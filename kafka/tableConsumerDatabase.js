const cron = require('node-cron');
const logger = require('../config/logger');
const config = require(`../init_config`);
const pool = require('../init_db_pool');
const reg_init = require(`../reg_init`)

const axiosDefaultConfig = {
    proxy: false
};
const axios = require('axios').create(axiosDefaultConfig);

logger.info(`Старт tableConsumerDatabase`);

cron.schedule('* * * * * *', async () => {

    var curPhase = config.stages.database;
    var nextPhase = config.stages.channel;

    try {
        // выбираем очередную порцию данных
        client = await pool.connect();
        var sql = `SELECT * from ${config.SYSTEM.dbFunctions.imesGetNext} ($1,$2)`;
        result = await client.query(sql, [config.MAIN.system, curPhase]);
        await client.release();

        // если данные есть, инициируем запись в БД
        if (result.rowCount !== 0) {
            for (row of result.rows) {
                var configXml = { headers: { 'Content-Type': 'text/xml' } };
                response = await axios.post(`http://${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}/${config.SYSTEM.restConfig.etranService.name}`, row.imes_body_ori, configXml)
                if (response.data.status == 0) {
                    try {
                        jsonObject = JSON.parse(row.imes_body_ext);
                        jsonObject.data.transactions = response.data.transactions;
                        
                        client = await pool.connect();
                        var sql_imesEndPhase = `SELECT * from ${config.SYSTEM.dbFunctions.imesEndPhase} ($1,$2,$3,$4,$5,$6,$7,$8)`;
                        result_imesEndPhase = await client.query(sql_imesEndPhase, [row.imes_id, nextPhase, 0, "ok", true, false, jsonObject, 20]);
                        await client.release();
                    } catch (e) {
                        console.log(e)
                        await client.release();
                        reg_info = `Ошибка при обновлении информации в очереди процедурой ${config.SYSTEM.dbFunctions.imesEndPhase}`;
                        reg_init.regError(null, null, null, 2, 1, null, reg_info, sql_imesEndPhase, null, e);
                    }
                } else {
                    reg_info = `Ошибка. RC=${data.responseClaim.status[0]} при вызове ${config.SYSTEM.restConfig.etranService.name}`;
                    reg_init.regError(null, null, null, 2, 1, null, reg_info, sql, null, null);
                }
            }
        }
    }
    catch (e) {
        console.log(e)
        await client.release();
        reg_info = `Ошибка при считывании информации из очереди процедурой ${config.SYSTEM.dbFunctions.imesGetNext}. Фаза 1`;
        reg_init.regError(null, null, null, 2, 1, null, reg_info, null, null, e);
    }
});
