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

    logger.debug("handleOpGu27 - called");

    var response;

    // Регистрация
    reg_init.regMessage(invoice.idSm, 27, null, invoice.checkSum, 1, 1, invoice.invoiceStateID, invoice.invNumber, invoice.invoiceId);

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

    logger.debug("idSmInvoice: " + invoice.idSmInvoice);              //console.log(jsonObject);

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
    let jsonObject = { transaction: invoice.transaction, contractId: invoice.idSm, contractIdInvoice: invoice.idSmInvoice, payload: payload, opts: invoice.opts };

    logger.info(`handleOpInvoice: Sended to BlockChain: ${JSON.stringify(jsonObject)}`);

    //Вызываем REST-сервис записи в БЧ
    res.set('Content-Type', 'text/xml');
    try {
        response = await axios.post(`http://${config.SYSTEM.restConfig.invoke.host}:${config.SYSTEM.restConfig.invoke.port}/${config.SYSTEM.restConfig.invoke.name}`, jsonObject);
    } catch (e) {
        reg_info = `handleOpInvoice. Ошибка при вызове сервиса: ${JSON.stringify(e)}`;
        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 0, 1, invoice.invoiceStateID, reg_info, null, null, e);
        return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });
    }
    if (response.data.code === 0) {

        // Регистрация
        reg_init.regMessage(invoice.idSm, 27, null, invoice.checkSum, 2, 1, invoice.invoiceStateID, invoice.invNumber, invoice.invoiceId);

        // Запись в Postgres 
        await insInvoiceOp.sqlInvoiceOp(invoice, client, config, response);
    }
    else {
        reg_info = `handleOpInvoice. response.data.code !== 0:${JSON.stringify(response.data)}`;
        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 2, 1, invoice.invoiceStateID, reg_info, null, null, null);
        return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Доработка для дописывания инофрмации по ГУ-2Б и ГУ-45
    // сверяем полученные в накладной вагоны с тем, что есть в unreport_car. Если вагоны совпадают, то вызываем ГУ-2Б или ГУ-45
    logger.debug("handleOpGu27 - вызов блока работы с ГУ-2Б/ГУ-45");
    /*if (invoice.car.length !== 0) {
        for (let i = 0; i < invoice.car.length; i++) {
            try {
                logger.info(`handleOpInvoice: поиск car_number=${invoice.car[i].carNumber} id_sm=${invoice.idSm} cо status=1 в ${config.SYSTEM.dbTables.unreportCar} и ${config.SYSTEM.dbTables.unreportDocument}`);

                var sql = `select t1.id_sm, t2.car_number, t1.check_sum, t1.id_sm_doc, t1.handle_op, t2.status, t1.document_type, t1.doc_id, t1.doc_number, t1.oper_date_epoch, t2.car_in_date_epoch, t2.car_out_date_epoch 
                from ${config.SYSTEM.dbTables.unreportDocument} as t1 
                inner join ${config.SYSTEM.dbTables.unreportCar} as t2 
                on (t1.id_sm_doc = t2.id_sm_doc) 
                where t1.id_sm=($1) and t2.car_number=($2) and t2.status=1 and t1.handle_op is not null`;

                result_unreport = await client.query(sql, [invoice.idSm, invoice.car[i].carNumber]);

                if (result_unreport.rowCount !== 0) {
                    logger.info(`handleOpInvoice: найден вагон carNumber=${invoice.car[i].carNumber}, id_sm=${invoice.idSm} в количестве count=${result_unreport.rowCount}`);

                    let carNew = new Array();
                    carNew.push(invoice.car[i]);

                    //Формируем объект для передачи
                    payload = {
                        checkSum: result_unreport.rows[0].check_sum,
                        idSmDoc: result_unreport.rows[0].id_sm_doc,
                        docTypeId: result_unreport.rows[0].document_type,
                        docId: result_unreport.rows[0].doc_id,
                        docNumber: result_unreport.rows[0].doc_number,
                        emptyCargoEndNotificationDt: result_unreport.rows[0].oper_date_epoch,                        //handleOp17
                        ladenCargoEndNotificationDt: result_unreport.rows[0].oper_date_epoch,                        //handleOp60
                        signTrackDeliveryGu45Dt: result_unreport.rows[0].oper_date_epoch,                            //handleOp14a   handleOp58a
                        emptyTrackDeliveryGu45Dt: result_unreport.rows[0].car_in_date_epoch,                         //handleOP14a                   carInTime
                        rejectTrackDeliveryGu45Dt: result_unreport.rows[0].oper_date_epoch,                          //handleOp14b   handleOp58b
                        signTrackLeaveGu45Dt: result_unreport.rows[0].oper_date_epoch,                               //handleOp26a   handleOp65a
                        ladenTrackLeaveGu45Dt: result_unreport.rows[0].car_in_date_epoch,                            //handleOp26a                   carInTime
                        rejectTrackLeaveGu45Dt: result_unreport.rows[0].oper_date_epoch,                             //handleOp26b   handleOp65b
                        ladenTrackDeliveryGu45Dt: result_unreport.rows[0].car_in_date_epoch,                         //handleOp58a                   carInTime
                        emptyTrackLeaveGu45Dt: result_unreport.rows[0].car_in_date_epoch,                            //handleOp65c   handleOp65a     carInTime
                        cars: carNew
                    };
                    let jsonObject = { transaction: result_unreport.rows[0].handle_op, contractId: invoice.idSm, payload: payload, opts: null };

                    logger.info(`handleOpInvoice: GU-2B|GU-45 Sended to BlockChain: ${JSON.stringify(jsonObject)}`);

                    //Вызываем REST-сервис записи в БЧ
                    try {
                        sql = `update ${config.SYSTEM.dbTables.unreportCar} set status = 0 where car_number=($1)`
                        await client.query(sql, [invoice.car[i].carNumber]);
                    } catch (e) {
                        logger.error(e);
                    }
                }
                else {
                    logger.info(`handleOpInvoice: не найден вагон carNumber=${invoice.car[i].carNumber}, id_sm=${invoice.idSm}`);
                }
            } catch (e) {
                logger.error(e)
                logger.info(`handleOpInvoice: ошибка при SELECT ${config.SYSTEM.dbTables.unreportCar} и ${config.SYSTEM.dbTables.unreportDocument} по carNumber=${invoice.car[i].carNumber} и id_sm=${invoice.idSm}`);
            }
        }
    }*/

    return xml({ responseClaim: [{ status: 0 }, { message: "Ок" }] });
}


async function duesGen(due, invoice, dues) {

    for (let i = 0; i < due.length; i++) {
        if (due[i].dueCarNumber !== null) {
            const carObj = invoice.car.find(c => c.carNumber === due[i].dueCarNumber);
            if (carObj) { due[i].dueIdSmCar = carObj.idSmCar; }
        }
        if (due.dueContNumber !== null) {
            const contObj = invoice.cont.find(c => c.contNumber === due[i].dueContNumber);
            if (contObj) { due[i].dueIdSmCont = contObj.idSmCont; }
        }
        dueObj = {
            dueDocTypeId: 18,
            dueTypeCode: due[i].dueTypeId,
            idSmInvoice: invoice.idSmInvoice,
            invoiceID: invoice.invoiceId,
            invUNP: invoice.invUnp,
            invNumber: invoice.invNumber,
            invDueSign: due[i].invDueSign,
            carNumber: due[i].dueCarNumber,
            idSmCar: due[i].dueIdSmCar,
            contNumber: due[i].dueContNumber,
            idSmCont: due[i].dueIdSmCont,
            dueAmount: due[i].dueAmount,
            payerOKPO: invoice.invPayerId,
            recipOKPO: "00083262",
        }

        dues.push(dueObj);
    }

    return dues;
}