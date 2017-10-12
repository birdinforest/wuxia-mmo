var Direction = {NONE:0, UP:1, DOWN:2, LEFT:3, RIGHT:4};
var ShootVar = {NONE:'', SHOOT:'shoot', SHOOT_ANGLE:'angle'};

class Entity {
    constructor() {
        this.id = '';
        this.x = 250;
        this.y = 250;
        this.spdX = 0;
        this.spdY = 0;
    }

    update() {
        this.updatePosition();
    }

    updatePosition() {
        this.x += this.spdX;
        this.y += this.spdY;
    }

    getDistance(pt) {
        return Math.sqrt(Math.pow(this.x - pt.x, 2) + Math.pow(this.y - pt.y, 2));
    }
}

class Player extends Entity {
    constructor(id, look, maxSpd) {
        super();

        this.id = id;

        this.look = look || "P";
        this.maxSpd = maxSpd || 10;

        this.moveUp = false;
        this.moveDown = false;
        this.moveLeft = false;
        this.moveRight = false;

        this.canShoot = false;
        this.shootAngle = 90;

        this.faceTo = Direction.Up;

        this.hp = 10;
        this.hpMax = 10;
        this.score = 0;

        // add new player into list.
        Player.list[id] = this;
        initPack.player.push(this.getInitPack());
    }

    update() {
        this.updateSpeed();
        super.update();
        this.shoot();
    }

    shoot() {
        if(!this.canShoot) {
            return;
        }

        Bullet.create(this, this.shootAngle, 15, this.x + 10, this.y - 10);
    }

    // update date based on move direction and player's designed speed.
    updateSpeed() {
        let self = this;
        if(self.moveUp)
            self.spdY = -self.maxSpd;
        else if(self.moveDown)
            self.spdY = self.maxSpd;
        else 
            self.spdY = 0;

        if(self.moveLeft)
            self.spdX = -self.maxSpd;
        else if(self.moveRight)
            self.spdX = self.maxSpd;
        else 
            self.spdX = 0;
    }

    // udpate move direction based on given data.
    updateAction (inputID, state) {
        if(inputID === Direction.UP) {
            this.moveUp = state;
            this.faceTo = Direction.UP;
        }
        else if(inputID === Direction.DOWN) {
            this.moveDown = state;
            this.faceTo = Direction.DOWN;
        }
        else if(inputID === Direction.LEFT) {
            this.moveLeft = state;
            this.faceTo = Direction.LEFT;
        }
        else if(inputID === Direction.RIGHT) {
            this.moveRight = state;
            this.faceTo = Direction.RIGHT;
        }
        else if(inputID === ShootVar.SHOOT) {
            this.canShoot = state;
        }
        else if(inputID === ShootVar.SHOOT_ANGLE) {
            this.shootAngle = state;
        }
    }

    getInitPack() {
        return {
            x:this.x,
            y:this.y,
            id:this.id,
            look:this.look,
            hp:this.hp,
            hpMax:this.hpMax,
            score:this.score,
        };
    }

    getUpdatePack() {
        return {
            x:this.x,
            y:this.y,
            id:this.id,
            hp:this.hp,
            hpMax:this.hpMax,
            score:this.score,
        };
    }

    getRemovePack() {
        return {
            id:this.id,
        };
    }

    static getExistPlayersInitPack() {
        var pack = [];
        for(var i in Player.list) {
            pack.push(Player.list[i].getInitPack());
        }

        return pack;
    }

    // create new player.
    static create(id, look, maxSpd) {
        return new Player(id, look, maxSpd);
    }

    static onConnection(socket, look, maxSpd) {
        var player = Player.create(socket.id, look, maxSpd);

        socket.on('keyPress', function(data) {
            player.updateAction(data.inputID, data.state);
        });

        socket.on('keyRelease', function(data) {
            player.updateAction(data.inputID, data.state);
        });

        socket.on('mouseEvent', function(data) {
            player.updateAction(data.inputID, data.state);
        });

        socket.emit('connectionInit', {selfId:socket.id});
    }

