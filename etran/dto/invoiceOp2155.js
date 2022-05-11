const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp2155 extends BaseInvoice {

    constructor(req, xmlCfg, statusInvoice, res) {

        //BaseInvoice
        super(req, xmlCfg, statusInvoice, res);

        //HandleOp
        this.transaction = "handleOp2155";

        //Уникальный номер idSmInvoice
        this.idSmInvoice = null;

        //stateTransaction
        this.stateTransaction = 2155;

        //opts
        this.opts = null;

        if (this.invoiceStateID === '44') {
            //invDateEnd
            if (typeof xmlCfg.invoice_doc_route.invlastoper === 'undefined') { this.invDateEnd = "0001-01-01 00:00:00.00000+00"; }
            else {
                this.invDateEnd = xmlCfg.invoice_doc_route.invlastoper.$.value;
            }
            //console.log("this.invDateEnd = " + this.invDateEnd);

            //epochInvDateEnd
            if (typeof xmlCfg.invoice_doc_route.invlastoper === 'undefined') { this.epochInvDateEnd = null; }
            else {
                this.epochInvDateEnd = xmlCfg.invoice_doc_route.invlastoper.$.value;
                this.a = this.epochInvDateEnd.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.epochInvDateEnd = this.a[0] + " " + this.a[1];
                this.epochInvDateEnd = new Date(this.epochInvDateEnd).getTime() / 1000;
            }
            //console.log("this.epochInvDateEnd = " + this.epochInvDateEnd);
        }
        if (this.invoiceStateID === '117') {
            //invDateEnd
            if (typeof xmlCfg.invoice_doc_route.operdate === 'undefined') { this.invDateEnd = "0001-01-01 00:00:00.00000+00"; }
            else {
                this.invDateEnd = xmlCfg.invoice_doc_route.operdate.$.value;
            }
            //console.log("this.invDateEnd = " + this.invDateEnd);

            //epochInvDateEnd
            if (typeof xmlCfg.invoice_doc_route.operdate === 'undefined') { this.epochInvDateEnd = null; }
            else {
                this.epochInvDateEnd = xmlCfg.invoice_doc_route.operdate.$.value;
                this.a = this.epochInvDateEnd.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.epochInvDateEnd = this.a[0] + " " + this.a[1];
                this.epochInvDateEnd = new Date(this.epochInvDateEnd).getTime() / 1000;
            }
            //console.log("this.epochInvDateEnd = " + this.epochInvDateEnd);
        }

    }
}

module.exports.InvoiceOp2155 = InvoiceOp2155;