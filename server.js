var net = require('net'),
Room = require('./room.js'),
uuid = require('node-uuid'), 
_ = require('underscore')._;

/**
 * Keep track of connections.
 */

var count = 0, users = {};
var listenPort = 3000;
var rooms = {};
/**
 * Create server.
 */
  

var server = net.createServer(function (conn) {
  
  conn.write(
      '\n\r > welcome to \033[92m Weeby Chat Server\033[39m!'
    + '\n\r > Login name and press enter: '
  );

  conn.setEncoding('utf8');

  // the nickname for the current connection
  var nickname;
  var buf = null;

  
  function broadcast (roomID, msg, exceptMyself) {
   // var room = _.findWhere(rooms, {'name': roomName});
    //console.log(room.id);
    for (var i in users) {
      console.log(users[i].inroom+" "+roomID);
      if (users[i].inroom===roomID&&(!exceptMyself || i != nickname)) {
        users[i].port.write(msg);
        users[i].port.write('\n\r\033[93m > ');
      }
    }
  };
  function RemoveBackspaces(str)
  {   str = str.replace(/[.,\r\n]/g, '');
      while (str.indexOf("\b") != -1||str.indexOf("\t") != -1)
      {
          str = str.replace(/.?\x08/, ""); // 0x08 is the ASCII code for \b
         // str = str.replace(/\x32/, ""); 
          str = str.replace(/\x09/, "");
      }
      return str;
  };
  var ownerRoomID = inRoomID = null;
  var self = this;
  conn.on('data', function (data) {
      
      // the first piece of data we expect is the nickname
      var temp = RemoveBackspaces(data);
      if (!nickname) {
        if(temp !== "")
        {
          if (users[temp]) {
            conn.write('\n\r\033[93m > Sorry, name taken.\033[39m');
            conn.write('\n\r\033[93m > Login name and press enter:\033[39m')
            this.buf = '';
            return;
          } else {
            nickname = temp;
            users[nickname] = {"port": conn, "owns" : ownerRoomID, "inroom": inRoomID};//conn;
            conn.write("   Welcome "+nickname+'!\n\r');
            conn.write("   Type /help for commands!\n\r");
            broadcast('\n\r\033[90m > ' + nickname + ' joined the room\033[39m\n\r');
          }
        } else {
          conn.write('\n\r\033[93m > Sorry, Please enter some login name.\033[39m');
          conn.write('\n\r\033[93m > Login name and press enter:\033[39m')
          this.buf = '';
          return;
        }
      }
    if (firstWord(temp) == '/rooms') {
      listRooms(nickname);
    // To list all rooms by "/rooms" command
    } else if (firstWord(temp) == '/join') {
      joinRoom(temp, nickname);
    // To join a room by "/join" command
    } else if (firstWord(temp) == "/help") {
      conn.write('\n\r\033[93m /listusers \n\r /rooms \n\r /countusers \n\r /pm <name> <msg> \n\r /join <roomname> \n\r /leave <roomname> \n\r /help \n\r /quit \033[39m\n\r');
      conn.write(' end of list.\n\r');
    // To list all commands
    } else if (firstWord(temp) === '/listusers') {
      listUser(nickname);
    // To list all users who are online by "/listusers" command
    } else if (firstWord(temp) === '/countusers') {
      numUser(nickname);
    // To list number of users are online by "/countusers" command
    } else if (firstWord(temp) === '/pm') {
      pmUser(temp, nickname);
    // Private message to user
    } else if (firstWord(temp) === '/leave') {
      leaveRoom(temp, nickname);
    // leave current room 
    } else if (firstWord(temp) === '/quit') {
      quit(nickname);
    // close the connection
    } else {
        // otherwise we consider it a chat message if part of a room
        if(users[nickname].inroom!==null)
          broadcast(users[nickname].inroom, nickname + ':\033[39m ' + temp + '\n\r', true);
      }
      temp = '';
      conn.write('\n\r\033[93m > ');
    
  });

// To list all the online nickname
  function listUser (nickname) {
    users[nickname].port.write(' Currently online users:\n\r');
    for(var i in users){
      if(i!==nickname)
          users[nickname].port.write(' \n\r *'+i);
      else
          users[nickname].port.write(' \n\r *'+i+"(**this is you)");
    }
     users[nickname].port.write('\n\r end of list.\n\r');
  }
  // To show the number of users online
  function numUser (nickname) {
    var j = 0;
    for (var i in users) {
      j++;
    }
    users[nickname].port.write('\n\r\033[93m ' + j + ' users online\033[39m\n\r');
  }

// To find the first word from a sentence
  function firstWord (data) {
    var f = [];
    data = data.replace(/[.,\r\n]/g, '');
    f = data.split(' ');
    console.log(f[0]);
    return f[0];
  }
  // To private message a user
  function pmUser (data, nickname) {
    var original = data;
    var s = [];
    var data1 = data.replace(/[.,]/g, '');
    var s = data1.split(' ');
    var t = s[1];
    var result = original.substr(original.indexOf(" ")+ nickname.length + 2);
    //var result = s.splice(2).join(' ');
    console.log(result);
    if (nickname === t) {
      users[nickname].port.write('\n\r\033[93m > You PM yourself!\033[39m\n\r');
    } else if (validUser(t) === 1) {
      users[t].port.write('\n\r\033[92m > ' + nickname + ' (PM): ' + result + '\033[39m\n\r');
    } else {
      users[nickname].port.write('\n\r\033[93m > ' + t + ' is gone!\033[39m\n\r');
    }
  }

  function listUsersInRoom (roomobject, nickname) {
    for(var i=0;i<roomobject.people.length;i++){
      if(roomobject.people[i]!==nickname)
          users[nickname].port.write('\n\r *'+roomobject.people[i]);
      else
          users[nickname].port.write('\n\r *'+roomobject.people[i]+"(**this is you)\n\r");
    }
     users[nickname].port.write('\n\r end of list.\n\r');
}
  // Check if the user still online
  function validUser (t) {
    console.log(t);
    for (var i in users) {
      console.log(i);
      if (i === t) {
        return 1;
      }
    }
    return 0;
  }   
  // list all rooms in rooms hash
   function listRooms (nickname) {
    if(_.isEmpty(rooms)){
      users[nickname].port.write('\n\r No Active rooms!');
      return;
    }
    users[nickname].port.write('\n\r Active rooms are:');
    for(var prop in rooms){
      //if(rooms[prop].isAvailable)
        users[nickname].port.write('\n\r * '+rooms[prop].name+' ('+rooms[prop].people.length+')\n\r');
    }
    users[nickname].port.write('\n\r end of list.\n\r');
   }
   // To join a valid room if it exists, else create a room
  function joinRoom (data, nickname) {
    var s = data.split(' ');
    var roomname = s[1];
    console.log(roomname);
    var existRoom = _.findWhere(rooms, {'name': roomname});
      if(existRoom!==undefined){ //already exists, so join
        if (nickname === existRoom.owner) {
          users[nickname].port.write(" You are the owner of this room and you have already been joined.");
        } else {
          if (_.contains((existRoom.people), nickname)) {
            users[nickname].port.write(" You have already joined this room.");
          }
          else{
            users[nickname].port.write('\n\r Entering room: '+roomname);
            existRoom.addPerson(nickname);
            users[nickname].inroom = existRoom.id;
            //console.log(users[nickname].inroom);
            listUsersInRoom(existRoom, nickname);
            broadcast(existRoom.id,'\n\r > new user joined the room: ' + nickname, nickname);
          }
      }
    }
    else{  //create a new room
      if(users[nickname].inroom){
        users[nickname].port.write("You are in a room. Please leave it first to create your own.");
        return;
      }
      var id = uuid.v4();
      var room1 = new Room(roomname, id, nickname);
      rooms[id] = room1;
      rooms[id].addPerson(nickname);
      users[nickname].inroom = id;
      users[nickname].port.write('\n\r Entering room: '+roomname);
      listUsersInRoom(room1, nickname);
      //console.log(users[nickname].inroom);
      users[nickname].owns = id;
    }
     
  }
  // to leave the current room if the user belongs to one
  function leaveRoom (data, nickname) {
    var s = data.split(' ');
    var roomname = s[1];
    console.log(roomname);
    var curr_room = _.findWhere(rooms, {'name': roomname});
    //if user is owner of room
    if(curr_room!==null){
      if(users[nickname].owns === curr_room.id){
        console.log(curr_room.id);
        broadcast(curr_room.id, nickname + ' left the server. The room is removed and you have been disconnected from it as well.\033[39m\n\r',nickname);
        for (var i=0; i<curr_room.people.length; i++) {
          users[curr_room.people[i]].inroom = null;
        }
        users[nickname].owns = null;
        delete rooms[curr_room.id];
      }
      if(users[nickname].inroom === curr_room.id){
        var existRoom = _.findWhere(rooms, {'id': users[nickname].inroom});
        if(existRoom!==null){
          existRoom.people = _.without(existRoom.people, nickname);
          if(users[nickname].owns !== existRoom.id)
            broadcast(existRoom.id, nickname + ' left the room.\033[39m\n\r',nickname);
        }
          
        users[nickname].inroom = null;
      }
  }

  }
  function quit(nickname){
    count--;
    users[nickname].port.write(" BYE\n\r");
    
    if(users[nickname].inroom!==null){
      var existRoom = _.findWhere(rooms, {'id': users[nickname].inroom});
      if(existRoom!==null){
        existRoom.people = _.without(existRoom.people, nickname);
        if(users[nickname].owns !== existRoom.id)
          broadcast(existRoom.id, nickname + ' left the room\033[39m\n\r',nickname);
      }
    }
    if(users[nickname].owns!==null){
      var curr_room = _.findWhere(rooms, {'id': users[nickname].owns});
      broadcast(curr_room.id, nickname + ' left the server. The room is removed and you have been disconnected from it as well.\033[39m\n\r',nickname);
      for (var i=0; i<curr_room.people.length; i++) {
        users[room.people[i]].inroom = null;
      }
      delete rooms[curr_room.id];
    }
    conn.destroy();
    delete users[nickname];
    
    
  }
  conn.on('error', function(err) {
        console.log(err);
  }); 
  conn.on('close', function () {
    count--;
    if(users[nickname]!=undefined){
       users[nickname].port.write(" BYE");
    broadcast(users[nickname].inroom, nickname + ' left the room\033[39m\n\r',nickname);
    delete users[nickname];
    }
  });
});


server.listen(3000, function () {
  console.log('\033[96m   server listening on *:3000\033[39m');
});
