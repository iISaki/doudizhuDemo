import global from './../../global'
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onButtonClick(event, customData) {
        if (customData.indexOf('rate') !== -1) {
            console.log('createRoom >> line = 10 ' + customData);
            global.socket.requestCreateRoom({rate:customData}, (err, data) => {
                if (err) {
                    console.log('err' + err);
                } else {
                    console.log('createRoom >> line = 14 data = ' + JSON.stringify(data));
                    let roomID = data.data;
                    global.socket.requestJoinRoom(roomID, (err, data)=>{
                        if (err) {
                            console.log('createRoom >> line = 20 err = ' + err);
                        } else {
                            global.playerData.bottom = data.data.bottom
                            global.playerData.rate = data.data.rate
                            console.log('createRoom >> line = 22 data = ' + JSON.stringify(data));
                            cc.director.loadScene('gameScene');
                        }
                    });
                }
            });
        }
    }

});
