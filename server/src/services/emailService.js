import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Check if required environment variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error(
    "EMAIL_USER and EMAIL_PASS must be set in the environment variables."
  );
}

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email service:", error);
  } else {
    console.log("Email service is ready to send messages.");
  }
});

export const sendOtpToEmail = async (email, otp) => {
  console.log("Sending OTP ", email);
  try {
    const html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #075e54;">🔐 WhatsApp Web Verification</h2>
      
      <p>Hi there,</p>
      
      <p>Your one-time password (OTP) to verify your WhatsApp Web account is:</p>
      
      <h1 style="background: #e0f7fa; color: #000; padding: 10px 20px; display: inline-block; border-radius: 5px; letter-spacing: 2px;">
        ${otp}
      </h1>

      <p><strong>This OTP is valid for the next 5 minutes.</strong> Please do not share this code with anyone.</p>

      <p>If you didn’t request this OTP, please ignore this email.</p>

      <p style="margin-top: 20px;">Thanks & Regards,<br/>WhatsApp Web Security Team</p>

      <hr style="margin: 30px 0;" />

      <small style="color: #777;">This is an automated message. Please do not reply.</small>
    </div>

  `;

    await transporter.sendMail({
      from: `"WhatsApp Web" <${process.env.EMAIL_USER}>`, // sender address
      to: email, // list of receivers
      subject: "WhatsApp Web OTP Verification", // Subject line
      html: html, // html body
    });
  } catch (error) {
    console.error("Error sending OTP to email:", error);
    throw new Error("Failed to send OTP to email");
  }
};
