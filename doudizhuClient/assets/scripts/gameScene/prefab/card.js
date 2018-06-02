import global from "../../global";

cc.Class({
    extends: cc.Component,

    properties: {
        cardsSpriteAtlas: cc.SpriteAtlas,
    },

    onLoad () {
        this.flag = false;
        this.offset = 20;
        this.node.on('reset', ()=>{
            if (this.flag) {
                this.node.y -= this.offset;
                this.flag = false;
                cc.systemEvent.emit('cancel-choose', this.cardData);
            }
        });
        this.node.on('pushed-card', (event)=>{
            let detail = event.detail;
            for (let i = 0; i < detail.length; i ++) {
                if (detail[i].id === this.id) {
                    this.runToCenter(this.node);
                }
            }
        });
        this.node.on('tips-card', (event)=>{
            let detail = event.detail;
            if (this.flag) {
                this.node.y -= this.offset;
                this.flag = false;
                cc.systemEvent.emit('cancel-choose', this.cardData);
            }
            for (let i = 0; i < detail.length; i++) {
                let card = detail[i];
                if (card.id === this.id) {
                    if (this.flag === false){
                        this.node.y += this.offset;
                        this.flag = true;
                        cc.systemEvent.emit('choose-card', this.cardData);
                    }
                }
            }
        });
    },

    runToCenter (node) {
        let moveAc = cc.moveTo(0.3, cc.p(0, 0));
        let scaleAc = cc.scaleTo(0.3, 0.3);
        let spawn = cc.spawn(moveAc, scaleAc);
        let seq = cc.sequence(spawn, cc.callFunc(()=>{
            // cc.systemEvent.emit('rm-card-list', this.id);
            this.node.destroy();
        }));
        node.runAction(seq);
    },

    initWithData() {

    },

    setTouchEvent() {
        if (this.accountID === global.playerData.accountID) {
            this.node.on(cc.Node.EventType.TOUCH_START, ()=>{
                console.log('card >> line = 18 touch ' + this.id);
                this.flag = !this.flag;
                this.node.y += (this.flag ? 1 : -1) * this.offset;
                cc.systemEvent.emit((this.flag ? 'choose-card' : 'cancel-choose'), this.cardData);
            });
        }
    },

    showCard(card, accountID) {
        if (accountID) {
            this.accountID = accountID;
        }
        console.log('card >> line = 17 card = ' + JSON.stringify(card));
        this.id = card.id;
        this.cardData = card;
        const CardValue = {
            "12": 1,
            "13": 2,
            "1": 3,
            "2": 4,
            "3": 5,
            "4": 6,
            "5": 7,
            "6": 8,
            "7": 9,
            "8": 10,
            "9": 11,
            "10": 12,
            "11": 13,
        };
        const CardShape = {
            "1": 0,
            "2": 1,
            "3": 2,
            "4": 3
        };
        const Kings = {
            "53": 54,
            "54": 53,
        };
        let spriteKey = '';
        if (card.shape) {
            spriteKey = 'card_' + (CardShape[card.shape] * 13 + CardValue[card.value]);
        } else {
            spriteKey = 'card_' + Kings[card.king];
        }
        console.log('card >> line = 50 spriteKey = ' + spriteKey);
        this.node.getComponent(cc.Sprite).spriteFrame = this.cardsSpriteAtlas.getSpriteFrame(spriteKey);
        this.setTouchEvent();
    },

});
