const { BaseClaim } = require('./baseClaim.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class ClaimOp01 extends BaseClaim {

    constructor(req, xmlCfg, res) {

        //BaseClaim
        super(req, xmlCfg, res);

        //Уникальный номер SM
        //this.idSm = getuuid();

        //HandleOp
        this.transaction = "handleOp1";

        //stateTransaction
        this.stateTransaction = 1;

        //opts
        this.opts = null;

        //claimRegDate
        if (typeof xmlCfg.claim_doc_route.operdate === 'undefined') { this.claimRegDate = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.claimRegDate = xmlCfg.claim_doc_route.operdate.$.value;
        }
        //console.log("this.claimRegDate = " + this.claimRegDate);

        //epochClaimRegDate
        if (typeof xmlCfg.claim_doc_route.operdate === 'undefined') { this.epochClaimRegDate = null; }
        else {
            this.epochClaimRegDate = xmlCfg.claim_doc_route.operdate.$.value;
            this.a = this.epochClaimRegDate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochClaimRegDate = this.a[0] + " " + this.a[1];
            this.epochClaimRegDate = new Date(this.epochClaimRegDate).getTime() / 1000;
        }
        //console.log("this.epochClaimRegDate = " + this.epochClaimRegDate);

        //clmStartDate
        if (typeof xmlCfg.claim_doc_route.clmstartdate === 'undefined') { this.clmStartDate = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.clmStartDate = xmlCfg.claim_doc_route.clmstartdate.$.value;
        }
        //console.log("this.clmStartDate = " + this.clmStartDate);

        //epochClmStartDate
        if (typeof xmlCfg.claim_doc_route.clmstartdate === 'undefined') { this.epochClmStartDate = null; }
        else {
            this.epochClmStartDate = xmlCfg.claim_doc_route.clmstartdate.$.value;
            this.a = this.epochClmStartDate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochClmStartDate = this.a[0] + " " + this.a[1];
            this.epochClmStartDate = new Date(this.epochClmStartDate).getTime() / 1000;
        }
        //console.log("this.epochClmStartDate = " + this.epochClmStartDate);
    }
}

module.exports.ClaimOp01 = ClaimOp01;