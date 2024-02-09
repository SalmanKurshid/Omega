module.exports = function (router, passport) {
    router.get('/healthcheck', function (req, res, next) {
        try {
            res.send('Server Working Fine!');
        } catch (err) {
            console.log("Error in logging in", err);
        }
    });
}