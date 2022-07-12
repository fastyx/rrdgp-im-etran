const { v4: getuuid } = require('uuid');
const logger = require('../../config/logger');
const checksum = require('json-checksum');

class BaseFdu92 {

    constructor(message) {

        try {

            //Входной документ
            this.inputDocument = message;                //rawBody - исходный XML документ

            //Контрольная сумма
            this.checkSum = checksum(JSON.stringify(message));         //контрольная сумма по исходному документу

            //HandleOp
            this.transaction = "handleDoc";   //ФДУ-92

            //dueHandleOp
            this.dueTransaction = "handleDue";

            //stateTransaction
            this.stateTransaction = 178;

            //docName
            this.docName = 'FDU92';

            //opts
            this.opts = null;

            //idSm
            if (typeof message.requestnotification.idsm === 'undefined') { this.idSm = null; }
            else { this.idSm = message.requestnotification.idsm; }
            //console.log("this.idSm = " + this.idSm);

            //idSmDoc      
            this.idSmDoc = null;

            //docTypeId
            this.docTypeId = -9;

            //docId
            if (typeof message.requestnotification.cum.cumid === 'undefined') { this.docId = null; }
            else { this.docId = message.requestnotification.cum.cumid.$.value; }
            //console.log("this.docId = " + this.docId);

            //docNumber
            if (typeof message.requestnotification.cum.cumnumber === 'undefined') { this.docNumber = null; }
            else { this.docNumber = message.requestnotification.cum.cumnumber.$.value; }
            //console.log("this.docNumber = " + this.docNumber);

            //operDate
            if (typeof message.requestnotification.cum.operdate === 'undefined') { this.operDate = null; }
            else {
                this.operDate = message.requestnotification.cum.operdate.$.value;
                this.a = this.operDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.operDate = this.a[0] + " " + this.a[1];

            }
            //console.log("this.operDate = " + this.operDate);

            //payerOKPO
            if (typeof message.requestnotification.cum.cumpayerokpo === 'undefined') { this.payerOKPO = null; }
            else { this.payerOKPO = message.requestnotification.cum.cumpayerokpo.$.value; }
            //console.log("this.vpuState = " + this.vpuState);

            //vpuStateId
            if (typeof message.requestnotification.cum.cumstateid === 'undefined') { this.vpuStateId = null; }
            else { this.vpuStateId = message.requestnotification.cum.cumstateid.$.value; }
            //console.log("this.vpuStateId = " + this.vpuStateId);

            // массиве car ~ cumDue
            this.cumDue = new Array();
            this.dueDateAmount = new Array();
            this.dueTypeCode = new Array();
            this.dueAmount = new Array();
            this.invNumber = new Array();
            this.invoiceID = new Array();
            this.dueInfo = new Array();
            if (typeof message.requestnotification.cum.cumdue === 'undefined') {
                this.cumDue = [];
            }
            else {
                if (Array.isArray(message.requestnotification.cum.cumdue)) {
                    for (let i = 0; i < message.requestnotification.cum.cumdue.length; i++) {
                        //dueDateAmount
                        if (typeof message.requestnotification.cum.cumdue[i].duedate === 'undefined') { this.dueDateAmount[i] = null; }
                        else { this.dueDateAmount[i] = message.requestnotification.cum.cumdue[i].duedate.$.value; }
                        //console.log(`dueDateAmount[i] = ${this.dueDateAmount[i]} `);

                        //dueTypeCode
                        if (typeof message.requestnotification.cum.cumdue[i].duecode === 'undefined') { this.dueTypeCode[i] = null; }
                        else { this.dueTypeCode[i] = message.requestnotification.cum.cumdue[i].duecode.$.value; }
                        //console.log(`dueTypeCode[i] = ${this.dueTypeCode[i]} `);

                        //dueAmount
                        if (typeof message.requestnotification.cum.cumdue[i].duesum === 'undefined') { this.dueAmount[i] = null; }
                        else { this.dueAmount[i] = message.requestnotification.cum.cumdue[i].duesum.$.value; }
                        //console.log(`dueAmount[i] = ${this.dueAmount[i]} `);

                        //invNumber
                        if (typeof message.requestnotification.cum.cumdue[i].dueparentdocnum === 'undefined') { this.invNumber[i] = null; }
                        else { this.invNumber[i] = message.requestnotification.cum.cumdue[i].dueparentdocnum.$.value; }
                        //console.log(`invNumber[i] = ${this.invNumber[i]} `);

                        //invoiceID
                        if (typeof message.requestnotification.cum.cumdue[i].dueparentdocid === 'undefined') { this.invoiceID[i] = null; }
                        else { this.invoiceID[i] = message.requestnotification.cum.cumdue[i].dueparentdocid.$.value; }
                        //console.log(`invoiceID[i] = ${this.invoiceID[i]} `);

                        // dueInfo 
                        if (typeof message.requestnotification.cum.cumdue[i].dueinfo === 'undefined') { this.dueInfo[i] = null; }
                        else { this.dueInfo[i] = message.requestnotification.cum.cumdue[i].dueinfo.$.value; }
                        //console.log(`dueInfo[i] = ${this.dueInfo[i]} `);

                        this.cumDue[i] = {
                            dueDateAmount: this.dueDateAmount[i],
                            dueTypeCode: this.dueTypeCode[i],
                            dueAmount: this.dueAmount[i],
                            invNumber: this.invNumber[i],
                            invoiceID: this.invoiceID[i],
                            dueInfo: this.dueInfo[i]
                        }
                    }
                }
                else {
                    let i = 0;
                    //dueDateAmount
                    if (typeof message.requestnotification.cum.cumdue.duedate === 'undefined') { this.dueDateAmount[i] = null; }
                    else { this.dueDateAmount[i] = message.requestnotification.cum.cumdue.duedate.$.value; }
                    //console.log(`dueDateAmount[i] = ${this.dueDateAmount[i]} `);

                    //dueTypeCode
                    if (typeof message.requestnotification.cum.cumdue.duecode === 'undefined') { this.dueTypeCode[i] = null; }
                    else { this.dueTypeCode[i] = message.requestnotification.cum.cumdue.duecode.$.value; }
                    //console.log(`dueTypeCode[i] = ${this.dueTypeCode[i]} `);

                    //dueAmount
                    if (typeof message.requestnotification.cum.cumdue.duesum === 'undefined') { this.dueAmount[i] = null; }
                    else { this.dueAmount[i] = message.requestnotification.cum.cumdue.duesum.$.value; }
                    //console.log(`dueAmount[i] = ${this.dueAmount[i]} `);

                    //invNumber
                    if (typeof message.requestnotification.cum.cumdue.dueparentdocnum === 'undefined') { this.invNumber[i] = null; }
                    else { this.invNumber[i] = message.requestnotification.cum.cumdue.dueparentdocnum.$.value; }
                    //console.log(`invNumber[i] = ${this.invNumber[i]} `);

                    //invoiceID
                    if (typeof message.requestnotification.cum.cumdue.dueparentdocid === 'undefined') { this.invoiceID[i] = null; }
                    else { this.invoiceID[i] = message.requestnotification.cum.cumdue.dueparentdocid.$.value; }
                    //console.log(`invoiceID[i] = ${this.invoiceID[i]} `);

                    // dueInfo 
                    if (typeof message.requestnotification.cum.cumdue.dueinfo === 'undefined') { this.dueInfo[i] = null; }
                    else { this.dueInfo[i] = message.requestnotification.cum.cumdue.dueinfo.$.value; }
                    //console.log(`dueInfo[i] = ${this.dueInfo[i]} `);

                    this.cumDue[i] = {
                        dueDateAmount: this.dueDateAmount[i],
                        dueTypeCode: this.dueTypeCode[i],
                        dueAmount: this.dueAmount[i],
                        invNumber: this.invNumber[i],
                        invoiceID: this.invoiceID[i],
                        dueInfo: this.dueInfo[i]
                    }
                }
            }


            //car
            this.carNumber = new Array();
            this.idSmCar = new Array();
            this.car = new Array();
            if (typeof message.requestnotification.cum.cumcar === 'undefined') {
                this.car = [];
            }
            else {
                if (Array.isArray(message.requestnotification.cum.cumcar)) {
                    for (let i = 0; i < message.requestnotification.cum.cumcar.length; i++) {
                        if (typeof message.requestnotification.cum.cumcar[i].carnumber === 'undefined') {
                            this.carNumber[i] = null;
                            this.idSmCar[i] = null;
                            this.car[i] = {
                                carNumber: this.carNumber[i],
                                idSmCar: this.idSmCar[i]
                            };
                        }
                        else {
                            this.carNumber[i] = message.requestnotification.cum.cumcar[i].carnumber.$.value;
                            this.idSmCar[i] = getuuid();
                            this.car[i] = {
                                carNumber: this.carNumber[i],
                                idSmCar: this.idSmCar[i]
                            };
                        }
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestnotification.cum.cumcar.carnumber === 'undefined') {
                        this.carNumber[i] = null;
                        this.idSmCar[i] = null;
                        this.car[i] = {
                            carNumber: this.carNumber[i],
                            idSmCar: this.idSmCar[i]
                        };
                    }
                    else {
                        this.carNumber[i] = message.requestnotification.cum.cumcar.carnumber.$.value;
                        this.idSmCar[i] = getuuid();
                        this.car[i] = {
                            carNumber: this.carNumber[i],
                            idSmCar: this.idSmCar[i]
                        };
                    }
                }
            }
        } catch (e) {
            logger.error(`baseFdu92: ошибка парсинга базовых показателей fdu92`);
            logger.error(e);
        }
    }
}

module.exports.BaseFdu92 = BaseFdu92;