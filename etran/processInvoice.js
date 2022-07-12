const xml = require('xml');                                 //для работы с XML
const logger = require('../config/logger');
const config = require(`../init_config`);

// Накладная
const opInvoice = require('./handleOpInvoice');
const { BaseInvoice } = require(`./dto/baseInvoice`);
const { InvoiceOp03 } = require('./dto/invoiceOp03.js')
const { InvoiceOp04 } = require('./dto/invoiceOp04.js')
const { InvoiceOp2004a } = require('./dto/invoiceOp2004a.js')
const { InvoiceOp2004r } = require('./dto/invoiceOp2004r.js')
const { InvoiceOp2005a } = require('./dto/invoiceOp2005a.js')
const { InvoiceOp2005r } = require('./dto/invoiceOp2005r.js')
const { InvoiceOp10 } = require('./dto/invoiceOp10.js')
const { InvoiceOp11 } = require('./dto/invoiceOp11.js')
const { InvoiceOp2111 } = require('./dto/invoiceOp2111.js')
const { InvoiceOp16 } = require('./dto/invoiceOp16.js')
const { InvoiceOp21a } = require('./dto/invoiceOp21a.js')
const { InvoiceOp21r } = require('./dto/invoiceOp21r.js')
const { InvoiceOp24 } = require('./dto/invoiceOp24.js')
const { InvoiceOp47 } = require('./dto/invoiceOp47.js')
const { InvoiceOp55 } = require('./dto/invoiceOp55.js')
const { InvoiceOp2155 } = require('./dto/invoiceOp2155.js')

const reg_init = require('../reg_init');

