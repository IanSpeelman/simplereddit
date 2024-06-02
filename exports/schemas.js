const mongoose = require("mongoose");
const subredditSchema = new mongoose.Schema({
      _id: {
            type: String,
            required: true
      },
      name: {
            type: String,
            required: true
      },
      description: {
            type: String,
            required: true
      },
      members: {
            type: Array
      }
})
subredditSchema.methods.getAllPosts = async function() {
      return await Post.find({subreddit: this.name})
}
const Subreddit = new mongoose.model('Subreddit', subredditSchema)


const userSchema = new mongoose.Schema({
      _id: {
            type: String,
            required: true
      },
      username: {
            type: String,
            required: true
      },
      email: {
            type: String,
            required: true
      },
      password: {
            type: String,
            required: true
      },
      posts: {
            type: Array,
      }

}) 
const User = new mongoose.model("User", userSchema)


const postSchema = new mongoose.Schema({
      _id: {
            type: String,
            required: true
      },
      title: {
            type: String,
            required: true
      },
      content: {
            type: String,
            required: true
      },
      subreddit: { 
            type: String, 
            required: true
      },
      author: {
            type: String,
            required: true
      }
})
const Post = new mongoose.model('Post', postSchema)


module.exports = { Subreddit, User, Post}