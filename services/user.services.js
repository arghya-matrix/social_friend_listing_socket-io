const { Op } = require("sequelize");
const db = require("../models");

async function signIn({ email_address }) {
  const user = await db.User.findAndCountAll({
    where: {
      email_address: email_address,
    },
    raw: true,
  });
  return user;
}

async function createUser({ Name, user_name, email_address, password }) {
  const user = await db.User.create({
    Name: Name,
    user_name: user_name,
    email_address: email_address,
    password: password,
  });
  const userData = { ...user.get(), password: undefined, user_id: undefined };
  return userData;
}

async function findUser({ email_address }) {
  const user = await db.User.findOne({
    where: {
      [Op.or]: {
        email_address: email_address,
      },
    },
  });
  return user;
}

async function findUserById({ friend_id }) {
  const user = await db.User.findOne({
    where: {
      user_id: friend_id,
    },
  });
  return user;
}

async function getUser({ whereOptions, index, size }) {
  const user = await db.User.findAndCountAll({
    attributes: ["user_id", "Name"],
    where: whereOptions,
    limit : size,
    offset : index,
    raw: true,
  });
  return user;
}

async function getAllUser() {
  const user = await db.User.findAll({
    raw: true,
  });
  return user;
}

module.exports = {
  signIn,
  createUser,
  findUser,
  findUserById,
  getUser,
  getAllUser,
};
