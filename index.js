const express = require("express");
const mongoose = require("mongoose");
const mongooseConnect = require("./exports/mongoose.js");
const app = express();
const session = require("express-session")
app.use(session({ secret: 'keyboard cat',resave: false,saveUninitialized: false , cookie: { maxAge: null }}))
mongooseConnect.connectDB();
app.use(express.static(`${__dirname}/public`))
const port = 3001;
const { 
      home,
      login,
      register,
      subView,
      notfound,
      postRegister,
      postLogin,
      newSub,
      newPost,
      createSub,
      createPost,
      logout,
      subscribe,
} = require("./routes")

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", `${__dirname}/views`);

app.get("/", home);
app.get("/r", subView)
app.get("/r/new", newSub)
app.get("/r/:sub/new", newPost)
app.get("/login", login)
app.get("/logout", logout)
app.get("/register", register)
app.post("/login", postLogin)
app.post("/register", postRegister)
app.post("/r", createSub)
app.post("/r/:sub", createPost)
app.post("/r/:sub/subscribe", subscribe)
// app.post("/r", createSub)

app.get("*", notfound);

app.listen(port, () => console.log(`app running on: http://localhost:${port}`));