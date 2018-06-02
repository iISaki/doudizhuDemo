import global from './../../global';
cc.Class({
    extends: cc.Component,

    properties: {
        headImage: cc.Sprite,
        nickNameLabel: cc.Label,
        idLabel: cc.Label,
        goldLabel: cc.Label,
        readyIcon: cc.Node,
        offlineIcon: cc.Node,
        cardsNode: cc.Node,
        pushCardNode: cc.Node,
        cardPrefab: cc.Prefab,
        tipsClock: cc.Label,
        clockIcon: cc.Node,
        infoNode: cc.Node,
        timeLabel: cc.Label,
        robIconSp: cc.Sprite,
        robIcon: cc.SpriteFrame,
        noRobIcon: cc.SpriteFrame,
        callIcon: cc.SpriteFrame,
        noCallIcon: cc.SpriteFrame,
        masterIcon: cc.Node,
    },

    onLoad () {
        this.cardList = [];
        this.readyIcon.active = false;
        this.offlineIcon.active = false;
        this.node.on('game-start', ()=> {
            this.readyIcon.active = false;
            this.robIconSp.node.active = false;
        });
        this.node.on('push-card', ()=>{
            if (this.accountID !== global.playerData.accountID){
                this.pushCard();
            }
        });
        this.node.on('can-rob', (event) => {
            console.log('playerNode >> line = 33 can-rob');
            let detail = event.detail;
            if (detail == this.accountID && detail !== global.playerData.accountID) {
                this.infoNode.active = true;
                this.timeLabel.string = '5';
                this.tipsClock.string = 'robbing..';
            }
        });
        this.node.on('rob-state', (event)=>{
            let detail = event.detail;
            console.log('playerNode >> line = 46 detail = ' + JSON.stringify(detail));
            if (detail.accountID === this.accountID) {
                this.infoNode.active = false;
                this.robIconSp.node.active = true;
                switch (detail.value) {
                    case 'rob':
                        this.robIconSp.spriteFrame = this.robIcon;
                        break;
                    case 'no_rob':
                        this.robIconSp.spriteFrame = this.noRobIcon;
                        break;
                    case 'call':
                        this.robIconSp.spriteFrame = this.callIcon;
                        break;
                    case 'no_call':
                        this.robIconSp.spriteFrame = this.noCallIcon;
                        break;
                    default:
                        break;
                }
            }
        });
        this.node.on('change-master', (event) => {
            let detail = event.detail;
            this.robIconSp.node.active = false;
            console.log('playerNode >> line = 66 detail = ' + detail);
            if (detail === this.accountID) {
                this.masterIcon.active = true;
                this.masterIcon.scaleX = 0.8;
                this.masterIcon.scaleY = 0.5;
                this.masterIcon.runAction(cc.scaleTo(0.3, 0.8, 0.8).easing(cc.easeBackOut()));
            }
        });
        this.node.on('add-three-cards', (event) => {
            let detail = event.detail;
            if (detail === this.accountID) {
                for (let i = 0; i < 3; i++) {
                    this.pushOneCard();
                }
            }
        });
        this.node.on('player-push-card', (event) =>{
            let detail = event.detail;
            if (detail.accountID === this.accountID && global.playerData.accountID !== this.accountID) {
                console.log('playerNode >> line = 86 data ' + JSON.stringify(detail.cards));
                this.playerPushCard(detail.cards)
            }
        });
    },

    initWithData(data, index) {
        this.accountID = data.accountID;
        this.nickNameLabel.string = data.nickName;
        this.idLabel.string = 'ID:' + data.accountID;
        this.goldLabel.string = data.gold;   
        this.readyIcon.active = data.isReady;   
        this.index = index;
        cc.loader.load({url: data.avatarUrl, type: 'jpg'}, (err, tex)=>{
            let oldWidth = this.headImage.node.width;
            this.headImage.spriteFrame = new cc.SpriteFrame(tex);
            let newWidth = this.headImage.node.width;
            this.headImage.node.scale = oldWidth / newWidth;
        });

        this.node.on('player_ready', (event)=> {
            let detail = event.detail;
            console.log('playerNode >> line = 26 detail = ' + JSON.stringify(detail));
            if (detail.data === this.accountID) {
                this.readyIcon.active = detail.isReady;
            }
        });
        global.socket.onChangeHouseManager((data) => {
            // global.playerData.houseManagerID = data;
            if (data === this.accountID) {
                this.readyIcon.active = false;
            }
        });
        if (index === 1) {
            this.cardsNode.x *= -1;
            this.pushCardNode.x *= -1;
        }
    },

    pushCard () {
        this.cardsNode.active = true;
        for (let i = 0; i < 17; i ++) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.cardsNode;
            card.scale = 0.4;
            card.y = ((17 - 1) * 0.5 - i ) * card.height * 0.3 * 0.4;
            this.cardList.push(card);
        }
    },

    pushOneCard () {
        let card = cc.instantiate(this.cardPrefab);
        card.parent = this.cardsNode;
        card.scale = 0.4;
        card.y =  (17 - 1) * 0.5 * card.height * 0.3 * 0.4 - this.cardList.length * card.height * 0.3 * 0.4;
        this.cardList.push(card);
    },

    playerPushCard (cards) {
        for (let i = 0; i < this.pushCardNode.children.length; i++) {
            this.pushCardNode.children[i].destroy();
        }
        console.log('playerNode >> line = 145 length ' + cards.length);
        this.sortPushCard(cards);
        for (let i = 0; i < cards.length; i ++) {
            let card = cc.instantiate(this.cardPrefab);
            card.parent = this.pushCardNode;
            card.scale = 0.4;
            card.y = ((cards.length - 1) * 0.5  - i) * card.height * 0.4 * 0.3;
            card.getComponent('card').showCard(cards[i]);
        }

        for (let i = 0; i < cards.length; i ++) {
            let card = this.cardList.pop();
            card.destroy();
        }
        this.referCardPos();
    },

    referCardPos () {
        for (let i = 0; i <this.cardList.length; i ++) {
            let card = this.cardList[i];
            card.y = ((this.cardList.length - 1) * 0.5 - i ) * card.height * 0.3 * 0.4;
        }
    },

    sortPushCard (cardList) {
        let map = {};
        for (let i = 0; i < cardList.length; i++) {
            let key = cardList[i].value !== undefined ? cardList[i].value : key = cardList[i].king;
            if (map.hasOwnProperty(key)){
                map[key] ++;
            } else {
                map[key] = 1;
            }
        }
        for (let i = 0; i < cardList.length; i++) {
            let key = cardList[i].value !== undefined ? cardList[i].value : key = cardList[i].king;
            cardList[i].count = map[key];
        }
        cardList.sort(function(a, b) {
            // let a = x.getComponent('card').cardData;
            // let b = y.getComponent('card').cardData;
            if (a.count !== b.count) {
                return b.count - a.count;
            }
            if (a.hasOwnProperty('value') && b.hasOwnProperty('value')) {
                if (b.value === a.value){
                    return b.shape - a.shape;
                }
                return b.value - a.value;
            }
            if (a.hasOwnProperty('king') && !b.hasOwnProperty('king')) {
                return -1;
            }
            if (!a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                return 1;
            }
            if (a.hasOwnProperty('king') && b.hasOwnProperty('king')) {
                return b.king - a.king;
            }
        });
    }, 

});
