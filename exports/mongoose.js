const mongoose = require("mongoose");

module.exports.connectDB = () => {
      mongoose
            .connect("mongodb://127.0.0.1:27017/reddit")
            .then(() => console.log("connection to database success"))
            .catch((err) =>
                  console.log("Oops something went wrong: no connection to database")
            );
}