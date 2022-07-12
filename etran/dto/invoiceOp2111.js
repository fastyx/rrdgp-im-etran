const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp2111 extends BaseInvoice {

    constructor(message, statusInvoice)  {

        //BaseInvoice
        super(message, statusInvoice) ;

        //HandleOp
        this.transaction = "handleOp2111";

        //Уникальный номер idSmInvoice
        this.idSmInvoice = null;

        //stateTransaction
        this.stateTransaction = 2111;

        //opts
        this.opts = null;

        if (this.invoiceStateID === '44') {
            //invDateEnd
            if (typeof message.requestinvoice.invoice.invlastoper === 'undefined') { this.invDateEnd = "0001-01-01 00:00:00.00000+00"; }
            else {
                this.invDateEnd = message.requestinvoice.invoice.invlastoper.$.value;
            }
            //console.log("this.invDateEnd = " + this.invDateEnd);

            //epochInvDateEnd
            if (typeof message.requestinvoice.invoice.invlastoper === 'undefined') { this.epochInvDateEnd = null; }
            else {
                this.epochInvDateEnd = message.requestinvoice.invoice.invlastoper.$.value;
                this.a = this.epochInvDateEnd.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.epochInvDateEnd = this.a[0] + " " + this.a[1];
                this.epochInvDateEnd = new Date(this.epochInvDateEnd).getTime() / 1000;
            }
            //console.log("this.epochInvDateEnd = " + this.epochInvDateEnd);
        }
        if (this.invoiceStateID === '117') {
            //invDateEnd
            if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.invDateEnd = "0001-01-01 00:00:00.00000+00"; }
            else {
                this.invDateEnd = message.requestinvoice.invoice.operdate.$.value;
            }
            //console.log("this.invDateEnd = " + this.invDateEnd);

            //epochInvDateEnd
            if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.epochInvDateEnd = null; }
            else {
                this.epochInvDateEnd = message.requestinvoice.invoice.operdate.$.value;
                this.a = this.epochInvDateEnd.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.epochInvDateEnd = this.a[0] + " " + this.a[1];
                this.epochInvDateEnd = new Date(this.epochInvDateEnd).getTime() / 1000;
            }
            //console.log("this.epochInvDateEnd = " + this.epochInvDateEnd);
        }

    }
}

module.exports.InvoiceOp2111 = InvoiceOp2111;