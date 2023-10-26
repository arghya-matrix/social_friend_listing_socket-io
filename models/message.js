const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    con_id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    sender_id: {
      type: Number,
    },
    receiver_id: {
      type: Number,
    },
    message: {
      type: String,
    },
    messageType : {
      type: String
    }
  },
  {
    timestamps: true,
  }
);
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
