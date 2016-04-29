/* Prototype to model the chat room - has 
    additional features built in, but not necessarily part of the application*/

//Constructor function for Room
function Room(name, id, owner) {
  this.name = name;
  this.id = id;
  this.owner = owner;
  this.people = [];
  //this.peopleLimit = 10;
  this.status = "available";
  this.private = false;
};

//add a person to the room
Room.prototype.addPerson = function(personID) {
  if (this.status === "available") {
    this.people.push(personID);
  }
};

//removes a person from the room
Room.prototype.removePerson = function(person) {
  var personIndex = -1;
  for(var i = 0; i < this.people.length; i++){
    if(this.people[i].id === person.id){
      personIndex = i;
      break;
    }
  }
  this.people.remove(personIndex);
};

// gets a person by personID
Room.prototype.getPerson = function(personID) {
  var person = null;
  for(var i = 0; i < this.people.length; i++) {
    if(this.people[i].id == personID) {
      person = this.people[i];
      break;
    }
  }
  return person;
};
//check availability of the room --not used
Room.prototype.isAvailable = function() {
  return this.available === "available";
};

//check if room is private -- not used
Room.prototype.isPrivate = function() {
  return this.private;
};

module.exports = Room;
