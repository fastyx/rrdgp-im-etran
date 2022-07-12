const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp03 extends BaseInvoice {

    constructor(message, statusInvoice) {

        //BaseInvoice
        super(message, statusInvoice);

        //Уникальный номер SM
        this.idSmInvoice = getuuid();

        //HandleOp
        this.transaction = "handleOp3";

        //stateTransaction
        this.stateTransaction = 3;

        //opts
        this.opts = null;

        //invDateCreate
        if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.invDateCreate = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.invDateCreate = message.requestinvoice.invoice.operdate.$.value;
        }
        //console.log("this.invDateCreate = " + this.invDateCreate);

        //epochInvDateCreate
        if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.epochInvDateCreate = null; }
        else {
            this.epochInvDateCreate = message.requestinvoice.invoice.operdate.$.value;
            this.a = this.epochInvDateCreate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochInvDateCreate = this.a[0] + " " + this.a[1];
            this.epochInvDateCreate = new Date(this.epochInvDateCreate).getTime() / 1000;
        }
        //console.log("this.epochInvDateCreate = " + this.epochInvDateCreate);
    }
}

module.exports.InvoiceOp03 = InvoiceOp03;