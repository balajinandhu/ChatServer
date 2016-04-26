var gulp = require('gulp')
var nodemon = require('gulp-nodemon');

var processes = {server1: null, server2: null};

gulp.task('run', function (cb) {
    
    processes.server1 = nodemon({
        script: "server.js",
        ext: "js"
    });

    processes.server2 = nodemon({
        script: "httpserver.js",
        ext: "js"
    });

    cb(); 
});


process.on('exit', function () {
    // In case the gulp process is closed (e.g. by pressing [CTRL + C]) stop both processes
    processes.server1.kill();
    processes.server2.kill();
});

gulp.task('default', ['run']);