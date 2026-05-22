import bcrypt from "bcryptjs";
import crypto from "crypto";
import os from "os";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/generateToken.js";
import User from "../models/User.js";
import { sendMail } from "../config/mailer.js";
import { sendRegistrationNotification } from "../utils/sendEmail.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const normalizeRole = (role) => {
  const value = String(role || "buyer").trim().toLowerCase();
  return value === "seller" ? "farmer" : value;
};

const validateUser = (name, email, password) => {
  if (!name || !email || !password) return "All fields required";

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{6,}$/;
  if (!passwordRegex.test(password)) {
    return "Password must contain letter, number & special character";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Invalid email format";

  return null;
};

const publicUser = (user) => ({
  id: user.id || user._id.toString(),
  name: user.name || user.full_name,
  full_name: user.full_name || user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  is_verified: user.is_verified,
  gst_number: user.gst_number,
  gst_verified: user.gst_verified,
  business_name: user.business_name,
});

const getLanIpAddress = () => {
  const interfaces = os.networkInterfaces();

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses || []) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }

  return null;
};

const getPasswordResetOrigin = (req) => {
  const configuredUrl = process.env.PASSWORD_RESET_PUBLIC_URL || process.env.PUBLIC_API_URL;

  if (configuredUrl && !configuredUrl.includes("localhost") && !configuredUrl.includes("127.0.0.1")) {
    return configuredUrl.replace(/\/$/, "");
  }

  const host = req.get("host") || "";
  const isLocalHost = host.includes("localhost") || host.includes("127.0.0.1");

  if (isLocalHost) {
    const lanIp = getLanIpAddress();
    const port = host.split(":")[1] || process.env.PORT || "5000";

    if (lanIp) {
      return `${req.protocol}://${lanIp}:${port}`;
    }
  }

  return (configuredUrl || `${req.protocol}://${host}`).replace(/\/$/, "");
};

