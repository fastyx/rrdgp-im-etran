const bc = require("../app");
const xml = require('xml');                                 //для работы с XML
const fs = require('fs');
const logger = require('../config/logger');

const reg_init = require('../reg_init');

const axiosDefaultConfig = {
    proxy: false
};
const axios = require('axios').create(axiosDefaultConfig);

const sqlDoc = require('./crud/sqlDocumentOp.js');

exports.handleOpDocument = async function (req, res, client, config, xmlCfg, idSm, resCarArray, guDoc, cumDue) {

    let transactions = new Array();

    logger.debug("handleOpGuDoc - called");

    let response;

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Запись информации в БД 
    // Регистрация
    reg_init.regMessage(idSm, guDoc.docTypeId, null, guDoc.checkSum, 2, 1, guDoc.stateTransaction, guDoc.docNumber, guDoc.docId);
    // Запись в Postgres 
    await sqlDoc.sqlDocumentOp(guDoc, client, config, idSm, response, resCarArray, cumDue);
    // Регистрация
    reg_init.regMessage(idSm, guDoc.docTypeId, null, guDoc.checkSum, 3, 1, guDoc.stateTransaction, guDoc.docNumber, guDoc.docId);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Подготовка информации в БЧ
    //Формируем объект для передачи
    if (guDoc.stateTransaction === 177 || guDoc.stateTransaction === 178) {
        payload = {
            checkSum: guDoc.checkSum,
            idSmDoc: guDoc.idSmDoc,
            docTypeId: guDoc.docTypeId,
            docId: guDoc.docId,
            docNumber: guDoc.docNumber
        };
    }
    else {
        payload = {
            checkSum: guDoc.checkSum,
            idSmDoc: guDoc.idSmDoc,
            docTypeId: guDoc.docTypeId,
            docId: guDoc.docId,
            docNumber: guDoc.docNumber,
            emptyCargoEndNotificationDt: guDoc.epochEmptyCargoEndNotificationDt,                //handleOp17
            ladenCargoEndNotificationDt: guDoc.epochLadenCargoEndNotificationDt,                //handleOp60
            signTrackDeliveryGu45Dt: guDoc.epochSignTrackDeliveryGu45Dt,                        //handleOp14a   handleOp58a
            rejectTrackDeliveryGu45Dt: guDoc.epochRejectTrackDeliveryGu45Dt,                    //handleOP14a                   carInTime
            emptyTrackDeliveryGu45Dt: guDoc.epochEmptyTrackDeliveryGu45Dt,                      //handleOp14b   handleOp58b
            signTrackLeaveGu45Dt: guDoc.epochSignTrackLeaveGu45Dt,                              //handleOp26a   handleOp65a
            rejectTrackLeaveGu45Dt: guDoc.epochRejectTrackLeaveGu45Dt,                          //handleOp26a                   carInTime
            ladenTrackLeaveGu45Dt: guDoc.epochLadenTrackLeaveGu45Dt,                            //handleOp26b   handleOp65b
            ladenTrackDeliveryGu45Dt: guDoc.epochLadenTrackDeliveryGu45Dt,                      //handleOp58a                   carInTime
            emptyTrackLeaveGu45Dt: guDoc.epochEmptyTrackLeaveGu45Dt,                            //handleOp65c   handleOp65a     carInTime
            cars: resCarArray                                                                   //Работаем с тем массивом вагонов, которые получены после удаления тех, что не на слежении
        };
    }
    let jsonObject = { channel: config.SYSTEM.defaultChannel, transaction: guDoc.transaction, contractId: idSm, contractIdInvoice: '00000000-0000-0000-0000-000000000000', payload: payload, opts: guDoc.opts };
    transactions.push(jsonObject);

    return { status: 0, transactions: transactions };
}