const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp2005a extends BaseInvoice {

    constructor(message, statusInvoice)  {

        //BaseInvoice
        super(message, statusInvoice) ;

        //HandleOp
        this.transaction = "handleOp2005a";

        //Уникальный номер idSmInvoice
        this.idSmInvoice = null;

        //stateTransaction
        this.stateTransaction = 2005;

        //opts
        this.opts = null;

        //invFactDateAccept
        if (typeof message.requestinvoice.invoice.invfactdateaccept === 'undefined') { this.invFactDateAccept = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.invFactDateAccept = message.requestinvoice.invoice.invfactdateaccept.$.value;
        }
        //console.log("this.invFactDateAccept = " + this.invFactDateAccept);

        //epochInvFactDateAccept
        if (typeof message.requestinvoice.invoice.invfactdateaccept === 'undefined') { this.epochInvFactDateAccept = null; }
        else {
            this.epochInvFactDateAccept = message.requestinvoice.invoice.invfactdateaccept.$.value;
            this.a = this.epochInvFactDateAccept.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochInvFactDateAccept = this.a[0] + " " + this.a[1];
            this.epochInvFactDateAccept = new Date(this.epochInvFactDateAccept).getTime() / 1000;
        }
        //console.log("this.epochInvFactDateAccept = " + this.epochInvFactDateAccept);

    }
}

module.exports.InvoiceOp2005a = InvoiceOp2005a;