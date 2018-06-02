const getRandomStr = function (count) {
    let str = '';
    for(let i = 0; i < count; i ++ ){
        str += Math.floor(Math.random() * 10);
    }
    return str;
}

const PlayerData = function () {
    let that = {};
    let headImgUrl = {
        0 :'http://att.bbs.duowan.com/forum/201503/12/091444vv8v5l85klfl057f.png',
        1 :'http://att.bbs.duowan.com/forum/201704/05/1120072m2dwsg5umd25lmu.jpg',
        2 :'http://att.bbs.duowan.com/forum/201503/12/100008jmcnbs4lvcjufmjs.jpg',
        3 :'http://att.bbs.duowan.com/forum/201506/01/230422coyandtd8nhakryi.jpg',
        4 :'http://d.lanrentuku.com/down/png/1709/mahjong-icons/pin2.png',
        5 :'http://attimg.dospy.com/img/day_100711/20100711_a45f5ecbbf9a7f3493b0T4t8LFe86N32.png',
    }
    that.uniqueID = '1' + getRandomStr(6);
    // that.uniqueID = '100000';
    that.accountID = '1' + getRandomStr(6);
    that.nickName = 'saki' + getRandomStr(2);
    // that.avatarUrl = headImgUrl[Math.floor(Math.random() * 5)];
    // that.avatarUrl = 'http://att.bbs.duowan.com/forum/201503/12/091444vv8v5l85klfl057f.png';
    // that.avatarUrl = 'http://att.bbs.duowan.com/forum/201704/05/1120072m2dwsg5umd25lmu.jpg';
    // that.avatarUrl = 'http://att.bbs.duowan.com/forum/201503/12/100008jmcnbs4lvcjufmjs.jpg';
    // that.avatarUrl = 'http://att.bbs.duowan.com/forum/201506/01/230422coyandtd8nhakryi.jpg';
    // that.avatarUrl = 'http://attimg.dospy.com/img/day_100711/20100711_a45f5ecbbf9a7f3493b0T4t8LFe86N32.png'; 
    // that.avatarUrl = 'http://d.lanrentuku.com/down/png/1709/mahjong-icons/pin2.png'; 
    // that.avatarUrl = 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1665110666,1033370706&fm=27&gp=0.jpg'; 
    that.goldCount = 0;
    return that;
}
export default PlayerData;