# Deploy on Heroku
Login to heroku in terminal:
heroku login

Ensure git is initizalized in project folder:
git init

Ensure that not using local database.

Ensure set dependencies, engeins, and start script in package.json:
```json
// tsconfig.json
"dependencies":{
    "express": "^4.13.4",
    "socket.io": "^1.4.5",
    "v8-profiler": "^5.7.0"
},
"engines": {
"node": "6.11.3"
},
"scripts": {
"start": "node app.js",
"test": "echo \"Error: no test specified\" && exit 1"
},
```

Get npm installed module's version:
npm list modulename

Get npm version:
node -v

Server should listen on node's process port:

```js
// app.js
// create server.
var express = require('express');
var app = express();
// @ts-ignore
var server = require('http').Server(app);

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/client/index.html");
});
app.use('/client', express.static(__dirname + '/client'));

server.listen(process.env.PORT || 2000);            // HERE. use correct port depending on nodejs running environment, or using custmised prot.
console.log("Server started.");
```

Push to heroku master:
git add .
git commit -am "init"
git push keroku master

Check log:
heroku logs
heroku logs --tail  // streaming log

# Profiler
## Client
Develop Tools -> Performance
Cpu profiler: Develop Tools -> Custmise and control DevTools -> More tools -> javascript Profiler
## Server
Install v8-profiler:
npm install v8-profiler

Sample profiler on server by code:
```js

// app.js
var profiler = require('v8-profiler');
var fs = require('fs');

/**
 * Sample profiler by given duration, and save it to file.
 * @param {number} duration 
 */
var startProfiling = function(duration) {
    profiler.startProfiling('01', true);
    setTimeout(function(error, result) {
        var profile01 = profiler.stopProfiling('01');

        profile01.export(function(error, result) {
            fs.writeFile('./profile01.cpuprofile', result, null);
            profile01.delete();
            console.log('Profile saved as "./profile01.cpuprofile"');
        });
    }, duration);
};

// sample profile.
startProfiling(10000);
```