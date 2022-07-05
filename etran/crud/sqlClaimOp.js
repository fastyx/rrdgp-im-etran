const logger = require('../../config/logger');
const reg_init = require('../../reg_init');

const bundleHistory = require('../crud/models/bundle_history');

exports.sqlClaimOp = async function (claim, client, config, response) {

    //let sequence = await client.query(`SELECT currval(pg_get_serial_sequence('rrd.history','id_history'))`);

    // Вставка в history и bundle_history
    try {
        var sql = `select * from  ${config.SYSTEM.dbTables.history} where check_sum = ($1);`
        result = await client.query(sql, [claim.checkSum]);
        if (result.rowCount === 0) {
            // вставка в history
            try {
                var sql = `INSERT INTO ${config.SYSTEM.dbTables.history} 
                            (
                            state_id,
                            date_op,
                            stan_op,
                            check_sum,
                            claim_reg_date,
                            claim_clm_agreement_agr_date,
                            clm_start_date,
                            claim_end_date
                            ) VALUES 
                            ($1,$2,$3,$4,to_timestamp($5),to_timestamp($6),to_timestamp($7),to_timestamp($8)) returning id_history`;
                sequence = await client.query(sql, [
                    claim.stateTransaction,
                    claim.operDate,
                    claim.clmFromStationCode,
                    claim.checkSum,
                    claim.epochClaimRegDate,
                    claim.epochClaimClmAgreementAgrDate,
                    claim.epochClmStartDate,
                    claim.epochClaimEndDate
                ]);
            } catch (e) {
                reg_info = `Claim. sqlClaimOp: ошибка при insert ${config.SYSTEM.dbTables.history} `;
                reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
            }

            // вставка в bundle_history
            try {
                await bundleHistory.insert(
                    sequence.rows[0].id_history,
                    claim.idSm,
                    '00000000-0000-0000-0000-000000000000',
                    '00000000-0000-0000-0000-000000000000',
                    '00000000-0000-0000-0000-000000000000',
                    '00000000-0000-0000-0000-000000000000',
                    claim.stateTransaction,
                    claim.operDate,
                    null,
                    1
                );
            } catch (e) {
                reg_info = `Claim. sqlClaimOp: ошибка при insert ${config.SYSTEM.dbTables.bundleHistory} `;
                reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
            }

            //update bundle_claim
            try {
                var sql_del = `DELETE FROM ${config.SYSTEM.dbTables.bundleClaim} where id_sm=($1)`;
                await client.query(sql_del, [claim.idSm]);
                try {
                    var sql_ins = `INSERT INTO ${config.SYSTEM.dbTables.bundleClaim} (id_sm, claim_id, claim_number) VALUES ($1, $2, $3)`;
                    await client.query(sql_ins, [claim.idSm, claim.claimId, claim.claimNumber]);
                } catch (e) {
                    reg_info = `Claim. sqlClaimOp: ошибка при INSERT в ${config.SYSTEM.dbTables.bundleClaim} idSm=${claim.idSm} claimId=${claim.claimId} claimNumber=${claim.claimNumber}`;
                    reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql_ins, null, e);
                }
            } catch (e) {
                reg_info = `Claim. sqlClaimOp: ошибка при DELETE из ${config.SYSTEM.dbTables.bundleClaim} idSm=${claim.idSm}`;
                reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql_del, null, e);
            }

            // Постановка на слежение заявки (handleOp1). Вызов функции editTracking
            if (claim.transaction == 'handleOp1') {
                try {
                    var sql = `SELECT id_sm from ${config.SYSTEM.dbTables.objectsTracking} where id_sm=($1) and claim_number=($2)`;
                    result = await client.query(sql, [claim.idSm, claim.claimNumber]);
                    if (result.rowCount === 0) {
                        logger.debug("Claim. sqlClaimOp: транзакция 1. Постановка на слежение");
                        try {
                            var sql_func = `SELECT ${config.SYSTEM.dbFunctions.editTracking} ($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
                            res_func = await client.query(sql_func, [claim.idSm, claim.claimNumber, '', null, '', null, '', null, null]);
                            if (res_func.rows[0].edit_tracking == 0) {
                                try {
                                    var sql_upd = `UPDATE ${config.SYSTEM.dbTables.eventTracking} set status_track=1, status_response=0 WHERE system_type = 1`;
                                    await client.query(sql_upd, []);
                                } catch (e) {
                                    reg_info = `Claim. sqlClaimOp: ошибка при UPDATE ${config.SYSTEM.dbTables.eventTracking}`;
                                    reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql_func, null, e);
                                }
                            }
                            else {
                                reg_info = `Claim. sqlClaimOp: заявка не поставлена на слежение pr_1=${claim.idSm} pr_2=${claim.claimNumber}`;
                                reg_init.regError(claim.idSm, 12, claim.checkSum, 2, 1, claim.claimStateID, reg_info, sql_func, null, null);
                            }
                        } catch (e) {
                            reg_info = `Claim. sqlClaimOp: ошибка при вызове функции ${config.SYSTEM.dbFunctions.editTracking} pr_1=${claim.idSm} pr_2=${claim.claimNumber} pr_3='' pr_4=null pr_5='' pr_6=''`;
                            reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql_func, null, e);
                        }
                    }
                } catch (e) {
                    reg_info = `Claim. sqlClaimOp: ошибка при чтении ${config.SYSTEM.dbFunctions.objectsTracking} idSm=${claim.idSm} claimNumber=${claim.claimNumber}`;
                    reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
                }
            }

            //insert source_information
            try {
                let document_inf;
                if (claim.claimVersion !== null) {
                    document_inf = `${claim.claimNumber}-ИЗМ/${claim.claimVersion}`;
                }
                else {
                    document_inf = claim.claimNumber;
                }

                var sql_ins = `INSERT INTO ${config.SYSTEM.dbTables.sourceInformation} 
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
                await client.query(sql_ins, [
                    claim.idSm,
                    claim.operDate,
                    claim.stateTransaction,
                    claim.checkSum,
                    null,
                    sequence.rows[0].id_history,
                    null,
                    'GU12',
                    null,
                    claim.inputDocument,
                    document_inf,
                    claim.claimStateID,
                    claim.claimState,
                    null,
                    null,
                    null,
                    null
                ]);
            } catch (e) {
                // Проверка на 803 ~ 23505
                if (e.code !== 23505) {
                    reg_info = `Claim. sqlClaimOp: ошибка при INSERT в ${config.SYSTEM.dbTables.sourceInformation} idSm=${claim.idSm} opDate=${claim.operDate} stateId=${claim.stateTransaction}`;
                    reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql_ins, null, e);
                }
            }

            //update etran_claim
            try {
                var sql_del = `DELETE FROM ${config.SYSTEM.dbTables.etranClaim} where id_sm=($1)`;
                await client.query(sql_del, [claim.idSm]);
                try {
                    var sql_ins = `INSERT INTO ${config.SYSTEM.dbTables.etranClaim} 
                (
                id_sm,
                claim_number,
                claim_version,
                clm_send_kind_name,
                sender_okpo,
                sender_name,
                sender_address,
                from_station_code,
                from_station_name,
                claim_reg_date,
                sender_id,
                claim_state_id,
                claim_state
                ) VALUES 
                ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`;
                    await client.query(sql_ins, [
                        claim.idSm,
                        claim.claimNumber,
                        claim.claimVersion,
                        claim.clmSendKindName,
                        claim.clmSenderOkpo,
                        claim.clmSenderName,
                        claim.clmSenderAddress,
                        claim.clmFromStationCode,
                        claim.clmFromStationName,
                        claim.operDate,
                        claim.clmSenderId,
                        claim.claimStateID,
                        claim.claimState
                    ]);
                } catch (e) {
                    reg_info = `Claim. sqlClaimOp: ошибка при INSERT в ${config.SYSTEM.dbTables.etranClaim} idSm=${claim.idSm}`;
                    reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql_ins, null, e);
                }
            } catch (e) {
                reg_info = `Claim. sqlClaimOp: ошибка при DELETE из ${config.SYSTEM.dbTables.etranClaim} idSm=${claim.idSm}`;
                reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql_del, null, e);
            }

            //update etran_claim_otpr
            try {
                var sql_del = `DELETE FROM ${config.SYSTEM.dbTables.etranClaimOtpr} where id_sm=($1)`;
                await client.query(sql_del, [claim.idSm]);
                try {
                    for (let i = 0; i < claim.otprRecipOkpo.length; i++) {
                        var sql_ins = `INSERT INTO ${config.SYSTEM.dbTables.etranClaimOtpr} 
                    (
                    id_sm,
                    row_index,
                    recip_okpo,
                    recip_name,
                    recip_address,
                    to_station_code,
                    to_station_name,
                    freight_name,
                    freight_gng_name,
                    freight_weight,
                    car_type_name,
                    rv_cont_name,
                    car_owner_name,
                    days_delivery,
                    recip_id
                    ) VALUES 
                    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`;
                        await client.query(sql_ins, [
                            claim.idSm,
                            i,
                            claim.otprRecipOkpo[i],
                            claim.otprRecipName[i],
                            claim.otprRecipAddress[i],
                            claim.otprToStationCode[i],
                            claim.otprToStationName[i],
                            claim.otprFreightName[i],
                            claim.otprFreightGngName[i],
                            claim.otprFreightWeight[i],
                            claim.otprCarTypeName[i],
                            claim.otprRvContName[i],
                            claim.otprCarOwnerName[i],
                            claim.otprDaysDelivery[i],
                            claim.otprRecipId[i]
                        ]);
                    }
                } catch (e) {
                    reg_info = `Claim. sqlClaimOp: ошибка при INSERT в ${config.SYSTEM.dbTables.etranClaimOtpr} idSm=${claim.idSm}`;
                    reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql_ins, null, e);
                }
            } catch (e) {
                reg_info = `Claim. sqlClaimOp: ошибка при DELETE из ${config.SYSTEM.dbTables.etranClaimOtpr} idSm=${claim.idSm}`;
                reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql_del, null, e);
            }

            // update etran_claim_payer
            try {
                var sql_del = `DELETE FROM ${config.SYSTEM.dbTables.etranClaimPayer} where id_sm=($1)`;
                await client.query(sql_del, [claim.idSm]);
                try {
                    for (let i = 0; i < claim.payerOKPO.length; i++) {
                        var sql = `INSERT INTO ${config.SYSTEM.dbTables.etranClaimPayer} 
                    (
                    id_sm,
                    row_index,
                    payer_okpo,
                    payer_id,
                    payer_name,
                    payer_address
                    ) VALUES 
                    ($1,$2,$3,$4,$5,$6)`;
                        await client.query(sql, [
                            claim.idSm,             //1
                            i,                      //1,5
                            claim.payerOKPO[i],     //2
                            claim.payerId[i],
                            claim.payerName[i],     //3
                            claim.payerAddress[i],  //4
                        ]);
                    }
                } catch (e) {
                    console.log("kjdkfhj")
                    console.log(e)
                    reg_info = `Claim. sqlClaimOp: ошибка при INSERT в ${config.SYSTEM.dbTables.etranClaimPayer}  idSm=${claim.idSm}`;
                    reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
                }
            } catch (e) {
                reg_info = `Claim. sqlClaimOp: ошибка при DELETE из ${config.SYSTEM.dbTables.etranClaimPayer} idSm=${claim.idSm}`;
                reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql_del, null, e);
            }

            /*
            // запись в violation_reg
            list = { condCheckList: response.data.data.condCheckList };
            list = JSON.stringify(list);
            logger.debug(`Claim. sqlClaimOp: вызов функции ${config.SYSTEM.dbFunctions.violationReg}. idSm=${response.data.data.sm.idSm}. condCheckList=${list}`);
            try {
                var sql_func = `SELECT ${config.SYSTEM.dbFunctions.violationReg} ($1,$2)`;
                res_func = await client.query(sql_func, [response.data.data.sm.idSm, list]);
                if (res_func.rows[0].violation_reg !== 0) {
                    reg_info = `Claim. sqlClaimOp: RC ${config.SYSTEM.dbFunctions.violationReg} != 0. idSm=${response.data.data.sm.idSm}. condCheckList=${list}`;
                    reg_init.regError(claim.idSm, 12, claim.checkSum, 2, 1, claim.claimStateID, reg_info, sql_func, null, null);
                }
            } catch (e) {
                reg_info = `Claim. sqlClaimOp: ошибка при вызове функции ${config.SYSTEM.dbFunctions.violationReg} idSm=${response.data.data.sm.idSm}. condCheckList=${list}`;
                reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql_func, null, e);
            }
            */

            //Запись в role_org 
            if (claim.transaction === 'handleOp1') {
                await insertIntoRoleOrg(config, client, claim.clmSenderId, 'sender', claim, null);
                await insertIntoRoleOrg(config, client, claim.otprRecipId[0], 'recip', claim, null);
                await insertIntoRoleOrg(config, client, claim.payerId[0], 'payer', claim, null);
                await insertIntoRoleOrg(config, client, -1, 'carrier', claim, null);
            }
            if (claim.transaction === 'handleOp2') {
                await selectInsertFromRoleOrg(config, client, claim.clmSenderId, 'sender', claim, null);
                await selectInsertFromRoleOrg(config, client, claim.otprRecipId[0], 'recip', claim, null);
                await selectInsertFromRoleOrg(config, client, claim.payerId[0], 'payer', claim, null);
            }
        }
    } catch (e) {
        console.log(e)
        reg_info = `Claim. sqlClaimOp: ошибка при select ${config.SYSTEM.dbTables.history} `;
        reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
    }
};

