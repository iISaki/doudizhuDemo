const Player = require('./player');
const Room = require('./room')
const defines = require('./../defines')
let _playerList = [];
let _roomList = [];
exports.createPlayer = function (data, socket, callBackIndex) {
    let player = Player(data, socket, callBackIndex, this);
    _playerList.push(player);
};

exports.createRoom = function (data, player, cb) {
    //todo 检测金币
    let needCostGold = defines.createRoomConfig[data.rate];
    if (player.gold < needCostGold) {
        if (cb) {
            cb('gold not enough');
        }
    }
    let room = Room(data, player);
    _roomList.push(room);
    if (cb) {
        cb(null, room.roomID);
    }
};

exports.joinRoom = function (data, player, cb) {
    console.log('joinRoom data = ' + data);
    for(let i = 0; i < _roomList.length; i++) {
        if (_roomList[i].roomID === data) {
            let room = _roomList[i];
            if (room.getPlayerCount() === 3) {
                if (cb) {
                    cb('room is full');
                }
                return;
            }
            room.joinPlayer(player);
            if (cb) {
                console.log('room gold = ' + room.gold);
                cb(null, {
                    room: room,
                    data: {bottom:room.bottom, rate: room.rate}
                });
            }
            return;
        }
    }
    if (cb){
        console.log('game-controller >> line = 39');
        cb('have not this room ' + data);
    }
};

exports.exitRoom = function (data, player, cb) {
    console.log('exitRoom data = ' + data);
    for(let i = 0; i < _roomList.length; i++) {
        if (_roomList[i].roomID === data) {
            let room = _roomList[i];
            if (room.getPlayerCount() === 0) {
                if (cb) {
                    cb('room is empty');
                }
                return;
            }
            room.exitPlayer(player);
            if (cb) {
                console.log('room gold = ' + room.gold);
                cb(null, {
                    room: room,
                    // data: {bottom:room.bottom, rate: room.rate}
                });
            }
            return;
        }
    }
    if (cb){
        console.log('game-controller >> line = 39');
        cb('have not this room ' + data);
    }
};