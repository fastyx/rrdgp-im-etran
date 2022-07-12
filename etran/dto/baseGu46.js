const { v4: getuuid } = require('uuid');
const logger = require('../../config/logger');
const checksum = require('json-checksum');

class BaseGu46 {

    constructor(message) {

        try {

            //Входной документ
            this.inputDocument = message;                //rawBody - исходный XML документ

            //Контрольная сумма
            this.checkSum = checksum(JSON.stringify(message));         //контрольная сумма по исходному документу

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
            if (typeof message.requestnotification.idsm === 'undefined') { this.idSm = null; }
            else { this.idSm = message.requestnotification.idsm; }
            //console.log("this.idSm = " + this.idSm);

            //idSmDoc      
            this.idSmDoc = null;

            //docId
            if (typeof message.requestnotification.vpu.vpuid === 'undefined') { this.docId = null; }
            else { this.docId = message.requestnotification.vpu.vpuid.$.value; }
            //console.log("this.docId = " + this.docId);

            //vpuStateId
            if (typeof message.requestnotification.vpu.vpustateid === 'undefined') { this.vpuStateId = null; }
            else { this.vpuStateId = message.requestnotification.vpu.vpustateid.$.value; }
            //console.log("this.vpuStateId = " + this.vpuStateId);

            //operDate
            if (typeof message.requestnotification.vpu.operdate === 'undefined') { this.operDate = null; }
            else {
                this.operDate = message.requestnotification.vpu.operdate.$.value;
                this.a = this.operDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.operDate = this.a[0] + " " + this.a[1];

            }
            //console.log("this.operDate = " + this.operDate);

            //vpuState
            if (typeof message.requestnotification.vpu.vpustate === 'undefined') { this.vpuState = null; }
            else { this.vpuState = message.requestnotification.vpu.vpustate.$.value; }
            //console.log("this.vpuState = " + this.vpuState);

            //vpuPayerOKPO
            if (typeof message.requestnotification.vpu.vpupayerokpo === 'undefined') { this.vpuPayerOKPO = null; }
            else { this.vpuPayerOKPO = message.requestnotification.vpu.vpupayerokpo.$.value; }
            //console.log("this.vpuState = " + this.vpuState);

            //dueTypeCode
            this.dueTypeCode = new Array();
            if (typeof message.requestnotification.vpu.vpusbor === 'undefined') {
                this.dueTypeCode[0] = null;
                //console.log("this.dueTypeCode=" + this.dueTypeCode[0]);
            }
            else {
                if (Array.isArray(message.requestnotification.vpu.vpusbor)) {
                    for (let i = 0; i < message.requestnotification.vpu.vpusbor.length; i++) {

                        if (typeof message.requestnotification.vpu.vpusbor[i].sbortype === 'undefined') { this.dueTypeCode[i] = null; }
                        else { this.dueTypeCode[i] = message.requestnotification.vpu.vpusbor[i].sbortype.$.value; }
                        //console.log("this.dueTypeCode[" + i + "] = " + this.dueTypeCode[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestnotification.vpu.vpusbor.sbortype === 'undefined') { this.dueTypeCode[i] = null; }
                    else { this.dueTypeCode[i] = message.requestnotification.vpu.vpusbor.sbortype.$.value; }
                    //console.log("this.dueTypeCode(не массив)[" + i + "] = " + this.dueTypeCode[i]);
                }
            }

            //dueAmount
            this.dueAmount = new Array();
            if (typeof message.requestnotification.vpu.vpusbor === 'undefined') {
                this.dueAmount[0] = null;
                //console.log("this.dueAmount=" + this.dueAmount[0]);
            }
            else {
                if (Array.isArray(message.requestnotification.vpu.vpusbor)) {
                    for (let i = 0; i < message.requestnotification.vpu.vpusbor.length; i++) {

                        if (typeof message.requestnotification.vpu.vpusbor[i].sborsumma === 'undefined') { this.dueAmount[i] = null; }
                        else { this.dueAmount[i] = message.requestnotification.vpu.vpusbor[i].sborsumma.$.value; }
                        //console.log("this.dueAmount[" + i + "] = " + this.dueAmount[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestnotification.vpu.vpusbor.sborsumma === 'undefined') { this.dueAmount[i] = null; }
                    else { this.dueAmount[i] = message.requestnotification.vpu.vpusbor.sborsumma.$.value; }
                    //console.log("this.dueAmount(не массив)[" + i + "] = " + this.dueAmount[i]);
                }
            }

            //docNumber
            if (typeof message.requestnotification.vpu.vpunumber === 'undefined') { this.docNumber = null; }
            else { this.docNumber = message.requestnotification.vpu.vpunumber.$.value; }
            //console.log("this.docNumber = " + this.docNumber);

            //car
            this.carNumber = new Array();
            this.idSmCar = new Array();
            this.idSmInvoice = new Array();
            this.carDueAmount = new Array();
            this.car = new Array();
            if (typeof message.requestnotification.vpu.vpucar === 'undefined') {
                this.car = [];
            }
            else {
                if (Array.isArray(message.requestnotification.vpu.vpucar)) {
                    for (let i = 0; i < message.requestnotification.vpu.vpucar.length; i++) {
                        if (typeof message.requestnotification.vpu.vpucar[i].carnumber === 'undefined') {
                            this.carNumber[i] = null;
                            this.idSmCar[i] = null;
                            this.carDueAmount[i] = null;
                            this.car[i] = {
                                carNumber: this.carNumber[i],
                                idSmCar: this.idSmCar[i],
                                carDueAmount: this.carDueAmount[i],
                                idSmInvoice: '00000000-0000-0000-0000-000000000000'
                            };
                        }
                        else {
                            this.carNumber[i] = message.requestnotification.vpu.vpucar[i].carnumber.$.value;
                            if (typeof message.requestnotification.vpu.vpucar[i].cargu23due === 'undefined') {
                                this.carDueAmount[i] = null;
                            }
                            else {
                                this.carDueAmount[i] = message.requestnotification.vpu.vpucar[i].cargu23due.$.value;
                            }
                            this.idSmCar[i] = getuuid();
                            this.car[i] = {
                                carNumber: this.carNumber[i],
                                idSmCar: this.idSmCar[i],
                                carDueAmount: this.carDueAmount[i],
                                idSmInvoice: '00000000-0000-0000-0000-000000000000'
                            };
                        }
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestnotification.vpu.vpucar.carnumber === 'undefined') {
                        this.carNumber[i] = null;
                        this.idSmCar[i] = null;
                        this.carDueAmount[i] = null;
                        this.car[i] = {
                            carNumber: this.carNumber[i],
                            idSmCar: this.idSmCar[i],
                            carDueAmount: this.carDueAmount[i],
                            idSmInvoice: '00000000-0000-0000-0000-000000000000'
                        };
                    }
                    else {
                        this.carNumber[i] = message.requestnotification.vpu.vpucar.carnumber.$.value;
                        if (typeof message.requestnotification.vpu.vpucar.cargu23due === 'undefined') {
                            this.carDueAmount[i] = null;
                        }
                        else {
                            this.carDueAmount[i] = message.requestnotification.vpu.vpucar.cargu23due.$.value;
                        }
                        this.idSmCar[i] = getuuid();
                        this.car[i] = {
                            carNumber: this.carNumber[i],
                            idSmCar: this.idSmCar[i],
                            carDueAmount: this.carDueAmount[i],
                            idSmInvoice: '00000000-0000-0000-0000-000000000000'
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