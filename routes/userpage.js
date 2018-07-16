var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var dbConfig = require('../config/db')
var dbManager = require('../db')


/* GET home page. */
router.get('/', function(req, res, next) {
  var username = req.query.user;

  var response = function(err, result) {
    var cookie = req.cookies.login;
    if (cookie === undefined || username != cookie) {
      res.render('userpage', {user: result.username, checkin: result.recentCheckin});
    } else {
      res.redirect('/homepage');
    }
  }

  dbManager.getUser(username, response);

}); 

module.exports = router;
