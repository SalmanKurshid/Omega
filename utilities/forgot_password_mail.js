module.exports = {
    forgot_password_email: function (url,token, mailOptions) {
        mailOptions.html = [
            'Hi,',
            'We have received a request to reset the password for your account.',
            'If you made this request, please click on the link below or paste this into your browser to complete the process:',
            url + '/reset-password/' + `${token}`,
            'If you did not ask to change your password, please ignore this email and your account will remain unchanged.'
        ].join('\n\n');
        mailOptions.subject = 'Resetting the password';
        return mailOptions;
    }
};