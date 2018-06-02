import global from './../global'
cc.Class({
    extends: cc.Component,

    properties: {
        bottomLabel: cc.Label,
        rateLabel: cc.Label,
        roomIDLabel: cc.Label,
        playerNodePrefab: cc.Prefab,
        playerPosNode: cc.Node,
    },

    onLoad() {
        console.log('gameScene >> line = 14 onLoad');
        this.playerNodeList = [];
        this.bottomLabel.string = '底:' + global.playerData.bottom;
        this.rateLabel.string = '倍:' + global.playerData.rate;
        global.socket.requestEnterRoomScene((err, data)=>{
            if (err) {
                console.log('gameScene >> line = 15 err ' + err);
            } else {
                // let seatIndex = data.seatIndex;
                this.playerPosList = [];
                this.initPlayerPos(data.seatIndex)
                let playerData = data.playerData;
                let roomID = data.roomID;
                this.roomIDLabel.string = '房间ID:' + roomID;
                global.playerData.houseManagerID = data.houseManagerID;
                for (let i = 0; i < playerData.length; i ++) {
                    this.addPlayerNode(playerData[i]);
                }
                // console.log('gameScene >> line = 17 data' + JSON.stringify(data));
            }
            this.node.emit('init', data)
        });
        global.socket.onPlayerJoinRoom((data) => {
            this.addPlayerNode(data);
        });
        global.socket.onPlayerExitRoom((data) => {
            console.log('gameScene >> line = 39 ', JSON.stringify(data));
            this.delPlayerNode(data);
        });
        global.socket.onPlayerReady((data) => {
            for(let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('player_ready', data);
            }
        });
        global.socket.onGameStart(()=>{
            console.log('gameScene >> line = 48');
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('game-start');
            }
        });
        global.socket.onPushCard(()=>{
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('push-card');
            }
        });
        global.socket.onCanRob((data) => {
            for (let i = 0; i < this.playerNodeList.length; i ++) {
                this.playerNodeList[i].emit('can-rob', data);
            }
        });
        global.socket.onPlayerRobState((data) => {
            for (let i = 0; i < this.playerNodeList.length; i++) {
                this.playerNodeList[i].emit('rob-state', data);
            }
        });
        global.socket.onChangeMaster((data)=>{
            // console.log('gameScene >> line = 64 change master ' + JSON.stringify(data));
            global.playerData.masterID = data;
            for (let i = 0; i < this.playerNodeList.length; i++) {
                let node = this.playerNodeList[i];
                // node.emit('change-master', data);
                if (node.getComponent('playerNode').accountID === data) {
                    this.node.emit('master-pos', node.position);
                    // this.node.emit('master-pos', node);
                }
            }
        });
        global.socket.onPlayerPushCard((data) => {
            // console.log('gameScene >> line = 76 player push card ' + JSON.stringify(data));
            for (let i = 0; i < this.playerNodeList.length; i ++) {
                this.playerNodeList[i].emit('player-push-card', data);
            }
        });
        global.socket.onShowBottomCard((data) => {
            this.node.emit('player-node-list', this.playerNodeList);
        });
        this.node.on('add-card', ()=> {
            if (global.playerData.accountID !== global.playerData.masterID) {
                for (let i = 0; i < this.playerNodeList.length; i++) {
                    this.playerNodeList[i].emit('add-three-cards', global.playerData.masterID);
                }
            }
        });
    },

    initPlayerPos(seatIndex) {
        let children = this.playerPosNode.children;
        switch (seatIndex) {
            case 0:
                this.playerPosList[0] = 0;
                this.playerPosList[1] = 1;
                this.playerPosList[2] = 2;
                break;
            case 1:
                this.playerPosList[1] = 0;
                this.playerPosList[2] = 1;
                this.playerPosList[0] = 2;
                break;
            case 2:
                this.playerPosList[2] = 0;
                this.playerPosList[0] = 1;
                this.playerPosList[1] = 2;
                break;
            default:
                break;
        }
    },

    addPlayerNode(data) {
        let playerNode = cc.instantiate(this.playerNodePrefab);
        playerNode.parent = this.node;
        playerNode.getComponent('playerNode').initWithData(data, this.playerPosList[data.seatIndex]);
        playerNode.position = this.playerPosNode.children[this.playerPosList[data.seatIndex]].position;
        this.playerNodeList.push(playerNode);
        console.log('gameScene >> line = 126 ', this.playerNodeList.length);
    },

    delPlayerNode(data) {
        console.log('gameScene >> line = 133 ', this.playerNodeList.length);
        for (let i = 0; i < this.playerNodeList.length; i++) {
            if (this.playerNodeList[i].getComponent('playerNode').accountID === data.accountID) {
                this.playerNodeList[i].parent = undefined;
                this.playerNodeList.splice(i, 1);
                break;
            }
        }
    },

    // update: function (dt) {
    //     console.log('gameScene >> line = 148 ', this.playerNodeList.length);
    // },
});