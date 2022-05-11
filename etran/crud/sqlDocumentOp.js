const logger = require('../../config/logger');
const reg_init = require('../../reg_init');

exports.sqlDocumentOp = async function (document, client, config, idSm, response, resCarArray, cumDue) {

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //insert bundle_documents
    logger.debug(`Document. sqlDocumentOp: запись в ${config.SYSTEM.dbTables.bundleDocument}`);
    try {
        var sql = `SELECT id_sm_doc from ${config.SYSTEM.dbTables.bundleDocument} WHERE id_sm=($1) and doc_number=($2)`;
        result = await client.query(sql, [document.idSm, document.docNumber]);
        if (result.rowCount === 0) {
            try {
                var sql = `INSERT INTO ${config.SYSTEM.dbTables.bundleDocument} (
                    id_sm,
                    id_sm_dop,
                    id_sm_doc,
                    id_sm_car,
                    id_sm_cont,
                    doc_id,
                    doc_number
                ) 
                VALUES ($1,$2,$3,$4,$5,$6,$7)`
                await client.query(sql, [
                    idSm,                                   //1
                    '',                                     //2
                    document.idSmDoc,                       //3
                    null,                                   //4
                    null,                                   //5
                    document.docId,                         //6
                    document.docNumber                      //7

                ]);
            } catch (e) {
                reg_info = `Document. sqlDocumentOp: ошибка при INSERT в ${config.SYSTEM.dbTables.bundleDocument} idSm=${idSm}`;
                reg_init.regError(idSm, document.docTypeId, document.checkSum, 1, 1, document.stateTransaction, reg_info, sql, null, e);
            }
        }
    } catch (e) {
        reg_info = `Document. sqlDocumentOp: ошибка при SELECT из ${config.SYSTEM.dbTables.bundleDocument} idSm=${idSm}`;
        reg_init.regError(idSm, document.docTypeId, document.checkSum, 1, 1, document.stateTransaction, reg_info, sql, null, e);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //insert source_information
    logger.debug(`Document. sqlDocumentOp: запись в ${config.SYSTEM.dbTables.sourceInformation}`);
    try {
        var sql = `INSERT INTO ${config.SYSTEM.dbTables.sourceInformation} 
        (
            id_sm,
            id_sm_dop,
            op_date,
            state_id,
            check_sum,
            id_sm_invoice,
            document_type,
            document_data,
            document_number
        ) 
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
        await client.query(sql, [
            idSm,                       //1
            '',                         //2
            document.operDate,          //3
            document.stateTransaction,  //4
            document.checkSum,          //5
            null,                       //6
            document.docName,           //7
            document.inputDocument,     //8
            document.docNumber          //9
        ]);

    } catch (e) {
        // Проверка на 803 ~ 23505
        if (e.code !== 23505) {
            reg_info = `Document. sqlDocumentOp: ошибка при INSERT в ${config.SYSTEM.dbTables.sourceInformation} idSm=${idSm}`;
            reg_init.regError(idSm, document.docTypeId, document.checkSum, 1, 1, document.stateTransaction, reg_info, sql, null, e);
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // запись в violation_reg
    list = { condCheckList: response.data.data.condCheckList };
    list = JSON.stringify(list);
    logger.debug(`Document. sqlDocumentOp: вызов функции ${config.SYSTEM.dbFunctions.violationReg}. idSm=${response.data.data.sm.idSm}. condCheckList=${list}`);
    try {
        var sql_func = `SELECT ${config.SYSTEM.dbFunctions.violationReg} ($1,$2)`;
        res_func = await client.query(sql_func, [response.data.data.sm.idSm, list]);
        if (res_func.rows[0].violation_reg !== 0) {
            reg_info = `Document. sqlDocumentOp: RC ${config.SYSTEM.dbFunctions.violationReg} != 0. idSm=${response.data.data.sm.idSm}. condCheckList=${list}`;
            reg_init.regError(idSm, document.docTypeId, document.checkSum, 1, 1, document.stateTransaction, reg_info, sql_func, null, null);
        }
    } catch (e) {
        reg_info = `Document. sqlDocumentOp: ошибка при вызове функции ${config.SYSTEM.dbFunctions.violationReg} idSm=${response.data.data.sm.idSm}. condCheckList=${list}`;
        reg_init.regError(idSm, document.docTypeId, document.checkSum, 1, 1, document.stateTransaction, reg_info, sql_func, null, e);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // запись в dues
    if (document.stateTransaction === 177 || document.stateTransaction === 178) {

        dues = new Array();

        if (document.stateTransaction === 177) {
            logger.debug(`Document. sqlDocumentOp: запись в ${config.SYSTEM.dbTables.dues} документа ГУ-46`);
            due = {
                idSm: idSm,
                privateCollection: null,
                idSmDoc: document.idSmDoc,
                dueDocTypeId: document.docTypeId,
                dueDocId: document.docId,
                dueDocNumber: document.docNumber,
                dueTypeCode: document.dueTypeCode[0],
                idSmInvoice: null,
                invoiceID: null,
                invUNP: null,
                invNumber: null,
                idSmCar: null,
                carNumber: null,
                idSmCont: null,
                contNumber: null,
                dueAmount: document.dueAmount[0],
                createDt: null,
                createDtEpoch: null,
                updateDt: null,
                updateDtEpoch: null,
                dueRowNumber: null,
                dueInfo: null,
                payerOKPO: document.vpuPayerOKPO,
                recipOKPO: "00083262",
                invDueSign: null
            }
            dues.push(due);

            for (let i = 0; i < resCarArray.length; i++) {
                // пишем только те вагоны, у которых есть carDueAmount
                if (resCarArray[i].carDueAmount !== null) {
                    due = {
                        idSm: idSm,
                        privateCollection: null,
                        idSmDoc: document.idSmDoc,
                        dueDocTypeId: document.docTypeId,
                        dueDocId: document.docId,
                        dueDocNumber: document.docNumber,
                        dueTypeCode: -999,
                        idSmInvoice: null,
                        invoiceID: null,
                        invUNP: null,
                        invNumber: null,
                        idSmCar: resCarArray[i].idSmCar,
                        carNumber: resCarArray[i].carNumber,
                        idSmCont: null,
                        contNumber: null,
                        dueAmount: resCarArray[i].carDueAmount,
                        createDt: null,
                        createDtEpoch: null,
                        updateDt: null,
                        updateDtEpoch: null,
                        dueRowNumber: null,
                        dueInfo: null,
                        payerOKPO: document.vpuPayerOKPO,
                        recipOKPO: "00083262",
                        invDueSign: null
                    }
                    dues.push(due);
                }
            }
        }
        else if (document.stateTransaction === 178) {
            logger.debug(`Document. sqlDocumentOp: запись в ${config.SYSTEM.dbTables.dues} документа ФДУ-92`);
            for (let i = 0; i < cumDue.length; i++) {
                due = {
                    idSm: idSm,
                    privateCollection: null,
                    idSmDoc: document.idSmDoc,
                    dueDocTypeId: document.docTypeId,
                    dueDocId: document.docId,
                    dueDocNumber: document.docNumber,
                    dueTypeCode: cumDue[i].dueTypeCode,
                    idSmInvoice: null,
                    invoiceID: cumDue[i].invoiceID,
                    invUNP: null,
                    invNumber: cumDue[i].invNumber,
                    idSmCar: null,
                    carNumber: null,
                    idSmCont: null,
                    contNumber: null,
                    dueAmount: cumDue[i].dueAmount,
                    createDt: null,
                    createDtEpoch: null,
                    updateDt: null,
                    updateDtEpoch: null,
                    dueRowNumber: i,
                    dueInfo: cumDue[i].dueInfo,
                    payerOKPO: document.payerOKPO,
                    recipOKPO: "00083262",
                    invDueSign: null
                }
                dues.push(due);
            }
        }

        try {
            var sql_del = `DELETE FROM ${config.SYSTEM.dbTables.dues} where id_sm=($1) and due_doc_id=($2)`;
            await client.query(sql_del, [dues[0].idSm, dues[0].dueDocId]);

            for (let i = 0; i < dues.length; i++) {
                try {
                    var sql = `INSERT INTO ${config.SYSTEM.dbTables.dues} 
                    (
                        id_sm,
                        private_collection,
                        id_sm_doc,
                        due_doc_type_id, 
                        due_doc_id,
                        due_doc_number, 
                        due_type_code,
                        id_sm_invoice,
                        invoice_id,
                        inv_unp,
                        inv_number, 
                        id_sm_car,
                        car_number, 
                        id_sm_cont,
                        cont_number, 
                        due_amount,
                        create_dt,
                        create_dt_epoch,
                        update_dt,
                        update_dt_epoch,
                        due_row_number,
                        due_info,
                        payer_okpo, 
                        recip_okpo,
                        inv_due_sign 
                    ) 
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`;
                    await client.query(sql, [
                        dues[i].idSm,
                        dues[i].privateCollection,
                        dues[i].idSmDoc,
                        dues[i].dueDocTypeId,
                        dues[i].dueDocId,
                        dues[i].dueDocNumber,
                        dues[i].dueTypeCode,
                        dues[i].idSmInvoice,
                        dues[i].invoiceID,
                        dues[i].invUNP,
                        dues[i].invNumber,
                        dues[i].idSmCar,
                        dues[i].carNumber,
                        dues[i].idSmCont,
                        dues[i].contNumber,
                        dues[i].dueAmount,
                        dues[i].createDt,
                        dues[i].createDtEpoch,
                        dues[i].updateDt,
                        dues[i].updateDtEpoch,
                        dues[i].dueRowNumber,
                        dues[i].dueInfo,
                        dues[i].payerOKPO,
                        dues[i].recipOKPO,
                        dues[i].invDueSign
                    ]);

                } catch (e) {
                    reg_info = `Document. sqlDocumentOp: ошибка при INSERT в ${config.SYSTEM.dbTables.dues}`;
                    reg_init.regError(idSm, document.docTypeId, document.checkSum, 1, 1, document.stateTransaction, reg_info, sql, null, e);
                }
            }
        } catch (e) {
            reg_info = `Document. sqlDocumentOp: ошибка при DELETE ${config.SYSTEM.dbTables.dues}`;
            reg_init.regError(idSm, document.docTypeId, document.checkSum, 1, 1, document.stateTransaction, reg_info, sql, null, e);
        }
    }
}