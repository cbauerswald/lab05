var dbConfig = require('./config/db')
var MongoClient = require('mongodb').MongoClient;
var url = dbConfig.dbUri;

var createUser = function(username, originId, listenerId, response) {
  MongoClient.connect(url, function(err, db) {
    var dbo = getDb(db);
    var myobj = {username: username, originId: originId, listenerId: listenerId, numSend: 0};
    dbo.collection("users").insertOne(myobj, function(err, res) {
      if (err) throw err;
      db.close();
      response();
    });
  });
}

var createMessage = function(originId, sequenceNumber, originator, text) {
  MongoClient.connect(url, function(err, db) {
    var dbo = getDb(db);
    var newMessage = {originId: originId, sequenceNumber: sequenceNumber, originator: originator, text: text };
    dbo.collection("messages").insertOne(newMessage, function(err, res) {
      if (err) throw err;
      db.close();
    })
  })
}

var updateUserReceives = function(user, originId, sequenceNumber) {
  MongoClient.connect(url, function(err, db) {
    var dbo = getDb(db);
    var obj = {user: user.username, originId: originId};
    var updatedObj = {user: user.username, originId: originId, sequenceNumber: sequenceNumber};
    dbo.collection("user_receives").update(obj, updatedObj, {upsert: true}, function(err, result) {
      if (err) throw err;
      db.close();
    })

  });
}

var getMessagesForUser = function(user, response) {
  MongoClient.connect(url, function(err, db) {
    var dbo = getDb(db);
    dbo.collection("user_receives").find({user: user.username}).toArray(function(err, result) {
      if (err) {
        throw err;
      } else {
        getMessagesFromUserReceives(user, db, result, response);
      }
      db.close();
    });
  });
}

var getMessagesFromUserReceives = function(user, db, result, response) {
  var dbo = getDb(db);
  matchingUserReceivesDict = {};
  for (r in result) {
    matchingUserReceivesDict[result[r].originId] = result[r].sequenceNumber;
  }
  console.log("user receives for " + user.username + ":", result);
  dbo.collection("messages").find({originId: { $in: Object.keys(matchingUserReceivesDict) }}).toArray(function(err, res) {
    messages = [];
    for (m in res) {
      if (res[m].sequenceNumber <= matchingUserReceivesDict[res[m].originId] ) {
        messages.push(res[m]);
        //console.log(matchingUserReceivesDict[res[m].originId], ",", res[m].sequenceNumber, ",", matchingUserReceivesDict[res[m].originId] <= res[m].sequenceNumber)
        //console.log("being pushed into messages list for " + user.username, res[m])
      }
    }
    db.close();
    // console.log("messages in get messages for user in db:", messages);
    response(messages);
  });
}

var updateUserState = function(username, messageOriginId, messageNum) {
  MongoClient.connect(url, function(err, db) {
    var dbo = getDb(db);
    var myobj = getUser(username, function(err, myobj) {
      var update = myobj.state;
      update[messageOriginId] = messageNum;
      update = {$set: update};
      dbo.collection("users").update(myobj, update, function(err, res) {
        if (err) throw err;
        db.close();
      });
    });
  });
}

var updateListenerIdOnUser = function(username, listenerId, response) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = getDb(db);
    dbo.collection("users").updateOne(
      { username: username}, 
      { $set: {listenerId: listenerId } }, 
      function(err, result) {
        // console.log("in mongo response in updateListenerIdOnUser");
        response(err, result);
        db.close();
    });
  });
}

var incrementNumSend = function(username) {
  MongoClient.connect(url, function(err, db) {
    var dbo = getDb(db);
    // console.log("username in increment num send ", username)
    var myobj = getUser(username, function(err, myobj) {
      var update = {$set: {numSend: myobj.numSend + 1}};
      dbo.collection("users").update(myobj, update, function(err, res) {
        if (err) throw err;
        db.close();
      });
    });
  });
}

var getAllUsernames = function(response) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var allUsers = [];
    var dbo = getDb(db);
    dbo.collection("users").find({}).toArray(function(err, result) {
      if (err) {
        throw err;
      } else {
        for(var r in result) {
          allUsers.push(result[r].username);
        }
        db.close();
      }
      response(allUsers);
    });
  });
}

var getAllUsers = function(response) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var allUsers = [];
    var dbo = getDb(db);
    dbo.collection("users").find({}).toArray(function(err, result) {
      if (err) {
        throw err;
      } else {
        allUsers = result;
        db.close();
      }
      response(allUsers);
    });
  });
}

var getUser = function(username, response) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = getDb(db);
    dbo.collection("users").findOne({username: username}, function(err, result) {
      response(err, result);
      db.close();
    });
  });
}

var getUserWithQuery = function(query, response) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = getDb(db);
    dbo.collection("users").findOne(query, function(err, result) {
      response(err, result);
      db.close();
    });
  });
}

var getUserNoCallback = function(username, response) {
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = getDb(db);
    return dbo.collection("users").findOne({username: username});
  });
}


var getDb = function(db) {
  return db.db(dbConfig.dbName);
}

module.exports = {
  createUser: createUser,
  getAllUsernames: getAllUsernames,
  getAllUsers: getAllUsers,
  getUser: getUser,
  getUserWithQuery: getUserWithQuery,
  updateUserState: updateUserState,
  incrementNumSend: incrementNumSend,
  updateListenerIdOnUser: updateListenerIdOnUser,
  createMessage: createMessage,
  updateUserReceives: updateUserReceives,
  getMessagesForUser: getMessagesForUser
}