const mysql = require("mysql");
let clinet = undefined;
const query = function(sql, cb) {
    clinet.getConnection((err, connection) => {
        if (err) {
            console.log('get connection = ' + err);
            if (cb) {
                cb(err);
            }
        } else {
            connection.query(sql, (connErr, result) => {
                if (connErr) {
                    console.log(sql + connErr);
                    if (cb) {
                        cb(connErr);
                    }
                } else {
                    if (cb) {
                        cb(null, result);
                    }
                }
                connection.release();
            }) 
        } 
    })
};

exports.createPlayerInfo = function (uniqueId, accountId, nickName, goldCount, avatarUrl) {
    let sql = "insert into t_account(unique_id, account_id, nick_name, gold_count, avatar_url)values('" 
    + uniqueId + "', '" 
    + accountId + "', '" 
    + nickName + "', " 
    + goldCount + ", '"
    +  avatarUrl + "');";
    query(sql, (err, data) => {
        if (err){
            console.log('create player info ' + err);
        } else {
            console.log('create player info = ' + JSON.stringify(data));
        }
    });
};
//insert into t_account(unique_id, account_id, nick_name, gold_count, avatar_url)values('20000', '2000', 'libai', 5, 'https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=1840304787,2707992394&fm=58&bpow=512&bpoh=768');
exports.getPlayerInfoWithUniqueID = function(key, cb) {
    let sql = 'select * from t_account where unique_id = ' + key + ';';
    query(sql, cb);
};

exports.getPlayerInfoWithAccountID = function(key, cb) {
    let sql = 'select * from t_account where account_id = ' + key + ';';
    query(sql, cb);
};

exports.connect = function(config) {
    clinet = mysql.createPool(config);
};