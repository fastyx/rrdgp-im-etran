const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp16 extends BaseInvoice {

    constructor(req, xmlCfg, statusInvoice, res) {

        //BaseInvoice
        super(req, xmlCfg, statusInvoice, res);

        //Уникальный номер idSmInvoice
        this.idSmInvoice = getuuid();

        //HandleOp
        this.transaction = "handleOp16";

        //stateTransaction
        this.stateTransaction = 16;

        //opts
        this.opts = null;

        //ladenInvoicePresentingDate
        if (typeof xmlCfg.invoice_doc_route.operdate === 'undefined') { this.ladenInvoicePresentingDate = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.ladenInvoicePresentingDate = xmlCfg.invoice_doc_route.operdate.$.value;
        }
        //console.log("this.ladenInvoicePresentingDate = " + this.ladenInvoicePresentingDate);

        //epochLadenInvoicePresentingDate
        if (typeof xmlCfg.invoice_doc_route.operdate === 'undefined') { this.epochLadenInvoicePresentingDate = null; }
        else {
            this.epochLadenInvoicePresentingDate = xmlCfg.invoice_doc_route.operdate.$.value;
            this.a = this.epochLadenInvoicePresentingDate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochLadenInvoicePresentingDate = this.a[0] + " " + this.a[1];
            this.epochLadenInvoicePresentingDate = new Date(this.epochLadenInvoicePresentingDate).getTime() / 1000;
        }
        //console.log("this.epochLadenInvoicePresentingDate = " + this.epochLadenInvoicePresentingDate);

    }
}

module.exports.InvoiceOp16 = InvoiceOp16;