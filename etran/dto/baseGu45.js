const xml = require('xml');
const { BaseDocument } = require('./baseDocument.js')
const logger = require('../../config/logger');
var parseString = require('xml2js').parseString;
var DomParser = require('dom-parser');
var parser = new DomParser();
var xmlParse = require('xml2json');

class BaseGu45 extends BaseDocument {

    constructor(req, xmlCfg) {

        try {

            //BaseDocument
            super(req);

            //idSm
            if (typeof xmlCfg.gu_45_root_route.idsm === 'undefined') { this.idSm = null; }
            else { this.idSm = xmlCfg.gu_45_root_route.idsm; }
            ////console.log("this.idSm = " + this.idSm);

            //docId
            if (typeof xmlCfg.gu_45_doc_route.request.documentdata.docid === 'undefined') { this.docId = null; }
            else { this.docId = xmlCfg.gu_45_doc_route.request.documentdata.docid; }

            //idSmDoc      
            this.idSmDoc = null;

            //docTypeId
            this.docTypeId = 7;

            //docName
            this.docName = 'GU45';

            //docBase64
            //преобразуем document из base64 в utf-8 
            logger.debug("baseGu45. Преобразование Base64 в UTF-8");
            this.docBaseUtf8 = (new Buffer.from(xmlCfg.gu_45_doc_route.request.documentdata.doccontent, 'base64')).toString('utf8');

            //преобразуем xml в jsonObject
            logger.debug("baseGu45. Преобразование XML(string) в JSON(object)");
            const jsonObj = JSON.parse(xmlParse.toJson(this.docBaseUtf8));
            ////console.log(jsonObj)

            //railwayStationCode
            if (typeof jsonObj.data.railway_station_code === 'undefined') { this.railwayStationCode = null; }
            else { this.railwayStationCode = jsonObj.data.railway_station_code; }
            ////console.log("this.railwayStationCode = " + this.railwayStationCode);

            //operType
            if (typeof jsonObj.data.oper_type === 'undefined') { this.operType = null; }
            else { this.operType = jsonObj.data.oper_type; }
            ////console.log("this.operType = " + this.operType);

            //docNumber
            if (typeof jsonObj.data.number === 'undefined') { this.docNumber = null; }
            else { this.docNumber = jsonObj.data.number; }
            ////console.log("this.docNumber = " + this.docNumber);

            //docStateId
            if (typeof xmlCfg.gu_45_doc_route.docstate.stateid === 'undefined') { this.docStateId = null; }
            else { this.docStateId = xmlCfg.gu_45_doc_route.docstate.stateid; }
            ////console.log("this.docStateId = " + this.docStateId);

            //operDate
            if (typeof xmlCfg.gu_45_doc_route.operdate === 'undefined') { this.operDate = null; }
            else {
                this.operDate = xmlCfg.gu_45_doc_route.operdate;
                this.a = this.operDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.operDate = this.a[0] + " " + this.a[1];

            }
            ////console.log("this.operDate = " + this.operDate);

            //epochOperDate
            if (typeof xmlCfg.gu_45_doc_route.operdate === 'undefined') { this.epochOperDate = null; }
            else {
                this.epochOperDate = xmlCfg.gu_45_doc_route.operdate;
                this.a = this.epochOperDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.epochOperDate = this.a[0] + " " + this.a[1];
                this.epochOperDate = new Date(this.epochOperDate).getTime() / 1000;
            }
            ////console.log("this.epochOperDate = " + this.epochOperDate);

            for (let i = 0; i < jsonObj.data.wagons.wagon.length; i++) {
                ////console.log(jsonObj.data.wagons.wagon[i]);
            }

            //car array
            this.carNumber = new Array();
            this.idSmCar = new Array();
            this.car = new Array();
            this.carInDate = new Array();
            this.carInDateEpoch = new Array();
            this.carOutDate = new Array();
            this.carOutDateEpoch = new Array();
            if (typeof jsonObj.data.wagons === 'undefined') {
                ////console.log("no_wagons");
                this.car = [];
                this.carInDate = [];
                this.carOutDate = [];
            }
            else {
                if (typeof jsonObj.data.wagons.wagon === 'undefined') {
                    ////console.log("no_wagon");
                    this.car = [];
                    this.carInDate = [];
                    this.carInDateEpoch = [];
                    this.carOutDate = [];
                    this.carOutDateEpoch = [];
                }
                else {
                    if (Array.isArray(jsonObj.data.wagons.wagon)) {
                        ////console.log("wagon - is array");
                        for (let i = 0; i < jsonObj.data.wagons.wagon.length; i++) {
                            // Проверяется наличие номера вагона
                            if (typeof jsonObj.data.wagons.wagon[i].wagon_number === 'undefined') {
                                this.carNumber[i] = null;
                                this.idSmCar[i] = null;
                                this.car[i] = { carNumber: this.carNumber[i], idSmCar: this.idSmCar[i] };
                                this.carInDate[i] = null;
                                this.carInDateEpoch[i] = null;
                                this.carOutDate[i] = null;
                                this.carOutDateEpoch[i] = null;
                            }
                            else {
                                this.carNumber[i] = jsonObj.data.wagons.wagon[i].wagon_number;
                                this.idSmCar[i] = null;
                                this.car[i] = { carNumber: this.carNumber[i], idSmCar: this.idSmCar[i] };

                                // Проверяется наличие get_in_date(time)
                                if (typeof jsonObj.data.wagons.wagon[i].get_in_date === 'undefined' || typeof jsonObj.data.wagons.wagon[i].get_in_time === 'undefined') {
                                    this.carInDate[i] = null;
                                    this.carInDateEpoch[i] = null;
                                }
                                else {
                                    // Преобразование и получение массива дат для вагона
                                    let date = jsonObj.data.wagons.wagon[i].get_in_date;
                                    let splitDate = date.split(".");
                                    date = `${splitDate[1]}.${splitDate[0]}`
                                    let time = jsonObj.data.wagons.wagon[i].get_in_time;
                                    var curTime = new Date(); let year = curTime.getFullYear(); let sec = '00';
                                    this.carInDate[i] = year + '.' + date + ' ' + time + ':' + sec;
                                    //console.log(`this.carInDate[${i}]= ` + this.carInDate[i]);

                                    this.carInDateEpoch[i] = new Date(this.carInDate[i]).getTime() / 1000;
                                    //console.log(`this.carInDateEpoch[${i}]= ` + this.carInDateEpoch[i]);
                                }

                                // Проверяется наличие get_out_date(time)
                                if (typeof jsonObj.data.wagons.wagon[i].get_out_date === 'undefined' || typeof jsonObj.data.wagons.wagon[i].get_out_time === 'undefined') {
                                    this.carOutDate[i] = null;
                                    this.carOutDateEpoch[i] = null;
                                }
                                else {
                                    // Преобразование и получение массива дат для вагона
                                    let date = jsonObj.data.wagons.wagon[i].get_out_date;
                                    let splitDate = date.split(".");
                                    date = `${splitDate[1]}.${splitDate[0]}`
                                    let time = jsonObj.data.wagons.wagon[i].get_out_time;
                                    var curTime = new Date(); let year = curTime.getFullYear(); let sec = '00';
                                    this.carOutDate[i] = year + '.' + date + ' ' + time + ':' + sec;
                                    //console.log(`this.carOutDate[${i}]= ` + this.carOutDate[i]);

                                    this.carOutDateEpoch[i] = new Date(this.carOutDate[i]).getTime() / 1000;
                                    //console.log(`this.carOutDateEpoch[${i}]= ` + this.carOutDateEpoch[i]);
                                }
                            }
                        }

                    }
                    else {
                        ////console.log("wagon - is not array");
                        let i = 0;
                        // Проверяется наличие номера вагона
                        if (typeof jsonObj.data.wagons.wagon.wagon_number === 'undefined') {
                            this.carNumber[i] = null;
                            this.idSmCar[i] = null;
                            this.car[i] = { carNumber: this.carNumber[i], idSmCar: this.idSmCar[i] };
                            this.carInDate[i] = null;
                            this.carInDateEpoch[i] = null;
                            this.carOutDate[i] = null;
                            this.carOutDateEpoch[i] = null;
                        }
                        else {
                            this.carNumber[i] = jsonObj.data.wagons.wagon.wagon_number;
                            this.idSmCar[i] = null;
                            this.car[i] = { carNumber: this.carNumber[i], idSmCar: this.idSmCar[i] };

                            // Проверяется наличие get_in_date(time)
                            if (typeof jsonObj.data.wagons.wagon.get_in_date === 'undefined' || typeof jsonObj.data.wagons.wagon.get_in_time === 'undefined') {
                                this.carInDate[i] = null;
                                this.carInDateEpoch[i] = null;
                            }
                            else {
                                // Преобразование и получение дат для вагона
                                let date = jsonObj.data.wagons.wagon.get_in_date;
                                let splitDate = date.split(".");
                                date = `${splitDate[1]}.${splitDate[0]}`
                                let time = jsonObj.data.wagons.wagon.get_in_time;
                                var curTime = new Date(); let year = curTime.getFullYear(); let sec = '00';
                                this.carInDate[i] = year + '.' + date + ' ' + time + ':' + sec;
                                //console.log(`this.carInDate[${i}]= ` + this.carInDate[i]);

                                this.carInDateEpoch[i] = new Date(this.carInDate[i]).getTime() / 1000;
                                //console.log(`this.carInDateEpoch[${i}]= ` + this.carInDateEpoch[i]);
                            }

                            // Проверяется наличие get_out_date(time)
                            if (typeof jsonObj.data.wagons.wagon.get_out_date === 'undefined' || typeof jsonObj.data.wagons.wagon.get_out_time === 'undefined') {
                                this.carOutDate[i] = null;
                                this.carOutDateEpoch[i] = null;
                            }
                            else {
                                // Преобразование и получение дат для вагона
                                let date = jsonObj.data.wagons.wagon.get_out_date;
                                let splitDate = date.split(".");
                                date = `${splitDate[1]}.${splitDate[0]}`
                                let time = jsonObj.data.wagons.wagon.get_out_time;
                                var curTime = new Date(); let year = curTime.getFullYear(); let sec = '00';
                                this.carOutDate[i] = year + '.' + date + ' ' + time + ':' + sec;
                                //console.log(`this.carOutDate[${i}]= ` + this.carOutDate[i]);


                                this.carOutDateEpoch[i] = new Date(this.carOutDate[i]).getTime() / 1000;
                                //console.log(`this.carOutDateEpoch[${i}]= ` + this.carOutDateEpoch[i]);
                            }
                        }
                    }
                }
            }

        } catch (e) {
            logger.error(`baseGu45: ошибка парсинга базовых показателей gu45. ${e}`);
            logger.error(e);
        }
    }
}

module.exports.BaseGu45 = BaseGu45;