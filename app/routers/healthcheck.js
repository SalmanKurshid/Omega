const apiResponseHandler = require('../../utilities/apiResponse')

module.exports = function (router, passport) {
    router.get('/healthcheck', function (req, res, next) {
        try {
            apiResponseHandler.sendResponse(200, true, 'Server working fine', function (response) {
                res.json(response);
            });
        } catch (err) {
            apiResponseHandler.sendError(500, false, err, function(response){
                res.json(response)
            })
        }
    });
}