    static onDisconnection(socket) {
        Player.destroy(socket.id);
    }

    static destroy(id) {
        var player = Player.list[id];
        if(player === undefined)
            return;
        removePack.player.push(player.getRemovePack());

        delete Player.list[id];
    }

    static updatePlayers() {
        var pack = [];

        for (var i in Player.list) {
            var player = Player.list[i];
            player.update();
            pack.push(player.getUpdatePack());
        }

        return pack;
    }
}
Player.list = {};       // A static list belongs to Player class.

class Bullet extends Entity {
    constructor(parent, angle, maxSpd, posX, posY) {
        super();

        /**@type{string} */
        this.id = Math.random().toString();

        /**@type{number} */
        this.x = posX;

        /**@type{number} */
        this.y = posY;

        /**@type{number} */
        this.maxSpd = maxSpd || 10;

        /**@type{number} */
        this.spdX = Math.cos(angle/180 * Math.PI) * this.maxSpd;

        /**@type{number} */
        this.spdY = Math.sin(angle/180 * Math.PI) * this.maxSpd;

        /**@type{Player} */
        this.parent = parent;

        /**@type{number} */
        this.lifeTime = 0;

        // add new bullet into list.
        Bullet.list[this.id] = this;
        initPack.bullet.push({
            id: this.id,
            x: this.x,
            y: this.y,
            parentId: this.parent.id,
        });
    }

    update() {
        var isHitPlayer = false;
        for(var i in Player.list) {
            var p = Player.list[i];
            if(this.parent.id === p.id) {
                continue;
            } else if(this.getDistance(p) <= 32) {
                isHitPlayer = true;
                p.hp -= 1;
                if(p.hp <= 0) {                     // target is dead, respawn that player. 
                    p.x = Math.random() * 500;
                    p.y = Math.random() * 500;
                    p.hp = p.hpMax;
                    if(this.parent) {               // shooter score up.
                        this.parent.score += 1;
                    }
                }
            }
        }

        this.lifeTime++;
        if(this.lifeTime == 20 || isHitPlayer) {
            Bullet.destroy(this.id);
        }

        super.update();
    }

    /**
     * @return {{x:number, y:number, id:string}}
     * @memberof Bullet
     */
    getInitPack() {
        return {
            x:this.x,
            y:this.y,
            id:this.id,
        };
    }

    /**
     * @return {{x:number, y:number, id:string}}
     * @memberof Bullet
     */
    getUpdatePack() {
        return {
            x:this.x,
            y:this.y,
            id:this.id,
        };
    }

    /**
     * @return {{id:string}}
     * @memberof Bullet
     */
    getRemovePack() {
        return {
            id:this.id,
        };
    }

    static getExistBulletInitPack() {
        var pack = [];
        for(var i in Bullet.list) {
            pack.push(Bullet.list[i].getInitPack());
        }

        return pack;
    }

    static destroy(id) {
        var bullet = Bullet.list[id];
        if(bullet === undefined)
            return;
        removePack.bullet.push(bullet.getRemovePack());

        delete Bullet.list[id];
    }

    /**
     * @static
     * @param {Player} parent 
     * @param {number} angle 
     * @param {number} maxSpd 
     * @param {number} posX 
     * @param {number} posY 
     * @returns {Bullet}
     * @memberof Bullet
     */
    // create new bullet.
    static create(parent, angle, maxSpd, posX, posY) {
        return new Bullet(parent, angle, maxSpd, posX, posY);
    }

    /**
     * @static
     * @returns []
     * @memberof Bullet
     */
    static updateBullets() {
        var pack = [];

        for (var i in Bullet.list) {
            var bullet = Bullet.list[i];
            bullet.update();
            pack.push(bullet.getUpdatePack());
        }

        return pack;
    }
}
/**@type{Object<number, Bullet>} */
Bullet.list = {};       // A static list belongs to Bullet class.

var DEBUG = true;
var SOCKET_LIST = new Map();

var latestSocket;
var doSynToLatest = false;

// get db
// var mongojs = require('mongojs');
// var db = mongojs('localhost:27017/myGame', ['account','progress']);

