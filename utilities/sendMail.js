const nodemailer = require('nodemailer')
const user = process.env.USERID
const pass = process.env.USERPASS
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user, 
        pass
    }
});

module.exports = {
    sendMail : function(mailOptions, call){
        transporter.sendMail(mailOptions, call,function(error, response){
            if(error){
                console.log("error in send mail", error)
                call(error)
            } else{
                response = JSON.parse(JSON.stringify(response)),
                call(null, response.messageId)
            }

        })
    }
}