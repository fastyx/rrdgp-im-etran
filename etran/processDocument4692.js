const xml = require('xml');                                 //для работы с XML
const logger = require('../config/logger');
const opDoc = require('./handleOpDocument');
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid
const reg_init = require('../reg_init');

var req;
var res;
var client;
var config;
var xmlCfg;

// ГУ-46, ФДУ-92
exports.processDocument4692 = async function (in_req, in_res, in_client, in_config, in_xmlCfg, doc) {
    req = in_req;
    res = in_res;
    client = in_client;
    config = in_config;
    xmlCfg = in_xmlCfg;

    if (doc.docTypeId === 2) {                    //ГУ-46
        idSm = doc.idSm;
        car = doc.car;
        cumDue = null;
    } else if (doc.docTypeId === -9) {            //ФДУ-92
        idSm = doc.idSm;
        car = doc.car;
        cumDue = doc.cumDue;
    } else {
        return xml({ responseClaim: [{ status: 1 }, { message: `Document: docTypeId не соответсвует документу ГУ-46 и ФДУ-92` }] });
    }

    logger.debug(`Document: на входе idSm = ${idSm} `);
    if (idSm === null) {
        for (let i = 0; i < car.length; i++) {
            try {
                var sql = `select id_sm from ${config.SYSTEM.dbTables.bundleCar} WHERE car_number = ($1)`;
                result = await client.query(sql, [car[i].carNumber]);
                if (result.rowCount !== 0) {
                    idSm = result.rows[0].id_sm;
                }
            } catch (e) {
                reg_info = `Document. processDocument4692: ошибка при чтении id_sm из ${config.SYSTEM.dbTables.bundleCar} where car_number=${car[i].carNumber}`;
                reg_init.regError(idSm, doc.docTypeId, doc.checkSum, 1, 1, doc.stateTransaction, reg_info, sql, null, e);
                return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });
            }
        }
    }
    logger.debug(`Document: на выходе idSm = ${idSm} `);

    if (idSm === null) {
        reg_info = `Document. processDocument4692: невозможно привязать документ doc_number = ${doc.docNumber} к idSm`;
        reg_init.regError(idSm, doc.docTypeId, doc.checkSum, 2, 1, doc.stateTransaction, reg_info, null, null, null);
        return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });
    }
    else {
        // определение IdSmDoc
        doc.idSmDoc = await getIdSmDoc(config, client, idSm, doc.docNumber, doc);
    }

    return await opDoc.handleOpDocument(req, res, client, config, xmlCfg, idSm, car, doc, cumDue);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getIdSmDoc(config, client, idSm, docNumber, doc) {
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
                reg_init.regError(idSm, doc.docTypeId, doc.checkSum, 1, 1, doc.stateTransaction, reg_info, sql, null, e);
            }
        }
    } catch (e) {
        reg_info = `Document: ошибка при SELECT ${config.SYSTEM.dbTables.bundleDocument} по doc_number = ${docNumber} и id_sm = ${idSm} `;
        reg_init.regError(idSm, doc.docTypeId, doc.checkSum, 1, 1, doc.stateTransaction, reg_info, sql, null, e);
    }
}