const socket = require("socket.io");
const app = socket(3000);
const myDB = require("./db");
const defines = require("./defines")
const gameController = require('./game/game-controller')
myDB.connect({
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "764522",
    "database": "doudizhu",
});
// myDB.createPlayerInfo("10000", "1000", "lian", 5, "https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=1840304787,2707992394&fm=58&bpow=512&bpoh=768");

// myDB.getPlayerInfo("10000", (err, data)=>{
//     if (err) {
//         console.log("get PlayerInfo " + err);
//     } else {
//         console.log('data = ' + JSON.stringify(data));
//     }
// });

app.on("connection", function (socket){
    console.log('a user connection');
    socket.emit('connection', 'connection success!');
    socket.on('notify', (notifyData)=>{
        console.log('notify ' + JSON.stringify(notifyData));
        // socket.emit('notify', {callBackIndex: data.callBackIndex, data: 'login success'});
        switch(notifyData.type){
            case 'login':
                let uniqueID = notifyData.data.uniqueID;
                let callBackIndex = notifyData.callBackIndex;
                myDB.getPlayerInfoWithUniqueID(uniqueID, (err, data) => {
                    console.log('');
                    if (err) {
                        console.log('err = ' + err);
                    } else {
                        console.log('data = ' + JSON.stringify(data));
                        if (data.length === 0){
                            let loginData = notifyData.data;
                            myDB.createPlayerInfo(
                                loginData.uniqueID,
                                loginData.accountID,
                                loginData.nickName,
                                defines.defaultGoldCount,
                                loginData.avatarUrl
                            );
                            gameController.createPlayer({
                                "unique_id": loginData.uniqueID,
                                "account_id": loginData.accountID,
                                "nick_name": loginData.nickName,
                                "gold_count": defines.defaultGoldCount,
                                "avatar_url": loginData.avatarUrl,
                            }, socket, callBackIndex);
                        } else {
                            gameController.createPlayer(data[0], socket, callBackIndex);
                        }
                    }
                });
                break;
            default:
                break;          
        }

    })
})