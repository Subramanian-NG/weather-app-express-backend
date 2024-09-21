const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // for smaller application, we are storing bookmarked cities in user profile table. If we need to scale, we have to normalize this and create seperate table for bookmarked cities.

    //having bookmarked cities in array mapped to user profile will create complexities while removing bookmarked city
    bookmarks: { type: [String], default: [] },
});

module.exports = userSchema;