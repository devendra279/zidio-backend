import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import User from "./model/user.js"

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect("mongodb+srv://devendrajangid202:e6Eie2Ne0857Qos6@cluster0.m79tf.mongodb.net/",{useNewUrlParser: true,
    useUnifiedTopology: true}).then(()=>{
      console.log("db connected succesfully")
}).catch(()=>{
    console.log("db connection failed ")
})


const verifetoken = (req,res,next) =>{
    try{
       // console.log("verified",req.user)
        const token = req.headers.authorization ; 
        if(!token){
          return  res.status(403).json({message:"User is Denied"})
        }
        const verifed =  jwt.verify(token,"gdhghegfhcgdh")
        req.user = verifed;
        //console.log(verifed)
        next();
    }catch(error){
       return res.status(400).json({message:"invalid user"})
    }
  

}
app.get("/", (req, res)=> {
  return res.status(200).json({message:"Backend is Working "})
})
app.post("/register" , async (req, res )=>{
    try{
    
         const {  firstname, lastname , email , password ,phone } = req.body;
         const alreadyuser =  await User.findOne({ email });
         if (alreadyuser){
          return res.status(400).json({message:"User already exist "})
         }else{
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password,salt);
            const newuser =  new User ({firstname,lastname,email,password:hash,phone});
            const data = await newuser.save();
            console.log(data)
      return  res.status(201).json({message:"user registered succesfully " , user_id:data._id})
      }
    }catch(error){
          console.error("Register error",error)
          return res.status(500).json({ message: "Server error" });
    }
});

app.post ("/login" , async (req ,res )=>{
    try{
        
        const { email , password} = req.body ;
        console.log(email,password)
        const not_user =  await User.findOne({ email });
        console.log(not_user)
        if(!not_user){
          return res.status(400).json({message:"user not found "});
        }
         const match =await bcrypt.compare(password,not_user.password);
           if(!match){
          return  res.status(400).json({ message : " password is incorrect " });
         }
         const token = jwt.sign({email:email},"gdhghegfhcgdh")
         return res.status(200).json({user_id:not_user._id , jwt_token:token ,message:"user login succesfully "} )  
          
    }catch(error){
  console.error("Login error :", error)
  return res.send(500).json({message:"Something went wrong "})
    }
});
app.get("/profile",verifetoken,(req , res)=>{
    try{
        console.log(req.user.email)
       return  res.send({message:req.user.email})
    }catch(error){
     return   res.status(400).json({message:error})
    }
   
})

app.listen("2000",()=>{
    console.log("server is running on 2000")
})