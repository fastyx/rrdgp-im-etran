const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp2005r extends BaseInvoice {

    constructor(req, xmlCfg, statusInvoice, res) {

        //BaseInvoice
        super(req, xmlCfg, statusInvoice, res);

        //HandleOp
        this.transaction = "handleOp2005r";

        //Уникальный номер idSmInvoice
        this.idSmInvoice = null;

        //stateTransaction
        this.stateTransaction = 2005;

        //opts
        this.opts = null;

        //invDateReject
        if (typeof xmlCfg.invoice_doc_route.operdate === 'undefined') { this.invDateReject = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.invDateReject = xmlCfg.invoice_doc_route.operdate.$.value;
        }
        //console.log("this.invDateReject = " + this.invDateReject);

        //epochInvDateReject
        if (typeof xmlCfg.invoice_doc_route.operdate === 'undefined') { this.epochInvDateReject = null; }
        else {
            this.epochInvDateReject = xmlCfg.invoice_doc_route.operdate.$.value;
            this.a = this.epochInvDateReject.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochInvDateReject = this.a[0] + " " + this.a[1];
            this.epochInvDateReject = new Date(this.epochInvDateReject).getTime() / 1000;
        }
        //console.log("this.epochInvDateReject = " + this.epochInvDateReject);

    }
}

module.exports.InvoiceOp2005r = InvoiceOp2005r;