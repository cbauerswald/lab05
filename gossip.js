var express = require('express');
var dbManager = require('./db');
var sleep = require('sleep');
var request = require('request');
var async = require("async");


var makeMessage = function() {
  var words = ['Rock', 'Paper', 'Scissor', 'butter', 'help', 'cuke', 'nuke', 'my', 'the', 'is', 'where', 'under', 'toward', 'blue', 'south', 'scatter', 'wind', 'novel', 'oval', 'superstar', 'go', 'leap', 'over', 'drudge', 'walk', 'I', 'he', 'blew'];
  message =  words[Math.floor(Math.random()*words.length)] + words[Math.floor(Math.random()*words.length)];
  console.log(message);
  return message;
}

var runMessagingSystem = function(currentUser, friends, baseUrl) {
  state = {
    'friends': friends, 
    'currentUser': currentUser,
    'host': baseUrl,
    'sequenceNumber': currentUser.numSend
  }

  delay=60000;
  console.log("currentUser is ",  currentUser);
  async.forever(
    function(next) {
      q = getPeer(state);                
      s = prepareMsg(state, q);    
      url = state.host + "/listener/" + q.listenerId;
      send (url, s, currentUser.username); 
      dbManager.incrementNumSend(currentUser.username);  
      state.sequenceNumber = state.sequenceNumber + 1;        
      setTimeout(function() {
        next();
      }, delay);
    },
    function(err) {
      console.error(err);
    }
  )
}

var getPeer = function(state) {
  return state.friends[Math.floor(Math.random()*state.friends.length)];
}

var prepareMsg = function(state, q) {
  var endpoint = state.host + "/listener/" + q.listenerId;
  console.log("sending message to ", q.username);
  var sendRumor = true; //Math.random() >= 0.5;
  if (sendRumor) {
    var sequenceNumber = state.sequenceNumber + 1;
    var messageID = state.currentUser.originId + ":" + sequenceNumber;
    var originator = state.currentUser.username;
    var text = makeMessage();
    return createRumor(messageID, originator, text, endpoint)
  } else {
    return;
    // return createWant(wants, endpoint);
  }
}

var createRumor = function(messageID, originator, text, endpoint) {
  return {
    "Rumor" : 
      {
        "MessageID": messageID ,
        "Originator": originator,
        "Text": text,
      },
   "EndPoint": endpoint
  }
}

var createWant = function(wants, endpoint) {
 return  {
    "Want": wants,
    "EndPoint": endpoint 
  }
}

var send = function(url, s, cookie) {
  url = "http://" + url;
  console.log("url in send in gossip: ", url);
  request.post({
    url: url,
    form: s,
    jar: true
  });
}

var isRumor = function(t) {
  return !(t['Rumor[MessageID]'] === undefined);
}

var isWant = function(t) {
  console.log(t); 
  return true;
}

module.exports = {
  'runMessagingSystem': runMessagingSystem,
  'isRumor': isRumor,
  'isWant': isWant
}