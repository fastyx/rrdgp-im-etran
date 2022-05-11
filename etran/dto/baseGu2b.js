const { BaseDocument } = require('./baseDocument.js')
const logger = require('../../config/logger');

class BaseGu2b extends BaseDocument {

    constructor(req, xmlCfg) {

        try {

            //BaseDocument
            super(req);

            //idSm
            if (typeof xmlCfg.gu_2b_root_route.idsm === 'undefined') { this.idSm = null; }
            else { this.idSm = xmlCfg.gu_2b_root_route.idsm; }
            //console.log("this.idSm = " + this.idSm);

            //docTypeId
            this.docTypeId = 6;

            //docName
            this.docName = 'GU2B';

            //idSmDoc      
            this.idSmDoc = null;

            //crgStateID
            if (typeof xmlCfg.gu_2b_doc_route.crgstateid === 'undefined') { this.crgStateID = null; }
            else { this.crgStateID = xmlCfg.gu_2b_doc_route.crgstateid.$.value; }
            //console.log("this.crgStateID = " + this.crgStateID);

            //docNumber 
            if (typeof xmlCfg.gu_2b_doc_route.cargoendnotificationnumber === 'undefined') { this.docNumber = null; }
            else { this.docNumber = xmlCfg.gu_2b_doc_route.cargoendnotificationnumber.$.value; }
            //console.log("this.docNumber = " + this.docNumber);

            //docId 
            if (typeof xmlCfg.gu_2b_doc_route.cargoendnotificationid === 'undefined') { this.docId = null; }
            else { this.docId = xmlCfg.gu_2b_doc_route.cargoendnotificationid.$.value; }
            //console.log("this.docNumber = " + this.docNumber);

            //operDate
            if (typeof xmlCfg.gu_2b_doc_route.crgdatecreate === 'undefined') { this.operDate = null; }
            else {
                this.operDate = xmlCfg.gu_2b_doc_route.crgdatecreate.$.value;
                this.a = this.operDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.operDate = this.a[0] + " " + this.a[1];

            }
            //console.log("this.operDate = " + this.operDate);

            //epochOperDate
            if (typeof xmlCfg.gu_2b_doc_route.crgdatecreate === 'undefined') { this.epochOperDate = null; }
            else {
                this.epochOperDate = xmlCfg.gu_2b_doc_route.crgdatecreate.$.value;
                this.a = this.epochOperDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.epochOperDate = this.a[0] + " " + this.a[1];
                this.epochOperDate = new Date(this.epochOperDate).getTime() / 1000;
            }
            //console.log("this.epochOperDate = " + this.epochOperDate);

            //crgStationCode
            if (typeof xmlCfg.gu_2b_doc_route.crgstationcode === 'undefined') { this.crgStationCode = null; }
            else { this.crgStationCode = xmlCfg.gu_2b_doc_route.crgstationcode.$.value; }
            //console.log("this.crgStationCode = " + this.crgStationCode);

            //car
            this.carNumber = new Array();
            this.idSmCar = new Array();
            this.car = new Array();
            if (typeof xmlCfg.gu_2b_doc_route.crgcar === 'undefined') {
                this.car = [];
            }
            else {
                if (Array.isArray(xmlCfg.gu_2b_doc_route.crgcar)) {
                    for (let i = 0; i < xmlCfg.gu_2b_doc_route.crgcar.length; i++) {
                        if (typeof xmlCfg.gu_2b_doc_route.crgcar[i].carnumber === 'undefined') { this.carNumber[i] = null; this.idSmCar[i] = null; this.car[i] = { carNumber: this.carNumber[i], idSmCar: this.idSmCar[i] }; }
                        else { this.carNumber[i] = xmlCfg.gu_2b_doc_route.crgcar[i].carnumber.$.value; this.idSmCar[i] = null; this.car[i] = { carNumber: this.carNumber[i], idSmCar: this.idSmCar[i] }; }
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.gu_2b_doc_route.crgcar.carnumber === 'undefined') { this.carNumber[i] = null; this.idSmCar[i] = null; this.car[i] = { carNumber: this.carNumber[i], idSmCar: this.idSmCar[i] }; }
                    else { this.carNumber[i] = xmlCfg.gu_2b_doc_route.crgcar.carnumber.$.value; this.idSmCar[i] = null; this.car[i] = { carNumber: this.carNumber[i], idSmCar: this.idSmCar[i] }; }
                }
            }
        } catch (e) {
            logger.error(`baseGu2b: ошибка парсинга базовых показателей gu2b`);
            logger.error(e);
        }
    }
}

module.exports.BaseGu2b = BaseGu2b;