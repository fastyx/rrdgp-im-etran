const { BaseClaim } = require('./baseClaim.js')

class ClaimOp2102 extends BaseClaim {

    constructor(message) {

        //BaseClaim
        super(message);

        //HandleOp
        this.transaction = "handleOp2102";

        //stateTransaction
        this.stateTransaction = 2102;

        //opts
        this.opts = null;

        //claimEndDate
        if (typeof message.requestclaim.claim.operdate === 'undefined') { this.claimEndDate = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.claimEndDate = message.requestclaim.claim.operdate.$.value;
        }
        //console.log("this.claimEndDate = " + this.claimEndDate);

        //epochClaimEndDate
        if (typeof message.requestclaim.claim.operdate === 'undefined') { this.epochClaimEndDate = null; }
        else {
            this.epochClaimEndDate = message.requestclaim.claim.operdate.$.value;
            this.a = this.epochClaimEndDate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochClaimEndDate = this.a[0] + " " + this.a[1];
            this.epochClaimEndDate = new Date(this.epochClaimEndDate).getTime() / 1000;
        }
        //console.log("this.epochClaimEndDate = " + this.epochClaimEndDate);
    }
}

module.exports.ClaimOp2102 = ClaimOp2102;