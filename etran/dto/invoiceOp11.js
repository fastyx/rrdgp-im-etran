const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp11 extends BaseInvoice {

    constructor(message, statusInvoice) {

        //BaseInvoice
        super(message, statusInvoice);

        //HandleOp
        this.transaction = "handleOp11";

        //Уникальный номер idSmInvoice
        this.idSmInvoice = null;

        //stateTransaction
        this.stateTransaction = 11;

        //opts
        this.opts = null;

        //epochInvDateDelivery
        if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.epochInvDateDelivery = null; }
        else {
            this.epochInvDateDelivery = message.requestinvoice.invoice.operdate.$.value;
            this.a = this.epochInvDateDelivery.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochInvDateDelivery = this.a[0] + " " + this.a[1];
            this.epochInvDateDelivery = new Date(this.epochInvDateDelivery).getTime() / 1000;
        }
        //console.log("this.epochInvDateDelivery = " + this.epochInvDateDelivery);

    }
}

module.exports.InvoiceOp11 = InvoiceOp11;