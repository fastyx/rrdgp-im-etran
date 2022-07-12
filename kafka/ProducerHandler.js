/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const xml = require('xml');
const checksum = require('json-checksum');
const { v4: getuuid } = require('uuid');
var xmlParse = require('xml2json');
const reg_init = require('../reg_init');
const config = require(`../init_config`);
var replaceall = require("replaceall");

const logger = require('../config/logger');
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
exports.producerHandler = async function (req) {

    let idSm = null;
    let docType = null;
    let docCheckSum = null;
    let docStateId = null;
    let docNumber = null;
    let docId = null;

    let sm = '';
    let reg_info = 'Ok';

    let prCreateChannel = 0;

    // Передача claim (GU-12)
    if (req.body.hasOwnProperty(`requestclaim`)) {
        try {
            idSm = req.body.requestclaim.idsm;
            docType = 12;
            docBody = req.rawBody;
            docCheckSum = checksum(req.rawBody);
            docStateId = req.body.requestclaim.claim.claimstateid.$.value;
            docNumber = req.body.requestclaim.claim.claimnumber.$.value;
            docId = req.body.requestclaim.claim.claimid.$.value;
            operDate = req.body.requestclaim.claim.operdate.$.value;

            try {
                result = await client.query(`select id_sm from ${config.SYSTEM.dbTables.etranClaim} where claim_number=($1)`, [docNumber]);
            } catch (e) {
                console.log(e)
                reg_info = `Claim: ошибка при чтении таблицы ${config.SYSTEM.dbTables.etranClaim} по claim_number=${docNumber}`;
                reg_init.regError(null, docType, docCheckSum, 1, 1, docStateId, reg_info, null, null, e);
            }

            if (docStateId == 70) {
                if (result.rowCount === 0 && idSm === '') {
                    idSm = getuuid();
                    prCreateChannel = 1;
                    req.rawBody = replaceall(`<idSm></idSm>`, `<idSm>${idSm}</idSm>`, req.rawBody);
                }
                else if (result.rowCount !== 0 && idSm === '') {
                    idSm = result.rows[0].id_sm;
                    req.rawBody = replaceall(`<idSm></idSm>`, `<idSm>${idSm}</idSm>`, req.rawBody);
                }
                else if (result.rowCount !== 0 && idSm !== '') {
                    if (idSm !== result.rows[0].id_sm) {
                        reg_info = `Claim: по claim_number=${docNumber} idSm=${idSm} != id_sm=${result.rows[0].id_sm}`;
                        reg_init.regError(idSm, docType, docCheckSum, 1, 1, docStateId, reg_info, null, null, null);
                    }
                }
                else if (result.rowCount === 0 && idSm !== '') {
                    reg_info = `Claim: по claim_number=${docNumber} в БД не обнаружен id_sm=${idSm}`;
                    reg_init.regError(idSm, docType, docCheckSum, 1, 1, docStateId, reg_info, null, null, null);
                }
                sm = idSm;
                req.body.requestclaim.idsm = idSm;
            }
        } catch (e) {
            console.log(e)
            reg_info = `Ошибка форматного контроля входных параметров ${e}`;
            reg_init.regError(idSm, docType, docCheckSum, 1, 1, docStateId, reg_info, null, null, null);
        }
    }

    // Передача invoice (ГУ-27)
    else if (req.body.hasOwnProperty(`requestinvoice`)) {
        try {
            idSm = req.body.requestinvoice.idsm;
            docType = 27;
            docBody = req.rawBody;
            docCheckSum = checksum(req.rawBody);
            docStateId = req.body.requestinvoice.invoice.invoicestateid.$.value;
            docNumber = req.body.requestinvoice.invoice.invnumber.$.value;
            docId = req.body.requestinvoice.invoice.invoiceid.$.value;
            operDate = req.body.requestinvoice.invoice.operdate.$.value;
        } catch (e) {
            console.log(e)
            reg_info = `Ошибка форматного контроля входных параметров ${e}`;
            reg_init.regError(idSm, docType, docCheckSum, 1, 1, docStateId, reg_info, null, null, null);
        }
    }

    else if (req.body.hasOwnProperty('requestnotification')) {
        //Передача ГУ-46
        if (req.body.requestnotification.hasOwnProperty('vpu')) {
            try {
                idSm = req.body.requestnotification.idsm;
                docType = 2;
                docBody = req.rawBody;
                docCheckSum = checksum(req.rawBody);
                docStateId = req.body.requestnotification.vpu.vpustateid.$.value;
                docNumber = req.body.requestnotification.vpu.vpunumber.$.value;
                docId = req.body.requestnotification.vpu.vpuid.$.value;
                operDate = req.body.requestnotification.vpu.operdate.$.value;
            } catch (e) {
                console.log(e)
                reg_info = `Ошибка форматного контроля входных параметров ${e}`;
                reg_init.regError(idSm, docType, docCheckSum, 1, 1, docStateId, reg_info, null, null, null);
            }
        }
        //Передача ФДУ-92
        if (req.body.requestnotification.hasOwnProperty('cum')) {
            try {
                idSm = req.body.requestnotification.idsm;
                docType = -9;
                docBody = req.rawBody;
                docCheckSum = checksum(req.rawBody);
                docStateId = req.body.requestnotification.cum.cumstateid.$.value;
                docNumber = req.body.requestnotification.cum.cumnumber.$.value;
                docId = req.body.requestnotification.cum.cumid.$.value;
                operDate = req.body.requestnotification.cum.operdate.$.value;
            } catch (e) {
                console.log(e)
                reg_info = `Ошибка форматного контроля входных параметров ${e}`;
                reg_init.regError(idSm, docType, docCheckSum, 1, 1, docStateId, reg_info, null, null, null);
            }
        }
        // Передача ГУ-2б
        if (req.body.requestnotification.hasOwnProperty('notificationgu2b')) {
            try {
                idSm = req.body.requestnotification.idsm;
                docType = 6;
                docBody = req.rawBody;
                docCheckSum = checksum(req.rawBody);
                docStateId = req.body.requestnotification.notificationgu2b.crgstateid.$.value;
                docNumber = req.body.requestnotification.notificationgu2b.cargoendnotificationnumber.$.value;
                docId = req.body.requestnotification.notificationgu2b.cargoendnotificationid.$.value;
                operDate = req.body.requestnotification.notificationgu2b.crgdatecreate.$.value;
            } catch (e) {
                console.log(e)
                reg_info = `Ошибка форматного контроля входных параметров ${e}`;
                reg_init.regError(idSm, docType, docCheckSum, 1, 1, docStateId, reg_info, null, null, null);
            }
        }
        //Передача ГУ-45
        if (req.body.requestnotification.hasOwnProperty('pps')) {
            try {
                idSm = req.body.requestnotification.idsm;
                docType = 7;
                docBody = req.rawBody;
                docCheckSum = checksum(req.rawBody);

                this.docBaseUtf8 = (new Buffer.from(req.body.requestnotification.pps.request.documentdata.doccontent, 'base64')).toString('utf8');
                const jsonObj = JSON.parse(xmlParse.toJson(this.docBaseUtf8));

                docStateId = req.body.requestnotification.pps.docstate.stateid;
                docNumber = jsonObj.data.number;
                docId = req.body.requestnotification.pps.request.documentdata.docid;
                operDate = req.body.requestnotification.pps.operdate;
            } catch (e) {
                console.log(e)
                reg_info = `Ошибка форматного контроля входных параметров ${e}`;
                reg_init.regError(idSm, docType, docCheckSum, 1, 1, docStateId, reg_info, null, null, null);
            }
        }
    }
    else {
        return xml({ responseClaim: [{ status: 1 }, { message: "Не определен формат передаваемых данных" }] });
    }

    // registration
    reg_init.regMessage(idSm, docType, docBody, docCheckSum, 0, 1, docStateId, docNumber, docId);

    // insert into Kafka or kafka_table
    logger.debug("kafkaHandler: Вызов ХП записи в таблицу-очередь сообщения");

    try {
        var sql = `SELECT ${config.SYSTEM.dbFunctions.imesToQueue} ($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
        await client.query(sql,
            [
                req.rawBody,
                { "data": { "message": req.body, idSm: idSm, prCreateChannel: prCreateChannel, "channels": { "channel": null, "orgList": [] }, "transactions": [], "violations": {} } },
                docCheckSum,
                checksum(req.rawBody),
                1,
                "ETRAN",
                0,
                reg_info,
                true
            ]
        );
        return xml({ responseClaim: [{ idSm: sm }, { status: 0 }, { message: "Ок" }] });
    } catch (e) {
        reg_info = `kafkaHandler. ошибка при вызову функции SELECT ${config.SYSTEM.dbFunctions.imesToQueue}`;
        reg_init.regError(idSm, docType, docCheckSum, 1, 1, docStateId, reg_info, sql, null, e);
        return xml({ responseClaim: [ { status: 1 }, { message: "Ошибка при записи сообщения в очередь" }] });
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////