const Player = function (spec, socket, cbIndex, gameController) {
    let that = {};
    that.gold = spec.gold_count;
    let _socket = socket;
    console.log('create new player = ' + JSON.stringify(spec));
    let _nickName = spec.nick_name;
    let _accountID = spec.account_id;
    let _avatarUrl = spec.avatar_url;
    let _room = undefined;
    let _startIndex = undefined;
    that.seatIndex = 0;
    that.isReady = false;
    that.cards = [];
    const notify = function (type, data, callBackIndex) {
        _socket.emit('notify', {
            type: type,
            data: data,
            callBackIndex: callBackIndex
        });
        console.log('callBackIndex = ' + callBackIndex);
    };

    notify('login', {
        goldCount: that.gold
    }, cbIndex);

    _socket.on('disconnect', ()=> {
        console.log('player >> line = 25 玩家掉线');
        if (_room) {
            _room.playerOffLine(that);
        }
    });

    _socket.on('notify', (notifyData)=>{
        let type = notifyData.type;
        let callBackIndex = notifyData.callBackIndex;
        switch (type) {
            case 'create_room':
                // notify('create_room', {data: 'create_room'}, callBackIndex)
                gameController.createRoom(notifyData.data, that, (err, data) => {
                    _startIndex = callBackIndex;
                    if (err) {
                        console.log('err =' + err);
                        notify('create_room', {err: err}, callBackIndex)
                    } else {
                        console.log('data = ' + JSON.stringify(data));
                        notify('create_room', {data: data}, callBackIndex)
                    }
                });
                break;
            case 'join_room':
                console.log('join room data = ' + JSON.stringify(notifyData.data));
                gameController.joinRoom(notifyData.data, that, (err, data)=>{
                    if (err) {
                        notify('join_room', {err:err,}, callBackIndex);
                    } else {
                        _room = data.room
                        notify('join_room', {data: data.data}, callBackIndex);
                    }
                });
                break;
            case 'exit_room':
                console.log('exit room data = ' + JSON.stringify(notifyData.data));
                gameController.exitRoom(notifyData.data, that, (err, data)=>{
                    if (err) {
                        notify('exit_room', {err:err,}, callBackIndex);
                    } else {
                        _room = data.room
                        notify('exit_room', {data: data.data}, callBackIndex);
                    }
                });
                break;
            case 'enter_room_scene':
                if (_room) {
                    _room.playerEnterRoomScene(that, (data)=>{
                        _seatIndex = data.seatIndex;
                        // console.log('player >> line = 64 enter room ' + JSON.stringify(data));
                        notify('enter_room_scene', data, callBackIndex);
                    });
                }
                break;
            case 'ready':
                that.isReady = true;
                if (_room) {
                    _room.playerReady(that);
                }
                break;
            case 'cancel':
                that.isReady = false;
                if (_room) {
                    _room.playerReady(that);
                }
                break;
            case 'start_game':
                if (_room) {
                    _room.houseManagerStartGame(that, (err, data)=>{
                        if (err) {
                            notify('start_game', {err: err}, callBackIndex);
                        } else {
                            notify('start_game', {data: data}, callBackIndex);
                        }
                    });
                }
                break;
            case 'rob_state':
                if (_room) {
                    _room.playerRobStateMaster(that, notifyData.data);
                }
                break;
            case 'own_push_card':
                if (_room) {
                    _room.playerPushCard(that, notifyData.data, (err, data)=>{
                        if (err) {
                            notify('own_push_card', {err: err}, callBackIndex);
                        } else {
                            notify('own_push_card', {data: data}, callBackIndex);
                        }
                    });
                }
                break;
            case 'request_tips':
                if (_room) {
                    _room.playerRequestTips(that, (err, data)=>{
                        if (err) {
                            notify('request_tips', {err: err}, callBackIndex);
                        } else {
                            notify('request_tips', {data: data}, callBackIndex);
                        }
                    });
                }
                console.log('player >> line = 112');
                break;
            default: 
                break;
        }
    });

    that.sendPlayerJoinRoom = function (data) {
        notify('player_join_room', data, null);
    };

    that.sendPlayerExitRoom = function (data) {
        notify('player_exit_room', data, null);
    };

    that.sendPlayerReady = function (data, isReady) {
        notify('player_ready', {data: data, isReady: isReady}, null);
    };

    that.sendGameStart = function () {
        notify('game_start', {}, null);
    };
    
    that.sendChangeHouseManager = function (data) {
        notify('change_house_manager', data, null);
    };

    that.sendPushCard = function (cards) {
        that.cards = cards;
        notify('push_card', cards, null);
    };

    that.sendPlayerCanRob = function (master, data) {
        notify('can_rob', {master: master, data: data}, null);
    };

    that.sendPlayerCallMaster = function (data) {
        notify('call_master', data, null);
    };

    that.sendPlayerRobStateMaster = function (accountID, value) {
        notify('player_rob_state', {accountID: accountID, value: value}, null);
    };

    that.sendChangeMaster = function (player, cards) {
        if (that.accountID === player.accountID) {
            for (let i = 0; i < cards.length; i++) {
                that.cards.push(cards[i]);
            }
        }
        notify('change_master', player.accountID);
    };
    
    that.sendShowBottomCard = function (data) {
        notify('show_bottom_card', data);
    };

    that.sendGameOver = function (winner) {
        notify('game_over', winner);
    };

    that.sendPlayerCanPushCard = function (data, isNonePush) {
        notify('can_push_card', {uid:data, push:isNonePush});
    };

    that.startGame = function () {
        if (_room) {
            console.log('player >> line = 192 ');
            _room.houseManagerStartGame(that, (err, data)=>{
                if (err) {
                    notify('start_game', {err: err}, _startIndex);
                } else {
                    notify('start_game', {data: data}, _startIndex);
                }
            });
        }
    };

    that.sendPlayerPushCard = function (data) {
        let accountID = data.accountID;
        if (accountID === that.accountID) {
            let cards = data.cards;
            for (let i = 0; i < cards.length; i++) {
                let card = cards[i];
                for (let j = 0; j < that.cards.length; j++) {
                    if (card.id === that.cards[j].id) {
                        that.cards.splice(j, 1);
                    }
                }
            }
        }
        notify('player_push_card', data);
    };

    Object.defineProperty(that, 'nickName', {
        get(){
            return _nickName;
        }
    });
    Object.defineProperty(that, 'accountID', {
        get(){
            return _accountID;
        }
    });
    Object.defineProperty(that, 'avatarUrl', {
        get(){
            return _avatarUrl;
        }
    });

    return that;
};
module.exports = Player;