import User from "../models/user.Model.js";
import Converstation from "../models/conversation.Molel.js";
import otpGenerator from "../utils/otpGenerator.js";
import responseHandler from "../utils/responseHandler.js";
import { sendOtpToEmail } from "../services/emailService.js";
import {
  sendOtpToNumber,
  verifyOtpToNumber,
} from "../services/twilioService.js";
import { generateToken } from "../utils/generateToken.js";
import cookieParser from "cookie-parser";
import { uploadFileToCloudinary } from "../config/cloudinary.js";

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
    console.log("Updating user profile with data:", req.user);
    const { username, agreedToTerms, about } = req.body;
    const userId = req.user.id; // Assuming user ID is stored in req.user
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found with ID:", user);
      return responseHandler(res, 404, "User not found");
    }
    const file = req.file; // Assuming you're using multer for file uploads
    if (file) {
      const uploadResult = await uploadFileToCloudinary(file);
      user.profilePicture = uploadResult?.secure_url;
    } else if (req.body.profilePicture) {
      user.profilePicture = req.body.profilePicture;
    }
    if (username !== undefined) user.username = username;
    if (agreedToTerms !== undefined) user.agreedToTerms = agreedToTerms;
    if (about !== undefined) user.about = about;
    await user.save();
    console.log("User profile updated successfully");
    return responseHandler(res, 200, "Profile updated successfully", { user });
  } catch (error) {
    console.error("Error updating profile:", error);
    return responseHandler(res, 500, "Internal server error");
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("auth_token", {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 0,
    });
    console.log("User logged out successfully");
    return responseHandler(res, 200, "Logged out successfully");
  } catch (error) {
    console.error("Error logging out:", error);
    return responseHandler(res, 500, "Internal server error");
  }
};

export const isAuthentic = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is stored in req.user

    if (!userId) {
      console.error("User ID not found in request");
      return responseHandler(res, 400, "User ID is required");
    }
    const user = await User.findById(userId);

    if (!user) {
      console.error("User not found with ID:", userId);
      return responseHandler(res, 404, "User not found");
    }
    console.log("User profile retrieved successfully");
    return responseHandler(res, 200, "User profile retrieved successfully", {
      user,
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    return responseHandler(res, 500, "Internal server error");
  }
};

export const getallUsers = async (req, res) => {
  const loggedInUser = req.user?.id;

  if (!loggedInUser) {
    console.error("User ID not found in request");
    return responseHandler(res, 400, "User ID is required");
  }

  try {
    const users = await User.find({ _id: { $ne: loggedInUser } })
      .select(
        "username email phoneNumber profilePicture lastSeen isOnline about phoneSuffix"
      )
      .lean();

    if (!users || users.length === 0) {
      return responseHandler(res, 404, "No users found");
    }
    const userWithConversation = await Promise.all(
      users.map(async (user) => {
        const conversation = await Converstation.findOne({
          participants: { $all: [user._id, loggedInUser] },
        })
          .populate({
            path: "lastMessage",
            select: "content createdAt sender receiver",
          })
          .lean();

        return {
          ...user,
          conversation: conversation || null,
        };
      })
    );

    return responseHandler(res, 200, "All users retrieved successfully", {
      users: userWithConversation,
    });
  } catch (error) {
    console.error("Error retrieving all users:", error);
    return responseHandler(res, 500, "Internal server error");
  }
};
