import { Router } from "express";
import { getallUsers, logout, sendOtp , updateProfile, verifyOtp } from "../controllers/auth.Controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { multerMiddleware } from "../config/cloudinary.js";


const router = Router();

// Route to send OTP
router.post("/send-otp", sendOtp);

// Route to verify OTP
router.post("/verify-otp", verifyOtp);


// Protected route

router.put("/update-profile", authMiddleware,multerMiddleware , updateProfile); 
router.get("/getallUsers", authMiddleware, getallUsers); 

router.get("/logout",logout)





export default router ;