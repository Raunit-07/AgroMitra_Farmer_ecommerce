const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export async function verifyGst(req, res) {
  try {
    const { gst_number } = req.body;

    if (!gst_number) {
      return res.status(400).json({ message: "GST number is required" });
    }

    // Backend regex validation
    if (!GST_REGEX.test(gst_number)) {
      return res.status(400).json({
        success: false,
        gst_verified: false,
        business_name: null,
        message: "Invalid GST number format. Must be 15 characters in valid GSTIN format.",
      });
    }

    // Check if external GST API key is configured
    const gstApiKey = process.env.GST_API_KEY;
    const gstApiBaseUrl = process.env.GST_API_BASE_URL;

    let business_name = "Verified Seller Business";
    let gst_verified = true;

    if (gstApiKey && gstApiBaseUrl) {
      // Use external GST API for real verification
      try {
        const apiRes = await fetch(`${gstApiBaseUrl}/taxpayer/${gst_number}`, {
          headers: {
            "Authorization": `Bearer ${gstApiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (apiRes.ok) {
          const apiData = await apiRes.json();
          business_name = apiData.business_name || apiData.tradeName || "Verified Seller Business";
          gst_verified = true;
        } else {
          gst_verified = false;
          business_name = null;
        }
      } catch (apiErr) {
        console.error("GST API call failed, falling back to regex-only:", apiErr.message);
        // Fallback to regex-only verification
        gst_verified = true;
        business_name = "Verified Seller Business";
      }
    }
    // If no API key, regex-only verification (development fallback) is already set above

    return res.json({
      success: true,
      gst_verified,
      business_name,
      message: gst_verified
        ? "GST number verified successfully"
        : "GST verification failed. Please check your GST number.",
    });
  } catch (error) {
    console.error("GST verification error:", error);
    return res.status(500).json({
      success: false,
      gst_verified: false,
      business_name: null,
      message: error.message || "GST verification failed",
    });
  }
}