export const registerUser = async (req, res) => {
  try {
    const { name, full_name, email, password, role, phone, gst_number, business_name, gst_verified } =
      req.body;

    const normalizedEmail = email?.trim().toLowerCase();
    const userName = name || full_name;
    const errorMsg = validateUser(userName, normalizedEmail, password);

    if (errorMsg) {
      return res.status(400).json({ message: errorMsg });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const assignedRole = normalizeRole(role);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: userName,
      full_name: userName,
      email: normalizedEmail,
      password: hashedPassword,
      role: assignedRole,
      phone: phone || null,
      gst_number: assignedRole === "farmer" ? gst_number || null : null,
      gst_verified: Boolean(gst_verified),
      business_name: business_name || null,
      is_verified: true,
    });

    const token = generateToken(user);

    sendRegistrationNotification({
      email: normalizedEmail,
      name: userName,
      role: assignedRole,
    }).catch((emailError) => {
      console.error("Registration notification email failed:", emailError.message);
    });

    return res.status(201).json({
      message: "Registration successful",
      token,
      role: user.role,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const registerSeller = async (req, res) => {
  req.body.role = "seller";
  return registerUser(req, res);
};

export const loginUser = async (req, res) => {
  try {
    const normalizedEmail = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      role: user.role,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  return res.json({
    message: "OTP verification is handled by MongoDB registration endpoints.",
  });
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google Client ID not configured" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const normalizedEmail = payload.email.trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        name: payload.name,
        full_name: payload.name,
        email: normalizedEmail,
        role: "buyer",
        is_verified: true,
      });
    }

    const jwtToken = generateToken(user);

    return res.json({
      message: "Google login successful",
      token: jwtToken,
      role: user.role,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(401).json({
      message: "Invalid Google token",
      error: error.message,
    });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const redirectTo = String(req.body.redirectTo || "").trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If an account exists, a reset link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const apiOrigin = getPasswordResetOrigin(req);
    const backendResetUrl = `${apiOrigin}/api/auth/password-reset/form`;
    const frontendResetUrl =
      redirectTo && /^https?:\/\//i.test(redirectTo)
        ? redirectTo
        : `${process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5176"}/reset-password`;
    const resetUrl = `${backendResetUrl}?token=${rawToken}&redirect=${encodeURIComponent(frontendResetUrl)}`;

    user.password_reset_token = hashedToken;
    user.password_reset_expires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendMail({
      to: user.email,
      subject: "Reset your AgroMitra password",
      text: `Reset your AgroMitra password using this link: ${resetUrl}\n\nThis link is valid for 15 minutes. If you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="color: #15803d;">Reset your AgroMitra password</h2>
          <p>We received a request to reset your password.</p>
          <p>
            <a href="${resetUrl}" style="display: inline-block; background: #16a34a; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 700;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>This link is valid for 15 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    return res.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    console.error("Password reset email error:", error);
    return res.status(500).json({
      message: error.message || "Failed to send reset email. Please try again.",
    });
  }
};

export const showPasswordResetForm = (req, res) => {
  const token = String(req.query.token || "");
  const redirect = String(req.query.redirect || "");

  if (!token) {
    return res.status(400).send("Reset token is missing.");
  }

  return res.type("html").send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Reset AgroMitra Password</title>
        <style>
          body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: Arial, sans-serif; background: #f0fdf4; color: #111827; }
          .card { width: min(92vw, 440px); background: white; border: 1px solid #dcfce7; border-radius: 18px; padding: 28px; box-shadow: 0 20px 45px rgba(22, 101, 52, 0.12); }
          h1 { margin: 0 0 8px; font-size: 28px; }
          p { color: #64748b; line-height: 1.5; }
          label { display: block; font-weight: 700; margin: 18px 0 8px; }
          input { width: 100%; box-sizing: border-box; padding: 13px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 16px; }
          button { width: 100%; margin-top: 20px; padding: 14px; border: 0; border-radius: 12px; background: #16a34a; color: white; font-size: 16px; font-weight: 800; cursor: pointer; }
          button:disabled { opacity: 0.7; cursor: not-allowed; }
          .status { display: none; margin-top: 14px; padding: 12px; border-radius: 10px; line-height: 1.45; }
          .status.error { display: block; color: #b91c1c; background: #fef2f2; }
          .status.success { display: block; color: #166534; background: #dcfce7; }
        </style>
      </head>
      <body>
        <main class="card">
          <h1>Reset Password</h1>
          <p>Enter your new AgroMitra password.</p>
          <form id="resetForm" method="POST" action="/api/auth/password-reset/submit">
            <input type="hidden" name="token" value="${token}" />
            <input type="hidden" name="redirect" value="${redirect}" />
            <label>New Password</label>
            <input type="password" name="password" minlength="6" autocomplete="new-password" required />
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" minlength="6" autocomplete="new-password" required />
            <button id="submitBtn" type="submit">Update Password</button>
          </form>
          <div id="statusBox" class="status"></div>
        </main>
        <script>
          const form = document.getElementById("resetForm");
          const button = document.getElementById("submitBtn");
          const statusBox = document.getElementById("statusBox");

          function showStatus(type, message) {
            statusBox.className = "status " + type;
            statusBox.textContent = message;
          }

          form.addEventListener("submit", (event) => {
            const formData = new FormData(form);
            const password = formData.get("password");
            const confirmPassword = formData.get("confirmPassword");

            if (password.length < 6) {
              event.preventDefault();
              showStatus("error", "Password must be at least 6 characters.");
              return;
            }

            if (password !== confirmPassword) {
              event.preventDefault();
              showStatus("error", "Passwords do not match.");
              return;
            }

            button.disabled = true;
            button.textContent = "Updating...";
            statusBox.className = "status";
            statusBox.textContent = "";
          });
        </script>
      </body>
    </html>
  `);
};

const renderPasswordResetResult = (message, success, loginUrl = "") => `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>AgroMitra Password Reset</title>
      <style>
        body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: Arial, sans-serif; background: #f0fdf4; color: #111827; }
        .card { width: min(92vw, 440px); background: white; border: 1px solid #dcfce7; border-radius: 18px; padding: 28px; box-shadow: 0 20px 45px rgba(22, 101, 52, 0.12); text-align: center; }
        h1 { margin: 0 0 10px; font-size: 28px; color: ${success ? "#166534" : "#b91c1c"}; }
        p { color: #475569; line-height: 1.5; font-size: 16px; }
        a { display: inline-block; margin-top: 18px; padding: 13px 18px; border-radius: 12px; background: #16a34a; color: white; text-decoration: none; font-weight: 800; }
      </style>
    </head>
    <body>
      <main class="card">
        <h1>${success ? "Success" : "Reset Failed"}</h1>
        <p>${message}</p>
        ${success && loginUrl ? `<a href="${loginUrl}">Go to Login</a>` : ""}
      </main>
    </body>
  </html>
`;

export const submitPasswordResetForm = async (req, res) => {
  try {
    const { token, password, confirmPassword, redirect } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).type("html").send(renderPasswordResetResult("Passwords do not match.", false));
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      password_reset_token: hashedToken,
      password_reset_expires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).type("html").send(renderPasswordResetResult("Invalid or expired reset link. Please request a new link.", false));
    }

    user.password = await bcrypt.hash(password, 10);
    user.password_reset_token = undefined;
    user.password_reset_expires = undefined;
    await user.save();

    const loginUrl =
      redirect && /^https?:\/\//i.test(redirect)
        ? new URL("/buyer-login", redirect).toString()
        : `${process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5176"}/buyer-login`;

    return res.type("html").send(
      renderPasswordResetResult(
        "Password updated successfully. You can now login with your new password.",
        true,
        `${loginUrl}?passwordReset=success`
      )
    );
  } catch (error) {
    console.error("Password reset form submit error:", error);
    return res.status(500).type("html").send(renderPasswordResetResult(error.message || "Failed to reset password.", false));
  }
};

export const confirmPasswordReset = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      password_reset_token: hashedToken,
      password_reset_expires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.password_reset_token = undefined;
    user.password_reset_expires = undefined;
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password reset confirm error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
