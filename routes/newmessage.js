var express = require('express');
var router = express.Router();
var dbManager = require('../db');


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("new message cookies: ", req.cookies)
  res.send(req.message);
});

module.exports = router;
