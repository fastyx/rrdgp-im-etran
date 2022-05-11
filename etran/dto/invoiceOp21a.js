const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp21a extends BaseInvoice {

    constructor(req, xmlCfg, statusInvoice, res) {

        //BaseInvoice
        super(req, xmlCfg, statusInvoice, res);

        //HandleOp
        this.transaction = "handleOp21a";

        //Уникальный номер idSmInvoice
        this.idSmInvoice = null;

        //stateTransaction
        this.stateTransaction = 21;

        //opts
        this.opts = null;

        //invFactDateAccept
        if (typeof xmlCfg.invoice_doc_route.invfactdateaccept === 'undefined') { this.invFactDateAccept = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.invFactDateAccept = xmlCfg.invoice_doc_route.invfactdateaccept.$.value;
        }
        //console.log("this.invFactDateAccept = " + this.invFactDateAccept);

        //epochInvFactDateAccept
        if (typeof xmlCfg.invoice_doc_route.invfactdateaccept === 'undefined') { this.epochInvFactDateAccept = null; }
        else {
            this.epochInvFactDateAccept = xmlCfg.invoice_doc_route.invfactdateaccept.$.value;
            this.a = this.epochInvFactDateAccept.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochInvFactDateAccept = this.a[0] + " " + this.a[1];
            this.epochInvFactDateAccept = new Date(this.epochInvFactDateAccept).getTime() / 1000;
        }
        //console.log("this.epochInvFactDateAccept = " + this.epochInvFactDateAccept);

    }
}

module.exports.InvoiceOp21a = InvoiceOp21a;