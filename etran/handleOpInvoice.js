const bc = require("../app");
const xml = require('xml');                                 //для работы с XML
const fs = require('fs');
const logger = require('../config/logger');
const { v4: getuuid } = require('uuid');

const reg_init = require('../reg_init');

const axiosDefaultConfig = {
    proxy: false
};
const axios = require('axios').create(axiosDefaultConfig);

const insInvoiceOp = require('./crud/sqlInvoiceOp.js');

exports.handleOpInvoice = async function (req, res, client, config, xmlCfg, invoice) {

    let transactions = new Array();

    logger.debug("handleOpGu27 - called");

    var response;

    // Регистрация
    reg_init.regMessage(invoice.idSm, 27, null, invoice.checkSum, 2, 1, invoice.invoiceStateID, invoice.invNumber, invoice.invoiceId);

    // Определяем idSmInvoice если не задан
    logger.debug(`handleOpInvoice: определяем idSmInvoice из ${config.SYSTEM.dbTables.bundleInvoice}`);

    if (invoice.idSmInvoice === null) {
        try {
            var sql = `SELECT id_sm_invoice FROM ${config.SYSTEM.dbTables.bundleInvoice} WHERE id_sm=($1) AND inv_unp=($2)`;
            result = await client.query(sql, [invoice.idSm, invoice.invUnp]);
        } catch (e) {
            reg_info = `handleOpInvoice: ошибка при SELECT ${config.SYSTEM.dbTables.bundleInvoice} по idSm=${invoice.idSm} invUNP=${invoice.invUnp}`;
            reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
        }
        if (result.rowCount !== 0) {
            invoice.idSmInvoice = result.rows[0].id_sm_invoice
        }
        else {
            if (invoice.invoiceStateID === '31') {
                logger.debug(`handleOpInvoice: генерация idSmInvocie по stateId=31, т.к. ранее не было 439 по id_sm=${invoice.idSm} inv_unp=${invoice.invUnp}`);
                invoice.idSmInvoice = getuuid();
            }
            else {
                reg_info = `handleOpInvoice: Ошибка. Не найден idSmInvoice в таблице ${config.SYSTEM.dbTables.bundleInvoice} по id_sm=${invoice.idSm} и inv_unp=${invoice.invUnp}`;
                reg_init.regError(invoice.idSm, 27, invoice.checkSum, 2, 1, invoice.invoiceStateID, reg_info, sql, null, null);
                return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });
            }
        }

    }

    // Определяем id_sm_car. Если нет в таблицах, то генерируем новое значение
    if (invoice.car.length !== 0) {
        logger.debug(`handleOpInvoice: привязываем idSmCar к carNumber по ${config.SYSTEM.dbTables.bundleCar}`);
        var carNumbers = '';
        for (let i = 0; i < invoice.car.length; i++) {
            carNumbers = carNumbers + "'" + invoice.car[i].carNumber + "'";              // подготовка строки
            if (i < invoice.car.length - 1) {
                carNumbers = carNumbers + ',';
            }
        }
        //console.log(carNumbers)
        try {
            var sql = `SELECT car_number, id_sm_car from ${config.SYSTEM.dbTables.bundleCar} where id_sm=($1) and car_number in (${carNumbers}) and id_sm_invoice=($2) `;
            result = await client.query(sql, [invoice.idSm, invoice.idSmInvoice]);
            for (let i = 0; i < invoice.car.length; i++) {
                const carObj = result.rows.find(c => c.car_number === invoice.car[i].carNumber);
                if (carObj) {
                    invoice.car[i].idSmCar = carObj.id_sm_car;
                }
                else {
                    if (invoice.car[i].carNumber === null) { invoice.car[i].idSmCar = null; }
                    else { invoice.car[i].idSmCar = getuuid(); }
                }
            }
        } catch (e) {
            reg_info = `handleOpInvoice: ошибка при SELECT ${config.SYSTEM.dbTables.bundleCar} по idSm=${invoice.idSm} carNumbers=${carNumbers} idSmInvoice=${invoice.idSmInvoice}`;
            reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
        }
    }


    // Определяем id_sm_cont. Если нет в таблицах, то генерируем новое значение
    if (invoice.cont.length !== 0) {
        logger.debug(`handleOpInvoice: привязываем idSmCont к contNumber по ${config.SYSTEM.dbTables.bundleCont}`);
        var contNumbers = '';
        for (let i = 0; i < invoice.cont.length; i++) {
            contNumbers = contNumbers + "'" + invoice.cont[i].contNumber + "'";              // подготовка строки
            if (i < invoice.cont.length - 1) {
                contNumbers = contNumbers + ',';
            }
        }
        try {
            var sql = `SELECT cont_number, id_sm_cont from ${config.SYSTEM.dbTables.bundleCont} where id_sm=($1) and cont_number in (${contNumbers}) and id_sm_invoice=($2) `;
            result = await client.query(sql, [invoice.idSm, invoice.idSmInvoice]);
            for (let i = 0; i < invoice.cont.length; i++) {
                const contObj = result.rows.find(c => c.cont_number === invoice.cont[i].contNumber);
                if (contObj) {
                    invoice.cont[i].idSmCont = contObj.id_sm_cont;
                }
                else {
                    if (invoice.cont[i].contNumber === null) { invoice.cont[i].idSmCont = null; }
                    else { invoice.cont[i].idSmCont = getuuid(); }
                }
            }
        } catch (e) {
            reg_info = `handleOpInvoice: ошибка при SELECT ${config.SYSTEM.dbTables.bundleCont} по idSm=${invoice.idSm} contNumbers=${contNumbers} idSmInvoice=${invoice.idSmInvoice}`;
            reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
        }
    }

    // Запись в Postgres 
    await insInvoiceOp.sqlInvoiceOp(invoice, client, config, response);
    // Регистрация
    reg_init.regMessage(invoice.idSm, 27, null, invoice.checkSum, 3, 1, invoice.invoiceStateID, invoice.invNumber, invoice.invoiceId);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Подготовка информации в БЧ
    //Формируем объект для передачи
    payload = {
        checkSum: invoice.checkSum,
        idSmInvoice: invoice.idSmInvoice,
        invoiceID: invoice.invoiceId,
        invUNP: invoice.invUnp,
        invNumber: invoice.invNumber,
        invDateCreate: invoice.epochInvDateCreate,                                  //handleOp3
        invDateDeparture: invoice.epochInvDateDeparture,                            //handleOp4
        emptyInvPresentingDate: invoice.epochEmptyInvPresentingDate,                //handleOp2004a
        emptyInvRejectDate: invoice.epochEmptyInvRejectDate,                        //handleOp2004r
        invFactDateAccept: invoice.epochInvFactDateAccept,                          //handleOp2005a
        invDateReject: invoice.epochInvDateReject,                                  //handleOp2005r
        invDateNotification: invoice.epochInvDateNotification,                      //handleOp10
        invDateDelivery: invoice.epochInvDateDelivery,                              //handleOp11
        invDateEnd: invoice.epochInvDateEnd,                                        //handleOp2111
        ladenInvoicePresentingDate: invoice.epochLadenInvoicePresentingDate,        //handleOp16
        invFactDateAccept: invoice.epochInvFactDateAccept,                          //handleOp21a
        invDateReject: invoice.epochInvDateReject,                                  //handleOp21r
        invDateDeparture: invoice.epochInvDateDeparture,                            //handleOp24
        invDateExpire: invoice.epochInvDateExpire,                                  //handleOp4 gandleOp24
        invDateNotification: invoice.epochInvDateNotification,                      //handleOp47
        invDateDelivery: invoice.epochInvDateDelivery,                              //handleOp55
        invDateEnd: invoice.epochInvDateEnd,                                        //handleOp2155
        cars: invoice.car
    };
    let jsonObject = { channel: config.SYSTEM.defaultChannel, transaction: invoice.transaction, contractId: invoice.idSm, contractIdInvoice: invoice.idSmInvoice, payload: payload, opts: invoice.opts };
    transactions.push(jsonObject);

    return { status: 0, transactions: transactions };
}
