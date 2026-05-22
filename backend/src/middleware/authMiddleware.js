import jwt from "jsonwebtoken";
import User from "../models/User.js";

const attachUserFromToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return null;
  }

  const userObject = user.toObject();
  userObject.role = userObject.role || decoded.role || "buyer";
  userObject.roles =
    userObject.role === "both"
      ? ["buyer", "farmer", "seller", "both"]
      : [userObject.role];

  return userObject;
};

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Not authorized. No token provided." });
  }

  try {
    const user = await attachUserFromToken(token);

    if (!user) {
      return res.status(401).json({ message: "Token invalid or expired" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

export const optionalProtect = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return next();
  }

  try {
    const user = await attachUserFromToken(token);
    if (user) req.user = user;
  } catch (error) {
    // Public routes can continue without an authenticated user.
  }

  next();
};
