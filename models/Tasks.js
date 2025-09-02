const mongoose= require("mongoose");

 const TaskSchema= new mongoose.Schema({
    AssignedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User", 
    },
    AssignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    TaskDesc:{
        type:String,
        required:true,

    },
    createdDate: {
    type: Date,
    default: Date.now, 
  },
  dueDate: {
    type: Date,
    required: true,    
  },
  TaskProgress:{
    type:String,
    required:false,
  }



 })