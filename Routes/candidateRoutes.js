const express =require('express');
const router = express.Router();
const User = require('./../models/user');

const {jwtAuthMiddleware,generateToken} = require('./../jwt');
const Candidate = require('./../models/candidate');



//check admin or not
const checkAdminRole = async (userId)=>{
    try{
        const  user = await User.findById(userId);
        // console.log('User ID:', userId);
        // console.log('User Role:', user.role);

        if(user.role === 'admin'){
            
            return true;
        }
       
    }
    catch(err){
        
        return false;
    }
}
//Post route to add a candidate
router.post('/',jwtAuthMiddleware,async(req,res)=>{
    
    try{
        // const isAdmin = await checkAdminRole(req.user.id);
        // console.log('isAdmin:', isAdmin);
        // if (!isAdmin) {
        //     return res.status(403).json({ message: 'User is not an admin' });
        // }
        if(!(await checkAdminRole(req.user.id))){
        
            return res.status(403).json({message : 'User has not admin role'});
        }
        const data = req.body
        //new user doc. 
        const newCandidate = new Candidate(data);

        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({response: response});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
 })

 //update
router.put('/:candidateId',jwtAuthMiddleware,async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message : 'User has not admin role'});
        }
       
        const candidateId = req.params.candidateId;
        const updatedID = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId,updatedID,{
                new : true,
                runValidators: true,
        });

        if(!response) return res.status(404).json({error:'Candidate not found'});

        console.log('Candidate data updated');
        res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})

router.delete('/:candidateId',jwtAuthMiddleware,async (req,res)=>{
    try{
        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message : 'User has not admin role'});
        }
       
        const candidateId = req.params.candidateId;
       

        const response = await candidate.findByIdAndDelete(candidateId);

        if(!response) return res.status(404).json({error:'Candidate not found'});

        console.log('Candidate deleted');
        res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})

// voting start

router.post('/vote/:candidateId',jwtAuthMiddleware,async (req,res)=>{
    
    
    candidateId = req.params.candidateId;
    userId = req.user.id;
    
    try{
        //no admin can role
      
        const candidate = await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({message : 'Candiadate not found'});
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message : 'user not found'});
        }
        if(user.isVoted){
            res.status(400).json({message : 'You have  already voted'});
        }
        if(user.role==='admin'){
           return  res.status(403).json({message : 'admin is not allow to vote'});
        }
        
        //Update the candidate doc of record the vote
       candidate.votes.push({user:userId});
       candidate.voteCount++;
       await candidate.save();

        //Update the user doc of record they voted

       user.isVoted = true;
       await user.save();
        
       res.status(200).json({message : 'Voted successfully'});
     }
     catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
     }
})

router.get('/vote/count',async (req,res)=>{
    try{
       const candidate = await Candidate.find().sort({voteCount :'desc'});

       const VoteRecord = candidate.map((data)=>{
        return {
            party : data.party,
            count : data.voteCount
        }
       });

       return  res.status(200).json(VoteRecord);

    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})

router.get('/candidates',async (req,res)=>{
    try{
        const candidates = await Candidate.find();
        res.status(200).json({ candidates: candidates });
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})
module.exports=router;