// функция вставки в role_org
async function insertIntoRoleOrg(config, client, id_org, role_id, claim, id_sm_invoice) {
    try {
        logger.debug(`Claim.sqlClaimOp. Пишем в role_org информацию по ${role_id}`); // 
        var sql = `INSERT INTO ${config.SYSTEM.dbTables.roleOrg} 
        (
            id_org,
            role_id,
            id_sm,
            id_sm_invoice
        ) VALUES 
        ($1,$2,$3,$4)`;
        await client.query(sql, [
            id_org,
            role_id,
            claim.idSm,
            id_sm_invoice
        ]);
    } catch (e) {
        reg_info = `Claim. sqlClaimOp: ошибка при записи в ${config.SYSTEM.dbTables.roleOrg} по ${role_id}`;
        reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
    }
}

// функция чтения в role_org
async function selectInsertFromRoleOrg(config, client, id_org, role_id, claim, id_sm_invoice) {
    try {
        logger.debug(`Claim.sqlClaimOp. Читаем role_org по ${role_id}`); // 
        var sql = `SELECT id_sm,id_org FROM ${config.SYSTEM.dbTables.roleOrg} where id_sm=($1) and id_org=($2)`;
        result = await client.query(sql, [claim.idSm, id_org]);
        if (result.rowCount === 0) {
            await insertIntoRoleOrg(config, client, id_org, role_id, claim, id_sm_invoice);
        }
    } catch (e) {
        reg_info = `Claim. sqlClaimOp: ошибка при чтении ${config.SYSTEM.dbTables.roleOrg}  по ${role_id}`;
        reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
    }
}

