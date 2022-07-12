const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp2004r extends BaseInvoice {

    constructor(message, statusInvoice) {

        //BaseInvoice
        super(message, statusInvoice);

        //HandleOp
        this.transaction = "handleOp2004r";

        //Уникальный номер idSmInvoice
        this.idSmInvoice = null;

        //stateTransaction
        this.stateTransaction = 2004;

        //opts
        this.opts = null;

        //emptyInvRejectDate
        if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.emptyInvRejectDate = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.emptyInvRejectDate = message.requestinvoice.invoice.operdate.$.value;
        }
        //console.log("this.emptyInvRejectDate = " + this.emptyInvRejectDate);

        //epochEmptyInvRejectDate
        if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.epochEmptyInvRejectDate = null; }
        else {
            this.epochEmptyInvRejectDate = message.requestinvoice.invoice.operdate.$.value;
            this.a = this.epochEmptyInvRejectDate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochEmptyInvRejectDate = this.a[0] + " " + this.a[1];
            this.epochEmptyInvRejectDate = new Date(this.epochEmptyInvRejectDate).getTime() / 1000;
        }
        //console.log("this.epochEmptyInvRejectDate = " + this.epochEmptyInvRejectDate);

    }
}

module.exports.InvoiceOp2004r = InvoiceOp2004r;