const conversationServices = require("../services/conversation.services");
const messageServices = require("../services/messages.services");
const friendServices = require("../services/friends.services");
const userServices = require("../services/user.services");

async function createConversation(req, res) {
  try {
    const conversationServices = require("../services/conversation.services");
    const convo = await conversationServices.findOneConversation({
      friend_id: req.body.friend_id,
      user_id: req.userdata.user_id,
    });
    

    if (!convo || convo == null) {
      const con = await conversationServices.createConversation({
        friend_id: req.body.friend_id,
        user_id: req.userdata.user_id,
        message: req.body.message,
      });
      const jsonData = await messageServices.createChat({
        con_id: con._id,
        friend_id: req.body.friend_id,
        message: req.body.message,
        user_id: req.userdata.user_id,
      });
      res.json({
        data: jsonData,
      });
    } else {
      const newChat = await messageServices.createChat({
        con_id: convo._id,
        friend_id: req.body.friend_id,
        message: req.body.message,
        user_id: req.userdata.user_id,
      });
      // const page = req.query.page ? req.query.page : 1;
      // const itemsInPage = req.query.size;
      // const size = itemsInPage ? +itemsInPage : 4;
      // const index = page ? (page - 1) * size : 0;
      // const { allChats, totalCount } = await messageServices.getChat({
      //   con_id: convo._id,
      //   index: index,
      //   size: size,
      // });
      // const currentPage = page ? +page : 1;
      // const totalPages = Math.round(totalCount / size);
      res.json({
        // totalChats: totalCount,
        // totalPages: totalPages,
        // currentPage: currentPage,
        data: newChat,
      });
    }
  } catch (error) {
    console.log(error, "<-----An error occured");
    res.status(500).json({
      message: `Server Error`,
      err: error,
    });
  }
}

async function getMyConversation(req, res) {
  try {
    const page = req.query.page ? req.query.page : 1;
    const itemsInPage = req.query.size;
    const size = itemsInPage ? +itemsInPage : 3;
    const index = page ? (page - 1) * size : 0;
    const newJson = [];

    const { totalCount, allChats, con_id } = await conversationServices.getConversation(
      {
        friend_id: req.query.friend_id,
        user_id: req.userdata.user_id,
        index: index,
        size: size,
      }
    );
    // console.log(conversation.rows, "<---- my conversation");
    const currentPage = page ? +page : 1;
    const totalPages = Math.round(totalCount / size);
    allChats.map((obj) => {
      if (obj.sender_id == req.userdata.user_id) {
        obj.myMessage = true;
        newJson.push(obj);
      } else {
        obj.myMessage = false;
        newJson.push(obj);
      }
    });
    // console.log(newJson, " <--- Updated json data");
    res.json({
      currentPage: currentPage,
      totalPages: totalPages,
      con_id: con_id,
      data: newJson,
    });
  } catch (error) {
    console.log(error, "<-----An error occured");
    res.status(500).json({
      message: `Server Error`,
      err: error,
    });
  }
}

async function chatListing(req, res) {
  try {
    const page = req.query.page ? req.query.page : 1;
    const itemsInPage = req.query.size;
    const size = itemsInPage ? +itemsInPage : 3;
    const index = page ? (page - 1) * size : 0;
    const chats = [];

    const chatList = await conversationServices.chatListing({
      user_id: req.userdata.user_id,
    });

    if (chatList.count == 0) {
      res.json({
        message: `Start new Conversations with your friends`,
      });
    } else {
      const currentPage = page ? +page : 1;
      const totalPages = Math.round(chatList.count / size);
      chatList.rows.map((data)=>{
        const obj = data.toJSON();
        if(obj.Sessions.length >0 && obj.user_id != req.userdata.user_id ){
          delete obj.Sessions
          obj.status = "Online"
          chats.push(obj)
        } else if(obj.user_id != req.userdata.user_id){
          delete obj.Sessions
          obj.status = "Offline"
          chats.push(obj)
        }
      })
      res.json({
        message: `Your chat list`,
        totalChats: chatList.count,
        totalPages: totalPages,
        currentPage: currentPage,
        data: chats,
      });
    }
  } catch (error) {
    console.log(error, "<-----An error occured");
    res.status(500).json({
      message: `Server Error`,
      err: error,
    });
  }
}

module.exports = {
  createConversation,
  getMyConversation,
  chatListing,
};
