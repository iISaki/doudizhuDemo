const Card = require('./card');
const CardValue = {
    "3": 1,
    "4": 2,
    "5": 3,
    "6": 4,
    "7": 5,
    "8": 6,
    "9": 7,
    "10": 8,
    "J": 9,
    "Q": 10,
    "K": 11,
    "A": 12,
    "2": 13,
};
const CardShape = {
    "S": 1,
    "H": 2,
    "C": 3,
    "D": 4,
};
const Kings = {
    "w": 53,
    "W": 54,
}
module.exports = function () {
    let that = {};
    let _cardList = [];
    const createCards = function () {
        let cardList = [];
        for (let v in CardValue) {
            for (let s in CardShape) {
                let card = Card(CardValue[v], CardShape[s])
                card.id = cardList.length;
                cardList.push(card);
            }
        }
        for (let k in Kings) {
            let card = Card(undefined, undefined, Kings[k])
            card.id = cardList.length;
            cardList.push(card);
        }
        // for (let i = 0; i < cardList.length; i++) {
        //     console.log('cardId = ' + cardList[i].id, 'vaule = ' + cardList[i].value, 'shape = ' + cardList[i].shape, 'kings = ' + cardList[i].king);
        // }

        // cardList.sort((a, b) => {
        //     return Math.random() > 0.5 ? -1 : 1;
        // });
        // return mess(cardList);
        return cardList;
    }

    const mess = function (cardList){ 
        let arr = [], idx = 0;
        for (let i in cardList) {
            arr[idx++] = cardList[i];
        }
        var _floor = Math.floor, _random = Math.random, 
            len = arr.length, i, j, arri, 
            n = _floor(len/2)+1; 
        while( n-- ){ 
            i = _floor(_random()*len); 
            j = _floor(_random()*len); 
            if( i!==j ){ 
                arri = arr[i]; 
                arr[i] = arr[j]; 
                arr[j] = arri; 
            } 
        } 
        //增加切牌操作 
        i = _floor(_random()*len); 
        arr.push.apply(arr, arr.splice(0,i)); 
        let map = [];
        for (let i = 0; i < arr.length; i++) {
            map.push(arr[i]);
        }
        return map;
    } 

    // _cardList = createCards();
    // for (let i = 0; i < _cardList.length; i++) {
    //     console.log('cardId = ' + _cardList[i].id, 'vaule = ' + _cardList[i].value, 'shape = ' + _cardList[i].shape, 'kings = ' + _cardList[i].king);
    // }

    // const refreshCard = function () {
    //     // for (let i = 0; i < _cardList.length; i ++ ) {}
    //     _cardList.sort((a, b) => {
    //         return Math.floor(Math.random() * 2)
    //     });
    //     // for (let i = 0; i < _cardList.length; i++) {
    //     //     console.log('vaule = ' + _cardList[i].value, 'shape = ' + _cardList[i].shape, 'kings = ' + _cardList[i].king);
    //     // }
    // };

    // refreshCard();

    that.getThreeCards = function () {
        _cardList = [];
        _cardList = createCards();
        let threeCardMap = {};
        for (let j = 0; j < 3; j++) {
            for (let  i = 0; i < 17; i ++ ) {
                if (threeCardMap.hasOwnProperty(j)) {
                    threeCardMap[j].push(_cardList.pop());
                } else {
                    threeCardMap[j] = [_cardList.pop()];
                }
            }
        }
        for (let i = 0; i < threeCardMap[0].length; i++) {
            if (threeCardMap[0][i].king !== undefined) {
                let card = threeCardMap[0][i];
                threeCardMap[0][i] = threeCardMap[2][i];
                threeCardMap[2][i] = card;
            }
        }
        sortCard(threeCardMap[0]);
        sortCard(threeCardMap[1]);
        sortCard(threeCardMap[2]);
        return [threeCardMap[0], threeCardMap[1], threeCardMap[2], _cardList];
    };

    const sortCard = function (cardList) {
        cardList.sort(function(a, b) {
            // let a = x.getComponent('card').cardData;
            // let b = y.getComponent('card').cardData;
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
    };

    const toMapForCount = function (cardList) {
        let map = {}
        for (let i = 0; i < cardList.length; i++) {
            let key = cardList[i].value !== undefined ? cardList[i].value : cardList[i].king;
            if (map.hasOwnProperty(key)){
                map[key] ++;
            } else {
                map[key] = 1;
            }
        }
        return map;
    }

    const toMapForVal = function (cardList) {
        let map = {}
        for (let i = 0; i < cardList.length; i++) {
            let key = cardList[i].value !== undefined ? cardList[i].value : cardList[i].king;
            if (map.hasOwnProperty(key)){
                map[key].push(cardList[i]);
            } else {
                map[key] = [cardList[i]];
            }
        }
        return map;
    }

    const isSameCard = function (cardList) {
        for (let i = 1; i < cardList.length; i++) {
            if (cardList[i - 1].value === undefined || cardList[i - 1].value !== cardList[i].value){
                return false
            }
        }
        return true
    }

    const isThreeWith = function (cardList) {
        let map = toMapForCount(cardList);
        let count = 0;
        let maxNum = -1;
        for (let i in map) {
            count++;
            if (maxNum < map[i]) {
                maxNum = map[i];
            }
        }
        if (count === 2 && maxNum === 3) {
            return true;
        }
        return false
    }

    const isFourWith = function (cardList) {
        let map = toMapForCount(cardList);
        let count = 0;
        let maxNum = -1;
        let num = Math.floor(cardList.length / 4);
        for (let i in map) {
            count++;
            if (map[i] !== num && map[i] !== 4) {
                return false
            }
            if (maxNum < map[i]) {
                maxNum = map[i];
            }
        }
        if (count === 3 && maxNum === 4) {
            return true;
        }
        return false;
    }

    const isPlaneWith = function (cardList) {
        let map = toMapForCount(cardList);
        let key = Object.keys(map);
        let count = 0;
        let newList = [];
        let  num = 0;
        if (key.length / 2 * 5 === cardList.length) {
            num = 2;
        }else if (key.length / 2 * 4 === cardList.length) {
            num = 1;
        } else if (key.length * 3 !== cardList.length) {
            return false;
        }
        for (let i in map) {
            if (map[i] === 3) {
                newList[count] = Number(i);
                count ++;
            } else if (map[i] !== num) {
                return false;
            }
        }
        newList.sort(function(a, b){
            return b - a;
        });
        if (count === (cardList.length / (num + 3))) {
            for (let i = 1; i < newList.length; i++) {
                if (Math.abs(newList[i - 1] - newList[i]) !== 1) {
                    return false;
                }
            }
        }
        return true;
    }

    const isOrderCard = function (cardList) {
        let map = toMapForCount(cardList);
        let key = Object.keys(map);
        let num = 1;
        if (cardList.length === key.length * 2) {
            num = 2;
        }
        for (let i in map) {
            if (map[i] !== num || Number(i) > 12) {
                return false;
            }
        }
        key.sort((a, b) =>{
            return Number(a) - Number(b);
        });
        for (let i = 1; i < key.length; i++) {
            if (Math.abs(Number(key[i - 1]) - Number(key[i])) !== 1) {
                return false;
            }
        }
        return true;
    }

    const isOneCard = function (cardList) {
        if (cardList.length === 1) {
            console.log('carder >> line = 107 单');
            return true;
        }
        return false;
    }

    const isDouble = function (cardList) {
        if (cardList.length === 2 && isSameCard(cardList)) {
            console.log('carder >> line = 116 对');
            return true
        }
        return false;
    }

    const isThree = function (cardList) {
        if (cardList.length === 3 && isSameCard(cardList)) {
            console.log('carder >> line = 127 三张');
            return true;
        }
        return false;
    }
    
    const isKingBoom = function (cardList) {
        if (cardList.length === 2) {
            if (cardList[0].king !== undefined && cardList[1].king !== undefined) {
                console.log('carder >> line = 137 王炸');
                return true
            }
        }
        return false;
    }

    const isBoom = function (cardList) {
        if (cardList.length === 4 && isSameCard(cardList)) {
            console.log('carder >> line = 148 炸弹');
            return true;
        }
        return false;
    }

    const isThreeWithOne = function (cardList) {
        if (cardList.length === 4 && isThreeWith(cardList)) {
            console.log('carder >> line = 167 三带一');
            return true;
        }
        return false;
    }

    const isThreeWithDouble = function (cardList) {
        if (cardList.length === 5 && isThreeWith(cardList)) {
            console.log('carder >> line = 183 三带二');
            return true;
        }
        return false;
    }

    const isFourWithTow = function (cardList) {
        if (cardList.length === 6 && isFourWith(cardList)) {
            console.log('carder >> line = 205 四带二');
            return true;
        }
        return false;
    }

    const isFourWithDouble = function (cardList) {
        if (cardList.length === 8 && isFourWith(cardList)) {
            console.log('carder >> line = 227 四带两对');
            return true;
        }
        return false;
    }

    const isStraight = function (cardList) {
        if (cardList.length > 4 && isOrderCard(cardList)) {
            console.log('carder >> line = 254 顺子');
            return true
        }
        return false;
    }
    
    const isDoubleScroll = function (cardList) {
        if (cardList.length >= 6 && cardList.length % 2 == 0 && isOrderCard(cardList)) {
            console.log('carder >> line = 366 连对');
            return true;
        }
        return false;
    }

    const isPlane = function (cardList) {
        if (cardList.length >= 6 && cardList.length % 3 === 0 && isPlaneWith(cardList)) {
            console.log('carder >> line = 281 飞机');
            return true;
        }
        return false;
    }

    const isPlaneWithSingle = function (cardList) {
        if (cardList.length >= 8 && cardList.length % 4 === 0 && isPlaneWith(cardList)) {
            console.log('carder >> line = 310 飞机带单');
            return true;
        }
        return false;
    }

    const isPlaneWithDouble = function (cardList) {
        if (cardList.length >= 10 && cardList.length % 5 === 0 && isPlaneWith(cardList)) {
            console.log('carder >> line = 342 飞机带双');
            return true;
        }
        return false;
    }

    let CardsValue = {
        "one" : {
            name: "one",
            value: 1,
        },
        "double" : {
            name: "double",
            value: 1,
        },
        "three" : {
            name: "three",
            value: 1,
        },
        "boom" : {
            name: "boom",
            value: 2,
        },
        "kingBoom" : {
            name: "kingBoom",
            value: 3,
        },
        "threeWithOne" : {
            name: "threeWithOne",
            value: 1,
        },
        "threeWithTow" : {
            name: "threeWithTow",
            value: 1,
        },
        "fourWithTow" : {
            name: "fourWithTow",
            value: 1,
        },
        "fourWithDouble" : {
            name: "fourWithDouble",
            value: 1,
        },
        "straight" : {
            name: "straight",
            value: 1,
        },
        "plane" : {
            name: "plane",
            value: 1,
        },
        "planeWithSingle" : {
            name: "planeWithSingle",
            value: 1,
        },
        "planeWithDouble" : {
            name: "planeWithDouble",
            value: 1,
        },
        "doubleScroll" : {
            name: "doubleScroll",
            value: 1,
        },
    }

    // that.isCanPushCards = function (cardList) {
    //     if (isOneCard(cardList) || 
    //         isDouble(cardList) || 
    //         isThree(cardList) || 
    //         isBoom(cardList) || 
    //         isKingBoom(cardList) || 
    //         isThreeWithOne(cardList) ||
    //         isThreeWithDouble(cardList) ||
    //         isFourWithTow(cardList) ||
    //         isFourWithDouble(cardList) ||
    //         isStraight(cardList) ||
    //         isPlane(cardList) ||
    //         isPlaneWithSingle(cardList) ||
    //         isPlaneWithDouble(cardList) ||
    //         isDoubleScroll(cardList)
    //     ){
    //         return true;
    //     }
    //     return false;
    // }
    const getCardValue = function (cardList) {
        if (isOneCard(cardList)){
            return CardsValue.one;
        } 
        if (isDouble(cardList)){
            return CardsValue.double;
        } 
        if (isThree(cardList)){
            return CardsValue.three;
        } 
        if (isBoom(cardList)){
            return CardsValue.boom;
        } 
        if (isKingBoom(cardList)){
            return CardsValue.kingBoom;
        } 
        if (isThreeWithOne(cardList)){
            return CardsValue.threeWithOne;
        }
        if (isThreeWithDouble(cardList)){
            return CardsValue.threeWithTow
        }
        if (isFourWithTow(cardList)){
            return CardsValue.fourWithTow;
        }
        if (isFourWithDouble(cardList)){
            return CardsValue.fourWithDouble;
        }
        if (isStraight(cardList)){
            return CardsValue.straight;
        }
        if (isPlane(cardList)){
            return CardsValue.plane;
        }
        if (isPlaneWithSingle(cardList)){
            return CardsValue.planeWithSingle;
        }
        if (isPlaneWithDouble(cardList)){
            return CardsValue.planeWithDouble;
        }
        if (isDoubleScroll(cardList)){
            return CardsValue.doubleScroll;
        }
        return false;
    }

    that.isCanPushCards = getCardValue;

    const compareOne = function(aList, bList) {
        console.log('carder >> line = 502 比较相同牌');
        let a = aList[0].value !== undefined ? aList[0].value : aList[0].king;
        let b = bList[0].value !== undefined ? bList[0].value : bList[0].king;
        return a > b;
    }

    const compareCardWith = function(aList, bList) {
        let num = 4
        console.log('carder >> line = 530 比较四带');
        if (aList.length < 6) {
            num = 3;
            console.log('carder >> line = 530 比较三带');
        }
        let mapA = toMapForCount(aList);
        let mapB = toMapForCount(bList);
        let aValue = 0;
        let bValue = 0;
        for (let i in mapA) {
            if (mapA[i] === num){
                aValue = i;
            }
        }
        for (let i in mapB) {
            if (mapB[i] === num){
                bValue = i;
            }
        }
        return Number(aValue) > Number(bValue);
    }

    const compareOrderCard = function(aList, bList) {
        console.log('carder >> line = 612 比较顺序牌型');
        aList.sort((a, b)=>{
            return b.value - a.value;
        });
        bList.sort((a, b)=>{
            return b.value - a.value;
        });
        return aList[0].value > bList[0].value;
    }

    const comparePlaneWith = function(aList, bList) {
        console.log('carder >> line = 646 比较飞机带翅膀');
        let map = toMapForCount(aList);
        let key = Object.keys(map);
        let num = 0;
        if (aList.length * 2 === key.length * 5){
            num = 1;
        }
        aList.sort((a, b)=>{
            return b.value - a.value;
        });
        let aValue = aList[0].value;
        let count = 0;
        for (let i = 1; i < aList.length; i++) {
            if (aValue === aList[i].value) {
                if (count === num){
                    count = 0;
                    break;
                }
                count ++;
            } else {
                aValue = aList[i].value;
                count = 0;
            }
        }
        bList.sort((a, b)=>{
            return b.value - a.value;
        });
        let bValue = bList[0].value;
        for (let i = 1; i < bList.length; i++) {
            if (bValue === bList[i].value) {
                if (count === num){
                    count = 0;
                    break;
                }
                count ++;
            } else {
                bValue = bList[i].value;
                count = 0;
            }
        }
        return aValue > bValue;
    }

    let compareFunc = {
        "one" : compareOne,
        "double" : compareOne,
        "three" : compareOne,
        "boom" : compareOne,
        // "kingBoom" : {
        //     name: "kingBoom",
        //     value: 3,
        // },
        "threeWithOne" : compareCardWith,
        "threeWithTow" : compareCardWith,
        "fourWithTow" : compareCardWith,
        "fourWithDouble" : compareCardWith,
        "doubleScroll" : compareOrderCard,
        "straight" : compareOrderCard,
        "plane" : compareOrderCard,
        "planeWithSingle" : comparePlaneWith,
        "planeWithDouble" : comparePlaneWith,
    }

    that.compare = function (a, b) {
        let cardsValueA = getCardValue(a);
        let cardsValueB = getCardValue(b);
        if (cardsValueA.value > cardsValueB.value){
            return true;
        }
        if (cardsValueA.value == cardsValueB.value){
            if (cardsValueA.name === cardsValueB.name && a.length == b.length) {
                if (compareFunc[cardsValueA.name](a, b)) {
                    console.log('carder >> line = 573 true');
                    return true;
                }
                return '牌不大于上家';
            }
        } else {
            return '牌不大于上家';
        }
        return '牌型不对';
    }


    const tipsSameCard = function (cardsA, cardsB){
        let list = [];
        let map1 = toMapForCount(cardsB);
        let map2 = toMapForVal(cardsB);
        let key = cardsA[0].value === undefined ? cardsA[0].king : cardsA[0].value;
        for (let i in map1) {
            if (map1[i] === cardsA.length && Number(i) > key) {
                list.push(map2[i]);
            }
        }
        if (cardsA.length < 4) {
            for (let i in map1) {
                if (map1[i] > cardsA.length && Number(i) > key) {
                    let mapList = [];
                    for (let j = 0; j < cardsA.length; j++) {
                        mapList.push(map2[i][j]);
                    }
                    list.push(mapList);
                }
            }
            for (let i in map1) {
                if (map1[i] === 4) {
                    list.push(map2[i]);
                }
            }
        }
        let kingList = [];
        for (let i in map2) {
            if (Number(i) === Kings.w || Number(i) === Kings.W) {
                kingList.push(map2[i][0]);
            }
        }
        if (kingList.length === 2) {
            list.push(kingList);
        }
        console.log('carder >> line = 643 多张相同牌的提示');
        console.log('carder >> line = 650 list = ' + JSON.stringify(list));
        return list;
    }

    // const getCardWithList = function (cardNum, withNum, map1, map2) {
    //     let withList = [];
    //     let list = [];
    //     for (let j = withNum; j <= 4; j++) {
    //         for (let i in map2) {
    //             if (map1[i] === j) {
    //                 for (let k = 0; k < withNum; k++) {
    //                     list.push(map2[i][k]);
    //                 }
    //             }
    //             if (list.length === (cardNum - 2) * withNum) {
    //                 withList.push(list);
    //                 list = [];
    //             }
    //             if (withList.length === cardNum - 1) {
    //                 return withList;
    //             }
    //         }
    //     }
    //     return withList;
    // }

    const getWithCardsList = function (num, map1, map2) {
        let withList = [];
        for (k = num; k <= 4; k++) {
            for (let i in map2) {
                let list = [];
                if (map1[i] == k) {
                    for (let j = 0; j < num; j++) {
                        list.push(map2[i][j]);
                    }
                    withList.push(list);
                }
            }
        }
        return withList;
    }

    const tipsCardWith = function (cardsA, cardsB){
        let list = [];
        let cardNum = 3;
        let withNum = 1;
        let mapA = toMapForCount(cardsA);
        let map1 = toMapForCount(cardsB);
        let map2 = toMapForVal(cardsB);
        let val = 0;
        for (let i in mapA) {
            if (mapA[i] >= 3) {
                cardNum = mapA[i];
                val = Number(i);
            } else {
                withNum = mapA[i];
            }
        }
        let withList = getWithCardsList(withNum, map1, map2);
        console.log('carder >> line = 821 withList = ' + JSON.stringify(withList));
        console.log('carder >> line = 681 withList = ' + JSON.stringify(withList));
        console.log('carder >> line = 681 cardsA = ' + JSON.stringify(cardsA));
        if (withList.length > 0) {
            for (let i in map2) {
                let cardList = [];
                let idx = 0;
                if (map1[i] >= cardNum && map2[i][0].value > val){
                    for (let j = 0; j < cardNum; j++) {
                        cardList.push(map2[i][j]);
                    }
                    let count = 0;
                    for (let m = 0; m < withList.length; m++) {
                        if (withList[m][0].value !== cardList[0].value) {
                            for (let n = 0; n < withList[m].length; n++) {
                                cardList.push(withList[m][n]);
                            }
                            count++;
                        }
                        if (count == cardNum - 2) {
                            break;
                        }
                    }
                    // for (let j = 0; j < withList.length; j++) {
                    //     for (let k = 0; k < withList[j].length; k++) {
                    //         if (cardList[0].value === withList[idx][k].value) {
                    //             idx++;
                    //             break;
                    //         }
                    //     }
                    // }
                    // if (idx >= withList.length) {
                    //     continue;
                    // }
                    // console.log('carder >> line = 721 withList[idx] ' + JSON.stringify(withList[idx]));
                    // for (let j = 0; j < withList[idx].length; j++) {
                    //     cardList.push(withList[idx][j]);
                    // }

                    list.push(cardList);
                }
            }
        }
        console.log('carder >> line = 692 list = ' + JSON.stringify(list));
        for (let i in map1) {
            if (map1[i] === 4) {
                list.push(map2[i]);
            }
        }
        let kingList = [];
        for (let i in map2) {
            if (Number(i) === Kings.w || Number(i) === Kings.W) {
                kingList.push(map2[i][0]);
            }
        }
        if (kingList.length === 2) {
            list.push(kingList);
        }
        console.log('carder >> line = 738 带牌的提示');
        return list;
    }

    const tipsOrderCard = function (cardsA, cardsB) {
        let list = [];
        let mapA = toMapForCount(cardsA);
        let keys = Object.keys(mapA);
        let map1 = toMapForCount(cardsB);
        let map2 = toMapForVal(cardsB);
        let num = mapA[keys[0]];
        let lastCardVal = -1;
        let lastVal = 0;
        for (let i = cardsB.length - 1; i >= cardsA.length; i--) {
            let childList = [];
            if (lastCardVal < cardsB[i].value) {
                for (let j in map1) {
                    // console.log('carder >> line = 759 ', map1[j], num, j, lastVal, j, keys[0]);
                    if (map1[j] >= num && Number(j) > lastVal && Number(j) > Number(keys[0])) {
                        if (childList.length !== 0) {
                            if (childList[childList.length - 1].value + 1 !== Number(j)|| Number(j) > 12) {
                                childList = [];
                            }
                        }
                        for (let k = 0; k < num; k++) {
                            childList.push(map2[j][k]);
                        }
                    }
                    if (childList.length === cardsA.length) {
                        lastVal = Number(childList[0].value);
                        list.push(childList);
                        break;
                    }
                }
                lastCardVal = cardsB[i].value;
            }
        }
        for (let i in map1) {
            if (map1[i] === 4) {
                list.push(map2[i]);
            }
        }
        let kingList = [];
        for (let i in map2) {
            if (Number(i) === Kings.w || Number(i) === Kings.W) {
                kingList.push(map2[i][0]);
            }
        }
        if (kingList.length === 2) {
            list.push(kingList);
        }
        console.log('carder >> line = 789 顺序牌型的提示');
        return list;
    }

    const tipsPlaneWith = function (cardsA, cardsB) {
        let list = [];
        let mapA = toMapForCount(cardsA);
        let keys = Object.keys(mapA);
        let map1 = toMapForCount(cardsB);
        let map2 = toMapForVal(cardsB);
        let cardsNum = 0;
        let num = 0;
        let lastCardVal = 55;
        for (let i in mapA) {
            if (mapA[i] === 3) {
                cardsNum ++;
                if (Number(i) < lastCardVal) {
                    lastCardVal = Number(i);
                }
            } else{
                num = mapA[i];
            }
        }
        let withList = getWithCardsList(num, map1, map2);
        let lastVal = lastCardVal;
        let sameList = [];
        console.log('carder >> line = 838 withList ' + JSON.stringify(withList));
        console.log('carder >> line = 838 cardsNum, num ', cardsNum, num);

        for (let i = cardsB.length - 1; i >= cardsNum * 3; i--) {
            let childList = [];
            // console.log('carder >> line = 856 lastCardVal = ' + lastCardVal + ", cardsB[i].value = " + cardsB[i].value);
            if (lastCardVal < cardsB[i].value) {
                for (let j in map1) {
                    if (map1[j] >= 3 && Number(j) > lastVal) {
                        if (childList.length !== 0) {
                            // console.log('carder >> line = 863 childList ' + JSON.stringify(childList));
                            if (childList[childList.length - 1].value + 1 !== Number(j)|| Number(j) > 12) {
                                childList = [];
                            }
                        }
                        for (let k = 0; k < 3; k++) {
                            childList.push(map2[j][k]);
                        }
                    }
                    if (childList.length === cardsNum * 3) {
                        lastVal = Number(childList[0].value);
                        sameList.push(childList);
                        break;
                    }
                }
                // console.log('carder >> line = 875 childList ' + JSON.stringify(childList));
                lastCardVal = cardsB[i].value;
            }
        }
        console.log('carder >> line = 877 sameList = ' + JSON.stringify(sameList));
        for (let i = 0; i < sameList.length; i++) {
            let count = 0;
            let is_has = false;
            for(let m = 0; m < withList.length; m++) {
                for (let n = 0; n < sameList[i].length; n += 3) {
                    if (withList[m][0].value === sameList[i][n].value) {
                        is_has = true;
                        break;
                    }
                }
                if (is_has) {
                    is_has = false;
                } else {
                    for (let n = 0; n < withList[m].length; n++) {
                        sameList[i].push(withList[m][n]);
                    }
                    count++;
                }
                if (count == cardsNum) {
                    list.push(sameList[i]);
                    break
                }
            }
        }
        console.log('carder >> line = 925 list ' + JSON.stringify(list));
        for (let i in map1) {
            if (map1[i] === 4) {
                list.push(map2[i]);
            }
        }

        let kingList = [];
        for (let i in map2) {
            if (Number(i) === Kings.w || Number(i) === Kings.W) {
                kingList.push(map2[i][0]);
            }
        }
        if (kingList.length === 2) {
            list.push(kingList);
        }

        return list;
    }

    let tipsFunc = {
        "one" : tipsSameCard,
        "double" : tipsSameCard,
        "three" : tipsSameCard,
        "boom" : tipsSameCard,
        // "kingBoom" : {
        //     name: "kingBoom",
        //     value: 3,
        // },
        "threeWithOne" : tipsCardWith,
        "threeWithTow" : tipsCardWith,
        "fourWithTow" : tipsCardWith,
        "fourWithDouble" : tipsCardWith,
        "doubleScroll" : tipsOrderCard,
        "straight" : tipsOrderCard,
        "plane" : tipsOrderCard,
        "planeWithSingle" : tipsPlaneWith,
        "planeWithDouble" : tipsPlaneWith,
    }

    that.getTipsCardsList = function (cardsA, cardsB) {
        if (cardsA === undefined) {
            let map = {}
            for (let i = 0; i < cardsB.length; i++) {
                let key = cardsB[i].value !== undefined ? cardsB[i].value : cardsB[i].king;
                if (map.hasOwnProperty(key)){
                    map[key].push(cardsB[i]);
                } else {
                    map[key] = [cardsB[i]];
                }
            }
            let list = [];
            for (let i in map) {
                list.push([map[i][0]]);
            }
            return list;
        } else {
            let cardsValueA = getCardValue(cardsA);
            let list = [];
            if (cardsValueA !== undefined && cardsValueA.name !== 'kingBoom') {
                console.log('carder >> line = 878 name = ' + cardsValueA.name);
                list = tipsFunc[cardsValueA.name](cardsA, cardsB);
            }
            // console.log('carder >> line = 685 list = ' + JSON.stringify(list));
            return list;
        }
    }

    return that;
};