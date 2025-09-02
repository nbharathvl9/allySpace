const { Int32 } = require("bson");
const mongoose = require("mongoose");
const { type } = require("os");



const userSchema = new mongoose.Schema({
    id : {
        type : Number ,
        unique : true

    },
    name:{
        type : String ,
        required : true
    } ,
    userName:{
        type : String ,
        unique : true ,
        required : true
    } ,
    email:{
        type : String , 
        required : true ,
        unique : true 
    },

    password:{
        type : String ,
        required : true
    }

},

{
    timestamps: true,
}

);
const User = mongoose.model("User", userSchema );
module.exports = User;