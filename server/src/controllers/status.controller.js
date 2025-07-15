import Status from "../models/status.Model.js";
import responseHandler from "../utils/responseHandler.js";
import { uploadFileToCloudinary } from "../config/cloudinary.js";

// Create a new status

export const createStauts = async (req, res) => {
  try {content
    const {  content, contentType } = req.body;
    const file = req.file;

    let stautsUrl = null;
    

    if (file) {
      const uploadFile = await uploadFileToCloudinary(file);
      if (!uploadFile.secure_url) {
        return res.status(500).json({ message: "File upload failed" });
      }

      stautsUrl = uploadFile.secure_url;
      contentType = file.mimetype.startsWith("image/") ? "image" : "video";
    } else if (content && content.trim()) {
      contentType = "text";
    } else {
      return responseHandler(res, 400, "Content is required");
    }

    const newMessage = new Message({
      conversation: conversation._id,
      sender: senderId,
      content,
      contentType,
    });

    await newMessage.save();

    conversation.lastMessage = newMessage._id;
    await conversation.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "username profilePicture")
      .populate("receiver", "username profilePicture");

    return responseHandler(res, 200, "Message sent successfully", populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return responseHandler(res, 500, "Internal server error");
  }
};
    