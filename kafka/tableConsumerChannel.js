const cron = require('node-cron');
const logger = require('../config/logger');
const config = require(`../init_config`);
const pool = require('../init_db_pool');
const reg_init = require(`../reg_init`)

const chaincodeChannels = require('../etran/crud/models/chaincode_channels');

const axiosDefaultConfig = {
    proxy: false
};
const axios = require('axios').create(axiosDefaultConfig);

logger.info(`Старт tableConsumerChannel`);

cron.schedule('* * * * * *', async () => {

    var curPhase = config.stages.channel;
    var nextPhase = config.stages.blockchain;
    //nextPhase = curPhase;

    try {
        client = await pool.connect();
        var sql = `SELECT * from ${config.SYSTEM.dbFunctions.imesGetNext} ($1,$2)`;
        result = await client.query(sql, [config.MAIN.system, curPhase]);
        await client.release();

        if (result.rowCount !== 0) {
            for (row of result.rows) {
                jsonObject = JSON.parse(row.imes_body_ext);
                jsonObject.data.channels.channel = `channel_` + jsonObject.data.idSm;

                // Если организации в канале есть, то считаем, что 70 и создаем канал
                if (Object.keys(jsonObject.data.channels.orgList).length != 0) {
                    try {
                        response = await axios.post(`http://${config.SYSTEM.restConfig.channel.host}:${config.SYSTEM.restConfig.channel.port}/${config.SYSTEM.restConfig.channel.name}`, jsonObject.data.channels)
                        if (response.data.code === 0) {
                            try {
                                var sql = `INSERT INTO ${config.SYSTEM.dbTables.chaincodeChannels} 
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
                                console.log(e)
                                reg_info = `Ошибка при insert в таблицу ${config.SYSTEM.dbTables.chaincodeChannels}`;
                                reg_init.regError(null, null, null, 2, 1, null, reg_info, null, null, e);
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }

                try {
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

            }
        }
    } catch (e) {
        console.log(e)
        await client.release();
        reg_info = `Ошибка при считывании информации из очереди процедурой ${config.SYSTEM.dbFunctions.imesGetNext}. Фаза 3`;
        reg_init.regError(null, null, null, 2, 1, null, reg_info, null, null, e);
    }
});
