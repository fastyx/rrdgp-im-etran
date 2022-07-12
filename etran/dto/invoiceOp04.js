const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp04 extends BaseInvoice {

    constructor(message, statusInvoice) {

        //BaseInvoice
        super(message, statusInvoice);

        //HandleOp
        this.transaction = "handleOp4";

        //Уникальный номер idSmInvoice
        this.idSmInvoice = null;

        //stateTransaction
        this.stateTransaction = 4;

        //opts
        this.opts = null;

        //invDateDeparture
        if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.invDateDeparture = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.invDateDeparture = message.requestinvoice.invoice.operdate.$.value;
        }
        //console.log("this.invDateDeparture = " + this.invDateDeparture);

        //epochInvDateDeparture
        if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.epochInvDateDeparture = null; }
        else {
            this.epochInvDateDeparture = message.requestinvoice.invoice.operdate.$.value;
            this.a = this.epochInvDateDeparture.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochInvDateDeparture = this.a[0] + " " + this.a[1];
            this.epochInvDateDeparture = new Date(this.epochInvDateDeparture).getTime() / 1000;
        }
        //console.log("this.epochInvDateDeparture = " + this.epochInvDateDeparture);

        //invDateExpire
        if (typeof message.requestinvoice.invoice.invdateexpire === 'undefined') { this.invDateExpire = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.invDateExpire = message.requestinvoice.invoice.invdateexpire.$.value;
        }
        //console.log("this.invDateExpire = " + this.invDateExpire);

        //epochInvDateExpire
        if (typeof message.requestinvoice.invoice.invdateexpire === 'undefined') { this.epochInvDateExpire = null; }
        else {
            this.epochInvDateExpire = message.requestinvoice.invoice.invdateexpire.$.value;
            this.a = this.epochInvDateExpire.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochInvDateExpire = this.a[0] + " " + this.a[1];
            this.epochInvDateExpire = new Date(this.epochInvDateExpire).getTime() / 1000;
        }
        //console.log("this.epochInvDateExpire = " + this.epochInvDateExpire);
    }
}

module.exports.InvoiceOp04 = InvoiceOp04;