const mongoose=require('mongoose');

const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name:{
        type :String,
        required : true
    },
    age:{
        type :Number
    },
    email : {
        type : String
    },
    mobile : {
        type: String
    },
    address : {
        type : String
    },
    aadharCardNumber : {
        type : Number,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        enum : ['voter','admin'],
        default:'voter'
    },
    isVoted :{
        type : Boolean,
        default:false
    }
});
userSchema.pre('save',async function(next){
    const user = this

    if(!user.isModified('password')) return next();
    try{
        const salt = await bcrypt.genSalt(10);

        const hashedPassword  = await bcrypt.hash(user.password,salt)

        user.password = hashedPassword;
        next();
    }
    catch(err){
        return next(err);
    }
})
userSchema.methods.comparePassword = async function(newPassword){
        try{
            const isMatched = await bcrypt.compare(newPassword,this.password)
            return isMatched;
        }
    catch(err){
            throw err;
    }
}

const User  = mongoose.model('User',userSchema);
module.exports = User;