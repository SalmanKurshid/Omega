const User = require('../../models/user');
const apiResponseHandler = require('../../../utilities/apiResponse')
const bcrypt = require("bcrypt")
const saltRounds=10

const getAllUsers=async(req,res,next)=>{
    try{
        let {page,pageSize} = req.query
        let searchData={};
        if(page && pageSize){
            page = page ? parseInt(page) : 1;
            if (pageSize != "ALL") {
                pageSize = pageSize ? parseInt(pageSize) : 10;
            }
            searchData.is_deleted=false
            let userCount=await User.countDocuments(searchData)
            if(userCount == 0){
                var result = {
                    'data': [],
                    'pagination': {
                        "pageSize": 0,
                        "page": 0,
                        "pages": 0,
                        "size": 0
                    },
                };
                apiResponseHandler.sendResponse(200,true,result,function(response){
                    res.json(response)
                })
            }else{
                var totalPages = userCount / pageSize;
                totalPages = Math.ceil(totalPages)
                if (totalPages < page) {
                    page = totalPages;
                }
                var skip = (parseInt(page)-1) * parseInt(pageSize);
                let user_data=await User.find(searchData).limit(pageSize).skip(skip)
                if(user_data && user_data.length){
                    let result= {
                        'data': user_data,
                        'pagination': {
                            "pageSize": pageSize,
                            "page": page,
                            "pages": totalPages,
                            "size": userCount
                        },
                    }
                    apiResponseHandler.sendResponse(200,true,result,function(response){
                        res.json(response)
                    })
                }else{
                    apiResponseHandler.sendResponse(204,true,'Unable To Fetch Data!',function(response){
                        res.json(response)
                    })
                }
            }
        }else{
            apiResponseHandler.sendError(400, false, 'Please Provide Page And Pagesize!', function(response){
                res.json(response)
            })
        }
    }catch(err){
        apiResponseHandler.sendError(500, false, err, function(response){
            res.json(response)
        })
    }
}

const createNewUser=async(req,res,next)=>{
    try{
        let user  = req.body
        const checkUserExists=await User.findOne({
            email: user.email
        })
        if(checkUserExists){
            apiResponseHandler.sendError(453, false, 'User With This Email Already Exists!', function(response){
                res.json(response)
            })
        }else{
            user.password=bcrypt.hashSync(user.password,saltRounds)
            let createObj={
                name: user.name,
                email: user.email,
                password: user.password,
                role: user.role
            }
            let newUser=await isertUserData(createObj)
            if(newUser){
                apiResponseHandler.sendResponse(200, true, newUser, function (response) {
                    res.json(response);
                });
            }else{
                apiResponseHandler.sendError(400, false, 'Please Provide Proper Data!', function(response){
                    res.json(response)
                })
            }
        }
    }catch(error){
        apiResponseHandler.sendError(500, false, error, function(response){
            res.json(response)
        })
    }
}

const loginUser = async(req,res,next)=>{
    try{
        let { email,password } = req.body
        if(email && password){
            let checkEmailExists=await User.findOne({email:email})
            console.log('checkEmailExists',checkEmailExists);
            if(checkEmailExists){
                bcrypt.compare(password,checkEmailExists.password,async function(res,err){
                    console.log('response->',res);
                    console.log('err',err);
                })
            }else{
                apiResponseHandler.sendError(400, false, 'Email Does Not Exist!', function(response){
                    res.json(response)
                })
            }
        }else{
            apiResponseHandler.sendError(400, false, 'Email Or Password Missing!', function(response){
                res.json(response)
            })
        }
    }catch(error){
        apiResponseHandler.sendError(500, false, error, function(response){
            res.json(response)
        })
    }
}

function isertUserData(userData) {
    return new Promise(function(resolve, reject) {
        User.create(userData)
            .then(function(createdUser) {
                resolve(createdUser);
            })
            .catch(function(error) {
                console.error('Error in Creating User:', error);
                reject(error);
            });
    });
}


module.exports={
    getAllUsers,
    createNewUser,
    loginUser
}