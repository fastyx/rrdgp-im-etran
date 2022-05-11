const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp24 extends BaseInvoice {

    constructor(req, xmlCfg, statusInvoice, res) {

        //BaseInvoice
        super(req, xmlCfg, statusInvoice, res);

        //HandleOp
        this.transaction = "handleOp24";

        //Уникальный номер idSmInvoice
        this.idSmInvoice = null;

        //stateTransaction
        this.stateTransaction = 24;

        //opts
        this.opts = null;

        //invDateDeparture
        if (typeof xmlCfg.invoice_doc_route.operdate === 'undefined') { this.invDateDeparture = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.invDateDeparture = xmlCfg.invoice_doc_route.operdate.$.value;
        }
        //console.log("this.invDateDeparture = " + this.invDateDeparture);

        //epochInvDateDeparture
        if (typeof xmlCfg.invoice_doc_route.operdate === 'undefined') { this.epochInvDateDeparture = null; }
        else {
            this.epochInvDateDeparture = xmlCfg.invoice_doc_route.operdate.$.value;
            this.a = this.epochInvDateDeparture.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochInvDateDeparture = this.a[0] + " " + this.a[1];
            this.epochInvDateDeparture = new Date(this.epochInvDateDeparture).getTime() / 1000;
        }
        //console.log("this.epochInvDateDeparture = " + this.epochInvDateDeparture);

        //invDateExpire
        if (typeof xmlCfg.invoice_doc_route.invdateexpire === 'undefined') { this.invDateExpire = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.invDateExpire = xmlCfg.invoice_doc_route.invdateexpire.$.value;
        }
        //console.log("this.invDateExpire = " + this.invDateExpire);

        //epochInvDateExpire
        if (typeof xmlCfg.invoice_doc_route.invdateexpire === 'undefined') { this.epochInvDateExpire = null; }
        else {
            this.epochInvDateExpire = xmlCfg.invoice_doc_route.invdateexpire.$.value;
            this.a = this.epochInvDateExpire.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochInvDateExpire = this.a[0] + " " + this.a[1];
            this.epochInvDateExpire = new Date(this.epochInvDateExpire).getTime() / 1000;
        }
        //console.log("this.epochInvDateExpire = " + this.epochInvDateExpire);

    }
}

module.exports.InvoiceOp24 = InvoiceOp24;