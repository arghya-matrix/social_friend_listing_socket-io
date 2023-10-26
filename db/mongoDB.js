const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://arghyamallick:f6fYy5XcyMw9MvdB@cluster0.0ndzcah.mongodb.net/Conversation",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to DB!"))
  .catch((error) => console.log(error.message));

module.exports = mongoose;
