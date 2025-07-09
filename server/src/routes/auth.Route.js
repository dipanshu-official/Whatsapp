import { Router } from "express";
import { sendOtp , verifyOtp } from "../controllers/auth.Controller.js";

const router = Router();

// Route to send OTP
router.post("/send-otp", sendOtp);

// Route to verify OTP
router.post("/verify-otp", verifyOtp);



export default router ;