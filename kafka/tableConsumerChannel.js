const cron = require('node-cron');
const logger = require('../config/logger');
const config = require(`../init_config`);
const reg_init = require(`../reg_init`)

const axiosDefaultConfig = {
    proxy: false
};
const axios = require('axios').create(axiosDefaultConfig);

logger.info(`Старт tableConsumerChannel`);

let isRun = false;

cron.schedule('* * * * * *', async () => {

    if (!isRun) {
        isRun = true;

        let currentPhase = config.stages.channel;
        let nextPhase = config.stages.blockchain;

        try {
            let sql = `SELECT * from ${config.SYSTEM.dbFunctions.imesGetNext} ($1,$2)`;
            const result = await client.query(sql, [config.MAIN.system, currentPhase]);

            if (result.rowCount !== 0) {
                for (row of result.rows) {

                    console.log(`${row.imes_id}. tableConsumerChannel`);

                    let jsonObject = JSON.parse(row.imes_body_ext);

                    try {
                        let sql = `select * from ${config.SYSTEM.dbTables.chaincodeChannels} where id_sm = ($1)`;
                        let result = await client.query(sql, [jsonObject.data.idSm]);
                        if (result.rowCount === 0) {
                            console.log("Создаем канал");
                            try {
                                const response = await axios.post(`http://${config.SYSTEM.restConfig.channel.host}:${config.SYSTEM.restConfig.channel.port}/${config.SYSTEM.restConfig.channel.name}`, jsonObject.data.channels)
                                if (response.data.code === 0) {
                                    try {
                                        let sql = `INSERT INTO ${config.SYSTEM.dbTables.chaincodeChannels} 
                                (
                                channel_name,
                                id_sm,
                                channel_config
                                ) VALUES 
                                ($1,$2,$3)`;
                                        await client.query(sql, [
                                            jsonObject.data.channels.channel,
                                            jsonObject.data.idSm,
                                            response.data.data
                                        ]);
                                    } catch (e) {
                                        console.log(`tableConsumerChannel`);
                                        console.log(e)
                                        reg_info = `Ошибка при insert в таблицу ${config.SYSTEM.dbTables.chaincodeChannels}`;
                                        reg_init.regError(null, null, null, 2, 1, null, reg_info, null, null, e);
                                    }
                                }
                            } catch (e) {
                                console.log(`tableConsumerChannel`);
                                console.log(e);
                            }
                        } else {
                            console.log("считываем значение канала");
                            jsonObject.data.channels.channel = result.rows[0].channel_name;
                        }
                    } catch (e) {
                        console.log("fjdfsjkfsdjkfd");
                        console.log(e);
                    }

                    let sql_imesEndPhase = null;
                    try {
                        sql_imesEndPhase = `SELECT * from ${config.SYSTEM.dbFunctions.imesEndPhase} ($1,$2,$3,$4,$5,$6,$7,$8)`;
                        await client.query(sql_imesEndPhase, [row.imes_id, nextPhase, 0, "ok", true, false, jsonObject, 20]);
                    } catch (e) {
                        console.log(`tableConsumerChannel`);
                        console.log(e)
                        reg_info = `Ошибка при обновлении информации в очереди процедурой ${config.SYSTEM.dbFunctions.imesEndPhase}`;
                        reg_init.regError(null, null, null, 2, 1, null, reg_info, sql_imesEndPhase, null, e);
                    }
                }
            }
        } catch (e) {
            console.log(`tableConsumerChannel`);
            console.log(e)
            reg_info = `Ошибка при считывании информации из очереди процедурой ${config.SYSTEM.dbFunctions.imesGetNext}. Фаза 3`;
            reg_init.regError(null, null, null, 2, 1, null, reg_info, null, null, e);
        } finally {
            isRun = false;
        }
    }
});
