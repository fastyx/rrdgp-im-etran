const checksum = require('json-checksum'); 
const logger = require('../../config/logger');

class BaseInvoice {

    constructor(message, statusInvoice) {

        try {

            //Входной документ
            this.inputDocument = message;                //rawBody - исходный XML документ

            //Контрольная сумма
            this.checkSum = checksum(JSON.stringify(message));         //контрольная сумма по исходному документу
            
            //idSm
            if (typeof message.requestinvoice.idsm === 'undefined') { this.idSm = null; }
            else { this.idSm = message.requestinvoice.idsm; }
            //console.log("this.idSm = " + this.idSm);

            //statusInvoice
            this.statusInvoice = statusInvoice;

            //docTypeId
            this.docTypeId = 27;

            //dueHandleOp
            this.dueTransaction = "handleDue";

            //invPayerId
            if (typeof message.requestinvoice.invoice.invpayerid === 'undefined') { this.invPayerId = null; }
            else { this.invPayerId = message.requestinvoice.invoice.invpayerid.$.value; }
            //////console.log("this.invPayerId = " + this.invPayerId);

            //invRecipId
            if (typeof message.requestinvoice.invoice.invrecipid === 'undefined') { this.invRecipId = null; }
            else { this.invRecipId = message.requestinvoice.invoice.invrecipid.$.value; }
            //////console.log("this.invRecipId = " + this.invRecipId);

            //invSenderId
            if (typeof message.requestinvoice.invoice.invsenderid === 'undefined') { this.invSenderId = null; }
            else { this.invSenderId = message.requestinvoice.invoice.invsenderid.$.value; }
            //////console.log("this.invSenderId = " + this.invSenderId);

            //invoiceID
            if (typeof message.requestinvoice.invoice.invoiceid === 'undefined') { this.invoiceId = null; }
            else { this.invoiceId = message.requestinvoice.invoice.invoiceid.$.value; }
            //////console.log("this.invoiceId = " + this.invoiceId);

            //invUNP
            if (typeof message.requestinvoice.invoice.invunp === 'undefined') { this.invUnp = null; }
            else { this.invUnp = message.requestinvoice.invoice.invunp.$.value; }
            //////console.log("this.invUnp = " + this.invUnp);

            //invNumber
            if (typeof message.requestinvoice.invoice.invnumber === 'undefined') { this.invNumber = null; }
            else { this.invNumber = message.requestinvoice.invoice.invnumber.$.value; }
            //////console.log("this.invNumber = " + this.invNumber);

            //invSendKindName
            if (typeof message.requestinvoice.invoice.invsendkindname === 'undefined') { this.invSendKindName = null; }
            else { this.invSendKindName = message.requestinvoice.invoice.invsendkindname.$.value; }
            //////console.log("this.invSendKindName = " + this.invSendKindName);

            //invPlanCarTypeName
            if (typeof message.requestinvoice.invoice.invplancartypename === 'undefined') { this.invPlanCarTypeName = null; }
            else { this.invPlanCarTypeName = message.requestinvoice.invoice.invplancartypename.$.value; }
            //////console.log("this.invPlanCarTypeName = " + this.invPlanCarTypeName);

            //invoiceStateID
            if (typeof message.requestinvoice.invoice.invoicestateid === 'undefined') { this.invoiceStateID = null; }
            else { this.invoiceStateID = message.requestinvoice.invoice.invoicestateid.$.value; }
            //////console.log("this.invoiceStateID = " + this.invoiceStateID);

            //invoiceState
            if (typeof message.requestinvoice.invoice.invoicestate === 'undefined') { this.invoiceState = ''; }
            else { this.invoiceState = message.requestinvoice.invoice.invoicestate.$.value; }
            //////console.log("this.invoiceState = " + this.invoiceState);

            //invFreightWeight
            this.invFreightWeight = new Array();
            this.invFreightWeightSum = 0;
            if (typeof message.requestinvoice.invoice.invfreight === 'undefined') { this.invFreightWeightSum = 0; }
            else {
                if (Array.isArray(message.requestinvoice.invoice.invfreight)) {
                    for (let i = 0; i < message.requestinvoice.invoice.invfreight.length; i++) {
                        if (typeof message.requestinvoice.invoice.invfreight[i].freightweight !== 'undefined') {
                            this.invFreightWeightSum = Number(this.invFreightWeightSum) + Number(message.requestinvoice.invoice.invfreight[i].freightweight.$.value);
                        }
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestinvoice.invoice.invfreight.freightweight !== 'undefined') {
                        this.invFreightWeightSum = Number(this.invFreightWeightSum) + Number(message.requestinvoice.invoice.invfreight.freightweight.$.value);
                    }
                }
            }

            //trainIndex
            if (typeof message.requestinvoice.invoice.trainindex === 'undefined') { this.trainIndex = null; }
            else { this.trainIndex = message.requestinvoice.invoice.trainindex.$.value; }
            //////console.log("this.trainIndex = " + this.trainIndex);

            //trainNumber
            if (typeof message.requestinvoice.invoice.trainnumber === 'undefined') { this.trainNumber = null; }
            else { this.trainNumber = message.requestinvoice.invoice.trainnumber.$.value; }
            //////console.log("this.trainNumber = " + this.trainNumber);

            //operDate
            if (typeof message.requestinvoice.invoice.operdate === 'undefined') { this.operDate = null; }
            else {
                this.operDate = message.requestinvoice.invoice.operdate.$.value;
                this.a = this.operDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.operDate = this.a[0] + " " + this.a[1];
            }
            //////console.log("this.operDate = " + this.operDate);

            //invDateDelivery
            if (typeof message.requestinvoice.invoice.invdatedelivery === 'undefined') { this.invDateDelivery = null; }
            else {
                this.invDateDelivery = message.requestinvoice.invoice.invdatedelivery.$.value;
                this.a = this.invDateDelivery.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.invDateDelivery = this.a[0] + " " + this.a[1];
            }

            //invLastOperDate
            if (typeof message.requestinvoice.invoice.invlastoper === 'undefined') { this.invLastOperDate = null; }
            else {
                this.invLastOperDate = message.requestinvoice.invoice.invlastoper.$.value;
                this.a = this.invLastOperDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.invLastOperDate = this.a[0] + " " + this.a[1];
            }

            //invFromStationCode
            if (typeof message.requestinvoice.invoice.invfromstationcode === 'undefined') { this.invFromStationCode = null; }
            else { this.invFromStationCode = message.requestinvoice.invoice.invfromstationcode.$.value; }

            //invToStationCode
            if (typeof message.requestinvoice.invoice.invtostationcode === 'undefined') { this.invToStationCode = null; }
            else { this.invToStationCode = message.requestinvoice.invoice.invtostationcode.$.value; }

            //car
            //console.log("here_1");
            this.carNumber = new Array();
            this.contNumber = new Array();
            this.idSmCar = new Array();
            this.idSmCont = new Array();
            this.car = new Array();
            this.cont = new Array();
        
            //Если вагонов нет, то смотрим есть ли контейнеры. Если есть, то создаем виртуальные вагон к контейнеру
            if (typeof message.requestinvoice.invoice.invcar === 'undefined') {
                //console.log("here_2");
                //console.log("Нет вагонов");
                this.car = [];
                //Если контейнеров тоже нет, то нам облегчили жизнь. Завершаем ковырятся в вагонах и контейнерах
                if (typeof message.requestinvoice.invoice.invcont === 'undefined') {
                    //console.log("Нет контейнеров");
                    this.cont = [];
                }
                //Если контенеры есть, то создаем к каждому контейнеру виртуальный вагон
                else {
                    //console.log("Есть контейнеры");

                    if (Array.isArray(message.requestinvoice.invoice.invcont)) {
                        ////console.log("Массив контейнеров");
                        for (let j = 0; j < message.requestinvoice.invoice.invcont.length; j++) {
                            this.contArray = new Array();
                            if (typeof message.requestinvoice.invoice.invcont[j].contnumber === 'undefined') {
                                ////console.log("не найден номер контейнера");
                                this.cont[j] = [];
                            }
                            else {
                                ////console.log("Номер контейнера найден");
                                this.contNumber[j] = message.requestinvoice.invoice.invcont[j].contnumber.$.value;
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

                        if (typeof message.requestinvoice.invoice.invcont.contnumber === 'undefined') {
                            ////console.log("Не найден номер контейнера");
                            this.cont = [];
                        }
                        else {
                            ////console.log("Номер контейнера найден");
                            this.contNumber[j] = message.requestinvoice.invoice.invcont.contnumber.$.value;
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
                //console.log("here_3");
                // console.log(message.requestinvoice.invoice)
                //console.log("Есть вагоны");
                if (Array.isArray(message.requestinvoice.invoice.invcar)) {
                    //console.log("here_4");
                    for (let i = 0; i < message.requestinvoice.invoice.invcar.length; i++) {
                        if (typeof message.requestinvoice.invoice.invcar[i].carnumber === 'undefined') {
                            this.carNumber[i] = null;
                            this.idSmCar[i] = null;
                            this.car = [];
                        }
                        else {
                            this.carNumber[i] = message.requestinvoice.invoice.invcar[i].carnumber.$.value;
                            //this.idSmCar[i] = getuuid();
                            this.car[i] = {
                                carNumber: this.carNumber[i],
                                idSmCar: this.idSmCar[i],
                                conts: []
                            };
                            //Если контейнеров нет, то оставляем массив контейнеров пустым
                            if (typeof message.requestinvoice.invoice.invcont === 'undefined') {
                                ////console.log("Нет контейнеров");
                                this.cont = [];
                            }
                            //Если контейнеры есть, то смотрим к какому вагону относятся и дописываем в соответствующий массив
                            else {
                                //console.log("Есть контейнеры");
                                //массив контейнеров

                                if (Array.isArray(message.requestinvoice.invoice.invcont)) {
                                    //console.log("Массив контейнеров");
                                    this.contArray = new Array();
                                    for (let j = 0; j < message.requestinvoice.invoice.invcont.length; j++) {
                                        if (typeof message.requestinvoice.invoice.invcont[j].contnumber === 'undefined') {
                                            //console.log("не найден номер контейнера");
                                            this.car[i] = {
                                                carNumber: this.carNumber[i],
                                                idSmCar: this.idSmCar[i],
                                                conts: []
                                            };
                                        }
                                        else {
                                            //console.log("here_0");
                                            if (message.requestinvoice.invoice.invcont[j].contcarorder.$.value == message.requestinvoice.invoice.invcar[i].carorder.$.value) {
                                                //console.log("Номер вагона в конейнере равен номеру вагона [массив]");
                                                this.contNumber[j] = message.requestinvoice.invoice.invcont[j].contnumber.$.value;
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

                                    if (typeof message.requestinvoice.invoice.invcont.contnumber === 'undefined') {
                                        //console.log("Не найден номер контейнера");
                                        this.car[i] = {
                                            carNumber: this.carNumber[i],
                                            idSmCar: this.idSmCar[i],
                                            conts: []
                                        };
                                    }
                                    else {
                                        //console.log("Номер конейнера найден");
                                        //console.log("Номера вагона в контейнере: " + message.requestinvoice.invoice.invcont.carnumber.$.value);
                                        //console.log("Номера вагона для контейнера: " + message.requestinvoice.invoice.invcar[i].carnumber.$.value);
                                        if (message.requestinvoice.invoice.invcont.contcarorder.$.value == message.requestinvoice.invoice.invcar[i].carorder.$.value) {
                                            ////console.log("Номер вагона в конейнере равен номеру вагона");
                                            this.contNumber[j] = message.requestinvoice.invoice.invcont.contnumber.$.value;
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
                    //console.log("here_5");
                    //console.log("один вагон");
                    //один Вагон
                    let i = 0;

                    if (typeof message.requestinvoice.invoice.invcar.carnumber === 'undefined') {
                        this.carNumber[i] = null;
                        this.idSmCar[i] = null;
                        this.car = [];
                    }
                    else {
                        this.carNumber[i] = message.requestinvoice.invoice.invcar.carnumber.$.value;
                        //this.idSmCar[i] = getuuid();
                        this.car[i] = {
                            carNumber: this.carNumber[i],
                            idSmCar: this.idSmCar[i],
                            conts: this.cont
                        };

                        if (typeof message.requestinvoice.invoice.invcont === 'undefined') {
                            //console.log("Нет контейнеров");
                            this.cont = [];
                        }
                        else {
                            if (Array.isArray(message.requestinvoice.invoice.invcont)) {
                                //console.log("Массив контейнеров");
                                this.contArray = new Array();
                                for (let j = 0; j < message.requestinvoice.invoice.invcont.length; j++) {
                                    if (typeof message.requestinvoice.invoice.invcont[j].contnumber === 'undefined') {
                                        //console.log("не найден номер контейнера");
                                        this.car[i] = {
                                            carNumber: this.carNumber[i],
                                            idSmCar: this.idSmCar[i],
                                            conts: []
                                        };
                                    }
                                    else {
                                        // убрано 01.10.21 (для "Доработка накладной "привязка контейнер на вагон")
                                        //if (message.requestinvoice.invoice.invcont[j].contcarorder.$.value == message.requestinvoice.invoice.invcar.carorder.$.value) {
                                        //console.log("Номер вагона в конейнере равен номеру вагона [массив]");
                                        this.contNumber[j] = message.requestinvoice.invoice.invcont[j].contnumber.$.value;
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

                                if (typeof message.requestinvoice.invoice.invcont.contnumber === 'undefined') {
                                    //console.log("Не найден номер контейнера");
                                    this.car[i] = {
                                        carNumber: this.carNumber[i],
                                        idSmCar: this.idSmCar[i],
                                        conts: []
                                    };
                                }
                                else {
                                    //console.log("Номер конейнера найден");
                                    //console.log("Номера вагона в контейнере: " + message.requestinvoice.invoice.invcont.carnumber.$.value);
                                    //console.log("Номера вагона для контейнера: " + message.requestinvoice.invoice.invcar.carnumber.$.value);
                                    // убрано 01.10.21 (для "Доработка накладной "привязка контейнер на вагон")
                                    //if (message.requestinvoice.invoice.invcont.contcarorder.$.value == message.requestinvoice.invoice.invcar.carorder.$.value) {
                                    //console.log("Номер вагона в конейнере равен номеру вагона");
                                    this.contNumber[j] = message.requestinvoice.invoice.invcont.contnumber.$.value;
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
            if (typeof message.requestinvoice.invoice.invdue === 'undefined') { this.invDue = []; }
            else {
                if (Array.isArray(message.requestinvoice.invoice.invdue)) {
                    for (let i = 0; i < message.requestinvoice.invoice.invdue.length; i++) {
                        if (typeof message.requestinvoice.invoice.invdue[i].duetypeid === 'undefined') { this.dueTypeId[i] = null; }
                        else { this.dueTypeId[i] = message.requestinvoice.invoice.invdue[i].duetypeid.$.value; }
                        if (typeof message.requestinvoice.invoice.invdue[i].dueamount === 'undefined') { this.dueAmount[i] = null; }
                        else { this.dueAmount[i] = message.requestinvoice.invoice.invdue[i].dueamount.$.value; }
                        if (typeof message.requestinvoice.invoice.invdue[i].contnumber === 'undefined') { this.dueContNumber[i] = null; }
                        else { this.dueContNumber[i] = message.requestinvoice.invoice.invdue[i].contnumber.$.value; }
                        if (typeof message.requestinvoice.invoice.invdue[i].carnumber === 'undefined') { this.dueCarNumber[i] = null; }
                        else { this.dueCarNumber[i] = message.requestinvoice.invoice.invdue[i].carnumber.$.value; }
                        this.dueIdSmCar[i] = null;
                        this.dueIdSmCont[i] = null;

                        this.invDue[i] = { dueTypeId: this.dueTypeId[i], dueContNumber: this.dueContNumber[i], dueIdSmCont: this.dueIdSmCont[i], dueCarNumber: this.dueCarNumber[i], dueIdSmCar: this.dueIdSmCar[i], dueAmount: this.dueAmount[i], invDueSign: 1 };
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestinvoice.invoice.invdue.duetypeid === 'undefined') { this.dueTypeId[i] = null; }
                    else { this.dueTypeId[i] = message.requestinvoice.invoice.invdue.duetypeid.$.value; }
                    if (typeof message.requestinvoice.invoice.invdue.dueamount === 'undefined') { this.dueAmount[i] = null; }
                    else { this.dueAmount[i] = message.requestinvoice.invoice.invdue.dueamount.$.value; }
                    if (typeof message.requestinvoice.invoice.invdue.contnumber === 'undefined') { this.dueContNumber[i] = null; }
                    else { this.dueContNumber[i] = message.requestinvoice.invoice.invdue.contnumber.$.value; }
                    if (typeof message.requestinvoice.invoice.invdue.carnumber === 'undefined') { this.dueCarNumber[i] = null; }
                    else { this.dueCarNumber[i] = message.requestinvoice.invoice.invdue.carnumber.$.value; }
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
            if (typeof message.requestinvoice.invoice.invduearrive === 'undefined') { this.invDueArrive = []; }
            else {
                if (Array.isArray(message.requestinvoice.invoice.invduearrive)) {
                    for (let i = 0; i < message.requestinvoice.invoice.invduearrive.length; i++) {
                        if (typeof message.requestinvoice.invoice.invduearrive[i].duetypeid === 'undefined') { this.dueTypeId[i] = null; }
                        else { this.dueTypeId[i] = message.requestinvoice.invoice.invduearrive[i].duetypeid.$.value; }
                        if (typeof message.requestinvoice.invoice.invduearrive[i].dueamount === 'undefined') { this.dueAmount[i] = null; }
                        else { this.dueAmount[i] = message.requestinvoice.invoice.invduearrive[i].dueamount.$.value; }
                        if (typeof message.requestinvoice.invoice.invduearrive[i].contnumber === 'undefined') { this.dueContNumber[i] = null; }
                        else { this.dueContNumber[i] = message.requestinvoice.invoice.invduearrive[i].contnumber.$.value; }
                        if (typeof message.requestinvoice.invoice.invduearrive[i].carnumber === 'undefined') { this.dueCarNumber[i] = null; }
                        else { this.dueCarNumber[i] = message.requestinvoice.invoice.invduearrive[i].carnumber.$.value; }
                        this.dueIdSmCar[i] = null;
                        this.dueIdSmCont[i] = null;

                        this.invDueArrive[i] = { dueTypeId: this.dueTypeId[i], dueContNumber: this.dueContNumber[i], dueIdSmCont: this.dueIdSmCont[i], dueCarNumber: this.dueCarNumber[i], dueIdSmCar: this.dueIdSmCar[i], dueAmount: this.dueAmount[i], invDueSign: 2 };
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestinvoice.invoice.invduearrive.duetypeid === 'undefined') { this.dueTypeId[i] = null; }
                    else { this.dueTypeId[i] = message.requestinvoice.invoice.invduearrive.duetypeid.$.value; }
                    if (typeof message.requestinvoice.invoice.invduearrive.dueamount === 'undefined') { this.dueAmount[i] = null; }
                    else { this.dueAmount[i] = message.requestinvoice.invoice.invduearrive.dueamount.$.value; }
                    if (typeof message.requestinvoice.invoice.invduearrive.contnumber === 'undefined') { this.dueContNumber[i] = null; }
                    else { this.dueContNumber[i] = message.requestinvoice.invoice.invduearrive.contnumber.$.value; }
                    if (typeof message.requestinvoice.invoice.invduearrive.carnumber === 'undefined') { this.dueCarNumber[i] = null; }
                    else { this.dueCarNumber[i] = message.requestinvoice.invoice.invduearrive.carnumber.$.value; }
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
            if (typeof message.requestinvoice.invoice.invdueenter === 'undefined') { this.invDueEnter = []; }
            else {
                if (Array.isArray(message.requestinvoice.invoice.invdueenter)) {
                    for (let i = 0; i < message.requestinvoice.invoice.invdueenter.length; i++) {
                        if (typeof message.requestinvoice.invoice.invdueenter[i].duetypeid === 'undefined') { this.dueTypeId[i] = null; }
                        else { this.dueTypeId[i] = message.requestinvoice.invoice.invdueenter[i].duetypeid.$.value; }
                        if (typeof message.requestinvoice.invoice.invdueenter[i].dueamount === 'undefined') { this.dueAmount[i] = null; }
                        else { this.dueAmount[i] = message.requestinvoice.invoice.invdueenter[i].dueamount.$.value; }
                        if (typeof message.requestinvoice.invoice.invdueenter[i].contnumber === 'undefined') { this.dueContNumber[i] = null; }
                        else { this.dueContNumber[i] = message.requestinvoice.invoice.invdueenter[i].contnumber.$.value; }
                        if (typeof message.requestinvoice.invoice.invdueenter[i].carnumber === 'undefined') { this.dueCarNumber[i] = null; }
                        else { this.dueCarNumber[i] = message.requestinvoice.invoice.invdueenter[i].carnumber.$.value; }
                        this.dueIdSmCar[i] = null;
                        this.dueIdSmCont[i] = null;

                        this.invDueEnter[i] = { dueTypeId: this.dueTypeId[i], dueContNumber: this.dueContNumber[i], dueIdSmCont: this.dueIdSmCont[i], dueCarNumber: this.dueCarNumber[i], dueIdSmCar: this.dueIdSmCar[i], dueAmount: this.dueAmount[i], invDueSign: 3 };
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestinvoice.invoice.invdueenter.duetypeid === 'undefined') { this.dueTypeId[i] = null; }
                    else { this.dueTypeId[i] = message.requestinvoice.invoice.invdueenter.duetypeid.$.value; }
                    if (typeof message.requestinvoice.invoice.invdueenter.dueamount === 'undefined') { this.dueAmount[i] = null; }
                    else { this.dueAmount[i] = message.requestinvoice.invoice.invdueenter.dueamount.$.value; }
                    if (typeof message.requestinvoice.invoice.invdueenter.contnumber === 'undefined') { this.dueContNumber[i] = null; }
                    else { this.dueContNumber[i] = message.requestinvoice.invoice.invdueenter.contnumber.$.value; }
                    if (typeof message.requestinvoice.invoice.invdueenter.carnumber === 'undefined') { this.dueCarNumber[i] = null; }
                    else { this.dueCarNumber[i] = message.requestinvoice.invoice.invdueenter.carnumber.$.value; }
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