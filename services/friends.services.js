// const { where } = require('sequelize');
const db = require("../models/index");
const { Op } = require('sequelize')

async function sendFriendRequest({ user_id, friend_id }) {
  const friend = await db.Friend.create({
    user_id: user_id,
    friend_id: friend_id,
    accept: false,
    counter: 1,
  });
  return friend;
}

async function friendDetails({ friend_id }) {
  const friend = await db.Friend.findOne({
    include: {
      model: db.User,
      attributes : ['uuid', 'Name']
    },
    where: {
      friend_id: friend_id,
    },
  });
  return friend;
}

async function findByFriendId({ user_id, friend_id }) {
  const friend = await db.Friend.findAndCountAll({
    where: {
      user_id: user_id,
      friend_id: friend_id,
    },
    raw: true,
  });
  return friend;
}

async function checkAcceptReject({ user_id, friend_id }) {
  const friend = await db.Friend.findOne({
    where: {
      user_id: user_id,
      friend_id: friend_id,
    },
  });
  return friend;
}

async function sendFriendRequestAgain({ user_id, friend_id }) {
  await db.Friend.update(
    {
      counter: db.sequelize.literal(`counter + ${1}`),
    },
    {
      where: {
        user_id: user_id,
        friend_id: friend_id,
      },
    }
  );
  await db.Friend.update(
    {
      blocked: true,
    },
    {
      where: {
        counter: 3,
      },
    }
  );
  const friend = await db.Friend.findOne({
    include: db.User,
    where: {
      user_id: user_id,
      friend_id: friend_id,
    },
  });
  // console.log(friend, " <<<------Friend Data");
  return friend;
}

async function acceptFriendRequest({ user_id, friend_id }) {
  const [numUpdatedRows, updatedRows] = await db.Friend.update(
    {
      accept: true,
      blocked: false,
      counter : 0
    },
    {
      where: {
        user_id: user_id,
        friend_id: friend_id,
      },
    }
  );
  await db.Friend.create({
    user_id : friend_id,
    friend_id : user_id,
    accept: true
  })
  if (numUpdatedRows > 0) {
    const friend = await friendDetails({
      friend_id: friend_id,
    });
    return friend;
  } else {
    return `Friend Request cannot be accepted`;
  }
}

async function deleteFriend({ user_id, friend_id }) {
  await db.Friend.destroy({
    where: {
      user_id: user_id,
      friend_id: friend_id,
    },
  });
}

async function getAllFriend({
  whereOptions,
  orderOptions,
  searchTerm,
  size,
  index,
}) {
  const currentDate = new Date();
  const friends = await db.Friend.findAndCountAll({
    attributes : ['user_id', 'accept', 'blocked', 'counter'],
    include:{
      model: db.User,
      where: searchTerm,
      attributes : ['uuid','Name','user_id'],
      include : {
        model : db.Sessions,
        attributes : ['user_id','logout_date'],
        where : {
          logout_date : null,
          expiry_date: {[Op.lte] : currentDate}
        },
        required: false,
      }
    },
    where: whereOptions,
    order: orderOptions,
    limit: size,
    offset: index,
  });
  const allFriend = friends.rows.map((friend)=> friend.toJSON());
  // console.log(allFriend,"<-----Friend data");
  return {friends,allFriend};
}

async function rejectRequest({user_id,friend_id}){
  const [numUpdatedRows, updatedRows] = await db.Friend.update(
    {
      accept: false,
    },
    {
      where: {
        user_id: user_id,
        friend_id: friend_id,
      },
    }
  );
  if (numUpdatedRows > 0) {
    const friend = await friendDetails({
      friend_id: friend_id,
    });
    // console.log(friend.User.dataValues,'<===REject req');
    return friend.User.dataValues;
  } else {
    return `Friend Request cannot be accepted`;
  }
}

async function checkStatus({user_id}){
  const sessions = await db.Sessions.findAll({
    where : {
      user_id : user_id
    },
    raw: true
  })
  console.log(sessions,"<=== session details");
}

module.exports = {
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriend,
  sendFriendRequestAgain,
  checkAcceptReject,
  findByFriendId,
  friendDetails,
  getAllFriend,
  rejectRequest,
  checkStatus
};