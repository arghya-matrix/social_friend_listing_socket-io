const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

const Friends = sequelize.define("Friend", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
  },
  friend_id: {
    type: DataTypes.INTEGER,
  },
  accept: {
    type: DataTypes.BOOLEAN,
  },
  blocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  counter: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  createdAt: DataTypes.DATE,
});

module.exports = Friends;
