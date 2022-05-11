const { BaseGu2b } = require('./baseGu2b.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class gu2bOp17 extends BaseGu2b {

    constructor(req, xmlCfg, res) {

        //BaseGu2b
        super(req, xmlCfg, res);

        //HandleOp
        this.transaction = null;                    // "handleOp17" "handleOp117"

        //stateTransaction
        this.stateTransaction = null;                       // 17 117

        //opts
        this.opts = null;

        //idSmDoc      
        this.idSmDoc = null;

        //emptyCargoEndNotificationDt
        if (typeof xmlCfg.gu_2b_doc_route.crgdatecreate === 'undefined') { this.emptyCargoEndNotificationDt = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.emptyCargoEndNotificationDt = xmlCfg.gu_2b_doc_route.crgdatecreate.$.value;
        }
        //console.log("this.emptyCargoEndNotificationDt = " + this.emptyCargoEndNotificationDt);

        //epochEmptyCargoEndNotificationDt 
        if (typeof xmlCfg.gu_2b_doc_route.crgdatecreate === 'undefined') { this.epochEmptyCargoEndNotificationDt = null; }
        else {
            this.epochEmptyCargoEndNotificationDt = xmlCfg.gu_2b_doc_route.crgdatecreate.$.value;
            this.a = this.epochEmptyCargoEndNotificationDt.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochEmptyCargoEndNotificationDt = this.a[0] + " " + this.a[1];
            this.epochEmptyCargoEndNotificationDt = new Date(this.epochEmptyCargoEndNotificationDt).getTime() / 1000;
        }
        //console.log("this.epochEmptyCargoEndNotificationDt = " + this.epochEmptyCargoEndNotificationDt);

    }
}

module.exports.gu2bOp17 = gu2bOp17;