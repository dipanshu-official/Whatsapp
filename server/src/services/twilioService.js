import  Twilio  from "twilio";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioServiceSid = process.env.TWILIO_SERVICE_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

const twilioClient = new Twilio(twilioAccountSid, twilioAuthToken);

// send OTP to phone number
export const sendOtpToNumber = async (phoneNumber) => {
  try {
    console.log("Sending OTP to phone number:", phoneNumber);
    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }
    const response = await twilioClient.verify.v2
      .services(twilioServiceSid)
      .verifications.create({ to: phoneNumber, channel: "sms" });
    console.log("OTP sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
};
// verify OTP
export const verifyOtpToNumber = async (phoneNumber, otp) => {
  try {
    console.log("Verifying OTP for phone number:", phoneNumber);
    if (!phoneNumber || !otp) {
      throw new Error("Phone number and OTP are required");
    }
    const response = await twilioClient.verify.v2
      .services(twilioServiceSid)
      .verificationChecks.create({ to: phoneNumber, code: otp });
    console.log("OTP verification response:", response);
    return response;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw new Error("Failed to verify OTP");
  }
};