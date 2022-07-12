const { BaseInvoice } = require('./baseInvoice.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class InvoiceOp60 extends BaseInvoice {

    constructor(message, statusInvoice) {

        //BaseInvoice
        super(message, statusInvoice);

        //HandleOp
        this.transaction = "handleOp60";

        //stateTransaction
        this.stateTransaction = 60;

        //opts
        this.opts = null;

        //ladenCargoEndNotificationDt
        if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.ladenCargoEndNotificationDt = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.ladenCargoEndNotificationDt = message.requestinvoice.invoice.operdate.$.value;
        }
        //console.log("this.ladenCargoEndNotificationDt = " + this.ladenCargoEndNotificationDt);

        //epochLadenCargoEndNotificationDt
        if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.epochLadenCargoEndNotificationDt = null; }
        else {
            this.epochLadenCargoEndNotificationDt = (new Date(message.requestinvoice.invoice.operdate.$.value)).getTime();               //преобразование в epoch (кажется косячит в формате DD.MM.YYYY а он делает MM.DD.YYYY )
        }
        //console.log("this.epochLadenCargoEndNotificationDt = " + this.epochLadenCargoEndNotificationDt);
    }
}

module.exports.InvoiceOp60 = InvoiceOp60;