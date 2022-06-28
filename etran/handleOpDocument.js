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

    logger.debug("handleOpGuDoc - called");

    var response;

    // Регистрация
    reg_init.regMessage(idSm, guDoc.docTypeId, null, guDoc.checkSum, 1, 1, guDoc.stateTransaction, guDoc.docNumber, guDoc.docId);


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
    let jsonObject = { transaction: guDoc.transaction, contractId: idSm, contractIdInvoice: '00000000-0000-0000-0000-000000000000', payload: payload, opts: guDoc.opts };
    logger.info("Sended to BlockChain: " + JSON.stringify(jsonObject));

    //Вызываем REST-сервис записи в БЧ
    res.set('Content-Type', 'text/xml');
    try {
        response = await axios.post(`http://${config.SYSTEM.restConfig.invoke.host}:${config.SYSTEM.restConfig.invoke.port}/${config.SYSTEM.restConfig.invoke.name}`, jsonObject)
    } catch (e) {
        reg_info = `Document. ProcessDocument4692: ошибка при вызове сервиса ${JSON.stringify(e)}`;
        reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 0, 1, guDoc.stateTransaction, reg_info, jsonObject, null, e);
        return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });
    }
    if (response.data.code === 0) {

        // Регистрация
        reg_init.regMessage(idSm, guDoc.docTypeId, null, guDoc.checkSum, 2, 1, guDoc.stateTransaction, guDoc.docNumber, guDoc.docId);

        // Запись в Postgres 
        await sqlDoc.sqlDocumentOp(guDoc, client, config, idSm, response, resCarArray, cumDue);
    }
    else {
        reg_info = `Document. ProcessDocument4692: response.data.code !== 0:${JSON.stringify(response.data)}`;
        reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 2, 1, guDoc.stateTransaction, reg_info, jsonObject, null, null);
        return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });
    }
    return xml({ responseClaim: [{ status: 0 }, { message: "Ок" }] });
}