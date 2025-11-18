const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Read API key from Render environment
const API_KEY = process.env.API_KEY;

// Check if key missing
if (!API_KEY) {
  console.error("❌ API_KEY not found. Add it in Render → Environment.");
}

const otpSessions = {};

// Send OTP
app.post("/send-otp", async (req, res) => {
  const phone = req.body.phone;

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${API_KEY}/SMS/${phone}/AUTOGEN2`
    );

    res.json({
      success: true,
      message: "OTP sent",
      details: response.data
    });
  } catch (err) {
    res.json({
      success: false,
      message: "API error",
      error: err.message,
      details: err.response?.data
    });
  }
});

// Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { sessionId, otp } = req.body;

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );

    res.json({
      success: true,
      details: response.data
    });
  } catch (err) {
    res.json({
      success: false,
      message: "Verification failed",
      error: err.message,
      details: err.response?.data
    });
  }
});

// VERY IMPORTANT for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
