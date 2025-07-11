import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    constentType: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },
    Viewers:[
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },    

    ]
  },
  { timestamps: true }
);

const Status = mongoose.model("Status", statusSchema);

export default Status;


