const sequelize = require("../db/database");
const Sessions = require("./sessions");
const User = require("./user");
const Friend = require("./Friends");
const Conversation = require('./conversation.mongo');
const Message = require('./message');

User.hasMany(Friend, {
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  // as: "Friends",
});
Friend.belongsTo(User, {
  foreignKey: "user_id",
});

User.hasMany(Friend, {
  foreignKey: "friend_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  // as: "FriendsOf",
});
Friend.belongsTo(User, {
  foreignKey: "friend_id",
});

User.hasMany(Sessions,{
  foreignKey : "user_id",
  onDelete : "CASCADE",
  onUpdate : "CASCADE"
})
Sessions.belongsTo(User,{
  foreignKey: "user_id"
})

// User.hasMany(Conversation,{
//   foreignKey: "receiver_id",
//   onDelete: "CASCADE",
//   onUpdate : "CASCADE",
//   as : "Receiver"
// })
// Conversation.belongsTo(User, {
//   foreignKey : "receiver_id",
//   as : "Receiver"
// })

// User.hasMany(Conversation, { 
//   foreignKey : "sender_id",
//   onDelete : "CASCADE",
//   onUpdate : "CASCADE",
//   as : "Sender"
// })
// Conversation.belongsTo(User,{
//   foreignKey : "sender_id",
//   as : "Sender"
// })

sequelize.sync({ alter: true });

module.exports = {
  sequelize,
  Sessions,
  User,
  Friend,
  Conversation,
  Message
};
