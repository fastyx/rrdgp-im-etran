const { BaseClaim } = require('./baseClaim.js')

class ClaimOp02 extends BaseClaim {

    constructor(message) {

        //BaseClaim
        super(message);

        //HandleOp
        this.transaction = "handleOp2";

        //stateTransaction
        this.stateTransaction = 2;

        //opts
        this.opts = null;

        //claimClmAgreementAgrDate
        if (typeof message.requestclaim.claim.operdate === 'undefined') { this.claimClmAgreementAgrDate = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.claimClmAgreementAgrDate = message.requestclaim.claim.operdate.$.value;
        }
        //console.log("this.claimClmAgreementAgrDate = " + this.claimClmAgreementAgrDate);

        //epochClaimClmAgreementAgrDate
        if (typeof message.requestclaim.claim.operdate === 'undefined') { this.epochClaimClmAgreementAgrDate = null; }
        else {
            this.epochClaimClmAgreementAgrDate = message.requestclaim.claim.operdate.$.value;
            this.a = this.epochClaimClmAgreementAgrDate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochClaimClmAgreementAgrDate = this.a[0] + " " + this.a[1];
            this.epochClaimClmAgreementAgrDate = new Date(this.epochClaimClmAgreementAgrDate).getTime() / 1000;
        }
        //console.log("this.epochClaimClmAgreementAgrDate = " + this.epochClaimClmAgreementAgrDate);

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

module.exports.ClaimOp02 = ClaimOp02;