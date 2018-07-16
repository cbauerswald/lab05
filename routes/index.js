var express = require('express');
var router = express.Router();
var dbConfig = require('../config/db');
var request = require("request");
var dbManager = require('../db');
var app = express();
var gossip = require('../gossip');

/* GET home page. */
router.get('/', function(req, res, next) {
  var loginCookie = req.cookies.login;
  var users = [];

  var loggedIn = !(loginCookie === undefined);
  var loginFailed = req.query.login == "failed";

  var createPage = function(allUsers) {
    users =  allUsers;
    var usernames = []

    for(var r in users) {
      usernames.push(users[r].username);
    }

    if (!loggedIn) {
      var message;
      if (loginFailed) {
        message = 'You must create an account before you can login.';
      }
      res.render('index', { title: 'Express', users: usernames, message: message});
    } else {
      var currentUser = users[usernames.indexOf(loginCookie)];

      usernames.splice(usernames.indexOf(loginCookie), 1);
      users.splice(users.indexOf(currentUser), 1);
      baseUrl = req.get('host');
      gossip.runMessagingSystem(currentUser, users, baseUrl, req.app.get('listenerId'));

      dbManager.getMessagesForUser(currentUser, function(result) {
        // console.log("we have a result in index for " + currentUser.username + "!", result[0]);
        res.render('homepage', {title: 'Express', user: loginCookie, users: usernames, messages: result}); 
      });

      
    }
  }

  dbManager.getAllUsers(createPage);

});

// router.post('/', function(req, res, next) {
//   var loginCookie = req.cookies.login;
//   var users = [];

//   var loggedIn =  !(loginCookie === undefined);
//   var loginFailed = req.query.login == "failed";

//   var createPage = function(allUsers) {
//     users =  allUsers;
//     var usernames = []

//     for(var r in users) {
//       usernames.push(users[r].username);
//     }

//     if (!loggedIn) {
//       var message;
//       if (loginFailed) {
//         message = 'You must create an account before you can login.';
//       }
//       res.render('index', { title: 'Express', users: usernames, message: message});
//     } else {
//       var currentUser = users[usernames.indexOf(loginCookie)];

//       usernames.splice(usernames.indexOf(loginCookie), 1);
//       baseUrl = req.get('host');
//       gossip.runMessagingSystem(currentUser, users, baseUrl, app.get('listenerId'));

//       var requestLoop = setInterval( async function(){ 
//         request.get({
//           url:  state.host + "/listener/" + app.get('listenerId')
//         }, function(error, response, body) {
//           // console.log(error);
//           // console.log(body);
//         });
//       }, 1000);

//       res.render('homepage', {title: 'Express', user: loginCookie, users: usernames});
//     }
//   }

//   dbManager.getAllUsers(createPage);

// });


module.exports = router;
