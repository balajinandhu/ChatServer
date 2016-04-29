# ChatServer
Node.js based chat server with TCP sockets.


Allows users to create, join and leave chat rooms. The users are identified using nicknames they enter while logging in. 

STEPS TO RUN ON MAC OS X:

STEP 1: Open Terminal.

STEP 2: Clone the Github repo into any folder, say ChatServer using `git clone https://github.com/balajinandhu/ChatServer.git`

STEP 3: CD into ChatServer.

STEP 4: Install the node packages necessary to run the server, using `npm install` on the terminal.

STEP 5: Start the server by using the command `node server.js`

STEP 6: Now the Server should be up and running. To create clients, just open a new terminal window, and use
`telnet localhost 3000`. You can create as many clients as you want users for my chat server.

Also there is a minimalist web client that can simulate the running of the application on a browser. To test it on a browser, start the http server using `node httpserver.js` while keeping the TCP server running as in Step 5. Now, go to http://localhost:8000 in the browser and you should be able to see the client. The commands to interact are similar to testing on telnet.
