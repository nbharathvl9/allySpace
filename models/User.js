const { Int32 } = require("bson");
const mongoose = require("mongoose");
const { type } = require("os");



const UserSchema = new mongoose.Schema({
    id : {
        type : Int32 ,
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
    }

    
})