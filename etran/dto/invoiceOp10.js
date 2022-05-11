const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp10 extends BaseInvoice {

    constructor(req, xmlCfg, statusInvoice, res) {

        //BaseInvoice
        super(req, xmlCfg, statusInvoice, res);

        //HandleOp
        this.transaction = "handleOp10";

        //Уникальный номер idSmInvoice
        this.idSmInvoice = null;

        //stateTransaction
        this.stateTransaction = 10;

        //opts
        this.opts = null;

        //invDateNotification
        if (typeof xmlCfg.invoice_doc_route.invdatenotification === 'undefined') { this.invDateNotification = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.invDateNotification = xmlCfg.invoice_doc_route.invdatenotification.$.value;
        }
        //console.log("this.invDateNotification = " + this.invDateNotification);

        //epochInvDateNotification
        if (typeof xmlCfg.invoice_doc_route.invdatenotification === 'undefined') { this.epochInvDateNotification = null; }
        else {
            this.epochInvDateNotification = xmlCfg.invoice_doc_route.invdatenotification.$.value;
            this.a = this.epochInvDateNotification.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochInvDateNotification = this.a[0] + " " + this.a[1];
            this.epochInvDateNotification = new Date(this.epochInvDateNotification).getTime() / 1000;
        }
        //console.log("this.epochInvDateNotification = " + this.epochInvDateNotification);


    }
}

module.exports.InvoiceOp10 = InvoiceOp10;