var express = require('express');
var router = express.Router();
var dbConfig = require('../config/db')
var dbManager = require('../db')
var request = require("request");


/* GET home page. */
router.get('/', function(req, res, next) {
  var MongoClient = require('mongodb').MongoClient;
  var url = dbConfig.dbUri;

  // var updateUserListenerId = function(username) {
  //   console.log("in update user");
  //   console.log("the listenerID for " + username + " is " + listenerID);
  //   dbManager.updateListenerIdOnUser(username, listenerID, function(err, result) { return; });
  // }

  var response = function(err, result) {
    if (err) throw err;
    if (!result) {
      res.redirect('/?login=failed');
    } else {
      res.cookie("login", result.username);
      res.redirect('/');
    }
  }
  
  dbManager.getUser(req.query.username, response);
  
});

module.exports = router;
