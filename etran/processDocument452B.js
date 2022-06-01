const xml = require('xml');                                 //для работы с XML
const logger = require('../config/logger');
const opDoc = require('./handleOpDocument');
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid
const reg_init = require('../reg_init');

// ГУ-2Б
const { gu2bOp17 } = require('./dto/gu2bOp17.js')
const { gu2bOp60 } = require('./dto/gu2bOp60.js')
//ГУ-45
const { gu45Op14a } = require('./dto/gu45Op14a.js')
const { gu45Op14b } = require('./dto/gu45Op14b.js')
const { gu45Op26a } = require('./dto/gu45Op26a.js')     //126a
const { gu45Op26b } = require('./dto/gu45Op26b.js')     //126b
const { gu45Op58a } = require('./dto/gu45Op58a.js')
const { gu45Op58b } = require('./dto/gu45Op58b.js')

var req;
var res;
var client;
var config;
var xmlCfg;

// ГУ-45, ГУ-2Б
exports.processDocument452B = async function (in_req, in_res, in_client, in_config, in_xmlCfg, guDoc) {
    req = in_req;
    res = in_res;
    client = in_client;
    config = in_config;
    xmlCfg = in_xmlCfg;

    var handleOpArray = new Array();

    if (guDoc.docTypeId === 6) {                // ГУ-2Б
        idSm = guDoc.idSm;
        car = guDoc.car;
        resCarArray = new Array();
        operDate = guDoc.operDate;
        epochOperDate = guDoc.epochOperDate;
        stationCode = guDoc.crgStationCode;
        stateId = 1760;                         // фейковый stateId. Для того, что бы различать ГУ-2Б и ГУ-45
        docNumber = guDoc.docNumber;
        docId = guDoc.docId;
        idSmDoc = null;
        carInDate = null;
        carInDateEpoch = null;
        carOutDate = null;
        carOutDateEpoch = null;
        documentType = guDoc.docTypeId;
        checkSum = guDoc.checkSum;
        documentData = guDoc.inputDocument;
        operType = null;
        idSmInvoice = null;
        opType = null;
    }
    else if (guDoc.docTypeId === 7) {           // ГУ-45
        idSm = guDoc.idSm;
        car = guDoc.car;
        resCarArray = new Array();
        operDate = guDoc.operDate;
        epochOperDate = guDoc.epochOperDate;
        stationCode = guDoc.railwayStationCode;
        stateId = guDoc.docStateId;
        docNumber = guDoc.docNumber;
        docId = guDoc.docId;
        idSmDoc = null;
        carInDate = guDoc.carInDate;
        carInDateEpoch = guDoc.carInDateEpoch;
        carOutDate = guDoc.carOutDate;
        carOutDateEpoch = guDoc.carOutDateEpoch;
        documentType = guDoc.docTypeId;
        checkSum = guDoc.checkSum;
        documentData = guDoc.inputDocument;
        operType = guDoc.operType;
        idSmInvoice = null;
        opType = null;
    }
    else {
        return xml({ responseClaim: [{ status: 1 }, { message: `Document: docTypeId не соответсвует документу ГУ-2Б и ГУ-45` }] });
    }

    // Определение временной зоны
    try {
        sql = `show timezone`
        timezoneQuery = await client.query(sql);
        timeZone = timezoneQuery.rows[0].TimeZone;
    } catch (e) {
        reg_info = `Document. processDocument452B: ошибка определения timeZone`;
        reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 1, 1, guDoc.stateTransaction, reg_info, sql, null, e);
    }

    // Основной алгоритм 
    if (idSm !== null) {
        logger.debug(`Document: idSm=${idSm}`);

        // определение IdSmDoc
        idSmDoc = await getIdSmDoc(config, client, idSm, docNumber, guDoc);
        logger.debug(`Document: idSmDoc=${idSmDoc}`);

        logger.info(`Document: начальный массив вагонов ${JSON.stringify(car)}`);

        let result;
        for (let i = 0; i < car.length; i++) {
            var carDate = null;
            if (operType !== null) {
                if (operType.toString() === 'Подачу' || operType.toString() === 'подачу') {
                    opType = 1;
                    carDate = carInDate[i];
                }
                else if (operType.toString() === 'Уборку' || operType.toString() === 'уборку') {
                    opType = 2;
                    carDate = carOutDate[i];
                }
            }
            else {
                carDate = operDate;
            }

            // Дополнение к carDate временной зоны
            try {
                sql = `select ($1)::timestamp at time zone 'utc' at time zone ($2)`;
                result = await client.query(sql, [carDate, timeZone]);
                carDate = result.rows[0].timezone;
            } catch (e) {
                reg_info = `Document. processDocument452B: ошибка преобразования даты по текущему timeZone`;
                reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 1, 1, guDoc.stateTransaction, reg_info, sql, null, e);
            }

            try {
                sql = `SELECT t1.id_sm, t1.car_number, t1.id_sm_car, t1.id_sm_invoice, t2.inv_from_station_code, t2.inv_to_station_code, t2.status_invoice
                    FROM ${config.SYSTEM.dbTables.objectsTracking} as t1 inner join ${config.SYSTEM.dbTables.etranInvoice} as t2
                    on t1.id_sm_invoice = t2.id_sm_invoice and t1.id_sm = t2.id_sm
                    where  t1.id_sm=($1) and t1.car_number = ($2) and 
                    (
                        (car_start_date<($3) and car_end_date>($3)) or  (car_start_date<($3) and car_end_date is null)
                    )
                    order by id_track desc 
                    limit 5;`;
                result = await client.query(sql, [idSm, car[i].carNumber, carDate]);
            } catch (e) {
                reg_info = `Document: ошибка при чтении ${config.SYSTEM.dbTables.objectsTracking} и ${config.SYSTEM.dbTables.etranInvoice}: ${JSON.stringify(e)}`;
                reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 1, 1, guDoc.stateTransaction, reg_info, sql, null, e);
            }

            if (result.rowCount !== 0) {
                for (let j = 0; j < result.rowCount; j++) {

                    // Определяем экспортный код
                    let attrExportCode = await getExportCodes(result.rows[j].inv_from_station_code, result.rows[j].inv_to_station_code, stationCode, guDoc)

                    logger.debug(`Document: определяем транзакцию для id_sm=${result.rows[j].id_sm} car_number=${result.rows[j].car_number} id_sm_invoice=${result.rows[j].id_sm_invoice} station_code=${stationCode} status_invoice=${result.rows[j].status_invoice}`);

                    logger.debug(`opType=${opType} attrExportCode=${attrExportCode} status_invoice=${result.rows[j].status_invoice}`);
                    if (Number(stateId) === 548) {
                        // Подача   invFromStationCode = stationCode    Груженая накладная       
                        if (opType === 1 && attrExportCode === 1 && result.rows[j].status_invoice === 2) {
                            resCarArray.push({ carNumber: result.rows[j].car_number, idSmCar: result.rows[j].id_sm_car, idSmInvoice: result.rows[j].id_sm_invoice });
                            handleOpArray.push({ handleOp: "14a" });
                            logger.debug(`Document: carNumber=${result.rows[j].car_number} найден. idSmCar=${result.rows[j].id_sm_car}; transaction=handleOp14a; attrExportCode=${attrExportCode}; statusInvoice=${result.rows[j].status_invoice}`);
                            break;
                        }
                        // Подача   invToStationCode = stationCode      Груженая накладная       
                        else if (opType === 1 && attrExportCode === 2 && result.rows[j].status_invoice === 2) {
                            resCarArray.push({ carNumber: result.rows[j].car_number, idSmCar: result.rows[j].id_sm_car, idSmInvoice: result.rows[j].id_sm_invoice });
                            handleOpArray.push({ handleOp: "58a" });
                            logger.debug(`Document: carNumber=${result.rows[j].car_number} найден. idSmCar=${result.rows[j].id_sm_car}; transaction=handleOp58a; attrExportCode=${attrExportCode}; statusInvoice=${result.rows[j].status_invoice}`);
                            break;
                        }
                        // Уборка   invFromStationCode = stationCode    Груженая накладная
                        else if (opType === 2 && attrExportCode === 1 && result.rows[j].status_invoice === 2) {
                            resCarArray.push({ carNumber: result.rows[j].car_number, idSmCar: result.rows[j].id_sm_car, idSmInvoice: result.rows[j].id_sm_invoice });
                            handleOpArray.push({ handleOp: "26a" });
                            logger.debug(`Document: carNumber=${result.rows[j].car_number} найден. idSmCar=${result.rows[j].id_sm_car}; transaction=handleOp26a; attrExportCode=${attrExportCode}; statusInvoice=${result.rows[j].status_invoice}`);
                            break;
                        }
                        // Уборка   invFromStationCode = stationCode    Порожняя накладная
                        else if (opType === 2 && attrExportCode === 1 && result.rows[j].status_invoice === 1) {
                            resCarArray.push({ carNumber: result.rows[j].car_number, idSmCar: result.rows[j].id_sm_car, idSmInvoice: result.rows[j].id_sm_invoice });
                            handleOpArray.push({ handleOp: "126a" });
                            logger.debug(`Document: carNumber=${result.rows[j].car_number} найден. idSmCar=${result.rows[j].id_sm_car}; transaction=handleOp126a; attrExportCode=${attrExportCode}; statusInvoice=${result.rows[j].status_invoice}`);
                            break;
                        }
                        else {
                            reg_info = `Document GU - 45: не найдена транзакция для id_sm=${result.rows[j].id_sm} car_number=${result.rows[j].car_number} id_sm_invoice=${result.rows[j].id_sm_invoice} inv_from_station_code=${result.rows[j].inv_from_station_code} inv_to_station_code=${result.rows[j].inv_to_station_code} stationCode=${stationCode} status_invoice=${result.rows[j].status_invoice}`;
                            reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 2, 1, guDoc.stateTransaction, reg_info, null, null, null);
                        }
                    }
                    else if (Number(stateId) === 699 || Number(stateId) === 697) {
                        // Подача   invFromStationCode = stationCode    Груженая накладная       
                        if (opType === 1 && attrExportCode === 1 && result.rows[j].status_invoice === 2) {
                            resCarArray.push({ carNumber: result.rows[j].car_number, idSmCar: result.rows[j].id_sm_car, idSmInvoice: result.rows[j].id_sm_invoice });
                            handleOpArray.push({ handleOp: "14b" });
                            logger.debug(`Document: carNumber=${result.rows[j].car_number} найден. idSmCar=${result.rows[j].id_sm_car}; transaction=handleOp14b; attrExportCode=${attrExportCode}; statusInvoice=${result.rows[j].status_invoice}`);
                            break;
                        }
                        // Подача   invToStationCode = stationCode      Груженая накладная       
                        else if (opType === 1 && attrExportCode === 2 && result.rows[j].status_invoice === 2) {
                            resCarArray.push({ carNumber: result.rows[j].car_number, idSmCar: result.rows[j].id_sm_car, idSmInvoice: result.rows[j].id_sm_invoice });
                            handleOpArray.push({ handleOp: "58b" });
                            logger.debug(`Document: carNumber=${result.rows[j].car_number} найден. idSmCar=${result.rows[j].id_sm_car}; transaction=handleOp58b; attrExportCode=${attrExportCode}; statusInvoice=${result.rows[j].status_invoice}`);
                            break;
                        }
                        // Уборка   invFromStationCode = stationCode    Груженая накладная
                        else if (opType === 2 && attrExportCode === 1 && result.rows[j].status_invoice === 2) {
                            resCarArray.push({ carNumber: result.rows[j].car_number, idSmCar: result.rows[j].id_sm_car, idSmInvoice: result.rows[j].id_sm_invoice });
                            handleOpArray.push({ handleOp: "26b" });
                            logger.debug(`Document: carNumber=${result.rows[j].car_number} найден. idSmCar=${result.rows[j].id_sm_car}; transaction=handleOp26b; attrExportCode=${attrExportCode}; statusInvoice=${result.rows[j].status_invoice}`);
                            break;
                        }
                        // Уборка   invFromStationCode = stationCode    Порожняя накладная
                        else if (opType === 2 && attrExportCode === 1 && result.rows[j].status_invoice === 1) {
                            resCarArray.push({ carNumber: result.rows[j].car_number, idSmCar: result.rows[j].id_sm_car, idSmInvoice: result.rows[j].id_sm_invoice });
                            handleOpArray.push({ handleOp: "126b" });
                            logger.debug(`Document: carNumber=${result.rows[j].car_number} найден. idSmCar=${result.rows[j].id_sm_car}; transaction=handleOp126b; attrExportCode=${attrExportCode}; statusInvoice=${result.rows[j].status_invoice}`);
                            break;
                        }
                        else {
                            reg_info = `Document GU - 45: не найдена транзакция для id_sm=${result.rows[j].id_sm} car_number=${result.rows[j].car_number} id_sm_invoice=${result.rows[j].id_sm_invoice} inv_from_station_code=${result.rows[j].inv_from_station_code} inv_to_station_code=${result.rows[j].inv_to_station_code} stationCode=${stationCode} status_invoice=${result.rows[j].status_invoice}`;
                            reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 2, 1, guDoc.stateTransaction, reg_info, null, null, null);
                        }
                    }
                    else if (Number(stateId) === 1760) {
                        if (attrExportCode === 1 && result.rows[j].status_invoice === 1) {
                            resCarArray.push({ carNumber: result.rows[j].car_number, idSmCar: result.rows[j].id_sm_car, idSmInvoice: result.rows[j].id_sm_invoice });
                            handleOpArray.push({ handleOp: "117" });
                            logger.debug(`Document: carNumber=${result.rows[j].car_number} найден. idSmCar=${result.rows[j].id_sm_car}; transaction=handleOp117; attrExportCode=${attrExportCode}; statusInvoice=${result.rows[j].status_invoice}`);
                            break;
                        }
                        else if (attrExportCode === 1 && result.rows[j].status_invoice === 2) {
                            resCarArray.push({ carNumber: result.rows[j].car_number, idSmCar: result.rows[j].id_sm_car, idSmInvoice: result.rows[j].id_sm_invoice });
                            handleOpArray.push({ handleOp: "17" });
                            logger.debug(`Document: carNumber=${result.rows[j].car_number} найден. idSmCar=${result.rows[j].id_sm_car}; transaction=handleOp17; attrExportCode=${attrExportCode}; statusInvoice=${result.rows[j].status_invoice}`);
                            break;
                        }
                        else if (attrExportCode === 2 && result.rows[j].status_invoice === 2) {
                            resCarArray.push({ carNumber: result.rows[j].car_number, idSmCar: result.rows[j].id_sm_car, idSmInvoice: result.rows[j].id_sm_invoice });
                            handleOpArray.push({ handleOp: "60" });
                            logger.debug(`Document: carNumber=${result.rows[j].car_number} найден. idSmCar=${result.rows[j].id_sm_car}; transaction=handleOp60; attrExportCode=${attrExportCode}; statusInvoice=${result.rows[j].status_invoice}`);
                            break;
                        }
                        else {
                            reg_info = `Document GU - 2B: не найдена транзакция для id_sm=${result.rows[j].id_sm} car_number=${result.rows[j].car_number} id_sm_invoice=${result.rows[j].id_sm_invoice} inv_from_station_code=${result.rows[j].inv_from_station_code} inv_to_station_code=${result.rows[j].inv_to_station_code} stationCode=${stationCode} status_invoice=${result.rows[j].status_invoice}`;
                            reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 2, 1, guDoc.stateTransaction, reg_info, null, null, null);
                        }
                    }
                }
            }
            else {
                await putUnreportCar(car[i].carNumber, operDate, stateId, docNumber, docId, idSmDoc, documentType, null, null, null, null, guDoc);
                await putUnreportDoc(resCarArray, idSm, car, operDate, epochOperDate, stationCode, stateId, docNumber, docId, idSmDoc, carInDate, carOutDate, documentType, checkSum, stationCode, documentData, guDoc)
            }
        }

        logger.info(`Document: конечный массив вагонов ${JSON.stringify(resCarArray)}`);

        if (handleOpArray.length !== 0) {
            // ГУ-45
            if (handleOpArray[0].handleOp === "14a") {
                gu452B = await handleOp14aPrepare(idSmDoc);
            }
            else if (handleOpArray[0].handleOp === "26a") {
                gu452B = await handleOp26aPrepare(idSmDoc);
            }
            else if (handleOpArray[0].handleOp === "58a") {
                gu452B = await handleOp58aPrepare(idSmDoc);
            }
            else if (handleOpArray[0].handleOp === "126a") {
                gu452B = await handleOp126aPrepare(idSmDoc);
            }
            else if (handleOpArray[0].handleOp === "14b") {
                gu452B = await handleOp14bPrepare(idSmDoc);
            }
            else if (handleOpArray[0].handleOp === "26b") {
                gu452B = await handleOp26bPrepare(idSmDoc);
            }
            else if (handleOpArray[0].handleOp === "58b") {
                gu452B = await handleOp58bPrepare(idSmDoc);
            }
            else if (handleOpArray[0].handleOp === "126b") {
                gu452B = await handleOp126bPrepare(idSmDoc);
            }
            // ГУ-2Б
            else if (handleOpArray[0].handleOp === "17") {
                gu452B = await handleOp17Prepare(idSmDoc);
            }
            else if (handleOpArray[0].handleOp === "117") {
                gu452B = await handleOp117Prepare(idSmDoc);
            }
            else if (handleOpArray[0].handleOp === "60") {
                gu452B = await handleOp60Prepare(idSmDoc);
            }
        }
        else {
            return xml({ responseClaim: [{ status: 0 }, { message: `Document: документ обработан, но к накладной не привязан ни один вагон` }] });
        }
    }
    else {
        await putUnreportDoc(resCarArray, idSm, car, operDate, epochOperDate, stationCode, stateId, docNumber, docId, idSmDoc, carInDate, carOutDate, documentType, checkSum, stationCode, documentData, guDoc)

        reg_info = `Document: в документе не передан idSm`;
        reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 2, 1, guDoc.stateTransaction, reg_info, null, null, null);
        return xml({ responseClaim: [{ status: 1 }, { message: `Document: в документе не передан idSm` }] });
    }
    return await opDoc.handleOpDocument(req, res, client, config, xmlCfg, idSm, resCarArray, gu452B, null);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Пишем в таблицу unreport_doc если что-то не совсем корректно (нет привязки к id_sm, не все вагоны привязаны к id_sm)
