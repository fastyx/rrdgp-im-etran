const xml = require('xml');                                 //для работы с XML
const logger = require('../config/logger');

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

exports.processInvoice = async function (req, res, client, config, xmlCfg) {

    if (!(typeof xmlCfg.invoice_doc_route.invoicestateid === 'undefined')) {
        logger.debug(`Invoice: найден xmlCfg.claim_doc_route.invoicestateid=${xmlCfg.invoice_doc_route.invoicestateid.$.value}`);
        logger.debug(`Invoice: значение idSm=${xmlCfg.invoice_root_route.idsm}`);
        var idSm = xmlCfg.invoice_root_route.idsm;
        try {
            var sql = `SELECT claim_number from ${config.SYSTEM.dbTables.bundleClaim} WHERE id_sm=($1)`;
            result = await client.query(sql, [idSm]);
        } catch (e) {
            reg_info = `Invoice: ошибка при чтении  ${config.SYSTEM.dbTables.bundleClaim} idSm=${idSm}`;
            reg_init.regError(idSm, 27, null, 1, 1, xmlCfg.invoice_doc_route.invoicestateid.$.value, reg_info, sql, null, e);
            return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });                                                              // +++ tests (send <invoice_31> Invoice: ошибка при чтении  ${config.SYSTEM.dbTables.bundleClaim}) +++
        }

        if (result.rowCount !== 0) {
            if (!(typeof xmlCfg.invoice_doc_route.invloadclaim_number === 'undefined')) {
                invoiceClaimNumberStr = xmlCfg.invoice_doc_route.invloadclaim_number.$.value;
                let invoiceClaimNumberArray = invoiceClaimNumberStr.split('-');
                let invoiceClaimNumber = invoiceClaimNumberArray[0];
                if (result.rows[0].claim_number === invoiceClaimNumber) {
                    statusInvoice = 1;                                              // порожняя
                    switch (Number(xmlCfg.invoice_doc_route.invoicestateid.$.value)) {
                        case 439:
                            invoice = new InvoiceOp03(req, xmlCfg, statusInvoice);
                            invoice.idSmInvoice = await getIdSmInvoice(config, client, invoice);
                            break;
                        case 31:
                            invoice = new InvoiceOp2004a(req, xmlCfg, statusInvoice);
                            break;
                        case 440:
                            invoice = new InvoiceOp2004r(req, xmlCfg, statusInvoice);
                            break;
                        case 1179: case 1116:
                            invoice = new InvoiceOp2005a(req, xmlCfg, statusInvoice);
                            break;
                        case 872:
                            invoice = new InvoiceOp2005r(req, xmlCfg, statusInvoice);
                            break;
                        case 35:
                            invoice = new InvoiceOp04(req, xmlCfg, statusInvoice);
                            break;
                        case 38:
                            invoice = new InvoiceOp10(req, xmlCfg, statusInvoice);
                            break;
                        case 42:
                            invoice = new InvoiceOp11(req, xmlCfg, statusInvoice);
                            break;
                        case 44: case 117:
                            invoice = new InvoiceOp2111(req, xmlCfg, statusInvoice);
                            break;
                        default:
                            reg_info = `Invoice: не найден handleOp для stateId=${xmlCfg.invoice_doc_route.invoicestateid.$.value}`;
                            reg_init.regError(idSm, 27, null, 2, 1, xmlCfg.invoice_doc_route.invoicestateid.$.value, reg_info, null, null, null);
                            return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });
                    }
                }
                else {
                    reg_info = `Invoice: claim_number=${result.rows[0].claim_number} != invloadclaim_number=${invoiceClaimNumber}`;
                    reg_init.regError(idSm, 27, null, 2, 1, xmlCfg.invoice_doc_route.invoicestateid.$.value, reg_info, null, null, null);
                    return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });
                }
            }
            else if (!(typeof xmlCfg.invoice_doc_route.invclaimnumber === 'undefined')) {
                invoiceClaimNumberStr = xmlCfg.invoice_doc_route.invclaimnumber.$.value;
                let invoiceClaimNumberArray = invoiceClaimNumberStr.split('-');
                let invoiceClaimNumber = invoiceClaimNumberArray[0];
                if (result.rows[0].claim_number === invoiceClaimNumber) {
                    statusInvoice = 2;                                              // груженая
                    switch (Number(xmlCfg.invoice_doc_route.invoicestateid.$.value)) {
                        case 31: case 429:
                            invoice = new InvoiceOp16(req, xmlCfg, statusInvoice);
                            invoice.idSmInvoice = await getIdSmInvoice(config, client, invoice);
                            break;
                        case 1116: case 1179:
                            invoice = new InvoiceOp21a(req, xmlCfg, statusInvoice);
                            break;
                        case 872:
                            invoice = new InvoiceOp21r(req, xmlCfg, statusInvoice);
                            break;
                        case 35:
                            invoice = new InvoiceOp24(req, xmlCfg, statusInvoice);
                            break;
                        case 38:
                            invoice = new InvoiceOp47(req, xmlCfg, statusInvoice);
                            break;
                        case 42:
                            invoice = new InvoiceOp55(req, xmlCfg, statusInvoice);
                            break;
                        case 44: case 117:
                            invoice = new InvoiceOp2155(req, xmlCfg, statusInvoice);
                            break;
                        default:
                            reg_info = `Invoice: не найден handleOp для stateId=${xmlCfg.invoice_doc_route.invoicestateid.$.value}`;
                            reg_init.regError(idSm, 27, null, 2, 1, xmlCfg.invoice_doc_route.invoicestateid.$.value, reg_info, null, null, null);
                            return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });
                    }
                }
                else {
                    reg_info = `Invoice: claim_number=${result.rows[0].claim_number} != invclaimnumber=${invoiceClaimNumber}`;
                    reg_init.regError(idSm, 27, null, 2, 1, xmlCfg.invoice_doc_route.invoicestateid.$.value, reg_info, null, null, null);
                    return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });      // +++ tests (send <invoice_31> Invoice: claim_number != invclaimnumber) +++
                }
            }
            else {
                reg_info = `Invoice. SQL_message: не найден xmlCfg.invoice_doc_route.invloadclaim_number или xmlCfg.invoice_doc_route.invclaimnumber`;
                reg_init.regError(idSm, 27, null, 2, 1, xmlCfg.invoice_doc_route.invoicestateid.$.value, reg_info, null, null, null);
                return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });          // +++ tests (Invoice. SQL_message: не найден xmlCfg.invoice_doc_route.invloadclaim_number или xmlCfg.invoice_doc_route.invclaimnumber) +++
            }
        }
        else {
            reg_info = `Invoice. SQL_message: не найден claim_number по id_sm = ${idSm} в ${config.SYSTEM.dbTables.bundleClaim}`;
            reg_init.regError(idSm, 27, null, 2, 1, xmlCfg.invoice_doc_route.invoicestateid.$.value, reg_info, sql, null, null);
            return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });      // +++ tests (`send <invoice_31> Invoice. SQL_message: не найден claim_number по id_sm`) +++
        }
    }
    else {
        reg_info = `Invoice: не найден путь xmlCfg.claim_doc_route.invoicestateid`;
        reg_init.regError(idSm, 27, null, 2, 1, null, reg_info, null, null, null);
        return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });      //+++ tests (send <invoice_31> Invoice: не найден путь xmlCfg.claim_doc_route.invoicestateid) +++
    }

    return await opInvoice.handleOpInvoice(req, res, client, config, xmlCfg, invoice);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getIdSmInvoice(config, client, invoice) {
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