const User = require('../../models/user');
const apiResponseHandler = require('../../../utilities/apiResponse')

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
            apiResponseHandler.sendResponse(200, true, createUser, function (response) {
                res.json(response);
            });
        }else{  
            apiResponseHandler.sendError(400, false, 'Please Provide Proper Data!', function(response){
                res.json(response)
            })
        }
    }catch(error){
        apiResponseHandler.sendError(500, false, err, function(response){
            res.json(response)
        })
    }
}

module.exports={
    getAllUsers,
    createNewUser
}