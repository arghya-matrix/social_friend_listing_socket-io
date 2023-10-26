const { Op } = require("sequelize");
const friendsServices = require("../services/friends.services");
const userServices = require("../services/user.services");
const sessionServices = require("../services/sessions.services");

async function sendFriendRequest(req, res) {
  try {
    const checkFriend = await friendsServices.findByFriendId({
      friend_id: req.userdata.user_id,
      user_id: req.query.friend_id,
    });
    const details = await userServices.findUserById({
      friend_id: req.query.friend_id,
    });
    if (checkFriend.count <= 0) {
      const friend = await friendsServices.sendFriendRequest({
        friend_id: req.userdata.user_id,
        user_id: req.query.friend_id,
      });
      res.json({
        message: `Request sent to ${details.Name}`,
        friend: friend,
      });
    } else {
      const friend = await friendsServices.sendFriendRequestAgain({
        friend_id: req.userdata.user_id,
        user_id: req.query.friend_id,
      });

      res.json({
        message: `Friend request sent to ${details.Name}`,
        data: friend,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `An internal error occured`,
      error: error,
    });
  }
}

async function deleteFriend(req, res) {
  try {
    const friend = await friendsServices.deleteFriend({
      friend_id: req.query.friend_id,
      user_id: req.userdata.user_id,
    });
    const details = await userServices.findUserById({
      friend_id: req.query.friend_id,
    });
    res.json({
      message: `${details.Name} is deleted from your friend list`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `An internal error occured`,
      error: error,
    });
  }
}

async function getAllFriends(req, res) {
  try {
    const whereOptions = {};
    const page = req.query.page ? req.query.page : 1;
    const itemsInPage = req.query.size;
    const searchTerm = {};
    const friendList = [];

    const orderOptions = [];
    const size = itemsInPage ? +itemsInPage : 3;
    const index = page ? (page - 1) * size : 0;

    if (req.query.Name) {
      searchTerm.Name = {
        [Op.substring]: req.query.Name,
      };
    }

    if (req.query.colName && req.query.orderName) {
      orderOptions.push([req.query.colName, req.query.orderName]);
    }
    // else {
    //   orderOptions.push(["createdAt", "ASC"]);
    // }
    if (req.query.reqstatus == "Reject") {
      whereOptions.accept = false;
    }

    whereOptions.accept = true;
    whereOptions.user_id = req.userdata.user_id;

    const { friends, allFriend } = await friendsServices.getAllFriend({
      orderOptions: orderOptions,
      searchTerm: searchTerm,
      whereOptions: whereOptions,
      size: size,
      index: index,
    });
    const currentPage = page ? +page : 1;
    const totalPages = Math.ceil(friends.count / size);
    if (friends.count == 0) {
      return res.json({
        message: `No data found with such inputs`,
      });
    } else {
      allFriend.map((obj) => {
        if (obj.User.Sessions.length > 0) {
          delete obj.User.Sessions;
          obj.loginStatus = "Online";
          friendList.push(obj);
        } else {
          delete obj.User.Sessions;
          obj.loginStatus = "Offline";
          friendList.push(obj);
        }
      });
      res.json({
        currentPage: currentPage,
        totalPages: totalPages,
        message: `${friends.count} results found`,
        data: friendList,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `An internal error occured`,
      error: error,
    });
  }
}

async function acceptRequest(req, res) {
  try {
    const friend = await friendsServices.acceptFriendRequest({
      friend_id: req.query.friend_id,
      user_id: req.userdata.user_id,
    });
    res.json({
      message: friend,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `An internal error occured`,
      error: error,
    });
  }
}

async function rejectRequest(req, res) {
  try {
    const friend = await friendsServices.rejectRequest({
      friend_id: req.query.friend_id,
      user_id: req.userdata.user_id,
    });
    res.json({
      message: `${friend.Name} Successfully unfriended`,
    });
  } catch (error) {}
}

async function checkStatus(req, res) {
  const sessions = await friendsServices.checkStatus({
    user_id: req.query.user_id,
  });
}

module.exports = {
  sendFriendRequest,
  deleteFriend,
  getAllFriends,
  acceptRequest,
  rejectRequest,
  checkStatus,
};