async function putUnreportDoc(resCarArray, idSm, car, operDate, epochOperDate, stationCode, stateId, docNumber, docId, idSmDoc, carInDate, carOutDate, documentType, checkSum, stationCode, documentData, guDoc) {
    try {
        var sql = `SELECT * from ${config.SYSTEM.dbTables.unreportDocument} where doc_number = ($1) and id_sm_doc = ($2)`;
        resultUnreportDocument = await client.query(sql, [docNumber, idSmDoc]);
        if (resultUnreportDocument.rowCount === 0) {
            try {
                var sql = `insert into ${config.SYSTEM.dbTables.unreportDocument}
                    (
                        id_sm,
                        id_sm_doc,
                        doc_id,
                        doc_number,
                        document_type,
                        oper_date,
                        oper_date_epoch,
                        state_id,
                        check_sum,
                        station_code,
                        document_data
                    )
                    values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`;
                await client.query(sql, [
                    idSm,
                    idSmDoc,
                    docId,
                    docNumber,
                    documentType,
                    operDate,
                    epochOperDate,
                    stateId,
                    checkSum,
                    stationCode,
                    documentData
                ]);
            } catch (e) {
                reg_info = `Document: ошибка при записи ${config.SYSTEM.dbTables.unreportDocument} `;
                reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 1, 1, guDoc.stateTransaction, reg_info, sql, null, e);
            }
        }
    } catch (e) {
        reg_info = `Document: ошибка при чтении ${config.SYSTEM.dbTables.unreportDocument} по doc_number = ${docNumber} и id_sm_doc = ${idSmDoc} `;
        reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 1, 1, guDoc.stateTransaction, reg_info, sql, null, e);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// функция записи в unreport_car
