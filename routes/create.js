var express = require('express');
var router = express.Router();
var dbConfig = require('../config/db')
var dbManager = require('../db')
var uuidv4 = require('uuid/v4');


/* GET home page. */
router.post('/', function(req, res, next) {


  function makeListenerId() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
  var response = function() {
    res.redirect('/login?username='+req.body.username);
  }
  var originId = uuidv4();
  var listenerId = makeListenerId();
  
  dbManager.createUser(req.body.username, originId, listenerId, response);
});

module.exports = router;
