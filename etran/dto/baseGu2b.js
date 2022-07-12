const checksum = require('json-checksum');
const logger = require('../../config/logger');

class BaseGu2b {

    constructor(message) {

        try {

            //Входной документ
            this.inputDocument = message;                //rawBody - исходный XML документ

            //Контрольная сумма
            this.checkSum = checksum(JSON.stringify(message));         //контрольная сумма по исходному документу

            //idSm
            if (typeof message.requestnotification.idsm === 'undefined') { this.idSm = null; }
            else { this.idSm = message.requestnotification.idsm; }
            //console.log("this.idSm = " + this.idSm);

            //docTypeId
            this.docTypeId = 6;

            //docName
            this.docName = 'GU2B';

            //idSmDoc      
            this.idSmDoc = null;

            //crgStateID
            if (typeof message.requestnotification.notificationgu2b.crgstateid === 'undefined') { this.crgStateID = null; }
            else { this.crgStateID = message.requestnotification.notificationgu2b.crgstateid.$.value; }
            //console.log("this.crgStateID = " + this.crgStateID);

            //docNumber 
            if (typeof message.requestnotification.notificationgu2b.cargoendnotificationnumber === 'undefined') { this.docNumber = null; }
            else { this.docNumber = message.requestnotification.notificationgu2b.cargoendnotificationnumber.$.value; }
            //console.log("this.docNumber = " + this.docNumber);

            //docId 
            if (typeof message.requestnotification.notificationgu2b.cargoendnotificationid === 'undefined') { this.docId = null; }
            else { this.docId = message.requestnotification.notificationgu2b.cargoendnotificationid.$.value; }
            //console.log("this.docNumber = " + this.docNumber);

            //operDate
            if (typeof message.requestnotification.notificationgu2b.crgdatecreate === 'undefined') { this.operDate = null; }
            else {
                this.operDate = message.requestnotification.notificationgu2b.crgdatecreate.$.value;
                this.a = this.operDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.operDate = this.a[0] + " " + this.a[1];

            }
            //console.log("this.operDate = " + this.operDate);

            //epochOperDate
            if (typeof message.requestnotification.notificationgu2b.crgdatecreate === 'undefined') { this.epochOperDate = null; }
            else {
                this.epochOperDate = message.requestnotification.notificationgu2b.crgdatecreate.$.value;
                this.a = this.epochOperDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.epochOperDate = this.a[0] + " " + this.a[1];
                this.epochOperDate = new Date(this.epochOperDate).getTime() / 1000;
            }
            //console.log("this.epochOperDate = " + this.epochOperDate);

            //crgStationCode
            if (typeof message.requestnotification.notificationgu2b.crgstationcode === 'undefined') { this.crgStationCode = null; }
            else { this.crgStationCode = message.requestnotification.notificationgu2b.crgstationcode.$.value; }
            //console.log("this.crgStationCode = " + this.crgStationCode);

            //car
            this.carNumber = new Array();
            this.idSmCar = new Array();
            this.car = new Array();
            if (typeof message.requestnotification.notificationgu2b.crgcar === 'undefined') {
                this.car = [];
            }
            else {
                if (Array.isArray(message.requestnotification.notificationgu2b.crgcar)) {
                    for (let i = 0; i < message.requestnotification.notificationgu2b.crgcar.length; i++) {
                        if (typeof message.requestnotification.notificationgu2b.crgcar[i].carnumber === 'undefined') { this.carNumber[i] = null; this.idSmCar[i] = null; this.car[i] = { carNumber: this.carNumber[i], idSmCar: this.idSmCar[i] }; }
                        else { this.carNumber[i] = message.requestnotification.notificationgu2b.crgcar[i].carnumber.$.value; this.idSmCar[i] = null; this.car[i] = { carNumber: this.carNumber[i], idSmCar: this.idSmCar[i] }; }
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestnotification.notificationgu2b.crgcar.carnumber === 'undefined') { this.carNumber[i] = null; this.idSmCar[i] = null; this.car[i] = { carNumber: this.carNumber[i], idSmCar: this.idSmCar[i] }; }
                    else { this.carNumber[i] = message.requestnotification.notificationgu2b.crgcar.carnumber.$.value; this.idSmCar[i] = null; this.car[i] = { carNumber: this.carNumber[i], idSmCar: this.idSmCar[i] }; }
                }
            }
        } catch (e) {
            logger.error(`baseGu2b: ошибка парсинга базовых показателей gu2b`);
            logger.error(e);
        }
    }
}

module.exports.BaseGu2b = BaseGu2b;