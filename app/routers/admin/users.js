const usersCtrl = require('./../../controllers/admin/userController')
const authenticateJWT = require('../../../middleware/authenticatejwt')
const uploadtos3 = require('./../../../middleware/uploads3')

module.exports = function (router) {
    router.get('/users',usersCtrl.getAllUsers);
    router.post('/users',authenticateJWT,usersCtrl.createNewUser);
    router.post('/login',usersCtrl.loginUser);
    router.put('/users',authenticateJWT,usersCtrl.updateUser);
    router.put('/delete-user',authenticateJWT,usersCtrl.softDeleteUser);
    router.put("/:userId/profile-image",uploadtos3.single("image"),usersCtrl.uploadImage)
    router.post('/forgot-password', usersCtrl.forgotPassword);
    router.put('/reset-password', usersCtrl.resetPassword);
}