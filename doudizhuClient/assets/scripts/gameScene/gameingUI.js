import global from './../global'
cc.Class({
    extends: cc.Component,

    properties: {
        gameingUI: cc.Node,
        cardPrefa: cc.Prefab,
        playerCardPos: cc.Node,
        robUI: cc.Node,
        callUI: cc.Node,
        landlordNode: cc.Node,
        playUI: cc.Node,
        tipLabel: cc.Label,
        pushCardNode: cc.Node,
        noPushCardBtn: cc.Node,
        clockLabel: [cc.Label],
        animNode: cc.Node,
    },

    onLoad: function () {
        console.log('gameingUI >> line = 21 onload');
        this.bottomCards = [];
        let bottomCardData = [];
        this.cardList = [];
        this.chooseCardDataList = [];
        this.tipsCardsList = [];
        this.tipsCardsIdx = 0;
        this.clockTime = 15;
        this.index = 0;
        // self = this;
        global.socket.onPushCard((data)=> {
            // console.log('gameingUI >> line = 11 push card ' + JSON.stringify(data));
            // this.cardList = [];
            this.pushCard(data);
        });
        global.socket.onCanRob((data)=> {
            // console.log('gameingUI >> line = 19 can rob ' + JSON.stringify(data));
            if (data.data === global.playerData.accountID) {
                this.callUI.active = false;
                this.robUI.active = false;
                this.index = 0;
                if (data.master === undefined) {
                    this.callUI.active = true;
                    this.index = 1;
                } else {
                    this.robUI.active = true;
                }
                console.log('gameingUI >> line = 46 schedule');
                this.clockTime = 15;
                this.schedule(this.doSomething, 1, this.clockTime, 1);
            }
        });
        global.socket.onShowBottomCard((data) => {
            bottomCardData = data;
            console.log('gameingUI >> line = 24 show bottom cards = ' + JSON.stringify(data));
            for (let i = 0; i < data.length; i++) {
                let card = this.bottomCards[i];
                card.getComponent('card').showCard(data[i]);
            }
            this.node.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(()=>{
                // let index = 0;
                const runAcCb = () => {
                    // index ++;
                    this.node.emit('add-card');
                    for (let i = 0; i < this.playerNodeList.length; i++) {
                        this.playerNodeList[i].emit('change-master', global.playerData.masterID);
                    }
                    // if (index == 3) {
                    //     this.node.emit('add-card');
                    //     this.player.emit('change-master', data);
                    // }
                };
                // for (let i = 0; i < this.bottomCards.length; i++) {
                //     let card = this.bottomCards[i];
                //     this.runCardAction(card, this.masterPos, runAcCb);
                // }
                this.runCardAction(this.landlordNode, this.masterPos, runAcCb);
                // this.bottomCards = [];
            })));
        });
        global.socket.onCanPushCard((data)=>{
            let uid = data.uid;
            let isPush = data.push;
            if (uid === global.playerData.accountID) {
                this.playUI.active = true;
                this.noPushCardBtn.active = !isPush;
                this.resetCardPos();
                for (i = 0; i < this.pushCardNode.children.length; i ++) {
                    this.pushCardNode.children[i].destroy();
                }
                this.clockTime = 20;
                this.index = 2;
                this.schedule(this.doSomething, 1, this.clockTime, 1);
            }
            if (this.noPushCardBtn.active) {
                this.playUI.x = -244;
            } else {
                this.playUI.x = -320;
            }
        });
        global.socket.onPlayerPushCard((data) => {
            console.log('gameingUI >> line = 101 data', JSON.stringify(data));
            if (data.accountID === global.playerData.accountID) {
                let cards = data.cards;
                this.sortPushCard(cards);
                for (let i = 0; i < cards.length; i++) {
                    let card = cc.instantiate(this.cardPrefa);
                    card.parent = this.pushCardNode;
                    card.scale = 0.6
                    card.x = ((cards.length - 1) * - 0.5 + i) * card.width * 0.4;
                    card.y += 10
                    card.getComponent('card').showCard(cards[i]);
                }
                if (cards.length === 0) {
                    if (data.accountID == global.playerData.masterID) {
                        console.log('gameingUI >> line = 115 ');
                    } else {
                        console.log('gameingUI >> line = 117 ');
                    }
                }
            }
        });
        global.socket.onGameOver((data) => {
            this.animNode.active = true;
            if (global.playerData.accountID === data || 
                (global.playerData.accountID !== global.playerData.masterID && data !== global.playerData.masterID)) {
                this.animNode.getComponent('animation').getAnima('win');
            } else {
                this.animNode.getComponent('animation').getAnima('lose');
            }
            setTimeout(()=> {
                this.animNode.active = false;
                this.node.emit('can-exit');
            }, 2000);
        })
        this.node.on('master-pos', (event)=>{
            let detail = event.detail;
            this.masterPos = detail;
        });
        this.node.on('player-node-list', (event)=>{
            let detail = event.detail;
            this.playerNodeList = detail;
        });
        this.node.on('add-card', ()=> {
            if (global.playerData.accountID === global.playerData.masterID) {
                for (let i = 0; i < bottomCardData.length; i ++) {
                    let card = cc.instantiate(this.cardPrefa);
                    card.parent = this.gameingUI;
                    card.scale = 0.8;
                    card.x = card.width * 0.4 * (17 - 1) * - 0.5 + card.width * 0.4 * this.cardList.length;
                    card.y = - 250;
                    card.getComponent('card').showCard(bottomCardData[i], global.playerData.accountID);
                    this.cardList.push(card);
                }
                this.sortCard(this.cardList);
                let x = this.cardList[0].x;
                for (let i = 0; i < this.cardList.length; i++) {
                    let card = this.cardList[i];
                    card.zIndex = i;
                    card.x = x + card.width * 0.4 * i;
                }
                this.referCardsPos();
            }
        });
        cc.systemEvent.on('choose-card', (event) => {
            let detail = event.detail;
            this.chooseCardDataList.push(detail);
        });
        cc.systemEvent.on('cancel-choose', (event) => {
            let detail = event.detail;
            for (let i = 0; i < this.chooseCardDataList.length; i ++) {
                if (this.chooseCardDataList[i].id === detail.id) {
                    this.chooseCardDataList.splice(i, 1);
                }
            }
        });
        // cc.systemEvent.on('rm-card-list', (event)=>{
        //     let detail = event.detail;
        //     for (let i = 0; i < this.cardList.length; i ++) {
        //         let card = this.cardList[i];
        //         if (card.getComponent('card').id === detail) {
        //             this.cardList.splice(i, 1);
        //         }
        //     }
        // });
    },

    runCardAction (node, pos, cb) {
        node.active = true;
        let scaleAc_1 = cc.scaleTo(0.5, 3);
        let delayTime = cc.delayTime(0.5)
        let moveAction = cc.moveTo(0.5, pos);
        let scaleAc_2 = cc.scaleTo(0.5, 0.5);
        let spawnAc = cc.spawn(moveAction, scaleAc_2);
        node.runAction(cc.sequence(scaleAc_1, delayTime, spawnAc, cc.callFunc(()=>{
            node.destroy();
            if (cb) {
                cb();
            }
        })));
    },

    sortCard (cardList) {
        cardList.sort(function(x, y) {
            let a = x.getComponent('card').cardData;
            let b = y.getComponent('card').cardData;
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

    pushCard (data) {
        if (data) {
            data.sort((a, b)=>{
                // return a.id - b.id;
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
            for (let i = 0; i < this.cardList.length; i++) {
                let card = this.cardList[i];
                card.destroy();
            }
            this.cardList = [];
            for (let i = 0; i < data.length; i ++) {
                let card = cc.instantiate(this.cardPrefa);
                // console.log('gameingUI >> line = 247 ', card);
                card.parent = this.gameingUI;
                card.scale = 0.8;
                console.log('gameingUI >> line = 26 data id ' + data[i].id);
                // card.position = cc.p(card.width * (17 - 1) * - 0.5 + card.width * i, 0);
                card.x = card.width * 0.4 * (17 - 1) * - 0.5 + card.width * 0.4 * i;
                card.y = - 250;
                card.getComponent('card').showCard(data[i], global.playerData.accountID);
                this.cardList.push(card);
            }
        }
        this.bottomCards = [];
        for (let i = 0; i < 3; i ++) {
            let card = cc.instantiate(this.cardPrefa);
            card.parent = this.gameingUI;
            card.scale = 0.6;
            card.y = 300;
            card.x = (card.width * 0.6 + 10) * ((3 - 1) * - 0.5 + i);
            this.bottomCards.push(card);
        }
    },

    resetCardPos () {
        if (this.chooseCardDataList.length > 0) {
            for (let i = 0; i < this.cardList.length; i ++) {
                this.cardList[i].emit('reset', this.chooseCardDataList);
            }
            this.chooseCardDataList = [];
        }
    },

    onButtonClick (event, customData) {
        this.unschedule(this.doSomething);
        console.log('gameingUI >> line = 299 unschedule');
        switch (customData) {
            case 'rob':
                console.log('gameingUI >> line = 60 rob');
                global.socket.notifyRobState('rob');
                break;
            case 'no-rob':
                console.log('gameingUI >> line = 64 no rob');
                global.socket.notifyRobState('no_rob');
                break;
            case 'call':
                console.log('gameingUI >> line = 60 rob');
                global.socket.notifyRobState('call');
                break;
            case 'no-call':
                console.log('gameingUI >> line = 64 no rob');
                global.socket.notifyRobState('no_call');
                break;
            case 'no-push':
                console.log('gameingUI >> line = 153 no push');
                this.playUI.active = false;
                global.socket.requestPlayerPushCard([], ()=>{
                    console.log('gameingUI >> line = 185 on push callback');
                });
                this.tipsCardsList = [];
                this.tipsCardsIdx = 0;
                this.resetCardPos();
                break;
            case 'tip':
                console.log('gameingUI >> line = 156 tip');
                if (this.tipsCardsList.length === 0) {
                    global.socket.requestTipsCards((err, data)=>{
                        if (err) {
                            console.log('gameingUI >> line = 283 err = ' + err);
                            this.tipLabel.string = err;
                            setTimeout(()=> {
                                this.tipLabel.string = '';
                            }, 2000);
                        } else {
                            console.log('gameingUI >> line = 285 data = ' + JSON.stringify(data));
                            this.tipsCardsList = data.data;
                            if (this.tipsCardsList === undefined || this.tipsCardsList.length === 0) {
                                this.tipLabel.string = '没有可出的牌';
                                setTimeout(()=> {
                                    this.tipLabel.string = '';
                                }, 2000);
                                this.tipsCardsList = [];
                            } else {
                                this.showTipsCards(this.tipsCardsList);
                            }
                        }
                    });
                } else {
                    this.showTipsCards(this.tipsCardsList);
                }
                break;
            case 'push':
                if (this.chooseCardDataList.length === 0) {
                    console.log('gameingUI >> line = 207 push');
                    if (this.tipLabel.string === '') {
                        this.tipLabel.string = '没有选中要出的牌';
                        setTimeout(()=> {
                            this.tipLabel.string = '';
                        }, 2000);
                    }
                } else {
                    console.log('gameingUI >> line = 215 push ' + JSON.stringify(this.chooseCardDataList));
                    global.socket.requestPlayerPushCard(this.chooseCardDataList, (err, data) =>{
                        if (err) {
                            console.log('gameingUI >> line = 196 push err ' + err);
                            if (this.tipLabel.string === '') {
                                this.tipLabel.string = err;
                                setTimeout(()=> {
                                    this.tipLabel.string = '';
                                }, 2000);
                            }
                            this.resetCardPos();
                        } else {
                            console.log('gameingUI >> line = 198 push data ' + JSON.stringify(data));
                            for (let i = 0; i < this.cardList.length; i++) {
                                this.cardList[i].emit('pushed-card', this.chooseCardDataList);
                            }
                            for (let i = 0; i < this.chooseCardDataList.length; i ++) {
                                let cardData = this.chooseCardDataList[i];
                                for (let j = 0; j < this.cardList.length; j++) {
                                    let card = this.cardList[j];
                                    if (card.getComponent('card').id === cardData.id) {
                                        this.cardList.splice(j, 1);
                                    }
                                }
                            }
                            this.playUI.active = false;
                            this.chooseCardDataList = [];
                            this.referCardsPos();
                            this.tipsCardsList = [];
                            this.tipsCardsIdx = 0;
                        }
                    });
                }
                break;
            default:
                break;
        }
        this.robUI.active = false;
        this.callUI.active = false;
    },

    referCardsPos () {
        for (let i = 0; i < this.cardList.length; i++) {
            let card = this.cardList[i];
            card.x = ((this.cardList.length - 1) * -0.5 + i ) * card.width * 0.4;
        }
    },

    showTipsCards (cards) {
        console.log('gameingUI >> line = 357 tips cards ' + JSON.stringify(cards));
        for (let i = 0; i < this.cardList.length; i++) {
            this.cardList[i].emit('tips-card', cards[this.tipsCardsIdx]);
        }
        this.tipsCardsIdx = (this.tipsCardsIdx + 1) % cards.length;
    },

    doSomething () {
        this.clockTime --;
        if (this.clockTime === 0 ) {
            // this.unschedule(this.doSomething);
            // console.log('gameingUI >> line = 423 unschedule');
            switch(this.index){
                case 0:
                    this.onButtonClick(1, 'no-rob');
                    break;
                case 1:
                    this.onButtonClick(1, 'no-call');
                    break;
                case 2:
                    global.socket.requestTipsCards((err, data)=>{
                        if (err) {
                            console.log('gameingUI >> line = 283 err = ' + err);
                            this.tipLabel.string = err;
                            setTimeout(()=> {
                                this.tipLabel.string = '';
                            }, 2000);
                            this.onButtonClick(1, 'no-push');
                        } else {
                            console.log('gameingUI >> line = 285 data = ' + JSON.stringify(data));
                            this.tipsCardsList = data.data;
                            if (this.tipsCardsList === undefined || this.tipsCardsList.length === 0) {
                                this.tipLabel.string = '没有可出的牌';
                                setTimeout(()=> {
                                    this.tipLabel.string = '';
                                }, 2000);
                                this.tipsCardsList = [];
                                this.onButtonClick(1, 'no-push');
                            } else {
                                this.showTipsCards(this.tipsCardsList);
                                this.onButtonClick(1, 'push');
                            }
                        }
                    });
                    break;
            }
            return;
        }
        this.clockLabel[this.index].string = this.clockTime + '';
    },
});
