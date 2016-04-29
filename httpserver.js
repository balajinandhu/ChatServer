var http = require('http').createServer(httpHandler),
    fs = require("fs"),
    wsock = require('socket.io').listen(http),
    tcpsock = require('net');
var sticky = require('sticky-session'); //solves the problem of sticky session
var http_port = 8000;

var tcp_HOST = 'localhost';
var tcp_PORT = 3000;

/**
 * http server
 */
function httpHandler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

//http.listen(http_port);
if (!sticky.listen(http, http_port)) {
    http.once('listening', function() {
        console.info("HTTP server listening on " + http_port);
         });
} else {
  // Worker code


wsock.sockets.on('connection', function (socket) { 

    var tcpClient = new tcpsock.Socket();
    tcpClient.setEncoding("utf8");
    tcpClient.setKeepAlive(true);

    tcpClient.connect(tcp_PORT, tcp_HOST, function() {
        console.info('CONNECTED TO : ' + tcp_HOST + ':' + tcp_PORT);

        tcpClient.on('data', function(data) {
            // console.log(data);
            socket.emit("httpServer", data);
        });

        tcpClient.on('end', function(data) {
            console.log(data);
        });
        tcpClient.on("error", function (err){
            console.log("Connection closed by TCP server.")
            //console.log(err.stack)
    });
        

    });
   
    socket.on('tcp', function(message) {
            tcpClient.write(message+"\r\n");
            return;
    });
    socket.on("error", function (err){
        console.log("Caught server socket error: ")
        console.log(err.stack)
    });
    //socket.emit("httpServer", "Initial Data");
});

}
