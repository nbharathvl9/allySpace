const mongoose= require("mongoose");

const ProjectSchema= new mongoose.Schema({
    Teams:[{type:mongoose.Schema.Types.ObjectId,ref:"Team"}],
    HR:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    Desc:{
        type:String,
        required:true,


    },
    Prototype:{
        type:String,
    }

})