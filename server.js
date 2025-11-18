const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.API_KEY;

// In-memory store for OTP verification (for testing)
const otpSessions = {};

// ------------------- Send OTP -------------------
app.post("/send-otp", async (req, res) => {
  const phone = req.body.phone;

  if (!phone) return res.status(400).json({ success: false, message: "Phone is required" });

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${API_KEY}/SMS/${phone}/AUTOGEN2`
    );

    const sessionId = response.data.Details;
    otpSessions[sessionId] = { phone, verified: false }; // store session

    res.json({
      success: true,
      message: "OTP sent via SMS",
      details: response.data, // contains Status, Details(sessionId), OTP (for testing)
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
      details: err.response?.data,
    });
  }
});

// ------------------- Verify OTP -------------------
app.post("/verify-otp", async (req, res) => {
  const { sessionId, otp } = req.body;

  if (!sessionId || !otp)
    return res.status(400).json({ success: false, message: "sessionId and OTP are required" });

  try {
    // Call 2Factor verify API
    const response = await axios.get(
      `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    const status = response.data.Status; // Success / Failure

    if (status === "Success") {
      otpSessions[sessionId].verified = true; // mark verified
      res.json({ success: true, message: "OTP verified successfully", details: response.data });
    } else {
      res.json({ success: false, message: "Invalid OTP", details: response.data });
    }
  } catch (err) {
    res.json({
      success: false,
      message: "Verification failed",
      error: err.message,
      details: err.response?.data,
    });
  }
});

app.listen(3000, () => console.log("OTP server running on port 3000"));
