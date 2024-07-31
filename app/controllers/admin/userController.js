const User = require('../../models/user');
const User_forgot_password = require('../../models/user_reset_password')
const apiResponseHandler = require('../../../utilities/apiResponse')
const bcrypt = require("bcrypt")
const crypto = require('crypto');
const saltRounds=10
const jwt = require('jsonwebtoken');
const SECRET_KEY=process.env.SECRET_KEY
const forgot_password_email = require('../../../utilities/forgot_password_mail')
const mailer= require('../../../utilities/sendMail')

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

const forgotPassword=async(req,res,next)=>{
    try{
        let {email,url}=req.body
        if(email && url){
            if(email && url){
                // Checking If User Exists With the email name recieved in the body
                let userData=await User.findOne({email: email}).exec()
                if(userData){
                    let token= await expireToken(res,email,1)
                    const resetToken = crypto.randomBytes(20).toString('hex');
                    const resetTokenExpires = Date.now() + 3600000; //Token Expires In 1 Hour
                    const createdAt = new Date(Date.now());
                    const expiredAt = resetTokenExpires;
                    const inserted_at = new Date(Date.now())
                    let tokenData = {
                        token_value: resetToken,
                        email: email,
                        created_at: createdAt,
                        expired_at: expiredAt,
                        inserted_at: inserted_at,
                        used: 0,
                    }
                    //Insert Token Data in DB
                    var createToken = await User_forgot_password.create(tokenData);
                    if(createToken){
                        const sendMail = process.env.USERID;
                        var mailOptions = {
                            to: userData.email,
                            from: sendMail
                        };
                        // Sending Email to the user.
                        var mailBody = forgot_password_email.forgot_password_email(url, resetToken, mailOptions);
                        mailer.sendMail(mailBody, userData.email, function (error, resMail) {
                            if (error) {
                                console.log("error in sending email", error);
                                apiResponseHandler.sendResponse(400, false, "Id missing!", function (response) {
                                    res.json(response);
                                });
                            } else {
                                // Sending 200(Success) response in case Email Is Sent Sucesssfully.
                                console.log("Link Sent Successfully" + userData.email)
                                apiResponseHandler.sendResponse(200, true, "Email sent Successfully!", function (response) {
                                    res.json(response);
                                });
                            }
                        })
                        apiResponseHandler.sendResponse(200, true, 'Email Sent Successfully!', (response) => {
                            res.json(response)
                        })
                    }else{
                        // Sending 400 response if unable to create data in User_forgot_password(table)
                        apiResponseHandler.sendError(400, false, "Unable To Insert Data into Database!", function (response) {
                            res.json(response);
                        });
                    }
                }else{
                    // Sending 456 Response if User is Not Found
                    apiResponseHandler.sendError(456, false, "User Does Not Exist!", function (response) {
                        res.json(response)
                    })
                }
            }else{
                // Sending 456 Response if Email Is Missing
                apiResponseHandler.sendError(400, false, "Email Or Url Is Missing!", function (response) {
                    res.json(response);
                });
            }
        }else{
            apiResponseHandler.sendError(400, false, 'Email Or Url is Missing!', function(response){
                res.json(response)
            })
        }
    }catch(err){
        console.log('Error in Forgot Password',err)
        apiResponseHandler.sendError(500, false, err, function(response){
            res.json(response)
        })
    }
}

const resetPassword=async(req,res,next)=>{
    try{
        let { email, resetToken, password } = req.body
        if(email){
            // Checking If User Exists(or if token has expired or not) in the User_forgot_password table.
            let tokenData = await User_forgot_password.findOne({email: email,expired_at: { $gt: Date.now() },used: 0}).exec()
            // console.log('tokenData::::',tokenData)
            if(tokenData){
                    if (tokenData && tokenData && tokenData.token_value === resetToken) {
                        // Hashing the new password recieved from the user.
                        let hash=bcrypt.hashSync(password,saltRounds);
                        // Updating the User Password
                        let updatePassword = await User.findOneAndUpdate({email: email},{password : hash},{new: true}).exec()
                        if(updatePassword){
                            let result = {
                                message: "Password changed successfully",
                            }
                            if (tokenData && tokenData._id) {
                                // Deleting the token information from Database once the password is changed successfully, so that the token should not be used again
                                let deleteData= await User_forgot_password.findOneAndDelete({email: tokenData.email,used: 0})
                                apiResponseHandler.sendResponse(200, result, 'Password Changed Successfully!', function (response) {
                                    res.json(response)
                                })
                            }else{
                                apiResponseHandler.sendError(304, false, 'Unable To Delete Token Information!', function (response) {
                                    res.json(response)
                                })
                            }
                        }else{
                            // Sending 304 Response if failed to update password.
                            apiResponseHandler.sendError(304, false, 'Unable to reset password!', function (response) {
                                res.json(response)
                            })
                        }
                    }else{
                        // Sending 403(Unauthorized) in case the token has expired.
                        apiResponseHandler.sendError(403, false, "Unauthorised User!", function (response) {
                            res.json(response)
                        })
                    }
            }else{
                apiResponseHandler.sendError(403, false, "Your Token Has Expired. Please Generate A New One!!", function (response) {
                    res.json(response)
                })
            }
        }else{
            // Sending 400 If Email Is Missing
            apiResponseHandler.sendError(400, false, "Email Is Missing!", function (response) {
                res.json(response);
            });
        }
    }catch(err){
        apiResponseHandler.sendError(500, false, err, function(response){
            res.json(response)
        })
    }
}

// Function Used To Expire The Tokens(generally unused tokens), from the database.
function expireToken(res,email,used) {
    console.log("******** Expire Old Tokens *********");
    return new Promise(async (resolve, reject) => {
        try {
            let data = await User_forgot_password.findOneAndUpdate({email: email,used: "0"},{used: used},{ new: true }).exec()
            resolve(data)
        } catch (err_catch) {
            console.error("Catch Error - expireOldTokens : ", err_catch);
            apiResponseHandler.sendError(500, false, "Internal Server Error: An unexpected error occurred while processing your request.", function (response) {
                res.json(response);
            });
        }
    })
}

module.exports={
    getAllUsers,
    createNewUser,
    loginUser,
    updateUser,
    softDeleteUser,
    uploadImage,
    forgotPassword,
    resetPassword
}