const cron = require('node-cron');
const logger = require('../config/logger');
const config = require(`../init_config`);
const pool = require('../init_db_pool');
const reg_init = require(`../reg_init`)

const axiosDefaultConfig = {
    proxy: false
};
const axios = require('axios').create(axiosDefaultConfig);

logger.info(`Старт tableConsumerViolation`);

cron.schedule('* * * * * *', async () => {

    try {
        client = await pool.connect();
        var sql = `SELECT * from ${config.SYSTEM.dbFunctions.imesGetNext} ($1,$2)`;
        result = await client.query(sql, [config.MAIN.system, config.stages.violation]);
        await client.release();

        if (result.rowCount !== 0) {
            for (row of result.rows) {
                let jsonObject = JSON.parse(row.imes_body_ext);
                list = JSON.stringify(jsonObject.data.violations);

                try {
                    var sql_func = `SELECT ${config.SYSTEM.dbFunctions.violationReg} ($1,$2)`;
                    res_func = await client.query(sql_func, [jsonObject.data.idSm, list]);
                    if (res_func.rows[0].violation_reg == 0) {
                        try {
                            client = await pool.connect();
                            var sql_imesEndPhase = `SELECT * from ${config.SYSTEM.dbFunctions.imesEndPhase} ($1,$2,$3,$4,$5,$6,$7,$8)`;
                            result_imesEndPhase = await client.query(sql_imesEndPhase, [row.imes_id, 400, 0, "ok", false, false, jsonObject, 20]);
                            await client.release();
                        } catch (e) {
                            await client.release();
                            reg_info = `Ошибка при обновлении информации в очереди процедурой ${config.SYSTEM.dbFunctions.imesEndPhase}`;
                            reg_init.regError(null, null, null, 2, 1, null, reg_info, sql_imesEndPhase, null, e);
                        }
                    }
                    else {
                        console.log(e)
                        reg_info = `Claim. sqlClaimOp: RC ${config.SYSTEM.dbFunctions.violationReg} != 0. idSm=${response.data.data.sm.idSm}. condCheckList=${list}`;
                        reg_init.regError(jsonObject.data.idSm, 12, null, 2, 1, null, reg_info, sql_func, null, null);
                    }
                } catch (e) {
                    console.log(e)
                    reg_info = `Claim. sqlClaimOp: ошибка при вызове функции ${config.SYSTEM.dbFunctions.violationReg} idSm=${response.data.data.sm.idSm}. condCheckList=${list}`;
                    reg_init.regError(jsonObject.data.idSm, 12, null, 1, 1, null, reg_info, sql_func, null, e);
                }
            }
        }
    }
    catch (e) {
        await client.release();
        reg_info = `Ошибка при считывании информации из очереди процедурой ${config.SYSTEM.dbFunctions.imesGetNext}. Фаза 2`;
        reg_init.regError(null, null, null, 2, 1, null, reg_info, null, null, e);
    }
});
