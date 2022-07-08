const logger = require('../../config/logger');
const reg_init = require('../../reg_init');

const bundleHistory = require('../crud/models/bundle_history');

exports.sqlDocumentOp = async function (document, client, config, idSm, response, resCarArray, cumDue) {

    // запись в history, byndle_history
    try {
        var sql = `select * from  ${config.SYSTEM.dbTables.history} where check_sum = ($1);`
        result = await client.query(sql, [document.checkSum]);
        if (result.rowCount === 0) {
            // вставка в history
            try {
                var sql = `INSERT INTO ${config.SYSTEM.dbTables.history} 
                                        (
                                        state_id,
                                        date_op,
                                        stan_op,
                                        check_sum,
                                        empty_cargo_end_notification_dt,
                                        laden_cargo_end_notification_dt,
                                        sign_track_delivery_gu45_dt,
                                        reject_track_delivery_gu45_dt,
                                        empty_track_delivery_gu45_dt,
                                        sign_track_leave_gu45_dt,
                                        reject_track_leave_gu45_dt,
                                        laden_track_leave_gu45_dt,
                                        laden_track_delivery_gu45_dt,
                                        empty_track_leave_gu45_dt
                                        ) VALUES 
                                        ($1,
                                        $2,
                                        $3,
                                        $4,
                                        to_timestamp($5),
                                        to_timestamp($6),
                                        to_timestamp($7),
                                        to_timestamp($8),
                                        to_timestamp($9),
                                        to_timestamp($10),
                                        to_timestamp($11),
                                        to_timestamp($12),
                                        to_timestamp($13),
                                        to_timestamp($14)
                                        ) returning id_history`;
                sequence = await client.query(sql, [
                    document.stateTransaction,
                    document.operDate,
                    0,
                    document.checkSum,
                    document.epochEmptyCargoEndNotificationDt,
                    document.epochLadenCargoEndNotificationDt,
                    document.epochSignTrackDeliveryGu45Dt,
                    document.epochRejectTrackDeliveryGu45Dt,
                    document.epochEmptyTrackDeliveryGu45Dt,
                    document.epochSignTrackLeaveGu45Dt,
                    document.epochRejectTrackLeaveGu45Dt,
                    document.epochLadenTrackLeaveGu45Dt,
                    document.epochLadenTrackDeliveryGu45Dt,
                    document.epochEmptyTrackLeaveGu45Dt
                ]);
            } catch (e) {
                console.log(e)
                reg_info = `Document. sqlDocumentOp: ошибка при INSERT в ${config.SYSTEM.dbTables.history} idSm=${idSm}`;
                reg_init.regError(idSm, document.docTypeId, document.checkSum, 1, 1, document.stateTransaction, reg_info, sql, null, e);
            }

            // вставка в bundle_history
            try {

                await bundleHistory.insert(
                    sequence.rows[0].id_history,
                    document.idSm,
                    '00000000-0000-0000-0000-000000000000',
                    '00000000-0000-0000-0000-000000000000',
                    '00000000-0000-0000-0000-000000000000',
                    document.idSmDoc,
                    document.stateTransaction,
                    document.operDate,
                    null,
                    3
                );

                for (car of resCarArray) {
                    await bundleHistory.insert(
                        sequence.rows[0].id_history,
                        document.idSm,
                        car.idSmInvoice,
                        car.idSmCar,
                        '00000000-0000-0000-0000-000000000000',
                        document.idSmDoc,
                        document.stateTransaction,
                        document.operDate,
                        null,
                        3
                    );
                }
            } catch (e) {
                console.log(e)
                reg_info = `Document. sqlDocumentOp: ошибка при INSERT в ${config.SYSTEM.dbTables.bundleHistory} idSm=${idSm}`;
                reg_init.regError(idSm, document.docTypeId, document.checkSum, 1, 1, document.stateTransaction, reg_info, sql, null, e);
            }

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
                    id_sm_doc,
                    id_sm_invoice,
                    id_sm_car,
                    id_sm_cont,
                    pr_doc,
                    pr_link,
                    doc_id,
                    doc_number
                ) 
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`
                        await client.query(sql, [
                            idSm,                                   //1
                            document.idSmDoc,                       //3
                            null,
                            null,                                   //4
                            null,                                   //5
                            0,
                            0,
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
            op_date, 
            state_id, 
            check_sum,  
            id_sm_invoice, 
            id_history,
            id_sm_doc,
            document_type, 
            cancellation,
            document_data,
            document_number,
            document_state_id,
            document_state,
            category,
            category_name,
            adj_sys_id,    
            dop_check_sum
            ) VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12,$13,$14,$15,$16,$17)`;
                await client.query(sql, [
                    idSm,                       //1
                    document.operDate,          //3
                    document.stateTransaction,  //4
                    document.checkSum,          //5
                    null,                       //6
                    sequence.rows[0].id_history,
                    document.idSmDoc,
                    document.docTypeId,
                    null,
                    document.inputDocument,     //8
                    document.docNumber,          //9
                    document.docTypeId,
                    null,
                    null,
                    null,
                    null,
                    null
                ]);

            } catch (e) {
                // Проверка на 803 ~ 23505
                if (e.code !== 23505) {
                    reg_info = `Document. sqlDocumentOp: ошибка при INSERT в ${config.SYSTEM.dbTables.sourceInformation} idSm=${idSm}`;
                    reg_init.regError(idSm, document.docTypeId, document.checkSum, 1, 1, document.stateTransaction, reg_info, sql, null, e);
                }
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
    } catch (e) {
        console.log(e)
        reg_info = `Document. sqlDocumentOp: ошибка при SELECT из ${config.SYSTEM.dbTables.history} idSm=${idSm}`;
        reg_init.regError(idSm, document.docTypeId, document.checkSum, 1, 1, document.stateTransaction, reg_info, sql, null, e);
    }
}