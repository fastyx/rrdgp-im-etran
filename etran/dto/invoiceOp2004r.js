const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp2004r extends BaseInvoice {

    constructor(req, xmlCfg, statusInvoice, res) {

        //BaseInvoice
        super(req, xmlCfg, statusInvoice, res);

        //HandleOp
        this.transaction = "handleOp2004r";

        //Уникальный номер idSmInvoice
        this.idSmInvoice = null;

        //stateTransaction
        this.stateTransaction = 2004;

        //opts
        this.opts = null;

        //emptyInvRejectDate
        if (typeof xmlCfg.invoice_doc_route.operdate === 'undefined') { this.emptyInvRejectDate = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.emptyInvRejectDate = xmlCfg.invoice_doc_route.operdate.$.value;
        }
        //console.log("this.emptyInvRejectDate = " + this.emptyInvRejectDate);

        //epochEmptyInvRejectDate
        if (typeof xmlCfg.invoice_doc_route.operdate === 'undefined') { this.epochEmptyInvRejectDate = null; }
        else {
            this.epochEmptyInvRejectDate = xmlCfg.invoice_doc_route.operdate.$.value;
            this.a = this.epochEmptyInvRejectDate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochEmptyInvRejectDate = this.a[0] + " " + this.a[1];
            this.epochEmptyInvRejectDate = new Date(this.epochEmptyInvRejectDate).getTime() / 1000;
        }
        //console.log("this.epochEmptyInvRejectDate = " + this.epochEmptyInvRejectDate);

    }
}

module.exports.InvoiceOp2004r = InvoiceOp2004r;