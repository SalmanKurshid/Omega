const usersCtrl = require('./../../controllers/admin/userController')
const authenticateJWT = require('../../../middleware/authenticatejwt')

module.exports = function (router) {
    router.get('/users',authenticateJWT,usersCtrl.getAllUsers);
    router.post('/users',authenticateJWT,usersCtrl.createNewUser);
    router.post('/login',usersCtrl.loginUser);
    router.put('/users',authenticateJWT,usersCtrl.updateUser);
    router.put('/delete-user',authenticateJWT,usersCtrl.softDeleteUser);
}