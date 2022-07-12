const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp2005r extends BaseInvoice {

    constructor(message, statusInvoice)  {

        //BaseInvoice
        super(message, statusInvoice) ;

        //HandleOp
        this.transaction = "handleOp2005r";

        //Уникальный номер idSmInvoice
        this.idSmInvoice = null;

        //stateTransaction
        this.stateTransaction = 2005;

        //opts
        this.opts = null;

        //invDateReject
        if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.invDateReject = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.invDateReject = message.requestinvoice.invoice.operdate.$.value;
        }
        //console.log("this.invDateReject = " + this.invDateReject);

        //epochInvDateReject
        if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.epochInvDateReject = null; }
        else {
            this.epochInvDateReject = message.requestinvoice.invoice.operdate.$.value;
            this.a = this.epochInvDateReject.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochInvDateReject = this.a[0] + " " + this.a[1];
            this.epochInvDateReject = new Date(this.epochInvDateReject).getTime() / 1000;
        }
        //console.log("this.epochInvDateReject = " + this.epochInvDateReject);

    }
}

module.exports.InvoiceOp2005r = InvoiceOp2005r;