import  twilio  from "twilio";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioServiceSid = process.env.TWILIO_SERVICE_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

const twilioClient = new twilio(twilioAccountSid, twilioAuthToken);



// send OTP to phone number
export const sendOtpToNumber = async (phoneNumber) => {
  try {
    console.log("Sending OTP to phone number:", phoneNumber);

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      throw new Error("A valid phone number is required");
    }

    // Make sure number starts with + and country code
    if (!phoneNumber.startsWith('+')) {
      throw new Error("Phone number must be in E.164 format (e.g., +1234567890)");
    }

    const response = await twilioClient.verify.v2
      .services(twilioServiceSid)
      .verifications.create({ to: phoneNumber, channel: "sms", });

    console.log("OTP sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending OTP:", error?.message || error);
    throw new Error("Failed to send OTP: " + (error?.message || "Unknown error"));
  }
};
// verify OTP
export const verifyOtpToNumber = async (phoneNumber, otp) => {
  try {
    console.log("Verifying OTP for phone number:", phoneNumber,otp);
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
