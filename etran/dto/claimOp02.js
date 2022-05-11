const { BaseClaim } = require('./baseClaim.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class ClaimOp02 extends BaseClaim {

    constructor(req, xmlCfg, res) {

        //BaseClaim
        super(req, xmlCfg, res);

        //HandleOp
        this.transaction = "handleOp2";

        //stateTransaction
        this.stateTransaction = 2;

        //opts
        this.opts = null;

        //claimClmAgreementAgrDate
        if (typeof xmlCfg.claim_doc_route.operdate === 'undefined') { this.claimClmAgreementAgrDate = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.claimClmAgreementAgrDate = xmlCfg.claim_doc_route.operdate.$.value;
        }
        //console.log("this.claimClmAgreementAgrDate = " + this.claimClmAgreementAgrDate);

        //epochClaimClmAgreementAgrDate
        if (typeof xmlCfg.claim_doc_route.operdate === 'undefined') { this.epochClaimClmAgreementAgrDate = null; }
        else {
            this.epochClaimClmAgreementAgrDate = xmlCfg.claim_doc_route.operdate.$.value;
            this.a = this.epochClaimClmAgreementAgrDate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochClaimClmAgreementAgrDate = this.a[0] + " " + this.a[1];
            this.epochClaimClmAgreementAgrDate = new Date(this.epochClaimClmAgreementAgrDate).getTime() / 1000;
        }
        //console.log("this.epochClaimClmAgreementAgrDate = " + this.epochClaimClmAgreementAgrDate);

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

module.exports.ClaimOp02 = ClaimOp02;