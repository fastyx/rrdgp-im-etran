const { BaseClaim } = require('./baseClaim.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class ClaimOp2102 extends BaseClaim {

    constructor(req, xmlCfg, res) {

        //BaseClaim
        super(req, xmlCfg, res);

        //HandleOp
        this.transaction = "handleOp2102";

        //stateTransaction
        this.stateTransaction = 2102;

        //opts
        this.opts = null;

        //claimEndDate
        if (typeof xmlCfg.claim_doc_route.operdate === 'undefined') { this.claimEndDate = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.claimEndDate = xmlCfg.claim_doc_route.operdate.$.value;
        }
        //console.log("this.claimEndDate = " + this.claimEndDate);

        //epochClaimEndDate
        if (typeof xmlCfg.claim_doc_route.operdate === 'undefined') { this.epochClaimEndDate = null; }
        else {
            this.epochClaimEndDate = xmlCfg.claim_doc_route.operdate.$.value;
            this.a = this.epochClaimEndDate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochClaimEndDate = this.a[0] + " " + this.a[1];
            this.epochClaimEndDate = new Date(this.epochClaimEndDate).getTime() / 1000;
        }
        //console.log("this.epochClaimEndDate = " + this.epochClaimEndDate);
    }
}

module.exports.ClaimOp2102 = ClaimOp2102;