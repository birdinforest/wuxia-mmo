# Heroku
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
    "socket.io": "^1.4.5"
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