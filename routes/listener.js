var express = require('express');
var router = express.Router();
var dbConfig = require('../config/db');
var dbManager = require('../db');
var gossip = require('../gossip');

var messages = {}

router.post('/', function(req, res, next) {
  
  var receiver = req.sentToUser.username;

  var getMessage = function() {
    return req.body;
  }

  var parseMessageId = function(messageId) {
    return messageId.split(":");
  }

  var store = function(t) {
    parsedMID = parseMessageId(t["Rumor[MessageID]"]);
    dbManager.createMessage(parsedMID[0], parsedMID[1], t["Rumor[Originator]"], t["Rumor[Text]"])
    dbManager.updateUserReceives(req.sentToUser, parsedMID[0], parsedMID[1]);
  }

  var handleMessage = function() {
    t = getMessage();
    if (  gossip.isRumor(t)  ) {
       store(t);
    } 
    res.send("GOT " + t);
    // elsif ( gossip.isWant(t) ) {
    //   work_queue = addWorkToQueue(t)
    //   foreach w work_queue {
    //     s = prepareMsg(state, w)
    //     <url> = getUrl(w)
    //     send(<url>, s)
    //     state = update(state, s)
    //   }
    // }
  }

  handleMessage();

});

module.exports = router;
