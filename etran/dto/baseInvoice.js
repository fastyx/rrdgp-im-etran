const { v4: getuuid } = require('uuid');
const { BaseDocument } = require('./baseDocument.js')
const logger = require('../../config/logger');

class BaseInvoice extends BaseDocument {

    constructor(req, xmlCfg, statusInvoice) {

        try {

            //BaseDocument
            super(req);

            //idSm
            if (typeof xmlCfg.invoice_root_route.idsm === 'undefined') { this.idSm = null; }
            else { this.idSm = xmlCfg.invoice_root_route.idsm; }
            //console.log("this.idSm = " + this.idSm);

            //statusInvoice
            this.statusInvoice = statusInvoice;

            //docTypeId
            this.docTypeId = 27;

            //dueHandleOp
            this.dueTransaction = "handleDue";

            //invPayerId
            if (typeof xmlCfg.invoice_doc_route.invpayerid === 'undefined') { this.invPayerId = null; }
            else { this.invPayerId = xmlCfg.invoice_doc_route.invpayerid.$.value; }
            //////console.log("this.invPayerId = " + this.invPayerId);

            //invRecipId
            if (typeof xmlCfg.invoice_doc_route.invrecipid === 'undefined') { this.invRecipId = null; }
            else { this.invRecipId = xmlCfg.invoice_doc_route.invrecipid.$.value; }
            //////console.log("this.invRecipId = " + this.invRecipId);

            //invSenderId
            if (typeof xmlCfg.invoice_doc_route.invsenderid === 'undefined') { this.invSenderId = null; }
            else { this.invSenderId = xmlCfg.invoice_doc_route.invsenderid.$.value; }
            //////console.log("this.invSenderId = " + this.invSenderId);

            //invoiceID
            if (typeof xmlCfg.invoice_doc_route.invoiceid === 'undefined') { this.invoiceId = null; }
            else { this.invoiceId = xmlCfg.invoice_doc_route.invoiceid.$.value; }
            //////console.log("this.invoiceId = " + this.invoiceId);

            //invUNP
            if (typeof xmlCfg.invoice_doc_route.invunp === 'undefined') { this.invUnp = null; }
            else { this.invUnp = xmlCfg.invoice_doc_route.invunp.$.value; }
            //////console.log("this.invUnp = " + this.invUnp);

            //invNumber
            if (typeof xmlCfg.invoice_doc_route.invnumber === 'undefined') { this.invNumber = null; }
            else { this.invNumber = xmlCfg.invoice_doc_route.invnumber.$.value; }
            //////console.log("this.invNumber = " + this.invNumber);

            //invSendKindName
            if (typeof xmlCfg.invoice_doc_route.invsendkindname === 'undefined') { this.invSendKindName = null; }
            else { this.invSendKindName = xmlCfg.invoice_doc_route.invsendkindname.$.value; }
            //////console.log("this.invSendKindName = " + this.invSendKindName);

            //invPlanCarTypeName
            if (typeof xmlCfg.invoice_doc_route.invplancartypename === 'undefined') { this.invPlanCarTypeName = null; }
            else { this.invPlanCarTypeName = xmlCfg.invoice_doc_route.invplancartypename.$.value; }
            //////console.log("this.invPlanCarTypeName = " + this.invPlanCarTypeName);

            //invoiceStateID
            if (typeof xmlCfg.invoice_doc_route.invoicestateid === 'undefined') { this.invoiceStateID = null; }
            else { this.invoiceStateID = xmlCfg.invoice_doc_route.invoicestateid.$.value; }
            //////console.log("this.invoiceStateID = " + this.invoiceStateID);

            //invoiceState
            if (typeof xmlCfg.invoice_doc_route.invoicestate === 'undefined') { this.invoiceState = ''; }
            else { this.invoiceState = xmlCfg.invoice_doc_route.invoicestate.$.value; }
            //////console.log("this.invoiceState = " + this.invoiceState);

            //invFreightWeight
            this.invFreightWeight = new Array();
            this.invFreightWeightSum = 0;
            if (typeof xmlCfg.invoice_doc_route.invfreight === 'undefined') { this.invFreightWeightSum = 0; }
            else {
                if (Array.isArray(xmlCfg.invoice_doc_route.invfreight)) {
                    for (let i = 0; i < xmlCfg.invoice_doc_route.invfreight.length; i++) {
                        if (typeof xmlCfg.invoice_doc_route.invfreight[i].freightweight !== 'undefined') {
                            this.invFreightWeightSum = Number(this.invFreightWeightSum) + Number(xmlCfg.invoice_doc_route.invfreight[i].freightweight.$.value);
                        }
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.invoice_doc_route.invfreight.freightweight !== 'undefined') {
                        this.invFreightWeightSum = Number(this.invFreightWeightSum) + Number(xmlCfg.invoice_doc_route.invfreight.freightweight.$.value);
                    }
                }
            }

            //trainIndex
            if (typeof xmlCfg.invoice_doc_route.trainindex === 'undefined') { this.trainIndex = null; }
            else { this.trainIndex = xmlCfg.invoice_doc_route.trainindex.$.value; }
            //////console.log("this.trainIndex = " + this.trainIndex);

            //trainNumber
            if (typeof xmlCfg.invoice_doc_route.trainnumber === 'undefined') { this.trainNumber = null; }
            else { this.trainNumber = xmlCfg.invoice_doc_route.trainnumber.$.value; }
            //////console.log("this.trainNumber = " + this.trainNumber);

            //operDate
            if (typeof xmlCfg.invoice_doc_route.operdate === 'undefined') { this.operDate = null; }
            else {
                this.operDate = xmlCfg.invoice_doc_route.operdate.$.value;
                this.a = this.operDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.operDate = this.a[0] + " " + this.a[1];
            }
            //////console.log("this.operDate = " + this.operDate);

            //invDateDelivery
            if (typeof xmlCfg.invoice_doc_route.invdatedelivery === 'undefined') { this.invDateDelivery = null; }
            else {
                this.invDateDelivery = xmlCfg.invoice_doc_route.invdatedelivery.$.value;
                this.a = this.invDateDelivery.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.invDateDelivery = this.a[0] + " " + this.a[1];
            }

            //invLastOperDate
            if (typeof xmlCfg.invoice_doc_route.invlastoper === 'undefined') { this.invLastOperDate = null; }
            else {
                this.invLastOperDate = xmlCfg.invoice_doc_route.invlastoper.$.value;
                this.a = this.invLastOperDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.invLastOperDate = this.a[0] + " " + this.a[1];
            }

            //invFromStationCode
            if (typeof xmlCfg.invoice_doc_route.invfromstationcode === 'undefined') { this.invFromStationCode = null; }
            else { this.invFromStationCode = xmlCfg.invoice_doc_route.invfromstationcode.$.value; }

            //invToStationCode
            if (typeof xmlCfg.invoice_doc_route.invtostationcode === 'undefined') { this.invToStationCode = null; }
            else { this.invToStationCode = xmlCfg.invoice_doc_route.invtostationcode.$.value; }

            //car
            this.carNumber = new Array();
            this.contNumber = new Array();
            this.idSmCar = new Array();
            this.idSmCont = new Array();
            this.car = new Array();
            this.cont = new Array();
            //Если вагонов нет, то смотрим есть ли контейнеры. Если есть, то создаем виртуальные вагон к контейнеру
            if (typeof xmlCfg.invoice_doc_route.invcar === 'undefined') {
                //console.log("Нет вагонов");
                this.car = [];
                //Если контейнеров тоже нет, то нам облегчили жизнь. Завершаем ковырятся в вагонах и контейнерах
                if (typeof xmlCfg.invoice_doc_route.invcont === 'undefined') {
                    //console.log("Нет контейнеров");
                    this.cont = [];
                }
                //Если контенеры есть, то создаем к каждому контейнеру виртуальный вагон
                else {
                    //console.log("Есть контейнеры");

                    if (Array.isArray(xmlCfg.invoice_doc_route.invcont)) {
                        ////console.log("Массив контейнеров");
                        for (let j = 0; j < xmlCfg.invoice_doc_route.invcont.length; j++) {
                            this.contArray = new Array();
                            if (typeof xmlCfg.invoice_doc_route.invcont[j].contnumber === 'undefined') {
                                ////console.log("не найден номер контейнера");
                                this.cont[j] = [];
                            }
                            else {
                                ////console.log("Номер контейнера найден");
                                this.contNumber[j] = xmlCfg.invoice_doc_route.invcont[j].contnumber.$.value;
                                //this.idSmCont[j] = getuuid();
                                this.cont[j] = {
                                    contNumber: this.contNumber[j],
                                    idSmCont: this.idSmCont[j]
                                };
                                this.contArray.push(this.cont[j]);          //Заполняем массив контейнеров
                                this.car[j] = {
                                    carNumber: null,
                                    idSmCar: null,
                                    conts: this.contArray
                                };
                            }
                        }
                    }
                    //один контейнер
                    else {
                        this.contArray = new Array();
                        //console.log("Один контейнер");
                        let j = 0;
                        let i = 0;

                        if (typeof xmlCfg.invoice_doc_route.invcont.contnumber === 'undefined') {
                            ////console.log("Не найден номер контейнера");
                            this.cont = [];
                        }
                        else {
                            ////console.log("Номер контейнера найден");
                            this.contNumber[j] = xmlCfg.invoice_doc_route.invcont.contnumber.$.value;
                            //this.idSmCont[j] = getuuid();
                            this.cont[j] = {
                                contNumber: this.contNumber[j],
                                idSmCont: this.idSmCont[j]
                            };
                            this.contArray.push(this.cont[j]);          //Заполняем массив контейнеров
                            this.car[j] = {
                                carNumber: null,
                                idSmCar: null,
                                conts: this.contArray
                            };
                        }
                    }

                }
            }
            //Если вагоны есть, то начинаем формировать массив вагонов
            else {
                //console.log("Есть вагоны");
                if (Array.isArray(xmlCfg.invoice_doc_route.invcar)) {
                    //console.log("массив вагонов");
                    for (let i = 0; i < xmlCfg.invoice_doc_route.invcar.length; i++) {
                        if (typeof xmlCfg.invoice_doc_route.invcar[i].carnumber === 'undefined') {
                            this.carNumber[i] = null;
                            this.idSmCar[i] = null;
                            this.car = [];
                        }
                        else {
                            this.carNumber[i] = xmlCfg.invoice_doc_route.invcar[i].carnumber.$.value;
                            //this.idSmCar[i] = getuuid();
                            this.car[i] = {
                                carNumber: this.carNumber[i],
                                idSmCar: this.idSmCar[i],
                                conts: []
                            };
                            //Если контейнеров нет, то оставляем массив контейнеров пустым
                            if (typeof xmlCfg.invoice_doc_route.invcont === 'undefined') {
                                ////console.log("Нет контейнеров");
                                this.cont = [];
                            }
                            //Если контейнеры есть, то смотрим к какому вагону относятся и дописываем в соответствующий массив
                            else {
                                //console.log("Есть контейнеры");
                                //массив контейнеров

                                if (Array.isArray(xmlCfg.invoice_doc_route.invcont)) {
                                    //console.log("Массив контейнеров");
                                    this.contArray = new Array();
                                    for (let j = 0; j < xmlCfg.invoice_doc_route.invcont.length; j++) {
                                        if (typeof xmlCfg.invoice_doc_route.invcont[j].contnumber === 'undefined') {
                                            //console.log("не найден номер контейнера");
                                            this.car[i] = {
                                                carNumber: this.carNumber[i],
                                                idSmCar: this.idSmCar[i],
                                                conts: []
                                            };
                                        }
                                        else {
                                            //console.log("here_0");
                                            if (xmlCfg.invoice_doc_route.invcont[j].contcarorder.$.value == xmlCfg.invoice_doc_route.invcar[i].carorder.$.value) {
                                                //console.log("Номер вагона в конейнере равен номеру вагона [массив]");
                                                this.contNumber[j] = xmlCfg.invoice_doc_route.invcont[j].contnumber.$.value;
                                                //this.idSmCont[j] = getuuid();
                                                this.cont[j] = {
                                                    contNumber: this.contNumber[j],
                                                    idSmCont: this.idSmCont[j]
                                                };

                                                this.contArray.push(this.cont[j]);          //Заполняем массив контейнеров
                                                this.car[i] = {
                                                    carNumber: this.carNumber[i],
                                                    idSmCar: this.idSmCar[i],
                                                    conts: this.contArray
                                                };
                                            }
                                        }
                                    }
                                }
                                //один контейнер
                                else {
                                    //console.log("Один контейнер");
                                    let j = 0;
                                    this.contArray = new Array();

                                    if (typeof xmlCfg.invoice_doc_route.invcont.contnumber === 'undefined') {
                                        //console.log("Не найден номер контейнера");
                                        this.car[i] = {
                                            carNumber: this.carNumber[i],
                                            idSmCar: this.idSmCar[i],
                                            conts: []
                                        };
                                    }
                                    else {
                                        //console.log("Номер конейнера найден");
                                        //console.log("Номера вагона в контейнере: " + xmlCfg.invoice_doc_route.invcont.carnumber.$.value);
                                        //console.log("Номера вагона для контейнера: " + xmlCfg.invoice_doc_route.invcar[i].carnumber.$.value);
                                        if (xmlCfg.invoice_doc_route.invcont.contcarorder.$.value == xmlCfg.invoice_doc_route.invcar[i].carorder.$.value) {
                                            ////console.log("Номер вагона в конейнере равен номеру вагона");
                                            this.contNumber[j] = xmlCfg.invoice_doc_route.invcont.contnumber.$.value;
                                            //this.idSmCont[j] = getuuid();
                                            this.cont[j] = {
                                                contNumber: this.contNumber[j],
                                                idSmCont: this.idSmCont[j]
                                            };

                                            this.contArray.push(this.cont[j]);          //Заполняем массив контейнеров
                                            this.car[i] = {
                                                carNumber: this.carNumber[i],
                                                idSmCar: this.idSmCar[i],
                                                conts: this.contArray
                                            };
                                        }
                                    }
                                }
                            }
                        }
                        //console.log("this.carNumber[" + i + "] = " + this.carNumber[i]);
                        //console.log("this.idSmCar[" + i + "] = " + this.idSmCar[i]);
                    }
                }
                else {
                    //console.log("один вагон");
                    //один Вагон
                    let i = 0;

                    if (typeof xmlCfg.invoice_doc_route.invcar.carnumber === 'undefined') {
                        this.carNumber[i] = null;
                        this.idSmCar[i] = null;
                        this.car = [];
                    }
                    else {
                        this.carNumber[i] = xmlCfg.invoice_doc_route.invcar.carnumber.$.value;
                        //this.idSmCar[i] = getuuid();
                        this.car[i] = {
                            carNumber: this.carNumber[i],
                            idSmCar: this.idSmCar[i],
                            conts: this.cont
                        };

                        if (typeof xmlCfg.invoice_doc_route.invcont === 'undefined') {
                            //console.log("Нет контейнеров");
                            this.cont = [];
                        }
                        else {
                            if (Array.isArray(xmlCfg.invoice_doc_route.invcont)) {
                                //console.log("Массив контейнеров");
                                this.contArray = new Array();
                                for (let j = 0; j < xmlCfg.invoice_doc_route.invcont.length; j++) {
                                    if (typeof xmlCfg.invoice_doc_route.invcont[j].contnumber === 'undefined') {
                                        //console.log("не найден номер контейнера");
                                        this.car[i] = {
                                            carNumber: this.carNumber[i],
                                            idSmCar: this.idSmCar[i],
                                            conts: []
                                        };
                                    }
                                    else {
                                        // убрано 01.10.21 (для "Доработка накладной "привязка контейнер на вагон")
                                        //if (xmlCfg.invoice_doc_route.invcont[j].contcarorder.$.value == xmlCfg.invoice_doc_route.invcar.carorder.$.value) {
                                        //console.log("Номер вагона в конейнере равен номеру вагона [массив]");
                                        this.contNumber[j] = xmlCfg.invoice_doc_route.invcont[j].contnumber.$.value;
                                        //this.idSmCont[j] = getuuid();
                                        this.cont[j] = {
                                            contNumber: this.contNumber[j],
                                            idSmCont: this.idSmCont[j]
                                        };

                                        this.contArray.push(this.cont[j]);          //Заполняем массив контейнеров
                                        this.car[i] = {
                                            carNumber: this.carNumber[i],
                                            idSmCar: this.idSmCar[i],
                                            conts: this.contArray
                                        };
                                        //}
                                    }
                                }
                            }
                            else {
                                //console.log("Один контейнер");
                                let j = 0;
                                this.contArray = new Array();

                                if (typeof xmlCfg.invoice_doc_route.invcont.contnumber === 'undefined') {
                                    //console.log("Не найден номер контейнера");
                                    this.car[i] = {
                                        carNumber: this.carNumber[i],
                                        idSmCar: this.idSmCar[i],
                                        conts: []
                                    };
                                }
                                else {
                                    //console.log("Номер конейнера найден");
                                    //console.log("Номера вагона в контейнере: " + xmlCfg.invoice_doc_route.invcont.carnumber.$.value);
                                    //console.log("Номера вагона для контейнера: " + xmlCfg.invoice_doc_route.invcar.carnumber.$.value);
                                    // убрано 01.10.21 (для "Доработка накладной "привязка контейнер на вагон")
                                    //if (xmlCfg.invoice_doc_route.invcont.contcarorder.$.value == xmlCfg.invoice_doc_route.invcar.carorder.$.value) {
                                    //console.log("Номер вагона в конейнере равен номеру вагона");
                                    this.contNumber[j] = xmlCfg.invoice_doc_route.invcont.contnumber.$.value;
                                    //this.idSmCont[j] = getuuid();
                                    this.cont[j] = {
                                        contNumber: this.contNumber[j],
                                        idSmCont: this.idSmCont[j]
                                    };

                                    this.contArray.push(this.cont[j]);          //Заполняем массив контейнеров
                                    this.car[i] = {
                                        carNumber: this.carNumber[i],
                                        idSmCar: this.idSmCar[i],
                                        conts: this.contArray
                                    };
                                    //}
                                }
                            }
                        }
                    }
                    //console.log("this.carNumber(Не массив)[" + i + "] = " + this.carNumber[i]);
                    //console.log("this.idSmCar(Не массив)[" + i + "] = " + this.idSmCar[i]);
                }
            }

            //invDue
            this.invDue = new Array();
            this.dueTypeId = new Array();
            this.dueContNumber = new Array();
            this.dueCarNumber = new Array();
            this.dueAmount = new Array();
            this.dueIdSmCar = new Array();
            this.dueIdSmCont = new Array();
            if (typeof xmlCfg.invoice_doc_route.invdue === 'undefined') { this.invDue = []; }
            else {
                if (Array.isArray(xmlCfg.invoice_doc_route.invdue)) {
                    for (let i = 0; i < xmlCfg.invoice_doc_route.invdue.length; i++) {
                        if (typeof xmlCfg.invoice_doc_route.invdue[i].duetypeid === 'undefined') { this.dueTypeId[i] = null; }
                        else { this.dueTypeId[i] = xmlCfg.invoice_doc_route.invdue[i].duetypeid.$.value; }
                        if (typeof xmlCfg.invoice_doc_route.invdue[i].dueamount === 'undefined') { this.dueAmount[i] = null; }
                        else { this.dueAmount[i] = xmlCfg.invoice_doc_route.invdue[i].dueamount.$.value; }
                        if (typeof xmlCfg.invoice_doc_route.invdue[i].contnumber === 'undefined') { this.dueContNumber[i] = null; }
                        else { this.dueContNumber[i] = xmlCfg.invoice_doc_route.invdue[i].contnumber.$.value; }
                        if (typeof xmlCfg.invoice_doc_route.invdue[i].carnumber === 'undefined') { this.dueCarNumber[i] = null; }
                        else { this.dueCarNumber[i] = xmlCfg.invoice_doc_route.invdue[i].carnumber.$.value; }
                        this.dueIdSmCar[i] = null;
                        this.dueIdSmCont[i] = null;

                        this.invDue[i] = { dueTypeId: this.dueTypeId[i], dueContNumber: this.dueContNumber[i], dueIdSmCont: this.dueIdSmCont[i], dueCarNumber: this.dueCarNumber[i], dueIdSmCar: this.dueIdSmCar[i], dueAmount: this.dueAmount[i], invDueSign: 1 };
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.invoice_doc_route.invdue.duetypeid === 'undefined') { this.dueTypeId[i] = null; }
                    else { this.dueTypeId[i] = xmlCfg.invoice_doc_route.invdue.duetypeid.$.value; }
                    if (typeof xmlCfg.invoice_doc_route.invdue.dueamount === 'undefined') { this.dueAmount[i] = null; }
                    else { this.dueAmount[i] = xmlCfg.invoice_doc_route.invdue.dueamount.$.value; }
                    if (typeof xmlCfg.invoice_doc_route.invdue.contnumber === 'undefined') { this.dueContNumber[i] = null; }
                    else { this.dueContNumber[i] = xmlCfg.invoice_doc_route.invdue.contnumber.$.value; }
                    if (typeof xmlCfg.invoice_doc_route.invdue.carnumber === 'undefined') { this.dueCarNumber[i] = null; }
                    else { this.dueCarNumber[i] = xmlCfg.invoice_doc_route.invdue.carnumber.$.value; }
                    this.dueIdSmCar[i] = null;
                    this.dueIdSmCont[i] = null;

                    this.invDue[i] = { dueTypeId: this.dueTypeId[i], dueContNumber: this.dueContNumber[i], dueIdSmCont: this.dueIdSmCont[i], dueCarNumber: this.dueCarNumber[i], dueIdSmCar: this.dueIdSmCar[i], dueAmount: this.dueAmount[i], invDueSign: 1 };
                }
            }
            //console.log(this.invDue)

            //invDueArrive
            this.invDueArrive = new Array();
            this.dueTypeId = new Array();
            this.dueContNumber = new Array();
            this.dueCarNumber = new Array();
            this.dueAmount = new Array();
            this.dueIdSmCar = new Array();
            this.dueIdSmCont = new Array();
            if (typeof xmlCfg.invoice_doc_route.invduearrive === 'undefined') { this.invDueArrive = []; }
            else {
                if (Array.isArray(xmlCfg.invoice_doc_route.invduearrive)) {
                    for (let i = 0; i < xmlCfg.invoice_doc_route.invduearrive.length; i++) {
                        if (typeof xmlCfg.invoice_doc_route.invduearrive[i].duetypeid === 'undefined') { this.dueTypeId[i] = null; }
                        else { this.dueTypeId[i] = xmlCfg.invoice_doc_route.invduearrive[i].duetypeid.$.value; }
                        if (typeof xmlCfg.invoice_doc_route.invduearrive[i].dueamount === 'undefined') { this.dueAmount[i] = null; }
                        else { this.dueAmount[i] = xmlCfg.invoice_doc_route.invduearrive[i].dueamount.$.value; }
                        if (typeof xmlCfg.invoice_doc_route.invduearrive[i].contnumber === 'undefined') { this.dueContNumber[i] = null; }
                        else { this.dueContNumber[i] = xmlCfg.invoice_doc_route.invduearrive[i].contnumber.$.value; }
                        if (typeof xmlCfg.invoice_doc_route.invduearrive[i].carnumber === 'undefined') { this.dueCarNumber[i] = null; }
                        else { this.dueCarNumber[i] = xmlCfg.invoice_doc_route.invduearrive[i].carnumber.$.value; }
                        this.dueIdSmCar[i] = null;
                        this.dueIdSmCont[i] = null;

                        this.invDueArrive[i] = { dueTypeId: this.dueTypeId[i], dueContNumber: this.dueContNumber[i], dueIdSmCont: this.dueIdSmCont[i], dueCarNumber: this.dueCarNumber[i], dueIdSmCar: this.dueIdSmCar[i], dueAmount: this.dueAmount[i], invDueSign: 2 };
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.invoice_doc_route.invduearrive.duetypeid === 'undefined') { this.dueTypeId[i] = null; }
                    else { this.dueTypeId[i] = xmlCfg.invoice_doc_route.invduearrive.duetypeid.$.value; }
                    if (typeof xmlCfg.invoice_doc_route.invduearrive.dueamount === 'undefined') { this.dueAmount[i] = null; }
                    else { this.dueAmount[i] = xmlCfg.invoice_doc_route.invduearrive.dueamount.$.value; }
                    if (typeof xmlCfg.invoice_doc_route.invduearrive.contnumber === 'undefined') { this.dueContNumber[i] = null; }
                    else { this.dueContNumber[i] = xmlCfg.invoice_doc_route.invduearrive.contnumber.$.value; }
                    if (typeof xmlCfg.invoice_doc_route.invduearrive.carnumber === 'undefined') { this.dueCarNumber[i] = null; }
                    else { this.dueCarNumber[i] = xmlCfg.invoice_doc_route.invduearrive.carnumber.$.value; }
                    this.dueIdSmCar[i] = null;
                    this.dueIdSmCont[i] = null;

                    this.invDueArrive[i] = { dueTypeId: this.dueTypeId[i], dueContNumber: this.dueContNumber[i], dueIdSmCont: this.dueIdSmCont[i], dueCarNumber: this.dueCarNumber[i], dueIdSmCar: this.dueIdSmCar[i], dueAmount: this.dueAmount[i], invDueSign: 2 };
                }
            }

            //invDueEnter
            this.invDueEnter = new Array();
            this.dueTypeId = new Array();
            this.dueContNumber = new Array();
            this.dueCarNumber = new Array();
            this.dueAmount = new Array();
            this.dueIdSmCar = new Array();
            this.dueIdSmCont = new Array();
            if (typeof xmlCfg.invoice_doc_route.invdueenter === 'undefined') { this.invDueEnter = []; }
            else {
                if (Array.isArray(xmlCfg.invoice_doc_route.invdueenter)) {
                    for (let i = 0; i < xmlCfg.invoice_doc_route.invdueenter.length; i++) {
                        if (typeof xmlCfg.invoice_doc_route.invdueenter[i].duetypeid === 'undefined') { this.dueTypeId[i] = null; }
                        else { this.dueTypeId[i] = xmlCfg.invoice_doc_route.invdueenter[i].duetypeid.$.value; }
                        if (typeof xmlCfg.invoice_doc_route.invdueenter[i].dueamount === 'undefined') { this.dueAmount[i] = null; }
                        else { this.dueAmount[i] = xmlCfg.invoice_doc_route.invdueenter[i].dueamount.$.value; }
                        if (typeof xmlCfg.invoice_doc_route.invdueenter[i].contnumber === 'undefined') { this.dueContNumber[i] = null; }
                        else { this.dueContNumber[i] = xmlCfg.invoice_doc_route.invdueenter[i].contnumber.$.value; }
                        if (typeof xmlCfg.invoice_doc_route.invdueenter[i].carnumber === 'undefined') { this.dueCarNumber[i] = null; }
                        else { this.dueCarNumber[i] = xmlCfg.invoice_doc_route.invdueenter[i].carnumber.$.value; }
                        this.dueIdSmCar[i] = null;
                        this.dueIdSmCont[i] = null;

                        this.invDueEnter[i] = { dueTypeId: this.dueTypeId[i], dueContNumber: this.dueContNumber[i], dueIdSmCont: this.dueIdSmCont[i], dueCarNumber: this.dueCarNumber[i], dueIdSmCar: this.dueIdSmCar[i], dueAmount: this.dueAmount[i], invDueSign: 3 };
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.invoice_doc_route.invdueenter.duetypeid === 'undefined') { this.dueTypeId[i] = null; }
                    else { this.dueTypeId[i] = xmlCfg.invoice_doc_route.invdueenter.duetypeid.$.value; }
                    if (typeof xmlCfg.invoice_doc_route.invdueenter.dueamount === 'undefined') { this.dueAmount[i] = null; }
                    else { this.dueAmount[i] = xmlCfg.invoice_doc_route.invdueenter.dueamount.$.value; }
                    if (typeof xmlCfg.invoice_doc_route.invdueenter.contnumber === 'undefined') { this.dueContNumber[i] = null; }
                    else { this.dueContNumber[i] = xmlCfg.invoice_doc_route.invdueenter.contnumber.$.value; }
                    if (typeof xmlCfg.invoice_doc_route.invdueenter.carnumber === 'undefined') { this.dueCarNumber[i] = null; }
                    else { this.dueCarNumber[i] = xmlCfg.invoice_doc_route.invdueenter.carnumber.$.value; }
                    this.dueIdSmCar[i] = null;
                    this.dueIdSmCont[i] = null;

                    this.invDueEnter[i] = { dueTypeId: this.dueTypeId[i], dueContNumber: this.dueContNumber[i], dueIdSmCont: this.dueIdSmCont[i], dueCarNumber: this.dueCarNumber[i], dueIdSmCar: this.dueIdSmCar[i], dueAmount: this.dueAmount[i], invDueSign: 3 };
                }
            }


        } catch (e) {
            logger.error(`baseInvoice: ошибка парсинга базовых показателей invoice`);
            logger.error(e);
        }
    }
}

module.exports.BaseInvoice = BaseInvoice;