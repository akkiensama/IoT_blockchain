var express = require('express');
var router = express.Router();

const Activity = require('../../models/Activity');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('about', {
        title: 'About'
    });
});

module.exports = router;