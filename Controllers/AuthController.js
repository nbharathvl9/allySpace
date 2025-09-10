const User= require("../models/User.js");
const UserController =require("./UserController.js");
const login = async (req,res)=>{
    let {email,password}= req.body;
    const user =await User.findOne({email});
    
    if(!user){
        return res.status(404).send("User not found");
    }
    if(user.password!=password){
        return res.send("password is inCorrect");
    }
    return res.send("Welcome to allySpace"); 
}
const SignUp =async (req,res)=>{
    let {name,userName,email,password}=req.body;
    let user= await User.findOne({email});
    let UserWithName=await User.findOne({userName});
    if(user){
        return res.send("User already exists");
    }
    if(UserWithName){
      return res.send("UserName already exists");
    }
    await UserController(name,userName,email,password);
    return res.send("successfully logged into allySpace");
}
module.exports={SignUp,login};