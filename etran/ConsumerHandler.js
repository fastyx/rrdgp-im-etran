/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const xml = require('xml');
const logger = require('../config/logger');
const reg_init = require('../reg_init');

// ГУ-12
const { BaseClaim } = require('./dto/baseClaim.js')
// ГУ-27
const { BaseInvoice } = require('./dto/baseInvoice.js');
// ГУ-46
const { BaseGu46 } = require('./dto/baseGu46.js');
// ФДУ-92
const { BaseFdu92 } = require('./dto/baseFdu92.js');
// ГУ-2Б
const { BaseGu2b } = require('./dto/baseGu2b.js');
//ГУ-45
const { BaseGu45 } = require('./dto/baseGu45.js');

// Processes
const processClaim = require('./processClaim');
const processInvoice = require(`./processInvoice`);
const processDocument4692 = require(`./processDocument4692`);
const processDocument452B = require(`./processDocument452B`);

exports.consumerHandler = async function (req, res, client, config) {

    logger.debug(`BaseHandler: старт базового обработчика`);

    // Получение из конфига xml_config xml-заголовков входных документов
    var xmlCfg = require('../xml_config.js').getXmlConfig(req);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Передача claim (GU-12)
    if (!(xmlCfg.claim_root_route === null)) {

        logger.debug(`Claim: старт обработки запроса ГУ-12`);

        // Регистрация Начала
        claimBase = new BaseClaim(req, xmlCfg);
        reg_init.regMessage(claimBase.idSm, 12, req.rawBody, claimBase.checkSum, 1, 1, claimBase.claimStateID, claimBase.claimNumber, claimBase.claimId);

        resultProcess = await processClaim.processClaim(req, res, client, config, xmlCfg);

        // Регистрация Завершения
        reg_init.regMessage(claimBase.idSm, 12, null, claimBase.checkSum, 100, 1, claimBase.claimStateID, claimBase.claimNumber, claimBase.claimId);

        return resultProcess;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Передача invoice (ГУ-27)
    else if (!(xmlCfg.invoice_root_route === null)) {

        logger.debug(`Invoice: старт обработки запроса ГУ-27`);

        // Регистрация начала
        invoiceBase = new BaseInvoice(req, xmlCfg, res);
        reg_init.regMessage(invoiceBase.idSm, invoiceBase.docTypeId, req.rawBody, invoiceBase.checkSum, 1, 1, invoiceBase.invoiceStateID, invoiceBase.invNumber, invoiceBase.invoiceId);

        resultProcess = await processInvoice.processInvoice(req, res, client, config, xmlCfg);

        // Регистрация завершения
        reg_init.regMessage(invoiceBase.idSm, invoiceBase.docTypeId, null, invoiceBase.checkSum, 100, 1, invoiceBase.invoiceStateID, invoiceBase.invNumber, invoiceBase.invoiceId);

        return resultProcess;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Передача ГУ-46
    else if (!(xmlCfg.gu_46_doc_route === null)) {

        logger.debug(`Document: старт обработки документа ГУ-46`);

        // Регистрация начала
        gu46 = new BaseGu46(req, xmlCfg, res);
        reg_init.regMessage(gu46.idSm, gu46.docTypeId, req.rawBody, gu46.checkSum, 1, 1, gu46.stateTransaction, gu46.docNumber, gu46.docId);

        resultProcess = await processDocument4692.processDocument4692(req, res, client, config, xmlCfg, gu46);

        // Регистрация завершения
        reg_init.regMessage(gu46.idSm, gu46.docTypeId, null, gu46.checkSum, 100, 1, gu46.stateTransaction, gu46.docNumber, gu46.docId);

        return resultProcess;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Передача ФДУ-92
    else if (!(xmlCfg.fdu_92_doc_route === null)) {

        logger.debug(`Document: старт обработки документа ФДУ-92`);

        // Регистрация Начала
        fdu92 = new BaseFdu92(req, xmlCfg, res);
        reg_init.regMessage(fdu92.idSm, fdu92.docTypeId, req.rawBody, fdu92.checkSum, 1, 1, fdu92.stateTransaction, fdu92.docNumber, fdu92.docId);

        resultProcess = await processDocument4692.processDocument4692(req, res, client, config, xmlCfg, fdu92);

        // Регистрация завершения
        reg_init.regMessage(fdu92.idSm, fdu92.docTypeId, null, fdu92.checkSum, 100, 1, fdu92.stateTransaction, fdu92.docNumber, fdu92.docId);

        return resultProcess;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Передача ГУ-2б
    else if (!(xmlCfg.gu_2b_doc_route === null)) {

        logger.debug(`Document: старт обработки документа ГУ-2Б`);

        // Регистрация начала
        gu2b = new BaseGu2b(req, xmlCfg, res);   //Парсим данные по ГУ-2Б
        reg_init.regMessage(gu2b.idSm, gu2b.docTypeId, req.rawBody, gu2b.checkSum, 1, 1, gu2b.crgStateID, gu2b.docNumber, gu2b.docId);

        resultProcess = await processDocument452B.processDocument452B(req, res, client, config, xmlCfg, gu2b);

        // Регистрация завершения
        reg_init.regMessage(gu2b.idSm, gu2b.docTypeId, null, gu2b.checkSum, 100, 1, gu2b.crgStateID, gu2b.docNumber, gu2b.docId);

        return resultProcess;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Передача ГУ-45
    else if (!(xmlCfg.gu_45_doc_route === null)) {

        logger.debug(`Document: старт обработки документа ГУ-45`);

        // Регистрация начала
        gu45 = new BaseGu45(req, xmlCfg, res);
        reg_init.regMessage(gu45.idSm, gu45.docTypeId, req.rawBody, gu45.checkSum, 1, 1, gu45.docStateId, gu45.docNumber, gu45.docId);

        // Обработка документа
        resultProcess = await processDocument452B.processDocument452B(req, res, client, config, xmlCfg, gu45);

        // Регистрация завершения
        reg_init.regMessage(gu45.idSm, gu45.docTypeId, null, gu45.checkSum, 100, 1, gu45.docStateId, gu45.docNumber, gu45.docId);

        return resultProcess;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Тестового запроса для проверки работоспособности
    else if (!(xmlCfg.testcon_root_route === null)) {
        return xml({ responseClaim: [{ status: 0 }, { message: "IM_ETRAN: тестовый запрос прошел успешно" }, { version: `${config.MAIN.version}` }] });
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Передано что-то другое
    else {
        logger.debug("Info: Тип входных данных не определен");

        // Регистрация Начала
        reg_init.regMessage(null, null, req.rawBody, null, 1, 1, null, null, null);

        return xml({ responseClaim: [{ status: 1 }, { message: "Info: тип входных данных не определен" }] });
    }
}