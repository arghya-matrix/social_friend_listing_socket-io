const { Op } = require("sequelize");
const db = require("../models/index");
const messageServices = require("../services/messages.services");

async function createConversation({ user_id, friend_id, message }) {
  const convo = new db.Conversation({
    user_id: [user_id, friend_id],
  });
  await convo.save();
  return convo;
}

async function deleteConversation({ user_id, con_id }) { }

async function findOneConversation({ user_id, friend_id }) {
  const convo = await db.Conversation.findOne({
    user_id: { $all: [user_id, friend_id] },
  }).lean();
  // console.log(convo, "<--- existing conversation");
  return convo;
}

async function getConversation({ user_id, friend_id, index, size }) {
  const convo = await findOneConversation({
    friend_id: friend_id,
    user_id: user_id,
  });
  const { allChats, totalCount } = await messageServices.getChat({
    con_id: convo._id,
    index: index,
    size: size,
  });
  const con_id = convo._id 
  return { allChats, totalCount, con_id};
}

async function chatListing({ user_id }) {
  const chatList = await messageServices.chatListing({
    user_id: user_id,
  });
  const currentDate = new Date();
  const details = await db.User.findAndCountAll({
      attributes: ['uuid', 'Name', 'user_id'],
      include: {
        model: db.Sessions,
        attributes: ['user_id', 'logout_date'],
        where: {
          logout_date: null,
          expiry_date: { [Op.gte]: currentDate }
        },
        required: false,
      },
    where: {
      user_id: chatList
    }
  })
  return details;
}

module.exports = {
  createConversation,
  deleteConversation,
  // updateConversation,
  getConversation,
  chatListing,
  findOneConversation,
};
