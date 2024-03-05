const weatherCtrl = require('./../../app/controllers/weatherCtrl')
const authenticateJWT = require('../../middleware/authenticatejwt')

module.exports = function (router) {
    router.get('/weatherByLocation',weatherCtrl.getWeatherByLocation);
}