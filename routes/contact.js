var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('contact', {
        title: 'Contact'
    });
});

router.post('/send', function (req, res, next) {
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'tien9ian9@gmail.com',
            pass: 'tien9_ian9'
        }
    });

    var mailOptions = {
        from: '<tien9ian9@gmail.com>',
        to: '1511640@hcmut.edu.vn',
        subject: 'Warning about data ',
        text: 'You have a new submission with a following details... Name: ' + req.body.name + '\nEmail: ' + req.body.email + '\nMessage: ' + req.body.message,
        html: '<p>You got a new submission with a following details.. </p><ul><li>Name: ' + req.body.name + '</li><li>Email: ' + req.body.email + '</li><li>Message: ' + req.body.message + '</li></ul>'
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.redirect('/');
        } else {
            console.log('Message send: ' + info.response);
            res.redirect('/');
        }
    });

});

module.exports = router;