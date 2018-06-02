const defines = require('./../defines');
const Carder = require('./carder');
const RoomState = {
    Invalide: -1,
    WaitingReady: 1,
    StartGame: 2,
    PushCard: 3,
    RobMaster: 4,
    ShowBottomCard: 5,
    Playing: 6,
    GameOver: 7,
};
const getRandomStr = function (count) {
    let str = '';
    for(let i = 0; i < count; i ++) {
        str += Math.floor(Math.random() * 10);
    }
    return str;
}
const getSeatIndex = function (playerList) {
    let idx = 0;

    if (playerList.length === 0) {
        return idx;
    }
    // let seatIndexList = [];
    // for (let i = 0; i < defines.roomFullPlayerCount; i ++) {
    //     seatIndexList.push(false);
    // }
    // for(let i = 0; i < playerList.length; i++) {
    //     seatIndexList[playerList[i].seatIndex] = true;
    // }
    // for (let i = 0; i < defines.roomFullPlayerCount; i ++) {
    //     if (!seatIndexList[i])
    //         return i
    // }
    for(let i = 0; i < playerList.length; i++) {
        if (idx !== playerList[i].seatIndex) {
            return idx;
        }
        idx++;
    }
    console.log('room >> line = 33 idx = ' + idx);
    return idx;
};
module.exports = function (spec, player) {
    let that = {};
    that.roomID = getRandomStr(6);

    let config = defines.createRoomConfig[spec.rate];
    let _bottom = config.bottom;
    let _rate = config.rate;
    let _houseManager = player;
    // that.gold = spec.gold;
    let _playerList = [];
    let _carder = Carder();
    let _lostPlayer = undefined;
    let _robMasterPlayerList = [];
    let _pushPlayerList = [];
    let _master = undefined;
    let _firstMaster = undefined;
    let _masterIndex = 0;
    let _threeCardsList = [];
    let _curPlayerPushCardList = undefined;
    let _curPlayerPushCardAccountID = undefined;
    let _winner = undefined;

    // for (let i = 0; i < cards.length; i++) {
    //     for (let j = 0; j < cards[i].length; j++) {
    //         let card = cards[i][j];
    //         console.log(i + ' value = ' + card.value, 'shape = ' + card.shape, 'kings = ' + card.king);
    //     }
    // }

    that.gold = 100;
    let _state = RoomState.Invalide;
    const setState = function (state) {
        console.log('room >> line = 76 ', _state);
        if (state === _state) {
            return;
        }
        switch (state) {
            case RoomState.Invalide:
                break;
            case RoomState.WaitingReady:
                break;
            case RoomState.StartGame:
                for(let i = 0; i < _playerList.length; i++) {
                    _playerList[i].sendGameStart();
                }
                setState(RoomState.PushCard);
                break;
            case RoomState.PushCard:
                console.log('room >> line = 69 push card');
                _threeCardsList = _carder.getThreeCards();
                for (let i = 0; i < _playerList.length; i ++) {
                    _playerList[i].sendPushCard(_threeCardsList[i]);
                }
                // for (let i = 0; i < threeCards.length; i++) {
                //     for (let j = 0; j < threeCards[i].length; j++) {
                //         let card = threeCards[i][j];
                //         console.log(i + ' value = ' + card.value, 'shape = ' + card.shape, 'kings = ' + card.king);
                //     }
                // }
                setState(RoomState.RobMaster);
                break;
            case RoomState.RobMaster:
                // turnRobMaster()
                _robMasterPlayerList = [];
                if (_lostPlayer === undefined) {
                    for (let i = _playerList.length - 1; i >= 0; i--) {
                        _robMasterPlayerList.push(_playerList[i]);
                    }
                }
                turnPlayerRobMaster();
                break;
            case RoomState.ShowBottomCard:
                for (let i = 0; i < _playerList.length; i ++) {
                    _playerList[i].sendShowBottomCard(_threeCardsList[3]);
                }
                setTimeout(()=>{
                    setState(RoomState.Playing);
                }, 2000);
                break;
            case RoomState.Playing:
                // let index = 0;
                for (let i = 0; i < _playerList.length; i++) {
                    if (_playerList[i].accountID === _master.accountID) {
                        _masterIndex = i;
                    }
                }
                refreshPushCardPlayer();
                changePushCardPlayer();
                break;
            case RoomState.GameOver:
                for (let i = 0; i < _playerList.length; i ++) {
                    _playerList[i].sendGameOver(_winner);
                }
                _winner = undefined;
                break;
            default:
                break;
        }
        _state = state;
    };
    setState(RoomState.WaitingReady);
    that.joinPlayer = function (player) {
        player.seatIndex = getSeatIndex(_playerList);
        for(let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendPlayerJoinRoom({
                nickName: player.nickName,
                accountID: player.accountID,
                avatarUrl: player.avatarUrl,
                gold: player.gold,
                seatIndex: player.seatIndex
            });
        }
        _playerList.push(player)
    };
    that.exitPlayer = function (player) {
        // player.seatIndex = getSeatIndex(_playerList);
        console.log('room >> line = 153 _playerList', JSON.stringify(_playerList));
        console.log('room >> line = 153 player', JSON.stringify(player));
        for(let i = 0; i < _playerList.length; i++) {
            console.log('room >> line = 156 ', _playerList[i].accountID, player.accountID);
            if (_playerList[i].accountID === player.accountID) {
                _playerList.splice(i, 1);
                break;
            }
        }
        for(let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendPlayerExitRoom({
                nickName: player.nickName,
                accountID: player.accountID,
                avatarUrl: player.avatarUrl,
                gold: player.gold,
                seatIndex: player.seatIndex
            });
        }
    };

    that.playerEnterRoomScene = function (player, cb) {
        let playerData = [];
        for(let i = 0; i < _playerList.length; i ++){
            playerData.push({
                nickName: _playerList[i].nickName,
                accountID: _playerList[i].accountID,
                avatarUrl: _playerList[i].avatarUrl,
                gold: _playerList[i].gold,
                seatIndex: _playerList[i].seatIndex,
                isReady: _playerList[i].isReady,
            });
        }
        // let index = 0;
        if (cb) {
            cb({
                seatIndex: player.seatIndex,
                playerData: playerData,
                roomID: that.roomID,
                houseManagerID: _houseManager.accountID,
            })
        }
    };

    const refreshPushCardPlayer = function () {
        let index = _masterIndex;
        for (let i = 2; i >= 0; i--) {
            let z = index % 3;
            _pushPlayerList[i] = _playerList[z];
            index ++;
        }
    }

    const changePushCardPlayer = function () {
        if (_pushPlayerList.length === 0) {
            refreshPushCardPlayer();
        }
        let player = _pushPlayerList.pop();
        if (_curPlayerPushCardAccountID !== undefined && _curPlayerPushCardAccountID === player.accountID) {
            _curPlayerPushCardAccountID = undefined;
            _curPlayerPushCardList = undefined;
        } 
        let isNonePush = (_curPlayerPushCardAccountID === undefined || player.accountID === _curPlayerPushCardAccountID) 
        for (let i = 0; i < _playerList.length; i ++) {
            _playerList[i].sendPlayerCanPushCard(player.accountID, isNonePush);
        }
    };

    const sendPlayerPushCard = function (player, cards) {
        for (let i = 0; i < _playerList.length; i ++) {
            _playerList[i].sendPlayerPushCard({
                accountID: player.accountID,
                cards: cards,
            });
        }
    };

    that.playerPushCard = function (player, cards, cb) {
        if (cards.length === 0) {
            changePushCardPlayer();
        } else {
            let cardsValue = _carder.isCanPushCards(cards);
            if (cardsValue) {
                if (_curPlayerPushCardList === undefined) {
                    if (cb) {
                        cb(null, 'push card success');
                    }
                    _curPlayerPushCardList = cards;
                    _curPlayerPushCardAccountID = player.accountID;
                    sendPlayerPushCard(player, cards);
                    if (player.cards.length === 0){
                        _winner = player.accountID;
                        setState(RoomState.GameOver);
                        return;
                    }
                    changePushCardPlayer();
                } else {
                    let result = _carder.compare(cards, _curPlayerPushCardList);
                    console.log('room >> line = 213 对比大小' + result);
                    if (result === true) {
                        if (cb) {
                            cb(null, cardsValue);
                        }
                        _curPlayerPushCardList = cards;
                        _curPlayerPushCardAccountID = player.accountID;
                        sendPlayerPushCard(player, cards);
                        if (player.cards.length === 0){
                            _winner = player.accountID;
                            setState(RoomState.GameOver);
                            return;
                        }
                        changePushCardPlayer();
                    } else {
                        if (cb) {
                            // cb('牌不大于上家')
                            cb(result)
                        }
                    }
                } 
            } else {
                if (cb) {
                    cb('不符合出牌规则')
                }
            }
        }
    };
    that.playerRobStateMaster = function (player, value) {
        console.log('room >> line = 269 value',player.accountID, value);
        if (value === 'rob' || value === 'call') {
            _master = player;
            if (_firstMaster === _master) {
                changeMaster();
                return;
            }
            if (_firstMaster === undefined) {
                _firstMaster = _master;
            }
        } else if (value === 'no_rob') {
            if (_firstMaster === player) {
                changeMaster();
                return;
            }
        }
        for (let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendPlayerRobStateMaster(player.accountID, value);
        }
        turnPlayerRobMaster();
    };

    that.playerRequestTips = function (player, cb) {
        let cardsList = player.cards;
        if (cb) {
            console.log('room >> line = 261 accountID = ' + player.accountID);
            let cardList = _carder.getTipsCardsList(_curPlayerPushCardList, cardsList);
            cb(null, cardList);
        }
    };
    
    const changeHouseManager = function () {
        if (_playerList.length == 0) {
            return;
        }
        _houseManager = _playerList[0];
        for (let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendChangeHouseManager(_houseManager.accountID);
        }
    };

    const turnPlayerRobMaster = function () {
        if (_robMasterPlayerList.length == 0) {
            // console.log('room >> line = 167 rob end', _firstMaster, _master);
            if (_firstMaster === undefined) {
                // _houseManager.startGame();
                setState(RoomState.Invalide);
                setState(RoomState.StartGame);
            } else {
                if (_firstMaster === _master) {
                    changeMaster();
                }else {
                    for (let i = 0; i < _playerList.length; i++) {
                        _playerList[i].sendPlayerCanRob(_master, _firstMaster.accountID);
                    }
                }
            }
            return ;
        }
        let player = _robMasterPlayerList.pop();
        // if (_robMasterPlayerList.length === 0 && _master === undefined) {
        //     _master = player;
        //     _firstMaster = player;
        //     changeMaster();
        //     return;
        // }
        for (let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendPlayerCanRob(_master, player.accountID);
        }
    };

    const changeMaster = function () {
        for (let i = 0; i < _playerList.length; i ++) {
            _playerList[i].sendChangeMaster(_master, _threeCardsList[3]);
        }
        console.log('room >> line = 346 master', _master.accountID);
        setState(RoomState.ShowBottomCard);
    };

    that.playerOffLine = function (player) {
        for(let i = 0; i < _playerList.length; i++) {
            if (_playerList[i].accountID == player.accountID) {
                _playerList.splice(i, 1);
                changeHouseManager();
            }
        }
    };

    that.playerReady = function (player) {
        for (let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendPlayerReady(player.accountID, player.isReady);
        }
    };

    const gameStart = function () {
        for(let i = 0; i < _playerList.length; i++) {
            _playerList[i].sendGameStart();
        }
    }

    that.houseManagerStartGame = function (player, cb){
        if (_playerList.length !== defines.roomFullPlayerCount) {
            if (cb) {
                cb('player no enough, can not start game!');
            }
            return;
        }
        for(let i = 0; i < _playerList.length; i ++){
            if (_playerList[i].accountID !== _houseManager.accountID && _playerList[i].isReady === false) {
                if (cb) {
                    cb('have player is not ready, can not start game!');
                }
                return;
            }
        }
        if (cb) {
            cb(null, 'success');
        }
        // gameStart();
        setState(RoomState.StartGame);
    };

    that.getPlayerCount = function () {
        return _playerList.length;
    };

    Object.defineProperty(that, 'bottom', {
        get() {
            return _bottom;
        },
        // set(val){
        //     _bottom = val
        // }
    });

    Object.defineProperty(that, 'rate', {
        get() {
            return _rate;
        },
        // set(val){
        //     _rate = val
        // }
    });

    return that;
};