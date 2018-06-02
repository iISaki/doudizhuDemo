cc.Class({
    extends: cc.Component,

    properties: {
        alertLabel: cc.Label,
        cancelBtn: cc.Node,
        sureBtn: cc.Node,
    },

    initWithData (tipStr) {
        this.alertLabel.string = tipStr;
    },
    
    initWithSure (tipStr, cb) {
        this.alertLabel.string = tipStr;
        this.sureCB = cb;
        this.cancelBtn.active = false;
        this.sureBtn.active = true;
        this.sureBtn.x = 0;
    },
    
    initWithCancel (tipStr, cb) {
        this.alertLabel.string = tipStr;
        this.cancelCB = cb;
        this.sureBtn.active = false;
        this.cancelBtn.active = true;
        this.cancelBtn.x = 0;
    },
    
    initWithAllBtn (tipStr, sureCB, cancelCB) {
        this.alertLabel.string = tipStr;
        this.sureCB = sureCB;
        this.cancelCB = cancelCB;
    },

    start () {

    },

    onButtonClick(event, customData) {
        switch(customData) {
            case 'sure':
                if (this.sureCB) {
                    this.sureCB();
                }
                break;
            case 'cancel':
                if (this.cancelCB) {
                    this.cancelCB();
                }
                break;
            default:
                break;
        }
        this.node.destroy();
    },
});
