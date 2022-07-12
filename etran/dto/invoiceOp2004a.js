const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp2004a extends BaseInvoice {

    constructor(message, statusInvoice){

        //BaseInvoice
        super(message, statusInvoice);

        //HandleOp
        this.transaction = "handleOp2004a";

        //Уникальный номер idSmInvoice
        this.idSmInvoice = null;

        //stateTransaction
        this.stateTransaction = 2004;

        //opts
        this.opts = null;

        //emptyInvPresentingDate
        if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.emptyInvPresentingDate = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.emptyInvPresentingDate = message.requestinvoice.invoice.operdate.$.value;
        }
        //console.log("this.emptyInvPresentingDate = " + this.emptyInvPresentingDate);

        //epochEmptyInvPresentingDate
        if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.epochEmptyInvPresentingDate = null; }
        else {
            this.epochEmptyInvPresentingDate = message.requestinvoice.invoice.operdate.$.value;
            this.a = this.epochEmptyInvPresentingDate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochEmptyInvPresentingDate = this.a[0] + " " + this.a[1];
            this.epochEmptyInvPresentingDate = new Date(this.epochEmptyInvPresentingDate).getTime() / 1000;
        }
        //console.log("this.epochEmptyInvPresentingDate = " + this.epochEmptyInvPresentingDate);


    }
}

module.exports.InvoiceOp2004a = InvoiceOp2004a;