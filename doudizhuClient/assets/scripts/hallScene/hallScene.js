import global from "./../global"
cc.Class({
    extends: cc.Component,

    properties: {
        nickNameLabel: cc.Label,
        idLabel: cc.Label,
        goldCountLabel: cc.Label,
        headImage: cc.Sprite,
        createRoomPrefab: cc.Prefab,
        joinRoomPrefab: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.nickNameLabel.string = global.playerData.nickName;
        this.idLabel.string = "ID:" + global.playerData.accountID;
        this.goldCountLabel.string = global.playerData.goldCount;
        cc.loader.load({
            url: global.playerData.avatarUrl,
            type: 'jpg'
        }, (err, tex) => {
            cc.log('tex: ' + tex);
            cc.log('Should load a texture from external url: ' + (tex instanceof cc.Texture2D));
            let oldWidth = this.headImage.node.width;
            console.log('old width = ' + oldWidth);
            this.headImage.spriteFrame = new cc.SpriteFrame(tex);
            let newWidth = this.headImage.node.width;
            console.log('new width = ' + newWidth);
            this.headImage.node.scale = oldWidth / newWidth;
        });
    },

    start() {

    },

    // update (dt) {},

    onButtonClick(event, customData) {
        switch (customData) {
            case 'create_room':
                // console.log("create room");
                let createRoom = cc.instantiate(this.createRoomPrefab);
                createRoom.parent = this.node;
                break;
            case 'join_room':
                console.log('join room');
                let joinRoom = cc.instantiate(this.joinRoomPrefab);
                joinRoom.parent = this.node;
                break;
            default:
                break;
        }
    }
});