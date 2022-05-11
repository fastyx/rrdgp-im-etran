const { v4: getuuid } = require('uuid');
const { BaseDocument } = require('./baseDocument.js')
const logger = require('../../config/logger');

class BaseFdu92 extends BaseDocument {

    constructor(req, xmlCfg) {

        try {

            //BaseDocument
            super(req);

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
            if (typeof xmlCfg.fdu_92_root_route.idsm === 'undefined') { this.idSm = null; }
            else { this.idSm = xmlCfg.fdu_92_root_route.idsm; }
            //console.log("this.idSm = " + this.idSm);

            //idSmDoc      
            this.idSmDoc = null;

            //docTypeId
            this.docTypeId = -9;

            //docId
            if (typeof xmlCfg.fdu_92_doc_route.cumid === 'undefined') { this.docId = null; }
            else { this.docId = xmlCfg.fdu_92_doc_route.cumid.$.value; }
            //console.log("this.docId = " + this.docId);

            //docNumber
            if (typeof xmlCfg.fdu_92_doc_route.cumnumber === 'undefined') { this.docNumber = null; }
            else { this.docNumber = xmlCfg.fdu_92_doc_route.cumnumber.$.value; }
            //console.log("this.docNumber = " + this.docNumber);

            //operDate
            if (typeof xmlCfg.fdu_92_doc_route.operdate === 'undefined') { this.operDate = null; }
            else {
                this.operDate = xmlCfg.fdu_92_doc_route.operdate.$.value;
                this.a = this.operDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.operDate = this.a[0] + " " + this.a[1];

            }
            //console.log("this.operDate = " + this.operDate);

            //payerOKPO
            if (typeof xmlCfg.fdu_92_doc_route.cumpayerokpo === 'undefined') { this.payerOKPO = null; }
            else { this.payerOKPO = xmlCfg.fdu_92_doc_route.cumpayerokpo.$.value; }
            //console.log("this.vpuState = " + this.vpuState);

            //vpuStateId
            if (typeof xmlCfg.fdu_92_doc_route.cumstateid === 'undefined') { this.vpuStateId = null; }
            else { this.vpuStateId = xmlCfg.fdu_92_doc_route.cumstateid.$.value; }
            //console.log("this.vpuStateId = " + this.vpuStateId);

            // массиве car ~ cumDue
            this.cumDue = new Array();
            this.dueDateAmount = new Array();
            this.dueTypeCode = new Array();
            this.dueAmount = new Array();
            this.invNumber = new Array();
            this.invoiceID = new Array();
            this.dueInfo = new Array();
            if (typeof xmlCfg.fdu_92_doc_route.cumdue === 'undefined') {
                this.cumDue = [];
            }
            else {
                if (Array.isArray(xmlCfg.fdu_92_doc_route.cumdue)) {
                    for (let i = 0; i < xmlCfg.fdu_92_doc_route.cumdue.length; i++) {
                        //dueDateAmount
                        if (typeof xmlCfg.fdu_92_doc_route.cumdue[i].duedate === 'undefined') { this.dueDateAmount[i] = null; }
                        else { this.dueDateAmount[i] = xmlCfg.fdu_92_doc_route.cumdue[i].duedate.$.value; }
                        //console.log(`dueDateAmount[i] = ${this.dueDateAmount[i]} `);

                        //dueTypeCode
                        if (typeof xmlCfg.fdu_92_doc_route.cumdue[i].duecode === 'undefined') { this.dueTypeCode[i] = null; }
                        else { this.dueTypeCode[i] = xmlCfg.fdu_92_doc_route.cumdue[i].duecode.$.value; }
                        //console.log(`dueTypeCode[i] = ${this.dueTypeCode[i]} `);

                        //dueAmount
                        if (typeof xmlCfg.fdu_92_doc_route.cumdue[i].duesum === 'undefined') { this.dueAmount[i] = null; }
                        else { this.dueAmount[i] = xmlCfg.fdu_92_doc_route.cumdue[i].duesum.$.value; }
                        //console.log(`dueAmount[i] = ${this.dueAmount[i]} `);

                        //invNumber
                        if (typeof xmlCfg.fdu_92_doc_route.cumdue[i].dueparentdocnum === 'undefined') { this.invNumber[i] = null; }
                        else { this.invNumber[i] = xmlCfg.fdu_92_doc_route.cumdue[i].dueparentdocnum.$.value; }
                        //console.log(`invNumber[i] = ${this.invNumber[i]} `);

                        //invoiceID
                        if (typeof xmlCfg.fdu_92_doc_route.cumdue[i].dueparentdocid === 'undefined') { this.invoiceID[i] = null; }
                        else { this.invoiceID[i] = xmlCfg.fdu_92_doc_route.cumdue[i].dueparentdocid.$.value; }
                        //console.log(`invoiceID[i] = ${this.invoiceID[i]} `);

                        // dueInfo 
                        if (typeof xmlCfg.fdu_92_doc_route.cumdue[i].dueinfo === 'undefined') { this.dueInfo[i] = null; }
                        else { this.dueInfo[i] = xmlCfg.fdu_92_doc_route.cumdue[i].dueinfo.$.value; }
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
                    if (typeof xmlCfg.fdu_92_doc_route.cumdue.duedate === 'undefined') { this.dueDateAmount[i] = null; }
                    else { this.dueDateAmount[i] = xmlCfg.fdu_92_doc_route.cumdue.duedate.$.value; }
                    //console.log(`dueDateAmount[i] = ${this.dueDateAmount[i]} `);

                    //dueTypeCode
                    if (typeof xmlCfg.fdu_92_doc_route.cumdue.duecode === 'undefined') { this.dueTypeCode[i] = null; }
                    else { this.dueTypeCode[i] = xmlCfg.fdu_92_doc_route.cumdue.duecode.$.value; }
                    //console.log(`dueTypeCode[i] = ${this.dueTypeCode[i]} `);

                    //dueAmount
                    if (typeof xmlCfg.fdu_92_doc_route.cumdue.duesum === 'undefined') { this.dueAmount[i] = null; }
                    else { this.dueAmount[i] = xmlCfg.fdu_92_doc_route.cumdue.duesum.$.value; }
                    //console.log(`dueAmount[i] = ${this.dueAmount[i]} `);

                    //invNumber
                    if (typeof xmlCfg.fdu_92_doc_route.cumdue.dueparentdocnum === 'undefined') { this.invNumber[i] = null; }
                    else { this.invNumber[i] = xmlCfg.fdu_92_doc_route.cumdue.dueparentdocnum.$.value; }
                    //console.log(`invNumber[i] = ${this.invNumber[i]} `);

                    //invoiceID
                    if (typeof xmlCfg.fdu_92_doc_route.cumdue.dueparentdocid === 'undefined') { this.invoiceID[i] = null; }
                    else { this.invoiceID[i] = xmlCfg.fdu_92_doc_route.cumdue.dueparentdocid.$.value; }
                    //console.log(`invoiceID[i] = ${this.invoiceID[i]} `);

                    // dueInfo 
                    if (typeof xmlCfg.fdu_92_doc_route.cumdue.dueinfo === 'undefined') { this.dueInfo[i] = null; }
                    else { this.dueInfo[i] = xmlCfg.fdu_92_doc_route.cumdue.dueinfo.$.value; }
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
            if (typeof xmlCfg.fdu_92_doc_route.cumcar === 'undefined') {
                this.car = [];
            }
            else {
                if (Array.isArray(xmlCfg.fdu_92_doc_route.cumcar)) {
                    for (let i = 0; i < xmlCfg.fdu_92_doc_route.cumcar.length; i++) {
                        if (typeof xmlCfg.fdu_92_doc_route.cumcar[i].carnumber === 'undefined') {
                            this.carNumber[i] = null;
                            this.idSmCar[i] = null;
                            this.car[i] = {
                                carNumber: this.carNumber[i],
                                idSmCar: this.idSmCar[i]
                            };
                        }
                        else {
                            this.carNumber[i] = xmlCfg.fdu_92_doc_route.cumcar[i].carnumber.$.value;
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

                    if (typeof xmlCfg.fdu_92_doc_route.cumcar.carnumber === 'undefined') {
                        this.carNumber[i] = null;
                        this.idSmCar[i] = null;
                        this.car[i] = {
                            carNumber: this.carNumber[i],
                            idSmCar: this.idSmCar[i]
                        };
                    }
                    else {
                        this.carNumber[i] = xmlCfg.fdu_92_doc_route.cumcar.carnumber.$.value;
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