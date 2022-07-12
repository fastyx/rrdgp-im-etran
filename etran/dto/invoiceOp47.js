const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp47 extends BaseInvoice {

    constructor(message, statusInvoice) {

        //BaseInvoice
        super(message, statusInvoice);

        //HandleOp
        this.transaction = "handleOp47";

        //Уникальный номер idSmInvoice
        this.idSmInvoice = null;

        //stateTransaction
        this.stateTransaction = 47;

        //opts
        this.opts = null;

        //invDateNotification
        if (typeof message.requestinvoice.invoice.invdatenotification === 'undefined') { this.invDateNotification = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.invDateNotification = message.requestinvoice.invoice.invdatenotification.$.value;
        }
        //console.log("this.invDateNotification = " + this.invDateNotification);

        //epochInvDateNotification
        if (typeof message.requestinvoice.invoice.invdatenotification === 'undefined') { this.epochInvDateNotification = null; }
        else {
            this.epochInvDateNotification = message.requestinvoice.invoice.invdatenotification.$.value;
            this.a = this.epochInvDateNotification.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochInvDateNotification = this.a[0] + " " + this.a[1];
            this.epochInvDateNotification = new Date(this.epochInvDateNotification).getTime() / 1000;
        }
        //console.log("this.epochInvDateNotification = " + this.epochInvDateNotification);

    }
}

module.exports.InvoiceOp47 = InvoiceOp47;