// create server.
var express = require('express');
var app = express();
// @ts-ignore
var server = require('http').Server(app);

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/client/index.html");
});
app.use('/client', express.static(__dirname + '/client'));

server.listen(process.env.PORT || 2000);
console.log("Server started.");

// socket functions
var io = require('socket.io')(server, {});
io.sockets.on('connection', function(socket){
    // collect new socket.
    socket.id = Math.random().toString();
    SOCKET_LIST[socket.id] = socket;
    console.log('socket connection, id:' + socket.id);

    // handle signin
    socket.on('signIn', function(data) {
        isValidPlayer(data, function(isValid) {
            if(isValid) {
                // create new player and collect it into Player.list.
                var number = Math.floor(10 * Math.random());
                Player.onConnection(socket, number, 15);
                socket.emit('signInResponse', {success:true});
                if(latestSocket === socket && doSynToLatest) {
                    createSynPack();
                    socket.emit('synchronize', synPack);
                    doSynToLatest = false;
                }
            } else {
                socket.emit('signInResponse', {success:false});
            }
        });
    });

    // handle signup
    socket.on('signUp', function(data) {
        isUsernameTaken(data, function(isTaken) {
            if(isTaken) {
                socket.emit('signUpResponse', {success:false});
            } else {
                addUser(data, function(isSuccess){
                    socket.emit('signUpResponse', {success:isSuccess?true:false});
                });
            }
        });
    });

    socket.on('disconnect', function() {
        delete SOCKET_LIST[socket.id];
        Player.onDisconnection(socket);
    });

    // receive chat and broadcast to all clients.
    socket.on('sendMsgToServer', function(data){
        let playerName = socket.id.toString().slice(2,7);
        let msg = playerName + ':' + data;
        for(var i in SOCKET_LIST) {
            SOCKET_LIST[i].emit('addToChat', msg);
        }
    });

    // evel server
    socket.on('evalServer', function(data){
        if(!DEBUG)
            return;

        var res = '';
        try {
            res = eval(data);   // jshint ignore:line
        } catch(e) {
            res = e.message;
        }
        socket.emit('evalAnswer', res);
    });

    latestSocket = socket;
    doSynToLatest = true;
    console.log("latest socket: " + latestSocket.id);
});

// data pack
var initPack = {player:[], bullet:[]};
var removePack = {player:[], bullet:[]};
var updatePack = {player:[], bullet:[]};
var synPack = {player:[], bullet:[]};

var createSynPack = function(){
    synPack.player = Player.getExistPlayersInitPack();
    synPack.bullet = Bullet.getExistBulletInitPack();
};

// update
setInterval(function() {
    updatePack.player = Player.updatePlayers();
    updatePack.bullet = Bullet.updateBullets();

    // var updatePack = {
    //     player: Player.updatePlayers(),
    //     bullet: Bullet.updateBullets(),
    // }

    for(var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('update', updatePack);
        socket.emit('init', initPack);
        socket.emit('destroy', removePack);
    }

    // empty them after sending.
    initPack.player = [];
    initPack.bullet = [];
    removePack.player = [];
    removePack.bullet = [];
    synPack.player = [];
    synPack.bullet = [];

}, 1000/25);

// util
var isValidPlayer = function(data, cb) {
    cb(true);
    // db.account.find({username:data.username,password:data.password}, function(err, res) {
    //     if(err) {
    //         console.log(err.message);
    //         cb(false);
    //     } else if(res.length === 0) {
    //         cb(false);
    //     } else {
    //         cb(true);
    //     }
    // });
};

var isUsernameTaken = function(data, cb) {
    cb(false);
    // db.account.find({username:data.username}, function(err, res) {
    //     if(err) {
    //         console.log(err.message);
    //         cb(true);
    //     } else if(res.length === 0) {
    //         cb(false);
    //     } else {
    //         cb(true);
    //     }
    // });
};

var addUser = function(data, cb) {
    cb();
    // db.account.insert({username:data.username,password:data.password}, function(err) {
    //     cb(err?false:true);
    // });
};