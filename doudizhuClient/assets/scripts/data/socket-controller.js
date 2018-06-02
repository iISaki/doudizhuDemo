import EventListener from './../utility/event-listener'
const SocketController = function () {
    let that = {};
    let _socket = io(defines.serverUrl);
    let _callBackMap = {};
    let _callBackIndex = 0;
    let _event = EventListener({});
    // _socket.on('connection', ()=>{
    //     console.log('connect success!!!!');
    // });
    _socket.on('notify', (data)=>{
        // console.log('notify = ' + JSON.stringify(data));
        let callBackIndex = data.callBackIndex;
        // console.log('callBackIndex = ' + callBackIndex);
        if (_callBackMap.hasOwnProperty(callBackIndex)) {
            let cb = _callBackMap[callBackIndex];
            if (data.data.err) {
                cb(data.data.err);
            } else {
                cb(null, data.data);
            }
        } else {
            let type = data.type;
            _event.fire(type, data.data);
        }
    });
    that.init = function () {

    };
    // that.requestWxLogin = function (data, cb) {
    //     _socket.emit('wx-login', data);
    // };

    const notify = function (type, data, callBackIndex) {
        _socket.emit('notify', {type: type, data: data, callBackIndex: callBackIndex})
    };

    const request = function (type, data, cb){
        _callBackIndex ++;
        _callBackMap[_callBackIndex] = cb;
        notify(type, data, _callBackIndex);
    };

    that.requestLogin = function (data, cb) {
        request('login', data, cb)
    };

    that.requestCreateRoom = function (data, cb) {
        request('create_room', data, cb)
    };

    that.requestJoinRoom = function (data, cb) {
        request('join_room', data, cb);
        console.log('socket-controller >> line = 49 data = ' + JSON.stringify(data));
    };

    that.requestExitRoom = function (data, cb) {
        request('exit_room', data, cb);
        console.log('socket-controller >> line = 59 data = ' + JSON.stringify(data));
    };

    that.requestEnterRoomScene = function (cb) {
        request('enter_room_scene', {}, cb);
    };

    that.requestStartGame = function (cb) {
        request('start_game', {}, cb);
    };

    that.requestPlayerPushCard = function (value, cb) {
        request('own_push_card', value, cb);
    };

    that.requestTipsCards = function (cb) {
        console.log('socket-controller >> line = 70 ');
        request('request_tips', {}, cb);
    };


    that.notifyReady = function () {
        notify('ready', {}, null);
    };

    that.notifyCancel = function () {
        notify('cancel', {}, null);
    };

    that.notifyRobState = function (value) {
        notify('rob_state', value, null);
    };

 
    that.onPlayerJoinRoom = function (cb) {
        _event.on('player_join_room', cb);
    };

    that.onPlayerExitRoom = function (cb) {
        _event.on('player_exit_room', cb);
    };

    that.onPlayerReady = function (cb) {
        _event.on('player_ready', cb)
    };

    that.onGameStart = function (cb) {
        _event.on('game_start', cb)
    };

    that.onChangeHouseManager = function (cb) {
        _event.on('change_house_manager', cb);
    };

    that.onPushCard = function (cb) {
        _event.on('push_card', cb)
    };

    that.onCanRob = function (cb) {
        _event.on('can_rob', cb);
    };

    that.onPlayerRobState = function (cb) {
        _event.on('player_rob_state', cb);
    };

    that.onChangeMaster = function (cb) {
        _event.on('change_master', cb);
    };
    
    that.onShowBottomCard = function (cb) {
        _event.on('show_bottom_card', cb);
    };

    that.onCanPushCard = function (cb) {
        _event.on('can_push_card', cb);
    };

    that.onPlayerPushCard = function (cb) {
        _event.on('player_push_card', cb);
    };

    that.onGameOver = function (cb) {
        _event.on('game_over', cb);
    };

    return that;
};
export default SocketController;