import { uploadFileToCloudinary } from "../config/cloudinary.js";
import Converstation from "../models/conversation.Molel.js";
import Message from "../models/message.Model.js";
import responseHandler from "../utils/responseHandler.js";

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content, messageStatus } = req.body;
    const file = req.file;

    const participants = [senderId, receiverId].sort();
    let conversation = await Converstation.findOne({ participants });

    if (!conversation) {
      conversation = new Converstation({ participants });
      await conversation.save();
    }

    let imageOrVideoUrl = null;
    let contentType = null;

    if (file) {
      const uploadFile = await uploadFileToCloudinary(file);
      if (!uploadFile.secure_url) {
        return res.status(500).json({ message: "File upload failed" });
      }

      imageOrVideoUrl = uploadFile.secure_url;
      contentType = file.mimetype.startsWith("image/") ? "image" : "video";
    } else if (content && content.trim()) {
      contentType = "text";
    } else {
      return responseHandler(res, 400, "Content is required");
    }

    const newMessage = new Message({
      conversation: conversation._id,
      sender: senderId,
      receiver: receiverId,
      content,
      contentType,
      imageOrVideoUrl,
      messageStatus: messageStatus || "sent",
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


export const getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversation = await Converstation.find({
      participants: userId,
    })
      .populate(
        "participants",
        "username profilePicture lastSeen isOnline about phoneSuffix"
      )
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender receiver",
          select: "username profilePicture",
        },
      })
      .sort({ updatedAt: -1 })
      .lean();
    if (!conversation || conversation.length === 0) {
      return responseHandler(res, 404, "No conversations found");
    }
    return responseHandler(res, 200, "Conversations retrieved successfully", {
      conversation,
    });
  } catch (error) {
    console.error("Error retrieving conversations:", error);
    return responseHandler(res, 500, "Internal server error");
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    if (!conversationId) {
      return responseHandler(res, 400, "Conversation ID is required");
    }
    const conversation = await Converstation.findById(conversationId);

    if (!conversation) {
      return responseHandler(res, 404, "Conversation not found");
    }
    if (!conversation.participants.includes(userId)) {
      return responseHandler(
        res,
        403,
        "You are not a participant in this conversation"
      );
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "username profilePicture")
      .populate("receiver", "username profilePicture")
      .sort({ createdAt: 1 })
      .lean();

    await Converstation.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        messageStatus: { $ne: ["send", "delivered"] },
      },
      { $set: { massageStatus: "read" } }
    );

    conversation.unreadCount = 0;
    await conversation.save();

    if (!messages || messages.length === 0) {
      return responseHandler(
        res,
        404,
        "No messages found in this conversation"
      );
    }

    return responseHandler(res, 200, "Messages retrieved successfully", {
      messages,
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    return responseHandler(res, 500, "Internal server error");
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.id;

    let messages = await Message.find(
      {
        _id: { $in: messageIds },
        receiver: userId,
      },
      { messageStatus: { $ne: "read" } }
    );

    await Message.updateMany(
      { _id: { $in: messageIds }, receiver: userId },
      { $set: { messageStatus: "read" } }
    );

    return responseHandler(res, 200, "Messages marked as read successfully", {
      messages,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return responseHandler(res, 500, "Internal server error");
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    if (!messageId) {
      return responseHandler(res, 400, "Message ID is required");
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return responseHandler(res, 404, "Message not found");
    }

    if (message.sender.toString() !== userId) {
      return responseHandler(res, 403, "You can only delete your own messages");
    }

    await message.deleteOne();

    return responseHandler(res, 200, "Message deleted successfully");
  } catch (error) {
    console.error("Error deleting message:", error);
    return responseHandler(res, 500, "Internal server error");
  }
};
