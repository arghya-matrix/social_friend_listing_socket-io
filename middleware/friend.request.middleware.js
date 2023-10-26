const friendsServices = require("../services/friends.services");
const userServices = require("../services/user.services");

async function sendReq(req, res, next) {
  try {
    const friend = await friendsServices.findByFriendId({
      friend_id: req.userdata.user_id,
      user_id: req.query.friend_id,
    });
    if(req.userdata.user_id == req.query.friend_id){
      return res.status(409).json({
        message : `Cannot send req to yourself`
      })
    }
    // console.log(friend.rows[0],"<---- friend middleware");
    if (friend.rows[0] != undefined) {
      if (friend.rows[0].accept == false && friend.rows[0].blocked == false) {
        next();
      }
      if (friend.rows[0].accept == true) {
        const friendDetails = await friendsServices.friendDetails({
          friend_id: req.query.friend_id,
        });
        return res.status(409).json({
          message: `You are already friend`,
          friend: friendDetails,
        });
      }
      if (friend.rows[0].blocked == true) {
        return res.status(403).json({
          message: `You have reached your max limit of sending Friend request to the user`,
        });
      }
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `An internal error occured`,
      error: error,
    });
  }
}

async function validateFriend(req, res, next) {
  const friend_id = req.body.friend_id
  // console.log(req.body);
  const friend = await friendsServices.findByFriendId({
    friend_id: req.query.friend_id ? req.query.friend_id : req.body.friend_id ,
    user_id: req.userdata.user_id,
  });
  if (friend.count > 0) {
    next(); 
  } else {
    const details = await userServices.findUserById({
      friend_id: req.query.friend_id ? req.query.friend_id : req.body.friend_id,
    });
    // console.log(details,"<<<<-------friend details");
    return res.json({
      message: `${details.Name} is not your friend. Send friend request to be a friend`,
    });
  }
}

module.exports = {
  sendReq,
  validateFriend,
};
