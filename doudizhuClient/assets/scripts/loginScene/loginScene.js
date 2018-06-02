import global from './../global'
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        // let socket = io("http://localhost:3000");
        // socket.on("welcome", (data)=>{
        //     console.log("welcom " + data); 
        // });

        global.socket.init();
        this.isLogin = false;
        global.eventListener.on('test', (data) => {
            console.log('test success ' + data);
        });
        global.eventListener.fire('test', 'ok');
    },

    onButtonClick (event, customData) {
        switch (customData) {
            case 'wx_login':
                console.log('wx login' + defines.serverUrl);
                if (!this.isLogin) {
                    this.isLogin = true;
                    global.socket.requestLogin({
                        uniqueID: global.playerData.uniqueID,
                        accountID: global.playerData.accountID,
                        nickName: global.playerData.nickName,
                        avatarUrl: global.playerData.avatarUrl,
                    }, (err, result)=>{
                        if (err) {
                            console.log('err = ' + err);
                            this.isLogin = false;
                        } else {
                            console.log('result = ss ' + result);
                            global.playerData.goldCount = result.goldCount;
                            this.node.runAction(cc.fadeOut(1.0));
                            cc.director.loadScene('hallScene');
                        }
                    });
                }
                // cc.director.loadScene("hallScene");
                break;
            default:
                break;
        }
    },

    // update (dt) {},
});
