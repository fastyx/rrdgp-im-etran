const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp03 extends BaseInvoice {

    constructor(req, xmlCfg, statusInvoice, res) {

        //BaseInvoice
        super(req, xmlCfg, statusInvoice, res);

        //Уникальный номер SM
        this.idSmInvoice = getuuid();

        //HandleOp
        this.transaction = "handleOp3";

        //stateTransaction
        this.stateTransaction = 3;

        //opts
        this.opts = null;

        //invDateCreate
        if (typeof xmlCfg.invoice_doc_route.operdate === 'undefined') { this.invDateCreate = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.invDateCreate = xmlCfg.invoice_doc_route.operdate.$.value;
        }
        //console.log("this.invDateCreate = " + this.invDateCreate);

        //epochInvDateCreate
        if (typeof xmlCfg.invoice_doc_route.operdate === 'undefined') { this.epochInvDateCreate = null; }
        else {
            this.epochInvDateCreate = xmlCfg.invoice_doc_route.operdate.$.value;
            this.a = this.epochInvDateCreate.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochInvDateCreate = this.a[0] + " " + this.a[1];
            this.epochInvDateCreate = new Date(this.epochInvDateCreate).getTime() / 1000;
        }
        //console.log("this.epochInvDateCreate = " + this.epochInvDateCreate);
    }
}

module.exports.InvoiceOp03 = InvoiceOp03;