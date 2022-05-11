const xml = require('xml');
const { v4: getuuid } = require('uuid');
const { BaseDocument } = require('./baseDocument.js')
const logger = require('../../config/logger');

class BaseGu46 extends BaseDocument {

    constructor(req, xmlCfg) {

        try {

            //BaseDocument
            super(req);

            //HandleOp
            this.transaction = "handleDoc";   //ГУ-46

            //dueHandleOp
            this.dueTransaction = "handleDue";

            //stateTransaction
            this.stateTransaction = 177;

            //docTypeId
            this.docTypeId = 2;

            //docName
            this.docName = 'GU46';

            //opts
            this.opts = null;

            //idSm
            if (typeof xmlCfg.gu_46_root_route.idsm === 'undefined') { this.idSm = null; }
            else { this.idSm = xmlCfg.gu_46_root_route.idsm; }
            //console.log("this.idSm = " + this.idSm);

            //idSmDoc      
            this.idSmDoc = null;

            //docId
            if (typeof xmlCfg.gu_46_doc_route.vpuid === 'undefined') { this.docId = null; }
            else { this.docId = xmlCfg.gu_46_doc_route.vpuid.$.value; }
            //console.log("this.docId = " + this.docId);

            //vpuStateId
            if (typeof xmlCfg.gu_46_doc_route.vpustateid === 'undefined') { this.vpuStateId = null; }
            else { this.vpuStateId = xmlCfg.gu_46_doc_route.vpustateid.$.value; }
            //console.log("this.vpuStateId = " + this.vpuStateId);

            //operDate
            if (typeof xmlCfg.gu_46_doc_route.operdate === 'undefined') { this.operDate = null; }
            else {
                this.operDate = xmlCfg.gu_46_doc_route.operdate.$.value;
                this.a = this.operDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.operDate = this.a[0] + " " + this.a[1];

            }
            //console.log("this.operDate = " + this.operDate);

            //vpuState
            if (typeof xmlCfg.gu_46_doc_route.vpustate === 'undefined') { this.vpuState = null; }
            else { this.vpuState = xmlCfg.gu_46_doc_route.vpustate.$.value; }
            //console.log("this.vpuState = " + this.vpuState);

            //vpuPayerOKPO
            if (typeof xmlCfg.gu_46_doc_route.vpupayerokpo === 'undefined') { this.vpuPayerOKPO = null; }
            else { this.vpuPayerOKPO = xmlCfg.gu_46_doc_route.vpupayerokpo.$.value; }
            //console.log("this.vpuState = " + this.vpuState);

            //dueTypeCode
            this.dueTypeCode = new Array();
            if (typeof xmlCfg.gu_46_doc_route.vpusbor === 'undefined') {
                this.dueTypeCode[0] = null;
                //console.log("this.dueTypeCode=" + this.dueTypeCode[0]);
            }
            else {
                if (Array.isArray(xmlCfg.gu_46_doc_route.vpusbor)) {
                    for (let i = 0; i < xmlCfg.gu_46_doc_route.vpusbor.length; i++) {

                        if (typeof xmlCfg.gu_46_doc_route.vpusbor[i].sbortype === 'undefined') { this.dueTypeCode[i] = null; }
                        else { this.dueTypeCode[i] = xmlCfg.gu_46_doc_route.vpusbor[i].sbortype.$.value; }
                        //console.log("this.dueTypeCode[" + i + "] = " + this.dueTypeCode[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.gu_46_doc_route.vpusbor.sbortype === 'undefined') { this.dueTypeCode[i] = null; }
                    else { this.dueTypeCode[i] = xmlCfg.gu_46_doc_route.vpusbor.sbortype.$.value; }
                    //console.log("this.dueTypeCode(не массив)[" + i + "] = " + this.dueTypeCode[i]);
                }
            }

            //dueAmount
            this.dueAmount = new Array();
            if (typeof xmlCfg.gu_46_doc_route.vpusbor === 'undefined') {
                this.dueAmount[0] = null;
                //console.log("this.dueAmount=" + this.dueAmount[0]);
            }
            else {
                if (Array.isArray(xmlCfg.gu_46_doc_route.vpusbor)) {
                    for (let i = 0; i < xmlCfg.gu_46_doc_route.vpusbor.length; i++) {

                        if (typeof xmlCfg.gu_46_doc_route.vpusbor[i].sborsumma === 'undefined') { this.dueAmount[i] = null; }
                        else { this.dueAmount[i] = xmlCfg.gu_46_doc_route.vpusbor[i].sborsumma.$.value; }
                        //console.log("this.dueAmount[" + i + "] = " + this.dueAmount[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.gu_46_doc_route.vpusbor.sborsumma === 'undefined') { this.dueAmount[i] = null; }
                    else { this.dueAmount[i] = xmlCfg.gu_46_doc_route.vpusbor.sborsumma.$.value; }
                    //console.log("this.dueAmount(не массив)[" + i + "] = " + this.dueAmount[i]);
                }
            }

            //docNumber
            if (typeof xmlCfg.gu_46_doc_route.vpunumber === 'undefined') { this.docNumber = null; }
            else { this.docNumber = xmlCfg.gu_46_doc_route.vpunumber.$.value; }
            //console.log("this.docNumber = " + this.docNumber);

            //car
            this.carNumber = new Array();
            this.idSmCar = new Array();
            this.carDueAmount = new Array();
            this.car = new Array();
            if (typeof xmlCfg.gu_46_doc_route.vpucar === 'undefined') {
                this.car = [];
            }
            else {
                if (Array.isArray(xmlCfg.gu_46_doc_route.vpucar)) {
                    for (let i = 0; i < xmlCfg.gu_46_doc_route.vpucar.length; i++) {
                        if (typeof xmlCfg.gu_46_doc_route.vpucar[i].carnumber === 'undefined') {
                            this.carNumber[i] = null;
                            this.idSmCar[i] = null;
                            this.carDueAmount[i] = null;
                            this.car[i] = {
                                carNumber: this.carNumber[i],
                                idSmCar: this.idSmCar[i],
                                carDueAmount: this.carDueAmount[i]
                            };
                        }
                        else {
                            this.carNumber[i] = xmlCfg.gu_46_doc_route.vpucar[i].carnumber.$.value;
                            if (typeof xmlCfg.gu_46_doc_route.vpucar[i].cargu23due === 'undefined') {
                                this.carDueAmount[i] = null;
                            }
                            else {
                                this.carDueAmount[i] = xmlCfg.gu_46_doc_route.vpucar[i].cargu23due.$.value;
                            }
                            this.idSmCar[i] = getuuid();
                            this.car[i] = {
                                carNumber: this.carNumber[i],
                                idSmCar: this.idSmCar[i],
                                carDueAmount: this.carDueAmount[i]
                            };
                        }
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.gu_46_doc_route.vpucar.carnumber === 'undefined') {
                        this.carNumber[i] = null;
                        this.idSmCar[i] = null;
                        this.carDueAmount[i] = null;
                        this.car[i] = {
                            carNumber: this.carNumber[i],
                            idSmCar: this.idSmCar[i],
                            carDueAmount: this.carDueAmount[i]
                        };
                    }
                    else {
                        this.carNumber[i] = xmlCfg.gu_46_doc_route.vpucar.carnumber.$.value;
                        if (typeof xmlCfg.gu_46_doc_route.vpucar.cargu23due === 'undefined') {
                            this.carDueAmount[i] = null;
                        }
                        else {
                            this.carDueAmount[i] = xmlCfg.gu_46_doc_route.vpucar.cargu23due.$.value;
                        }
                        this.idSmCar[i] = getuuid();
                        this.car[i] = {
                            carNumber: this.carNumber[i],
                            idSmCar: this.idSmCar[i],
                            carDueAmount: this.carDueAmount[i]
                        };
                    }
                }
            }

        } catch (e) {
            logger.error(`baseGu46: ошибка парсинга базовых показателей gu46. ${e}`);
            logger.error(e);
        }
    }
}

module.exports.BaseGu46 = BaseGu46;