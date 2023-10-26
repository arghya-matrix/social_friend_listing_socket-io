const db = require("../models/index");

async function createChat({ con_id, user_id, friend_id, message }) {
  const chat = new db.Message({
    sender_id: user_id,
    receiver_id: friend_id,
    con_id: con_id,
    message: message,
  });
  await chat.save();
  const allChats = await db.Message.find({ con_id: con_id })
    .sort({ createdAt: 1 })
    .lean();
  //   console.log(chat, "Saved chat");
    // console.log(allChats, "All chats");
  return chat;
}

async function getChat({ con_id, index, size }) {
  const allChats = await db.Message.find({ con_id: con_id }, 'sender_id receiver_id message createdAt messageType')
    .sort({ createdAt: 1 })
    .lean();
  const totalCount = await db.Message.countDocuments({ con_id: con_id });
    // console.log(allChats, totalCount, "All chats");
  return { totalCount, allChats };
}

async function chatListing({ user_id }) {
  const chatList = await db.Message.find({ $or: [{ sender_id: user_id }, { receiver_id: user_id }] })
    .distinct("receiver_id")
    .lean();

  return chatList;
}

module.exports = {
  createChat, 
  getChat,
  chatListing,
};
