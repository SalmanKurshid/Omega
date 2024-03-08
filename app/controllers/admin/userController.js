const User = require('../../models/user');
const apiResponseHandler = require('../../../utilities/apiResponse')
const bcrypt = require("bcrypt")
const saltRounds=10
const jwt = require('jsonwebtoken');
const SECRET_KEY=process.env.SECRET_KEY

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
                let compare_pass=await bcrypt.compare(password,checkEmailExists.password)
                if(compare_pass){
                    const createTokenData = {
                        id: checkEmailExists._id,
                        name: checkEmailExists.name,
                        email: checkEmailExists.email,
                    }
                    const token = jwt.sign({ createTokenData }, SECRET_KEY, { algorithm: "HS256", expiresIn: '24h' });
                    const finalData = {
                        token: token
                    }
                    apiResponseHandler.sendResponse(200, true, finalData, function(response) {
                        res.json(response);
                    });
                }else{
                    apiResponseHandler.sendError(455, false, 'Password Does Not Match!', function(response){
                        res.json(response)
                    })
                }
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

const updateUser=async(req,res,next)=>{
    try{
        let {name,role,id}=req.body
        let findUser=await User.findOne({_id:id})
        console.log('findUser',findUser);
        if(findUser){
            let findBody={
                _id:id
            }
            let updateBody={
                name: name,
                role: role
            }
            if(findUser.name == updateBody.name && findUser.role == updateBody.role){
                apiResponseHandler.sendError(304, false, 'Data Not Modified!', function(response){
                    res.json(response)
                })
            }else{
                let updateUser = await User.findOneAndUpdate(findBody, updateBody, { new: true }).exec()
                if(updateUser){
                    updateUser = updateUser.toObject();
                    delete updateUser._id;
                    delete updateUser.password;
                    delete updateUser.is_deleted;
                    apiResponseHandler.sendResponse(200, true, updateUser, function (response) {
                        res.json(response);
                    });
                }else{
                    apiResponseHandler.sendError(400, false, 'Please Provide Proper Data!', function(response){
                        res.json(response)
                    })
                }
            }
        }else{
            apiResponseHandler.sendError(456, false, 'User Does Not Exist!', function(response){
                res.json(response)
            })
        }
    }catch(error){
        apiResponseHandler.sendError(500, false, error, function(response){
            res.json(response)
        })
    }
}

const softDeleteUser=async(req,res,next)=>{
    try{
        let {id,is_deleted}=req.body
        let findUser=await User.findOne({_id:id})
        if(findUser){
            let findBody={
                _id:id
            }
            let deleteBody={
                is_deleted:is_deleted
            }
            let softDeleteUser=await User.findOneAndUpdate(findBody, deleteBody, { new: true }).exec()
            if(softDeleteUser){
                softDeleteUser = softDeleteUser.toObject();
                delete softDeleteUser._id;
                delete softDeleteUser.password;
                apiResponseHandler.sendResponse(200, true, softDeleteUser, function (response) {
                    res.json(response);
                });
            }else{
                apiResponseHandler.sendError(400, false, 'Please Provide Proper Data!', function(response){
                    res.json(response)
                })
            }
        }else{
            apiResponseHandler.sendError(456, false, 'User Does Not Exist!', function(response){
                res.json(response)
            })
        }
    }catch(error){
        apiResponseHandler.sendError(500, false, error, function(response){
            res.json(response)
        })
    }
}

const uploadImage=async(req,res,next)=>{
    try{
        apiResponseHandler.sendResponse(200,req.file, "Uploaded successfully!", function (response) {
            res.json(response);
        });
    }catch(err){
        apiResponseHandler.sendError(500, false, err, function(response){
            res.json(response)
        })
    }
}


module.exports={
    getAllUsers,
    createNewUser,
    loginUser,
    updateUser,
    softDeleteUser,
    uploadImage
}