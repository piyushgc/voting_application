const express =require('express');
const router = express.Router();
const User = require('./../models/user');

const {jwtAuthMiddleware,generateToken} = require('./../jwt');
const { read } = require('fs');

//check admin exits or not

const checkAdminExists =  async()=>{
    try{
        const adminCount = await User.countDocuments({role : 'admin'})
        return adminCount>0;    
    }
    catch(err){
        console.log(err);
        return true;
    }
}

//signu
router.post('/signup',async(req,res)=>{
    
    try{
        if(await checkAdminExists() && req.body.role==='admin') {
                return res.status(403).json({ message: 'Admin already exists. Registration not permitted.' });
        }

        const data = req.body
        //new user doc. 
        const newUser = new User(data);

        const response = await newUser.save();
        console.log('data saved');

        const payLoad= {
            id:response.id,
        }
        console.log(JSON.stringify(payLoad));

        const token = generateToken(payLoad);
        console.log("Token is : ",token);

        res.status(200).json({response: response,token: token});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
 })
//login route
 router.post('/login',async(req,res)=>{
    try{

        //extract user data
        const {aadharCardNumber,password} = req.body;

        //find the user by username
        const user = await User.findOne({aadharCardNumber:aadharCardNumber});
        if(!user||!(await user.comparePassword(password))){
                return res.status(401).json({error:'Invalid username or password'});
        }

        const payLoad = {
            id : user.id, 
        }

        const token = generateToken(payLoad);

        //return token as response
        res.json({token});

    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
 })
 //profile
 router.get('/profile',jwtAuthMiddleware,async (req,res)=>{
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(200).json({user});

    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
 })


//password change
router.put('/profile/password',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userId = req.user.id; // extract the id from the token 
        const {currentPassword,newPassword} = req.body; //extract current and newpassword

        const user = await User.findById(userId);

        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error:'Invalid password'});
        }

        user.password = newPassword;
        await user.save();
      
        console.log('password updated');
        res.status(200).json({message : 'Password updated'});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})


module.exports=router;

