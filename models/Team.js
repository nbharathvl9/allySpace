const mongoose = require("mongoose");

class Members{
    static MemArray=[];
    constructor(ObjectId){ 
       Members.MemArray.push(ObjectId);
    }

}

const TeamSchema= new mongoose.Schema({
    TeamId:{
        type:String,
        unique:true,
        required:true,

    },
    TeamHId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    TeamMembers:{
        type:Members,
        
    },
    HR:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
     Prototype:{
        type:String,
    }

    
});
const Team= mongoose.model("Team", TeamSchema);
module.exports =Team;