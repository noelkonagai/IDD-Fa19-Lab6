/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;


//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
  console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
  console.log('a new user connected');
  var questionNum = 0; // keep count of question, used for IF condition.
  socket.on('loaded', function() { // we wait until the client has loaded and contacted us that it is ready to go.

    socket.emit('answer', "Hey, I am your chat bot. I can be sometimes forgetful."); //We start with the introduction;
    setTimeout(timedQuestion, 3000, socket, "Say hi to me!"); // Wait a moment and respond with a question.

  });
  socket.on('message', (data) => { // If we get a new message from the client we process it;
    console.log(data);
    questionNum = bot(data, socket, questionNum); // run the bot function with the new message
  });
  socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
    console.log('user disconnected');
  });
});
//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data, socket, questionNum) {
  var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
  var answer;
  var question;
  var waitTime;

  /// These are the main statments that make up the conversation.
  if (questionNum == 0) {
    answer = "Uhm... do I know you?"
    waitTime = 5000;
    question = "Anyways, what's your name?"
  } else if (questionNum == 1) {
    answer = "Really! " + input + ", that's your name?"
    waitTime = 2500;
    question = "I've known someone with the same name... sorry, what's your name again?"
  } else if (questionNum == 2) {
    answer =  "The other " + input + " was a student at Cornell Tech."; // output response
    waitTime = 3500;
    question = "Where do you go to school?"; // load next question
  } else if (questionNum == 3) {
    answer = "Oh what a coincidence that you also go to " + input + "!";
    waitTime = 3000;
    question = 'Whats your favorite color?'; // load next question
  } else if (questionNum == 4) {
    answer = "Whatever, pink it is!";
    socket.emit('changeBG', 'pink');
    waitTime = 2000;
    question = 'I forgot your name. Could you remind me?'; // load next question
  } else if (questionNum == 5) {
      answer = "I don't like your attitude.";
      waitTime = 2500;
      question = 'Are we done yet? I gotta go.';
  } else {
    answer = 'Bye!'; // output response
    waitTime = 0;
    question = '';
  }


  /// We take the changed data and distribute it across the required objects.
  socket.emit('answer', answer);
  setTimeout(timedQuestion, waitTime, socket, question);
  return (questionNum + 1);
}

function timedQuestion(socket, question) {
  if (question != '') {
    socket.emit('question', question);
  } else {
    //console.log('No Question send!');
  }

}
//----------------------------------------------------------------------------//
