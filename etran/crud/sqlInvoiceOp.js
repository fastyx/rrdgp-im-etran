const logger = require('../../config/logger');
const reg_init = require('../../reg_init');

exports.sqlInvoiceOp = async function (invoice, client, config, response) {

    // delete insert etran_invoice
    try {
        var sql = `DELETE FROM ${config.SYSTEM.dbTables.etranInvoice} where id_sm=($1) and id_sm_invoice=($2)`;
        await client.query(sql, [invoice.idSm, invoice.idSmInvoice]);
        try {
            var sql = `INSERT INTO ${config.SYSTEM.dbTables.etranInvoice} 
                        (
                        id_sm,
                        id_sm_invoice,
                        inv_unp,
                        inv_number,
                        send_kind_name,
                        inv_from_station_code,
                        inv_to_station_code,   
                        car_type_name,
                        status_invoice,
                        freight_weight,
                        invoice_state_id,
                        invoice_state,
                        inv_last_oper_date
                        ) VALUES 
                        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`;
            await client.query(sql, [
                invoice.idSm,                   //1
                invoice.idSmInvoice,            //2
                invoice.invUnp,                 //3
                invoice.invNumber,              //4
                invoice.invSendKindName,        //5
                invoice.invFromStationCode,     //6
                invoice.invToStationCode,       //7
                invoice.invPlanCarTypeName,     //8
                invoice.statusInvoice,          //9              
                invoice.invFreightWeightSum,    //10
                invoice.invoiceStateID,         //11
                invoice.invoiceState,           //12       
                invoice.invLastOperDate         //13
            ]);
        } catch (e) {
            reg_info = `Invoice. sqlInvoiceOp: ошибка при INSERT ${config.SYSTEM.dbTables.etranInvoice} idSm=${invoice.idSm} idSmInvoice=${invoice.idSmInvoice}`;
            reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);

        }
    } catch (e) {
        reg_info = `Invoice. sqlInvoiceOp: ошибка при DELETE ${config.SYSTEM.dbTables.etranInvoice} idSm=${invoice.idSm} idSmInvoice=${invoice.idSmInvoice}`;
        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
    }

    //insert source_information
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
            invoice.idSm,
            invoice.operDate,
            invoice.stateTransaction,
            invoice.checkSum,
            invoice.idSmInvoice,
            123456789,
            null,
            'GU27',
            null,
            invoice.inputDocument,
            invoice.invNumber,
            invoice.invoiceStateID,
            invoice.invoiceState,
            null,
            null,
            null,
            null
        ]);
    } catch (e) {
        // Проверка на 803 ~ 23505
        if (e.code !== 23505) {
            reg_info = `Invoice. sqlInvoiceOp: ошибка при INSERT в ${config.SYSTEM.dbTables.sourceInformation} idSm=${invoice.idSm}`;
            reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
        }
    }

    // select insert tracking bundle_invoice (+ отреинжинированно)
    try {
        var sql = `SELECT id_sm_invoice from ${config.SYSTEM.dbTables.bundleInvoice} WHERE id_sm=($1) and inv_unp=($2)`;
        result = await client.query(sql, [invoice.idSm, invoice.invUnp]);
        if (result.rowCount === 0) {
            try {
                var sql = `INSERT INTO ${config.SYSTEM.dbTables.bundleInvoice} 
                (
                id_sm,
                id_sm_invoice,
                inv_number,
                inv_unp
                ) VALUES 
                ($1, $2, $3, $4)`;
                await client.query(sql, [
                    invoice.idSm,           //1
                    invoice.idSmInvoice,    //3
                    invoice.invNumber,      //3
                    invoice.invUnp          //4
                ]);

                try {
                    var sql = `SELECT ${config.SYSTEM.dbFunctions.editTracking} ($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
                    result = await client.query(sql, [invoice.idSm, '', invoice.invUnp, null, '', null, '', invoice.idSmInvoice, invoice.operDate]);
                    if (result.rows[0].edit_tracking !== 0) {
                        reg_info = `Накладная ${invoice.invUnp} не на слежении. RC=${result.rows[0].edit_tracking}. idSm=${invoice.idSm}`;
                        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 2, 1, invoice.invoiceStateID, reg_info, sql, null, null);
                    }
                } catch (e) {
                    reg_info = `Invoice. sqlInvoiceOp: ошибка при SELECT ${config.SYSTEM.dbFunctions.editTracking} idSm=${invoice.idSm} invUnp=${invoice.invUnp}`;
                    reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
                }
            } catch (e) {
                reg_info = `Invoice. sqlInvoiceOp: ошибка при INSERT в ${config.SYSTEM.dbTables.bundleInvoice} idSm=${invoice.idSm} invUnp=${invoice.invUnp}`;
                reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
            }
        }
    } catch (e) {
        reg_info = `Invoice. sqlInvoiceOp: ошибка при SELECT в ${config.SYSTEM.dbTables.bundleInvoice} idSm=${invoice.idSm} invUnp=${invoice.invUnp}`;
        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
    }

    // select insert tracking bundle_car
    for (let i = 0; i < invoice.car.length; i++) {
        if (invoice.car[i].carNumber !== null) {
            try {
                var sql = `SELECT * from ${config.SYSTEM.dbTables.bundleCar} WHERE id_sm=($1) and car_number=($2) and id_sm_invoice=($3)`;
                result = await client.query(sql, [invoice.idSm, invoice.car[i].carNumber, invoice.idSmInvoice]);
                if (result.rowCount === 0) {
                    try {
                        var sql = `INSERT INTO ${config.SYSTEM.dbTables.bundleCar} 
                        (
                        id_sm,
                        id_sm_invoice,
                        id_sm_doc,
                        id_sm_car,
                        car_number,
                        pr_link
                        ) VALUES 
                        ($1, $2, $3, $4, $5, $6)`;
                        await client.query(sql, [
                            invoice.idSm,
                            invoice.idSmInvoice,
                            null,
                            invoice.car[i].idSmCar,
                            invoice.car[i].carNumber,
                            18
                        ]);
                    } catch (e) {
                        reg_info = `Invoice. sqlInvoiceOp: ошибка при INSERT ${config.SYSTEM.dbTables.bundleCar} carNumber=${invoice.car[i].carNumber}`;
                        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
                    }

                    try {
                        var sql = `SELECT ${config.SYSTEM.dbFunctions.editTracking} ($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
                        result = await client.query(sql, [invoice.idSm, '', '', null, invoice.car[i].carNumber, null, '', invoice.idSmInvoice, invoice.operDate]);
                        if (result.rows[0].edit_tracking !== 0) {
                            reg_info = `Вагон ${invoice.car[i].carNumber} не на слежении. RC=${result.rows[0].edit_tracking}. idSm=${invoice.idSm}. idSmInvoice=${invoice.idSmInvoice}`;
                            reg_init.regError(invoice.idSm, 27, invoice.checkSum, 2, 1, invoice.invoiceStateID, reg_info, sql, null, null);
                        }
                    } catch (e) {
                        reg_info = `Invoice. sqlInvoiceOp: ошибка при SELECT ${config.SYSTEM.dbFunctions.editTracking} idSm=${invoice.idSm} carNumber=${invoice.car[i].carNumber} idSmInvoice=${invoice.idSmInvoice}`;
                        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
                    }

                    // insert rrdgp_car
                    try {
                        var sql = `INSERT INTO ${config.SYSTEM.dbTables.rrdgpCar}
                            (
                            id_sm,
                            id_sm_car,
                            car_number,
                            train_index,
                            train_number,
                            stan_op
                            ) VALUES 
                            ($1, $2, $3, $4, $5, $6)`;
                        await client.query(sql, [
                            invoice.idSm,                       //1
                            invoice.car[i].idSmCar,                 //2
                            invoice.car[i].carNumber,               //3
                            null,                               //6
                            null,                               //7
                            null
                        ]);
                    } catch (e) {
                        reg_info = `Invoice. sqlInvoiceOp: ошибка при INSERT ${config.SYSTEM.dbTables.rrdgpCar} idSm=${invoice.idSm} carNumber=${invoice.car[i].carNumber}`;
                        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
                    }
                }
            } catch (e) {
                reg_info = `Invoice. sqlInvoiceOp: ошибка при SELECT ${config.SYSTEM.dbTables.bundleCar} idSm=${invoice.idSm} carNumber=${invoice.car[i].carNumber}`;
                reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
            }

            // Снятее со слежения. Вызов remove_tracking
            if (invoice.transaction == 'handleOp11') {
                try {
                    logger.info(`Invoice. sqlInvoiceOp: вызов функции ${config.SYSTEM.dbFunctions.removeTracking} p1=${invoice.idSm}, p2=${invoice.car[i].idSmCar}, p3=${invoice.car[i].carNumber}, p4=${invoice.invDateDelivery}`);

                    var sql_func = `SELECT ${config.SYSTEM.dbFunctions.removeTracking} ($1,$2,$3,$4)`;
                    res_func = await client.query(sql_func, [invoice.idSm, invoice.car[i].idSmCar, invoice.car[i].carNumber, invoice.invDateDelivery]);
                    if (res_func.rows[0].remove_tracking !== 0 && res_func.rows[0].remove_tracking !== 4) {
                        reg_info = `Invoice. sqlInvoiceOp: вагон carNumber=${invoice.car[i].carNumber} idSmCar=${invoice.car[i].idSmCar} не снят со слежения. RC=${res_func.rows[0].remove_tracking}`;
                        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 2, 1, invoice.invoiceStateID, reg_info, sql_func, null, null);
                    }
                } catch (e) {
                    reg_info = `Invoice. sqlInvoiceOp: ошибка при вызове функции ${config.SYSTEM.dbFunctions.removeTracking} p1=${invoice.idSm}, p2=${invoice.car[i].idSmCar}, p3=${invoice.car[i].carNumber}, p4=${invoice.invDateDelivery}`;
                    reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql_func, null, e);
                }
            }
        }
    }

    // select insert tracking bundle_cont
    for (let i = 0; i < invoice.car.length; i++) {
        for (let j = 0; j < invoice.car[i].conts.length; j++) {
            try {
                var sql = `SELECT id_sm_cont from ${config.SYSTEM.dbTables.bundleCont} WHERE id_sm=($1) and cont_number=($2) and id_sm_invoice=($3)`;
                result = await client.query(sql, [invoice.idSm, invoice.car[i].conts[j].contNumber, invoice.idSmInvoice]);
                if (result.rowCount === 0) {
                    try {
                        var sql = `INSERT INTO ${config.SYSTEM.dbTables.bundleCont} 
                        (
                        id_sm,
                        id_sm_invoice,
                        id_sm_car,  
                        id_sm_cont,
                        cont_number
                        ) VALUES 
                        ($1, $2, $3, $4, $5)`;
                        await client.query(sql, [
                            invoice.idSm,                           //1
                            invoice.idSmInvoice,                    //3
                            invoice.car[i].idSmCar,                 //4
                            invoice.car[i].conts[j].idSmCont,       //5
                            invoice.car[i].conts[j].contNumber      //6 
                        ]);
                    } catch (e) {
                        reg_info = `Invoice. sqlInvoiceOp: ошибка при INSERT ${config.SYSTEM.dbTables.bundleCont} contNumber=${invoice.car[i].conts[j].contNumber}`;
                        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
                    }

                    try {
                        var sql = `SELECT ${config.SYSTEM.dbFunctions.editTracking} ($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
                        result = await client.query(sql, [invoice.idSm, '', '', null, '', null, invoice.car[i].conts[j].contNumber, invoice.idSmInvoice, invoice.operDate]);
                        if (result.rows[0].edit_tracking !== 0) {
                            reg_info = `Контейнер ${invoice.car[i].conts[j].contNumber} не на слежении. RC=${result.rows[0].edit_tracking}. idSm=${invoice.idSm}`;
                            reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, null);
                        }

                    } catch (e) {
                        reg_info = `Invoice. sqlInvoiceOp: ошибка при SELECT ${config.SYSTEM.dbFunctions.editTracking} idSm=${invoice.idSm} contNumber=${invoice.car[i].conts[j].contNumber}`;
                        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
                    }

                    // rrdgp_cont
                    try {
                        var sql = `INSERT INTO ${config.SYSTEM.dbTables.rrdgpCont}
                                (
                                id_sm,
                                id_sm_cont,
                                cont_number
                                ) VALUES 
                                ($1, $2, $3)`;
                        await client.query(sql, [
                            invoice.idSm,                                       //1
                            invoice.car[i].conts[j].idSmCont,                   //2
                            invoice.car[i].conts[j].contNumber                  //3
                        ]);
                    } catch (e) {
                        reg_info = `Invoice. sqlInvoiceOp: ошибка при INSERT ${config.SYSTEM.dbTables.rrdgpCont} idSm=${invoice.idSm} contNumber=${invoice.car[i].conts[j].contNumber}`;
                        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
                    }
                }
            } catch (e) {
                reg_info = `Invoice. sqlInvoiceOp: ошибка при SELECT ${config.SYSTEM.dbTables.bundleCont} idSm=${invoice.idSm} contNumber=${invoice.car[i].conts[j].contNumber}`;
                reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
            }
        }
    }

    // запись в violation_reg
    list = { condCheckList: response.data.data.condCheckList };
    list = JSON.stringify(list);
    logger.debug(`Invoice. sqlInvoiceOp: вызов функции ${config.SYSTEM.dbFunctions.violationReg}. idSm=${response.data.data.sm.idSm}. condCheckList=${list}`);
    try {
        var sql_func = `SELECT ${config.SYSTEM.dbFunctions.violationReg} ($1,$2)`;
        res_func = await client.query(sql_func, [response.data.data.sm.idSm, list]);
        if (res_func.rows[0].violation_reg !== 0) {
            reg_info = `Invoice. sqlInvoiceOp: RC ${config.SYSTEM.dbFunctions.violationReg} != 0. idSm=${response.data.data.sm.idSm}. condCheckList=${list}`;
            reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, null);
        }
    } catch (e) {
        reg_info = `Invoice. sqlInvoiceOp: ошибка при вызове функции ${config.SYSTEM.dbFunctions.violationReg} idSm=${response.data.data.sm.idSm}. condCheckList=${list}`;
        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
    }


    //Запись в role_org 
    if (invoice.transaction === 'handleOp16' || invoice.transaction === 'handleOp3') {
        await selectInsertFromRoleOrg(config, client, invoice.invSenderId, 'sender', invoice.idSm, invoice.idSmInvoice);
        await selectInsertFromRoleOrg(config, client, invoice.invRecipId, 'recip', invoice.idSm, invoice.idSmInvoice);
        await selectInsertFromRoleOrg(config, client, invoice.invPayerId, 'payer', invoice.idSm, invoice.idSmInvoice);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // запись в dues
    if ((invoice.stateTransaction === 4 || invoice.stateTransaction === 11 || invoice.stateTransaction === 24 || invoice.stateTransaction === 55) && invoice.invDue.length !== 0) {
        logger.debug(`Invoice. sqlInvoiceOp: запись в ${config.SYSTEM.dbTables.dues} документа ГУ-27`);

        dues = new Array();
        dues = await duesGen(invoice.invDue, invoice, dues);                    // генерация массива invDue
        dues = await duesGen(invoice.invDueArrive, invoice, dues);              // генерация массива invDueArrive
        dues = await duesGen(invoice.invDueEnter, invoice, dues);               // генерация массива invDueEnter

        try {
            var sql_del = `DELETE FROM ${config.SYSTEM.dbTables.dues} where id_sm=($1) and id_sm_invoice=($2)`;
            await client.query(sql_del, [dues[0].idSm, dues[0].idSmInvoice]);

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
                    reg_info = `Invoice. sqlInvoiceOp: ошибка при INSERT в ${config.SYSTEM.dbTables.dues}`;
                    reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
                }
            }
        } catch (e) {
            reg_info = `Invoice. sqlInvoiceOp: ошибка при DELETE ${config.SYSTEM.dbTables.dues}`;
            reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql_del, null, e);
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Снятие со слежения контейнеров (пока только delet из таблиц), отсутствующих в очередной накладной
    try {
        var sql = `SELECT * from ${config.SYSTEM.dbTables.bundleCont} WHERE id_sm=($1) and id_sm_invoice=($2)`;
        result = await client.query(sql, [invoice.idSm, invoice.idSmInvoice]);
        if (result.rowCount !== 0) {
            for (var res of result.rows) {
                const contObj = invoice.cont.find(c => c.contNumber === res.cont_number);
                if (!contObj) {
                    try {
                        var sql = `DELETE from ${config.SYSTEM.dbTables.bundleCont} WHERE id_sm=($1) and id_sm_invoice=($2) and id_sm_cont=($3)`;
                        await client.query(sql, [invoice.idSm, invoice.idSmInvoice, res.id_sm_cont]);
                        var sql = `DELETE from ${config.SYSTEM.dbTables.rrdgpCont} WHERE id_sm=($1)  and id_sm_cont=($2)`;
                        await client.query(sql, [invoice.idSm, res.id_sm_cont]);
                    } catch (e) {
                        reg_info = `Invoice. sqlInvoiceOp: ошибка при удалении из ${config.SYSTEM.dbTables.bundleCont} и ${config.SYSTEM.dbTables.rrdgpCont}`;
                        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
                    }
                }
            }
        }
    } catch (e) {
        reg_info = `Invoice. sqlInvoiceOp: ошибка при SELECT ${config.SYSTEM.dbTables.bundleCar} `;
        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Снятие со слежения вагонов, отсутствующих в очередной накладной
    try {
        var sql = `SELECT * from ${config.SYSTEM.dbTables.bundleCar} WHERE id_sm=($1) and id_sm_invoice=($2)`;
        result = await client.query(sql, [invoice.idSm, invoice.idSmInvoice]);
        if (result.rowCount !== 0) {
            for (var res of result.rows) {
                const carObj = invoice.car.find(c => c.carNumber === res.car_number);
                if (!carObj) {
                    try {
                        var sql = `DELETE from ${config.SYSTEM.dbTables.bundleCar} WHERE id_sm=($1) and id_sm_invoice=($2) and car_number=($3)`;
                        await client.query(sql, [invoice.idSm, invoice.idSmInvoice, res.car_number]);
                        var sql = `DELETE from ${config.SYSTEM.dbTables.rrdgpCar} WHERE id_sm=($1) and id_sm_car=($2) and car_number=($3)`;
                        await client.query(sql, [invoice.idSm, res.id_sm_car, res.car_number]);
                        try {
                            logger.debug(`Invoice. sqlInvoiceOp: вызов функции ${config.SYSTEM.dbFunctions.removeTracking} p1=${invoice.idSm}, p2=${res.id_sm_car}, p3=${res.car_number}, p4=${invoice.operDate}`);
                            var sql_func = `SELECT ${config.SYSTEM.dbFunctions.removeTracking} ($1,$2,$3,$4)`;
                            res_func = await client.query(sql_func, [invoice.idSm, res.id_sm_car, res.car_number, invoice.invDateDelivery]);
                            if (res_func.rows[0].remove_tracking !== 0 && res_func.rows[0].remove_tracking !== 4) {
                                reg_info = `Invoice. sqlInvoiceOp: вагон carNumber=${res.car_number} idSmCar=${res.id_sm_car} не снят со слежения. RC=${res_func.rows[0].remove_tracking}`;
                                reg_init.regError(invoice.idSm, 27, invoice.checkSum, 2, 1, invoice.invoiceStateID, reg_info, sql_func, null, null);
                            }

                        } catch (e) {
                            reg_info = `Invoice. sqlInvoiceOp: ошибка при вызове функции ${config.SYSTEM.dbFunctions.removeTracking} p1=${invoice.idSm}, p2=${res.id_sm_car}, p3=${res.car_number}, p4=${invoice.invDateDelivery}`;
                            reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql_func, null, e);
                        }
                    } catch (e) {
                        reg_info = `Invoice. sqlInvoiceOp: ошибка при удалении из ${config.SYSTEM.dbTables.bundleCar} и ${config.SYSTEM.dbTables.bundleCont}`;
                        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
                    }
                }
            }
        }
    } catch (e) {
        reg_info = `Invoice. sqlInvoiceOp: ошибка при SELECT ${config.SYSTEM.dbTables.bundleCar} `;
        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
    }
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// функция вставки в role_org
async function insertIntoRoleOrg(config, client, id_org, role_id, id_sm, id_sm_invoice) {
    try {
        logger.debug(`Invoice.sqlInvoiceOp. Пишем в role_org по ${role_id}`);
        var sql = `INSERT INTO ${config.SYSTEM.dbTables.roleOrg} 
        (
            id_org,
            role_id,
            id_sm,
            id_sm_invoice
        ) VALUES 
        ($1,$2,$3,$4)`;
        await client.query(sql, [
            id_org,                         //1
            role_id,                        //2
            id_sm,                          //3
            id_sm_invoice                   //4
        ]);
    } catch (e) {
        reg_info = `Invoice. sqlInvoiceOp: ошибка при записи в ${config.SYSTEM.dbTables.roleOrg} по ${role_id}`;
        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
    }
}

// функция чтения в role_org
async function selectInsertFromRoleOrg(config, client, id_org, role_id, id_sm, id_sm_invoice) {
    try {
        logger.debug(`Invoice. sqlInvoiceOp. Читаем role_org по ${role_id}`);
        var sql = `SELECT id_sm,id_org FROM ${config.SYSTEM.dbTables.roleOrg} where id_sm=($1) and id_org=($2)`;
        result = await client.query(sql, [id_sm, id_org]);
        if (result.rowCount === 0) {
            await insertIntoRoleOrg(config, client, id_org, role_id, id_sm, id_sm_invoice);
        }
    } catch (e) {
        reg_info = `Invoice. sqlInvoiceOp: ошибка при чтении ${config.SYSTEM.dbTables.roleOrg} по ${role_id}`;
        reg_init.regError(invoice.idSm, 27, invoice.checkSum, 1, 1, invoice.invoiceStateID, reg_info, sql, null, e);
    }
}

// функция наработки массива dues
async function duesGen(due, invoice, dues) {

    for (let i = 0; i < due.length; i++) {
        if (due[i].dueCarNumber !== null) {
            const carObj = invoice.car.find(c => c.carNumber === due[i].dueCarNumber);
            if (carObj) { due[i].dueIdSmCar = carObj.idSmCar; }
        }
        if (due.dueContNumber !== null) {
            const contObj = invoice.cont.find(c => c.contNumber === due[i].dueContNumber);
            if (contObj) { due[i].dueIdSmCont = contObj.idSmCont; }
        }
        dueObj = {
            idSm: invoice.idSm,
            privateCollection: null,
            idSmDoc: null,
            dueDocTypeId: 18,
            dueDocId: null,
            dueDocNumber: null,
            dueTypeCode: due[i].dueTypeId,
            idSmInvoice: invoice.idSmInvoice,
            invoiceID: invoice.invoiceId,
            invUNP: invoice.invUnp,
            invNumber: invoice.invNumber,
            idSmCar: due[i].dueIdSmCar,
            carNumber: due[i].dueCarNumber,
            idSmCont: due[i].dueIdSmCont,
            contNumber: due[i].dueContNumber,
            dueAmount: due[i].dueAmount,
            createDt: null,
            createDtEpoch: null,
            updateDt: null,
            updateDtEpoch: null,
            dueRowNumber: null,
            dueInfo: null,
            payerOKPO: invoice.invPayerId,
            recipOKPO: "00083262",
            invDueSign: due[i].invDueSign
        }

        dues.push(dueObj);
    }

    return dues;
}