'use strict';
var statusCodeMsg = require("../utilities/statusCodes")

function sendResponse(codeRes, statusRes, resultRes, cb) {
    if (statusRes) {
        cb({
            code: codeRes,
            message: statusCodeMsg[codeRes],
            status: statusRes,
            results: resultRes
        });
    } else {
        cb({
            code: codeRes,
            message: statusCodeMsg[codeRes],
            status: statusRes
        })
    }
}

function sendError(codeRes, statusRes, errMessage, cb) {
    cb({
        code: codeRes,
        message: errMessage,
        status: statusRes
    })
}

module.exports={
    sendResponse,
    sendError
}