const cron = require('node-cron');
const logger = require('../config/logger');
const config = require(`../init_config`);
const reg_init = require(`../reg_init`)

logger.info(`Старт tableConsumerViolation`);

let isRun = false;

cron.schedule('* * * * * *', async () => {

    if (!isRun) {
        isRun = true;

        let currentPhase = config.stages.violation;
        let nextPhase = config.stages.end;

        try {
            let sql = `SELECT * from ${config.SYSTEM.dbFunctions.imesGetNext} ($1,$2)`;
            const result = await client.query(sql, [config.MAIN.system, currentPhase]);

            if (result.rowCount !== 0) {
                for (row of result.rows) {
                    
                    console.log(`${row.imes_id}. tableConsumerViolation`);

                    let jsonObject = JSON.parse(row.imes_body_ext);
                    let list = JSON.stringify(jsonObject.data.violations);

                    try {
                        const sql_func = `SELECT ${config.SYSTEM.dbFunctions.violationReg} ($1,$2)`;
                        const res_func = await client.query(sql_func, [jsonObject.data.idSm, list]);
                        if (res_func.rows[0].violation_reg == 0) {
                            let sql_imesEndPhase = null;
                            try {
                                sql_imesEndPhase = `SELECT * from ${config.SYSTEM.dbFunctions.imesEndPhase} ($1,$2,$3,$4,$5,$6,$7,$8)`;
                                await client.query(sql_imesEndPhase, [row.imes_id, nextPhase, 0, "ok", false, false, jsonObject, 20]);
                            } catch (e) {
                                console.log(`tableConsumerViolation`);
                                console.log(e)
                                reg_info = `Ошибка при обновлении информации в очереди процедурой ${config.SYSTEM.dbFunctions.imesEndPhase}`;
                                reg_init.regError(null, null, null, 2, 1, null, reg_info, sql_imesEndPhase, null, e);
                            }
                        }
                        else {
                            console.log(`tableConsumerViolation`);
                            console.log(e)
                            reg_info = `Claim. sqlClaimOp: RC ${config.SYSTEM.dbFunctions.violationReg} != 0. idSm=${response.data.data.sm.idSm}. condCheckList=${list}`;
                            reg_init.regError(jsonObject.data.idSm, 12, null, 2, 1, null, reg_info, sql_func, null, null);
                        }
                    } catch (e) {
                        console.log(`tableConsumerViolation`);
                        console.log(e)
                        reg_info = `Claim. sqlClaimOp: ошибка при вызове функции ${config.SYSTEM.dbFunctions.violationReg} idSm=${response.data.data.sm.idSm}. condCheckList=${list}`;
                        reg_init.regError(jsonObject.data.idSm, 12, null, 1, 1, null, reg_info, sql_func, null, e);
                    }
                }
            }
        }
        catch (e) {
            console.log(`tableConsumerViolation`);
            console.log(e)
            reg_info = `Ошибка при считывании информации из очереди процедурой ${config.SYSTEM.dbFunctions.imesGetNext}. Фаза 3`;
            reg_init.regError(null, null, null, 2, 1, null, reg_info, null, null, e);
        } finally {
            isRun = false;
        }
    }
});
