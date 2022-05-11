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
    let jsonObject = { transaction: guDoc.transaction, contractId: idSm, payload: payload, opts: guDoc.opts };
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

        if (guDoc.stateTransaction === 177 || guDoc.stateTransaction === 178) {

            //Формируем объект для передачи
            payload = {
                privateName: config.SYSTEM.privateCollection
                //privateName: '_implicit_org_Org1MSP',
                //privateName: 'CollTest1',
                //privateName: 'CollTest2'
            };
            dues = new Array();

            if (guDoc.stateTransaction === 177) {
                logger.debug(`handleOpDocument: формирование due для GU-46`);
                due = {
                    //checkSum: guDoc.checkSum,
                    idSmDoc: guDoc.idSmDoc,
                    dueDocTypeId: guDoc.docTypeId,
                    dueDocId: guDoc.docId,
                    dueDocNumber: guDoc.docNumber,
                    dueTypeCode: guDoc.dueTypeCode[0],
                    dueAmount: guDoc.dueAmount[0],
                    payerOKPO: guDoc.payerOKPO,
                    recipOKPO: "00083262",
                }
                dues.push(due);

                for (let i = 0; i < resCarArray.length; i++) {
                    // пишем только те вагоны, у которых есть carDueAmount
                    if (resCarArray[i].carDueAmount !== null) {
                        due = {
                            //checkSum: guDoc.checkSum,
                            idSmDoc: guDoc.idSmDoc,
                            dueDocTypeId: guDoc.docTypeId,
                            dueDocId: guDoc.docId,
                            dueDocNumber: guDoc.docNumber,
                            dueTypeCode: -999,
                            carNumber: resCarArray[i].carNumber,
                            idSmCar: resCarArray[i].idSmCar,
                            dueAmount: resCarArray[i].carDueAmount,
                            payerOKPO: guDoc.vpuPayerOKPO,
                            recipOKPO: "00083262",
                        }
                        dues.push(due);
                    }
                }
            }
            else if (guDoc.stateTransaction === 178) {
                logger.debug(`handleOpDocument: формирование due для FDU-92`);
                for (let i = 0; i < cumDue.length; i++) {
                    due = {
                        //checkSum: guDoc.checkSum,
                        idSmDoc: guDoc.idSmDoc,
                        dueDocTypeId: guDoc.docTypeId,
                        dueDocId: guDoc.docId,
                        dueDocNumber: guDoc.docNumber,
                        dueDateAmount: cumDue[i].dueDateAmount,
                        dueTypeCode: cumDue[i].dueTypeCode,
                        dueAmount: cumDue[i].dueAmount,
                        invNumber: cumDue[i].invNumber,
                        invoiceID: cumDue[i].invoiceID,
                        payerOKPO: guDoc.payerOKPO,
                        dueRowNumber: i,
                        dueInfo: cumDue[i].dueInfo,
                        recipOKPO: "00083262",
                    }
                    dues.push(due);
                }
            }
            duesList = {
                dues: dues,
            };
            transient = {
                dueList: duesList
            };
            let jsonObject = { transaction: guDoc.dueTransaction, contractId: idSm, payload: payload, transient: transient, opts: guDoc.opts };
            logger.info("Sended to BlockChain: " + JSON.stringify(jsonObject));

            //Вызываем REST-сервис записи в БЧ
            res.set('Content-Type', 'text/xml');
            try {
                response = await axios.post(`http://${config.SYSTEM.restConfig.invoke.host}:${config.SYSTEM.restConfig.invoke.port}/${config.SYSTEM.restConfig.invoke.name}`, jsonObject);
            } catch (e) {
                reg_info = `Document. ProcessDocument4692: ошибка при вызове сервиса ${JSON.stringify(e)}`;
                reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 0, 1, guDoc.stateTransaction, reg_info, jsonObject, null, e);
                return xml({ responseClaim: [{ status: 0 }, { message: reg_info}] });     // ошибки по due не пишем. Потом вообще этот вызов уберется
            }
            if (response.data.code === 0) {
                // Регистрация
                reg_init.regMessage(idSm, guDoc.docTypeId, null, guDoc.checkSum, 3, 1, guDoc.stateTransaction, guDoc.docNumber, guDoc.docId);
            }
            else {
                reg_info = `Document. ProcessDocument4692: response.data.code !== 0:${JSON.stringify(response.data)}`;
                reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 2, 1, guDoc.stateTransaction, reg_info, jsonObject, null, null);
                return xml({ responseClaim: [{ status: 0 }, { message: reg_info }] });     // ошибки по due не пишем. Потом вообще этот вызов уберется
            }
        }
    }
    else {
        reg_info = `Document. ProcessDocument4692: response.data.code !== 0:${JSON.stringify(response.data)}`;
        reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 2, 1, guDoc.stateTransaction, reg_info, jsonObject, null, null);
        return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });
    }
    return xml({ responseClaim: [{ status: 0 }, { message: "Ок" }] });
}