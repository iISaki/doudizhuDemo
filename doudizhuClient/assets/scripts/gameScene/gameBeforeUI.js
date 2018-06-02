import global from './../global';
cc.Class({
    extends: cc.Component,

    properties: {
        readyBtn: cc.Node,
        cancelBtn: cc.Node,
        exitBtn: cc.Node,
        gameStartBtn: cc.Node,
        gameBeforeUI: cc.Node,
    },

    onLoad() {
        console.log('gameBeforeUI >> line = 14 onload');
        this.roomID = undefined;
        this.node.on('init', (event)=>{
            let detail = event.detail;
            this.roomID = detail.roomID;
            // console.log('gameBeforeUI >> line = 18 roomID', JSON.stringify(detail));
            if (global.playerData.houseManagerID === global.playerData.accountID){
                this.readyBtn.active = false;
                this.gameStartBtn.active = true;
            } else {
                this.readyBtn.active = true;
                this.gameStartBtn.active = false;
            }
            this.cancelBtn.active = false;
            this.exitBtn.active = true;
        });
        this.node.on('can-exit', ()=> {
            if (global.playerData.houseManagerID === global.playerData.accountID){
                this.readyBtn.active = false;
                this.gameStartBtn.active = true;
            } else {
                this.readyBtn.active = true;
                this.gameStartBtn.active = false;
            }
            this.cancelBtn.active = false;
            this.exitBtn.active = true;
        });
        global.socket.onGameStart(()=> {
            this.exitBtn.active = false;
            this.gameBeforeUI.active = false;
        });
        global.socket.onChangeHouseManager((data) => {
            global.playerData.houseManagerID = data;
            if (global.playerData.accountID === data) {
                this.readyBtn.active = false;
                this.cancelBtn.active = false;
                this.gameStartBtn.active = true
            }
        });
    },

    onButtonClick(event, constomData) {
        switch (constomData) {
            case 'ready':
                console.log('gameBeforeUI >> line = 12 ready');
                global.socket.notifyReady();
                this.readyBtn.active = false;
                this.cancelBtn.active = true;
                break;
            case 'cancel':
                console.log('gameBeforeUI >> line = 12 cancel');
                global.socket.notifyCancel();
                this.readyBtn.active = true;
                this.cancelBtn.active = false;
                break;
            case 'exit':
                console.log('gameBeforeUI >> line = 12 exit');
                global.socket.requestExitRoom(this.roomID, (err, data)=>{
                    if (err) {
                        console.log('createRoom >> line = 20 err = ' + err);
                    } else {
                        console.log('createRoom >> line = 22 data = ' + JSON.stringify(data));
                        cc.director.loadScene("hallScene");
                        this.node.destroy();
                    }
                });
                break;
            case 'game-start':
                console.log('gameBeforeUI >> line = 29 start-game');
                global.socket.requestStartGame((err, data) =>{
                    if (err) {
                        console.log('gameBeforeUI >> line = 31 err = ' + err);
                    } else {
                        console.log('gameBeforeUI >> line = 33 data = ' + data);
                    }
                })
                break;
            default:
                break;
        }
    }
});
