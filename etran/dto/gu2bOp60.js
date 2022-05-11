const { BaseGu2b } = require('./baseGu2b.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class gu2bOp60 extends BaseGu2b {

    constructor(req, xmlCfg, res) {

        //BaseGu2b
        super(req, xmlCfg, res);

        //HandleOp
        this.transaction = "handleOp60";

        //stateTransaction
        this.stateTransaction = 60;

        //opts
        this.opts = null;

        //idSmDoc      
        this.idSmDoc = null;

        //docTypeId
        this.docTypeId = 6;

        //ladenCargoEndNotificationDt
        if (typeof xmlCfg.gu_2b_doc_route.crgdatecreate === 'undefined') { this.ladenCargoEndNotificationDt = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.ladenCargoEndNotificationDt = xmlCfg.gu_2b_doc_route.crgdatecreate.$.value;
        }
        //console.log("this.ladenCargoEndNotificationDt = " + this.ladenCargoEndNotificationDt);

        //epochLadenCargoEndNotificationDt
        if (typeof xmlCfg.gu_2b_doc_route.crgdatecreate === 'undefined') { this.epochLadenCargoEndNotificationDt = null; }
        else {
            this.epochLadenCargoEndNotificationDt = xmlCfg.gu_2b_doc_route.crgdatecreate.$.value;
            this.a = this.epochLadenCargoEndNotificationDt.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochLadenCargoEndNotificationDt = this.a[0] + " " + this.a[1];
            this.epochLadenCargoEndNotificationDt = new Date(this.epochLadenCargoEndNotificationDt).getTime() / 1000;
        }
        //console.log("this.epochLadenCargoEndNotificationDt = " + this.epochLadenCargoEndNotificationDt);
    }
}

module.exports.gu2bOp60 = gu2bOp60;