async function putUnreportCar(carNumber, operDate, stateId, docNumber, docId, idSmDoc, documentType, carInDate, carInDateEpoch, carOutDate, carOutDateEpoch, guDoc) {
    try {
        var sql = `SELECT * from ${config.SYSTEM.dbTables.unreportCar} where car_number = ($1) and id_sm_doc = ($2)`;
        resultUnreportCar = await client.query(sql, [carNumber, idSmDoc]);
        if (resultUnreportCar.rowCount === 0) {
            try {
                var sql = `insert into ${config.SYSTEM.dbTables.unreportCar}
                    (
                        oper_date,
                        state_id,
                        car_number,
                        status,
                        id_sm_doc,
                        doc_id,
                        doc_number,
                        car_in_date,
                        car_in_date_epoch,
                        car_out_date,
                        car_out_date_epoch,
                        document_type
                    )
                    values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`;
                await client.query(sql,
                    [
                        operDate,
                        stateId,
                        carNumber,
                        '1',
                        idSmDoc,
                        docId,
                        docNumber,
                        carInDate,
                        carInDateEpoch,
                        carOutDate,
                        carOutDateEpoch,
                        documentType
                    ]
                );
            } catch (e) {
                reg_info = `Document: ошибка при записи в ${config.SYSTEM.dbTables.unreportCar} `;
                reg_init.regError(guDoc.idSm, guDoc.docTypeId, guDoc.checkSum, 1, 1, guDoc.stateTransaction, reg_info, sql, null, e);
            }
        }
    } catch (e) {
        reg_info = `Document: ошибка при чтении ${config.SYSTEM.dbTables.unreportCar} по car_number = ${carNumber} и id_sm_doc = ${idSmDoc} `;
        reg_init.regError(guDoc.idSm, guDoc.docTypeId, guDoc.checkSum, 1, 1, guDoc.stateTransaction, reg_info, sql, null, e);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Функция Update таблиц unreport_document и unreport_car с простановкой state_id, после того, как мы его вычислили 
async function setStateId(stateId, idSmDoc, transaction, guDoc) {
    logger.debug(`Document: установка stateId = ${stateId} в ${config.SYSTEM.dbTables.unreportDocument} и ${config.SYSTEM.dbTables.unreportCar} по idSmDoc = ${idSmDoc} `);
    try {
        var sql = `UPDATE ${config.SYSTEM.dbTables.unreportDocument} set state_id = ($1), handle_op = ($2) where id_sm_doc = ($3)`
        await client.query(sql, [stateId, transaction, idSmDoc]);
    } catch (e) {
        reg_info = `Document: ошибка при корректировке ${config.SYSTEM.dbTables.unreportDocument} по idSmDoc = ${idSmDoc} `;
        reg_init.regError(guDoc.idSm, guDoc.docTypeId, guDoc.checkSum, 1, 1, guDoc.stateTransaction, reg_info, sql, null, e);
    }

    try {
        var sql = `UPDATE ${config.SYSTEM.dbTables.unreportCar} set state_id = ($1), handle_op = ($2) where id_sm_doc = ($3)`
        await client.query(sql, [stateId, transaction, idSmDoc]);
    } catch (e) {
        reg_info = `Document: ошибка при корректировке ${config.SYSTEM.dbTables.unreportCar} по idSmDoc = ${idSmDoc} `;
        reg_init.regError(guDoc.idSm, guDoc.docTypeId, guDoc.checkSum, 1, 1, guDoc.stateTransaction, reg_info, sql, null, e);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Функция проверки соответствия экспортного кода - коду из ГУ-45/ГУ-2Б. Возвращает:
// 1 - если экспорт код соответствует invFromStationCode или stationCode из ГУ-45/ГУ-2Б = invFromStationCode
// 2 - если экспорт код соответствует invToStationCode или stationCode из ГУ-45/ГУ-2Б = invToStationCode
async function getExportCodes(invFromStationCode, invToStationCode, stationCode, guDoc) {
    let attrExportCode = 0;

    // stationCode из ГУ-45/ГУ-2Б = invFromStationCode
    if (invFromStationCode === stationCode) {
        attrExportCode = 1;
        return attrExportCode;
    }
    // stationCode из ГУ-45/ГУ-2Б = invToStationCode
    else if (invToStationCode === stationCode) {
        attrExportCode = 2;
        return attrExportCode;
    }
    // определеить по экспортным кодам, чему же равен stationCode
    else {
        try {
            var sql = `SELECT stan_op from ${config.SYSTEM.dbTables.tnSootStopStnV} WHERE stan_nazn_vag = ($1)::int`;
            result = await client.query(sql, [invFromStationCode]);
            if (result.rowCount !== 0) {
                for (let i = 0; i < result.rowCount; i++) {
                    if (Number(result.rows[i].stan_op) === Number(stationCode)) {
                        attrExportCode = 1;
                        return attrExportCode;
                    }
                }
            }
        } catch (e) {
            reg_info = `Document: ошибка при чтении ${config.SYSTEM.dbTables.tnSootStopStnV} по stan_nazn_vag = invFromStationCode = ${invFromStationCode} `;
            reg_init.regError(guDoc.idSm, guDoc.docTypeId, guDoc.checkSum, 1, 1, guDoc.stateTransaction, reg_info, sql, null, e);
        }

        try {
            var sql = `SELECT stan_op from ${config.SYSTEM.dbTables.tnSootStopStnV} WHERE stan_nazn_vag = ($1)::int`;
            result = await client.query(sql, [invToStationCode]);
            if (result.rowCount !== 0) {
                for (let i = 0; i < result.rowCount; i++) {
                    if (Number(result.rows[i].stan_op) === Number(stationCode)) {
                        attrExportCode = 2;
                        return attrExportCode;
                    }
                }
            }
        } catch (e) {
            reg_info = `Document: ошибка при чтении ${config.SYSTEM.dbTables.tnSootStopStnV} по stan_nazn_vag = invToStationCode = ${invToStationCode} `;
            reg_init.regError(guDoc.idSm, guDoc.docTypeId, guDoc.checkSum, 1, 1, guDoc.stateTransaction, reg_info, sql, null, e);
        }
    }
    logger.debug(`Document: Функция getExportCodes не нашла stationCode = ${stationCode} в таблице ${config.SYSTEM.dbTables.tnSootStopStnV} `);
    return attrExportCode;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Заготовки handleOp для ГУ-2Б и ГУ-45
async function handleOp14aPrepare(idSmDoc) {
    gu452B = new gu45Op14a(req, xmlCfg);
    gu452B.idSmDoc = idSmDoc;
    await setStateId(gu452B.stateTransaction, idSmDoc, gu452B.transaction, gu452B);
    return gu452B;
}
async function handleOp14bPrepare(idSmDoc) {
    gu452B = new gu45Op14b(req, xmlCfg);
    gu452B.idSmDoc = idSmDoc;
    await setStateId(gu452B.stateTransaction, idSmDoc, gu452B.transaction, gu452B);
    return gu452B;
}
async function handleOp26aPrepare(idSmDoc) {
    gu452B = new gu45Op26a(req, xmlCfg);
    gu452B.idSmDoc = idSmDoc;
    gu452B.stateTransaction = 26;
    gu452B.transaction = "handleOp26a";
    await setStateId(gu452B.stateTransaction, idSmDoc, gu452B.transaction, gu452B);
    return gu452B;
}
async function handleOp26bPrepare(idSmDoc) {
    gu452B = new gu45Op26b(req, xmlCfg);
    gu452B.stateTransaction = 26;
    gu452B.transaction = "handleOp26b";
    gu452B.idSmDoc = idSmDoc;
    await setStateId(gu452B.stateTransaction, idSmDoc, gu452B.transaction, gu452B);
    return gu452B;
}
async function handleOp126aPrepare(idSmDoc) {
    gu452B = new gu45Op26a(req, xmlCfg);
    gu452B.idSmDoc = idSmDoc;
    gu452B.stateTransaction = 126;
    gu452B.transaction = "handleOp126a";
    await setStateId(gu452B.stateTransaction, idSmDoc, gu452B.transaction, gu452B);
    return gu452B;
}
async function handleOp126bPrepare(idSmDoc) {
    gu452B = new gu45Op26b(req, xmlCfg);
    gu452B.stateTransaction = 126;
    gu452B.transaction = "handleOp126b";
    gu452B.idSmDoc = idSmDoc;
    await setStateId(gu452B.stateTransaction, idSmDoc, gu452B.transaction, gu452B);
    return gu452B;
}
async function handleOp58aPrepare(idSmDoc) {
    gu452B = new gu45Op58a(req, xmlCfg);
    gu452B.idSmDoc = idSmDoc;
    await setStateId(gu452B.stateTransaction, idSmDoc, gu452B.transaction, gu452B);
    return gu452B;
}
async function handleOp58bPrepare(idSmDoc) {
    gu452B = new gu45Op58b(req, xmlCfg);
    gu452B.idSmDoc = idSmDoc;
    await setStateId(gu452B.stateTransaction, idSmDoc, gu452B.transaction, gu452B);
    return gu452B;
}
async function handleOp17Prepare(idSmDoc) {
    gu452B = new gu2bOp17(req, xmlCfg);
    gu452B.idSmDoc = idSmDoc;
    gu452B.transaction = "handleOp17";
    gu452B.stateTransaction = 17;
    await setStateId(gu452B.stateTransaction, idSmDoc, gu452B.transaction, gu452B);
    return gu452B;
}
async function handleOp117Prepare(idSmDoc) {
    gu452B = new gu2bOp17(req, xmlCfg);
    gu452B.idSmDoc = idSmDoc;
    gu452B.transaction = "handleOp117";
    gu452B.stateTransaction = 117;
    await setStateId(gu452B.stateTransaction, idSmDoc, gu452B.transaction, gu452B);
    return gu452B;
}
async function handleOp60Prepare(idSmDoc) {
    gu452B = new gu2bOp60(req, xmlCfg);
    gu452B.idSmDoc = idSmDoc;
    await setStateId(gu452B.stateTransaction, idSmDoc, gu452B.transaction, gu452B);
    return gu452B;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getIdSmDoc(config, client, idSm, docNumber, guDoc) {
    logger.debug(`Document: определение idSmDoc из ${config.SYSTEM.dbTables.bundleDocument} по doc_number = ${docNumber} и id_sm = ${idSm} `);
    try {
        var sql = `SELECT id_sm_doc from ${config.SYSTEM.dbTables.bundleDocument} where id_sm = ($1) and doc_number = ($2)`;
        resultBundleDocument = await client.query(sql, [idSm, docNumber]);
        if (resultBundleDocument.rowCount !== 0) {
            let idSmDoc = resultBundleDocument.rows[0].id_sm_doc;
            return idSmDoc;
        }
        else {
            logger.debug(`Document: определение idSmDoc из ${config.SYSTEM.dbTables.unreportDocument} по doc_number = ${docNumber} и id_sm = ${idSm} `);
            try {
                var sql = `SELECT id_sm_doc from ${config.SYSTEM.dbTables.unreportDocument} where id_sm = ($1) and doc_number = ($2)`;
                resultUnreportDocument = await client.query(sql, [idSm, docNumber]);
                if (resultUnreportDocument.rowCount !== 0) {
                    let idSmDoc = resultUnreportDocument.rows[0].id_sm_doc;
                    return idSmDoc;
                }
                else {
                    idSmDoc = getuuid();
                    return idSmDoc;
                }
            } catch (e) {
                reg_info = `Document: ошибка при SELECT ${config.SYSTEM.dbTables.unreportDocument} по doc_number = ${docNumber} и id_sm = ${idSm} `;
                reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 1, 1, guDoc.stateTransaction, reg_info, sql, null, e);
            }
        }
    } catch (e) {
        reg_info = `Document: ошибка при SELECT ${config.SYSTEM.dbTables.bundleDocument} по doc_number = ${docNumber} и id_sm = ${idSm} `;
        reg_init.regError(idSm, guDoc.docTypeId, guDoc.checkSum, 1, 1, guDoc.stateTransaction, reg_info, sql, null, e);
    }
}