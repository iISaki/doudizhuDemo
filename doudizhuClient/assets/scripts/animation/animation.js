cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization

    getAnima: function (animName) {
        // let animName = 'win';
        // if (index == 1) {
        //     animName = 'lose';
        // }
        this.getComponent(cc.Animation).play(animName);
    },

    onLoad: function () {
        
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
