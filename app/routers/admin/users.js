const usersCtrl = require('./../../controllers/admin/userController')

module.exports = function (router) {
    router.get('/users',usersCtrl.getAllUsers);
    router.post('/users',usersCtrl.createNewUser);
    router.post('/login',usersCtrl.loginUser)
}