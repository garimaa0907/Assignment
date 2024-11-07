const express = require("express");
const route = require('./route');
const mongoose = require("mongoose");
const app = express();
var passport = require('passport')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//mongodb-Connection
mongoose
  .connect(
    "mongodb+srv://Project5:Project5@productmanagementcluste.3t2znay.mongodb.net/"
  )
  .then(() => {
    console.log("MongoDb is connected");
  })
  .catch((err) => console.log(err));


app.use('/', route);
app.use(passport.initialize())


app.listen(3000, function () {
  console.log("Express app running on port " + 3000);
});
