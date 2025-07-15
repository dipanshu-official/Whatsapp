import { Server } from "socket.io";
import User from "../models/user.Model.js";
import responseHandler from "../utils/responseHandler.js";
import { connect } from "mongoose";

const onlineUsers = new Map();
const typingUsers = new Map();

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
    pingTimeout: 60000, // 60 seconds
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Handle user connection
    socket.on("userConnected", async (userId) => {
      try {
        userId = connectUserId;
        onlineUsers.set(userId, socket.id);
        socket.join(userId);

        // Update user status in the database
        const user = await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });

        // Notify other users about the online status
        socket.broadcast.emit("userOnline", {
          userId,
          username: user.username,
          profilePicture: user.profilePicture,
        });

        console.log(`User ${userId} connected`);
      } catch (error) {
        console.error("Error handling user connection:", error);
        socket.emit("error", "Failed to connect user");
      }
    });

    // return online users
    socket.on("getOnlineUsers", (requestedUserId, callback) => {
      const online = onlineUsers.has(requestedUserId);
      callback({
        userId: requestedUserId,
        isOnline,
        lastSeen: online ? new Date() : null,
      });
    });

    // forwand message to receiver
    socket.on("sendMessage", (message, receiverId) => {
      try {
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messageForwarded", message);
        }
      } catch (error) {
        console.error("Error send message:", error);
        socket.emit("error", "Failed to forward message");
      }
    });


    // update message as read and notify sender


  });
};
