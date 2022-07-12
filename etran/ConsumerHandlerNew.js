/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const logger = require('../config/logger');
const reg_init = require('../reg_init');
const config = require(`../init_config`);

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

exports.consumerHandlerNew = async function (message) {

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Передача claim (GU-12)
    if (message.hasOwnProperty(`requestclaim`)) {

        // Регистрация Начала
        claimBase = new BaseClaim(message);
        reg_init.regMessage(claimBase.idSm, 12, message, claimBase.checkSum, 1, 1, claimBase.claimStateID, claimBase.claimNumber, claimBase.claimId);

        resultProcess = await processClaim.processClaim(message);

        // Регистрация Завершения
        reg_init.regMessage(claimBase.idSm, 12, null, claimBase.checkSum, 100, 1, claimBase.claimStateID, claimBase.claimNumber, claimBase.claimId);

        return resultProcess;
    }
    else if (message.hasOwnProperty('requestinvoice')) {

        //console.log(message.requestinvoice.invoice)

        // Регистрация начала
        invoiceBase = new BaseInvoice(message, null);
        reg_init.regMessage(invoiceBase.idSm, invoiceBase.docTypeId, message, invoiceBase.checkSum, 1, 1, invoiceBase.invoiceStateID, invoiceBase.invNumber, invoiceBase.invoiceId);

        resultProcess = await processInvoice.processInvoice(message);

        // Регистрация завершения
        reg_init.regMessage(invoiceBase.idSm, invoiceBase.docTypeId, null, invoiceBase.checkSum, 100, 1, invoiceBase.invoiceStateID, invoiceBase.invNumber, invoiceBase.invoiceId);

        return resultProcess;
    }
    else if (message.hasOwnProperty('requestnotification')) {
        if (message.requestnotification.hasOwnProperty('vpu')) {
            console.log(`gu-46`)

            // Регистрация начала
            gu46 = new BaseGu46(message);
            reg_init.regMessage(gu46.idSm, gu46.docTypeId, message, gu46.checkSum, 1, 1, gu46.stateTransaction, gu46.docNumber, gu46.docId);

            resultProcess = await processDocument4692.processDocument4692(gu46);

            // Регистрация завершения
            reg_init.regMessage(gu46.idSm, gu46.docTypeId, null, gu46.checkSum, 100, 1, gu46.stateTransaction, gu46.docNumber, gu46.docId);

            return resultProcess;
        }
        else if (message.requestnotification.hasOwnProperty('cum')) {
            console.log(`fdu-92`)

            // Регистрация Начала
            fdu92 = new BaseFdu92(message);
            reg_init.regMessage(fdu92.idSm, fdu92.docTypeId, message, fdu92.checkSum, 1, 1, fdu92.stateTransaction, fdu92.docNumber, fdu92.docId);

            resultProcess = await processDocument4692.processDocument4692(fdu92);

            // Регистрация завершения
            reg_init.regMessage(fdu92.idSm, fdu92.docTypeId, null, fdu92.checkSum, 100, 1, fdu92.stateTransaction, fdu92.docNumber, fdu92.docId);

            return resultProcess;
        }
        else if (message.requestnotification.hasOwnProperty('notificationgu2b')) {

            // Регистрация начала
            gu2b = new BaseGu2b(message);
            reg_init.regMessage(gu2b.idSm, gu2b.docTypeId, message, gu2b.checkSum, 1, 1, gu2b.crgStateID, gu2b.docNumber, gu2b.docId);

            resultProcess = await processDocument452B.processDocument452B(message, gu2b);

            // Регистрация завершения
            reg_init.regMessage(gu2b.idSm, gu2b.docTypeId, null, gu2b.checkSum, 100, 1, gu2b.crgStateID, gu2b.docNumber, gu2b.docId);

            return resultProcess;
        }
        else if (message.requestnotification.hasOwnProperty('pps')) {
            console.log(`gu-45`)

            // Регистрация начала
            gu45 = new BaseGu45(message);
            reg_init.regMessage(gu45.idSm, gu45.docTypeId, message, gu45.checkSum, 1, 1, gu45.docStateId, gu45.docNumber, gu45.docId);

            // Обработка документа
            resultProcess = await processDocument452B.processDocument452B(message, gu45);

            // Регистрация завершения
            reg_init.regMessage(gu45.idSm, gu45.docTypeId, null, gu45.checkSum, 100, 1, gu45.docStateId, gu45.docNumber, gu45.docId);

            return resultProcess;
        }
    }

    return { "status": 1 };
}