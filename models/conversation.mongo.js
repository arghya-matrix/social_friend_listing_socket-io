const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    // _id : {
    //     type : Number,
    //     unique : true,
    //     autoIncrement : true
    // },
    user_id: {
        type: [Number],
        required: true
    }
});

const Conversation = mongoose.model('Conversation',schema);
module.exports = Conversation   