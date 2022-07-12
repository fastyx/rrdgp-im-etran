const { BaseClaim } = require('./baseClaim.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class ClaimOp01 extends BaseClaim {

    constructor(message) {

        //BaseClaim
        super(message);

        //HandleOp
        this.transaction = "handleOp1";

        //stateTransaction
        this.stateTransaction = 1;

        //opts
        this.opts = null;

        //claimRegDate
        if (typeof message.requestclaim.claim.operdate === 'undefined') { this.claimRegDate = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.claimRegDate = message.requestclaim.claim.operdate.$.value;
        }
        //console.log("this.claimRegDate = " + this.claimRegDate);

        //epochClaimRegDate
        if (typeof message.requestclaim.claim.operdate === 'undefined') { this.epochClaimRegDate = null; }
        else {
            this.epochClaimRegDate = message.requestclaim.claim.operdate.$.value;
            this.a = this.epochClaimRegDate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochClaimRegDate = this.a[0] + " " + this.a[1];
            this.epochClaimRegDate = new Date(this.epochClaimRegDate).getTime() / 1000;
        }
        //console.log("this.epochClaimRegDate = " + this.epochClaimRegDate);

        //clmStartDate
        if (typeof message.requestclaim.claim.clmstartdate === 'undefined') { this.clmStartDate = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.clmStartDate = message.requestclaim.claim.clmstartdate.$.value;
            this.a = this.clmStartDate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.clmStartDate = this.a[0] + " " + this.a[1];
        }
        //console.log("this.clmStartDate = " + this.clmStartDate);

        //epochClmStartDate
        if (typeof message.requestclaim.claim.clmstartdate === 'undefined') { this.epochClmStartDate = null; }
        else {
            this.epochClmStartDate = message.requestclaim.claim.clmstartdate.$.value;
            this.a = this.epochClmStartDate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochClmStartDate = this.a[0] + " " + this.a[1];
            this.epochClmStartDate = new Date(this.epochClmStartDate).getTime() / 1000;
        }
        //console.log("this.epochClmStartDate = " + this.epochClmStartDate);
    }
}

module.exports.ClaimOp01 = ClaimOp01;