exports.processInvoice = async function (message) {

    if (!(typeof message.requestinvoice.invoice.invoicestateid === 'undefined')) {
        logger.debug(`Invoice: найден xmlCfg.claim_doc_route.invoicestateid=${message.requestinvoice.invoice.invoicestateid.$.value}`);
        logger.debug(`Invoice: значение idSm=${message.requestinvoice.idsm}`);
        var idSm = message.requestinvoice.idsm;
        try {
            var sql = `SELECT claim_number from ${config.SYSTEM.dbTables.bundleClaim} WHERE id_sm=($1)`;
            result = await client.query(sql, [idSm]);
        } catch (e) {
            reg_info = `Invoice: ошибка при чтении  ${config.SYSTEM.dbTables.bundleClaim} idSm=${idSm}`;
            reg_init.regError(idSm, 27, null, 1, 1, message.requestinvoice.invoice.invoicestateid.$.value, reg_info, sql, null, e);
            return { "status": 1, "message": reg_info };
        }

        if (result.rowCount !== 0) {
            if (!(typeof message.requestinvoice.invoice.invloadclaim_number === 'undefined')) {
                invoiceClaimNumberStr = message.requestinvoice.invoice.invloadclaim_number.$.value;
                let invoiceClaimNumberArray = invoiceClaimNumberStr.split('-');
                let invoiceClaimNumber = invoiceClaimNumberArray[0];
                if (result.rows[0].claim_number === invoiceClaimNumber) {
                    statusInvoice = 1;                                              // порожняя
                    switch (Number(message.requestinvoice.invoice.invoicestateid.$.value)) {
                        case 439:
                            invoice = new InvoiceOp03(req, xmlCfg, statusInvoice);
                            invoice.idSmInvoice = await getIdSmInvoice(invoice);
                            break;
                        case 31:
                            invoice = new InvoiceOp2004a(message, statusInvoice);
                            break;
                        case 440:
                            invoice = new InvoiceOp2004r(message, statusInvoice);
                            break;
                        case 1179: case 1116:
                            invoice = new InvoiceOp2005a(message, statusInvoice);
                            break;
                        case 872:
                            invoice = new InvoiceOp2005r(message, statusInvoice);
                            break;
                        case 35:
                            invoice = new InvoiceOp04(message, statusInvoice);
                            break;
                        case 38:
                            invoice = new InvoiceOp10(message, statusInvoice);
                            break;
                        case 42:
                            invoice = new InvoiceOp11(message, statusInvoice);
                            break;
                        case 44: case 117:
                            invoice = new InvoiceOp2111(message, statusInvoice);
                            break;
                        default:
                            reg_info = `Invoice: не найден handleOp для stateId=${message.requestinvoice.invoice.invoicestateid.$.value}`;
                            reg_init.regError(idSm, 27, null, 2, 1, message.requestinvoice.invoice.invoicestateid.$.value, reg_info, null, null, null);
                            return { "status": 1, "message": reg_info };
                    }
                }
                else {
                    reg_info = `Invoice: claim_number=${result.rows[0].claim_number} != invloadclaim_number=${invoiceClaimNumber}`;
                    reg_init.regError(idSm, 27, null, 2, 1, message.requestinvoice.invoice.invoicestateid.$.value, reg_info, null, null, null);
                    return { "status": 1, "message": reg_info };
                }
            }
            else if (!(typeof message.requestinvoice.invoice.invclaimnumber === 'undefined')) {
                invoiceClaimNumberStr = message.requestinvoice.invoice.invclaimnumber.$.value;
                let invoiceClaimNumberArray = invoiceClaimNumberStr.split('-');
                let invoiceClaimNumber = invoiceClaimNumberArray[0];
                if (result.rows[0].claim_number === invoiceClaimNumber) {
                    statusInvoice = 2;                                              // груженая
                    switch (Number(message.requestinvoice.invoice.invoicestateid.$.value)) {
                        case 31: case 429:
                            invoice = new InvoiceOp16(message, statusInvoice);
                            invoice.idSmInvoice = await getIdSmInvoice(invoice);
                            break;
                        case 1116: case 1179:
                            invoice = new InvoiceOp21a(message, statusInvoice);
                            break;
                        case 872:
                            invoice = new InvoiceOp21r(message, statusInvoice);
                            break;
                        case 35:
                            invoice = new InvoiceOp24(message, statusInvoice);
                            break;
                        case 38:
                            invoice = new InvoiceOp47(message, statusInvoice);
                            break;
                        case 42:
                            invoice = new InvoiceOp55(message, statusInvoice);
                            break;
                        case 44: case 117:
                            invoice = new InvoiceOp2155(message, statusInvoice);
                            break;
                        default:
                            reg_info = `Invoice: не найден handleOp для stateId=${message.requestinvoice.invoice.invoicestateid.$.value}`;
                            reg_init.regError(idSm, 27, null, 2, 1, message.requestinvoice.invoice.invoicestateid.$.value, reg_info, null, null, null);
                            return { "status": 1, "message": reg_info };
                    }
                }
                else {
                    reg_info = `Invoice: claim_number=${result.rows[0].claim_number} != invclaimnumber=${invoiceClaimNumber}`;
                    reg_init.regError(idSm, 27, null, 2, 1, message.requestinvoice.invoice.invoicestateid.$.value, reg_info, null, null, null);
                    return { "status": 1, "message": reg_info };
                }
            }
            else {
                reg_info = `Invoice. SQL_message: не найден message.requestinvoice.invoice.invloadclaim_number или message.requestinvoice.invoice.invclaimnumber`;
                reg_init.regError(idSm, 27, null, 2, 1, message.requestinvoice.invoice.invoicestateid.$.value, reg_info, null, null, null);
                return { "status": 1, "message": reg_info };
            }
        }
        else {
            reg_info = `Invoice. SQL_message: не найден claim_number по id_sm = ${idSm} в ${config.SYSTEM.dbTables.bundleClaim}`;
            reg_init.regError(idSm, 27, null, 2, 1, message.requestinvoice.invoice.invoicestateid.$.value, reg_info, sql, null, null);
            return { "status": 1, "message": reg_info };
        }
    }
    else {
        reg_info = `Invoice: не найден путь xmlCfg.claim_doc_route.invoicestateid`;
        reg_init.regError(idSm, 27, null, 2, 1, null, reg_info, null, null, null);
        return { "status": 1, "message": reg_info };
    }

    return await opInvoice.handleOpInvoice(invoice);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getIdSmInvoice(invoice) {
    try {
        logger.debug(`Invoice: определяем id_sm_invoice из ${config.SYSTEM.dbTables.etranInvoice} по ${invoice.invUnp} `);
        sql = `select id_sm_invoice from ${config.SYSTEM.dbTables.etranInvoice} where inv_unp = ($1)`
        result = await client.query(sql, [invoice.invUnp]);
        if (result.rowCount !== 0) {
            logger.debug(`Invoice: определен id_sm_invoice = ${result.rows[0].id_sm_invoice} из ${config.SYSTEM.dbTables.etranInvoice} по ${invoice.invUnp} `);
            let idSmInvoice = result.rows[0].id_sm_invoice;
            return idSmInvoice;
        }
        else {
            logger.debug(`Invoice: не определен idSmInvoice по ${invoice.invUnp}. Присвоен новый id_sm_invoice = ${invoice.idSmInvoice} `);
            return invoice.idSmInvoice;
        }
    } catch (e) {
        reg_info = `Invoice: ошибка при чтении таблицы ${config.SYSTEM.dbTables.etranInvoice} `;
        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 2, 1, invoice.invoiceStateID, reg_info, sql, null, e);
    }
}