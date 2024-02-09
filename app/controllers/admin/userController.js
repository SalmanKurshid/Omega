const User = require('../../models/user');

const getAllUsers=async(req,res,next)=>{
    try{
        let userData= await User.find()
        res.send(userData)
    }catch(err){
        console.log('Error in fetching users',err);
    }
}

const createNewUser=async(req,res,next)=>{
    try{
        let user  = req.body
        if(user && user.email && user.password){
            let createObj={
                name: user.name,
                email: user.email,
                password: user.password,
                role: user.role
            }
            let createUser = User.create(createObj)
            res.send(200)
        }else{  
            res.send(400)
        }
    }catch(error){
        console.log('Error in creating user');
    }
}

module.exports={
    getAllUsers,
    createNewUser
}