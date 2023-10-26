const sequelize = require("../db/database");
const { DataTypes, UUIDV4 } = require("sequelize");

const User = sequelize.define('User',{
    user_id : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true,
        unique : true
    },
    uuid : {
        type : DataTypes.UUID,
        defaultValue: UUIDV4
    },
    Name : {
        type : DataTypes.STRING,
        allowNull : false
    },
    user_name : {
        type : DataTypes.STRING,
        allowNull : false
    },
    email_address : {
        type : DataTypes.STRING,
        allowNull : false
    },
    password:{
        type : DataTypes.STRING,
        allowNull: false
    }
},{
    id: false
})

module.exports = User