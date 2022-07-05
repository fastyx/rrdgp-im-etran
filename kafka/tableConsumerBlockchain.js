const cron = require('node-cron');
const logger = require('../config/logger');
const config = require(`../init_config`);
const pool = require('../init_db_pool');
const reg_init = require(`../reg_init`)

const axiosDefaultConfig = {
    proxy: false
};
const axios = require('axios').create(axiosDefaultConfig);

logger.info(`Старт tableConsumerBlockchain`);

cron.schedule('* * * * * *', async () => {

    try {
        client = await pool.connect();
        var sql = `SELECT * from ${config.SYSTEM.dbFunctions.imesGetNext} ($1,$2)`;
        result = await client.query(sql, [config.MAIN.system, config.stages.blockchain]);
        await client.release();

        if (result.rowCount !== 0) {
            for (row of result.rows) {
                try {
                    let jsonData = JSON.parse(row.imes_body_ext);
                    let success = true;
                    for (message of jsonData.data.transactions) {
                        response = await axios.post(`http://${config.SYSTEM.restConfig.invoke.host}:${config.SYSTEM.restConfig.invoke.port}/${config.SYSTEM.restConfig.invoke.name}`, message)
                        if (response.data.code !== 0) {
                            success = false;
                            reg_info = `Ошибка. RC=${response.data.code} при вызове ${config.SYSTEM.restConfig.invoke.name}`;
                            reg_init.regError(null, null, null, 2, 1, null, reg_info, sql, null, null);
                        }
                    }

                    if (success) {
                        jsonObject = JSON.parse(row.imes_body_ext);
                        for (violation of response.data.data.condCheckList) {
                            jsonObject.data.violations.push(violation)
                        }

                        try {
                            client = await pool.connect();
                            var sql_imesEndPhase = `SELECT * from ${config.SYSTEM.dbFunctions.imesEndPhase} ($1,$2,$3,$4,$5,$6,$7,$8)`;
                            result_imesEndPhase = await client.query(sql_imesEndPhase, [row.imes_id, 300, 0, "ok", true, false, jsonObject, 20]);
                            await client.release();
                        } catch (e) {
                            await client.release();
                            reg_info = `Ошибка при обновлении информации в очереди процедурой ${config.SYSTEM.dbFunctions.imesEndPhase}`;
                            reg_init.regError(null, null, null, 2, 1, null, reg_info, sql_imesEndPhase, null, e);
                        }
                    }
                } catch (e) {
                    console.log(e)
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
