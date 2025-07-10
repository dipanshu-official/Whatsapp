import User from "../models/user.Model.js";
import otpGenerator from "../utils/otpGenerator.js";
import responseHandler from "../utils/responseHandler.js";
import { sendOtpToEmail } from "../services/emailService.js";
import {
  sendOtpToNumber,
  verifyOtpToNumber,
} from "../services/twilioService.js";
import { generateToken } from "../utils/generateToken.js";
import cookieParser from "cookie-parser";

export const sendOtp = async (req, res) => {
  try {
    const { phoneNumber, phoneSuffix, email } = req.body;
    const otp = otpGenerator();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
    let user;
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        user = new User({ email });
      }
      user.emailOtp = otp;
      user.emailOtpExpiry = otpExpiry;
      await user.save();
      // Send OTP to email
      await sendOtpToEmail(email, otp);
      console.log("OTP sent to email:", email);
      return responseHandler(res, 200, "OTP sent to email", { email });
    }
    if (!phoneNumber || !phoneSuffix) {
      return responseHandler(res, 400, "Phone number and suffix are required");
    }
    const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
    user = await User.findOne({ phoneNumber: fullPhoneNumber });
    if (!user) {
      user = new User({ phoneNumber, phoneSuffix });
    } else {
    }
    // Send OTP to phone number
    await sendOtpToNumber(fullPhoneNumber);
    console.log("OTP sent to phone number:", fullPhoneNumber);
    await user.save();

    return responseHandler(res, 200, "OTP sent successfully", { user });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return responseHandler(res, 500, "Internal server error");
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, phoneSuffix, otp, email } = req.body;
    let user;
    const now = new Date();

    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        return responseHandler(res, 404, "User not found");
      }

      if (
        !user.emailOtp ||
        String(user.emailOtp).trim() !== String(otp).trim() ||
        now > new Date(user.emailOtpExpiry)
      ) {
        return responseHandler(res, 400, "Invalid or expired OTP");
      }

      user.emailOtp = null;
      user.emailOtpExpiry = null;
      await user.save();

      const token = generateToken(user._id);
      res.cookie("auth_token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });

      console.log("Email OTP verified successfully");
      return responseHandler(res, 200, "Email OTP verified successfully", {
        user,
        token,
      });
    }

    // Proceed to phone OTP verification
    if (!phoneNumber || !phoneSuffix) {
      return responseHandler(res, 400, "Phone number and suffix are required");
    }
    

    const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
    console.log("Verifying phone number:", fullPhoneNumber);
    
    user = await User.findOne({ phoneNumber });
    if (!user) {
      return responseHandler(res, 404, "User not found");
    }

    const result = await verifyOtpToNumber(fullPhoneNumber, otp);
    if (!result.valid) {
      return responseHandler(res, 400, "Invalid or expired OTP");
    }

    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);
    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    console.log("Phone OTP verified successfully, token generated.");
    return responseHandler(res, 200, "Phone OTP verified successfully", {
      user,
      token,
    });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return responseHandler(res, 500, "Internal server error");
  }
};


export const updateProfile = async (req, res) => {
  try {
    const {username ,agreedToTerms, about } = req.body;
    const userId = req.user._id;    // Assuming user ID is stored in req.user
    const user = await User.findById(userId);
    const file = req.file;   // Assuming you're using multer for file uploads
    if(file) {
      const uploadResult = 
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return responseHandler(res, 500, "Internal server error");
    
  }
}
