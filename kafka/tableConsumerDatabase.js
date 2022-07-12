const cron = require('node-cron');
const logger = require('../config/logger');
const config = require(`../init_config`);
const reg_init = require(`../reg_init`)
const bh = require(`../etran/ConsumerHandlerNew`);

logger.info(`Старт tableConsumerDatabase`);

cron.schedule('* * * * * *', async () => {

    let currentPhase = config.stages.database;
    let nextPhase = config.stages.channel;
    //let nextPhase = config.stages.end;

    try {
        // выбираем очередную порцию данных
        let sql = `SELECT * from ${config.SYSTEM.dbFunctions.imesGetNext} ($1,$2)`;
        const result = await client.query(sql, [config.MAIN.system, currentPhase]);

        // если данные есть, инициируем запись в БД
        if (result.rowCount !== 0) {
            for (row of result.rows) {

                console.log(`${row.imes_id}. tableConsumerDatabase`);

                let jsonData = JSON.parse(row.imes_body_ext);
                let message = jsonData.data.message;

                try {
                    response = await bh.consumerHandlerNew(message);
                    //console.log(response.transactions[0].payload)
                } catch (e) {
                    logger.error(e);
                }

                let jsonObject = JSON.parse(row.imes_body_ext);
                jsonObject.data.transactions = response.transactions;

                let str = null;
                if (response.status == 0) {
                    str = [row.imes_id, nextPhase, 0, "ok", true, false, jsonObject, 20];
                }
                else {
                    str = [row.imes_id, currentPhase, 0, "ok", true, false, jsonObject, 20];
                }

                let sql_imesEndPhase = null;
                try {
                    sql_imesEndPhase = `SELECT * from ${config.SYSTEM.dbFunctions.imesEndPhase} ($1,$2,$3,$4,$5,$6,$7,$8)`;
                    await client.query(sql_imesEndPhase, str);
                } catch (e) {
                    console.log(`tableConsumerDatabase`);
                    console.log(e)
                    reg_info = `Ошибка при обновлении информации в очереди процедурой ${config.SYSTEM.dbFunctions.imesEndPhase}`;
                    reg_init.regError(null, null, null, 2, 1, null, reg_info, sql_imesEndPhase, null, e);
                }
            }
        }
    }
    catch (e) {
        console.log(`tableConsumerDatabase`);
        console.log(e)
        reg_info = `Ошибка при считывании информации из очереди процедурой ${config.SYSTEM.dbFunctions.imesGetNext}. Фаза 1`;
        reg_init.regError(null, null, null, 2, 1, null, reg_info, null, null, e);
    }

});
