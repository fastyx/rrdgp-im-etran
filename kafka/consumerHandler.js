const cron = require('node-cron');
const logger = require('../config/logger');
const config = require(`../init_config`);
const reg_init = require(`../reg_init`)

const stagePreparing = require('./stagePreparing');
const stageDatabase = require('./stageDatabase');
const stageChannel = require('./stageChannel');
const stageBlockchain = require('./stageBlockchain');
const stageViolation = require('./stageViolation');

let isRun = false;

logger.info(`Старт consumerHandler`);

cron.schedule('* * * * * *', async () => {

    if (!isRun) {
        isRun = true;

        let sql_imesGetNext = `SELECT * from ${config.SYSTEM.dbFunctions.imesGetNext} ($1,$2)`;
        let sql_imesEndPhase = `SELECT * from ${config.SYSTEM.dbFunctions.imesEndPhase} ($1,$2,$3,$4,$5,$6,$7,$8)`;
        try {
            // Preparing
            const result_preparing = await client.query(sql_imesGetNext, [config.MAIN.system, config.stages.preparing]);
            if (result_preparing.rowCount !== 0) {
                for (row of result_preparing.rows) {
                    //console.log("Строка result_preparing")

                    let jsonObject = JSON.parse(row.imes_body_ext);
                    let result = await stagePreparing.stagePreparing(jsonObject);
                    if (result.status === 0) {
                        await client.query(sql_imesEndPhase, [row.imes_id, config.stages.database, 0, "ok", true, false, result.data, 20]);
                    }
                }
            }
            // Database
            const result_database = await client.query(sql_imesGetNext, [config.MAIN.system, config.stages.database]);
            if (result_database.rowCount !== 0) {
                for (row of result_database.rows) {
                    //console.log("Строка result_database")

                    let jsonObject = JSON.parse(row.imes_body_ext);
                    let result = await stageDatabase.stageDatabase(jsonObject);
                    if (result.status === 0) {
                        await client.query(sql_imesEndPhase, [row.imes_id, config.stages.channel, 0, "ok", true, false, jsonObject, 20]);
                    }
                }
            }
            // Channel
            const result_channel = await client.query(sql_imesGetNext, [config.MAIN.system, config.stages.channel]);
            if (result_channel.rowCount !== 0) {
                for (row of result_channel.rows) {
                    //console.log("Строка result_channel")

                    let jsonObject = JSON.parse(row.imes_body_ext);
                    let result = await stageChannel.stageChannel(jsonObject);
                    if (result.status === 0) {
                        await client.query(sql_imesEndPhase, [row.imes_id, config.stages.blockchain, 0, "ok", true, false, jsonObject, 20]);
                    }
                }
            }
            // blockchain
            const result_blockchain = await client.query(sql_imesGetNext, [config.MAIN.system, config.stages.blockchain]);
            if (result_blockchain.rowCount !== 0) {
                for (row of result_blockchain.rows) {
                    //console.log("Строка result_blockchain")

                    let jsonObject = JSON.parse(row.imes_body_ext);
                    let result = await stageBlockchain.stageBlockchain(jsonObject);
                    if (result.status === 0) {
                        await client.query(sql_imesEndPhase, [row.imes_id, config.stages.violation, 0, "ok", true, false, jsonObject, 20]);
                    }
                }
            }
            // violation
            const result_violation = await client.query(sql_imesGetNext, [config.MAIN.system, config.stages.violation]);
            if (result_violation.rowCount !== 0) {
                for (row of result_violation.rows) {
                    //console.log("Строка result_violation")

                    let jsonObject = JSON.parse(row.imes_body_ext);
                    let result = await stageViolation.stageViolation(jsonObject);
                    if (result.status === 0) {
                        await client.query(sql_imesEndPhase, [row.imes_id, config.stages.end, 0, "ok", false, false, jsonObject, 20]);
                    }
                }
            }
        } catch (e) {
            console.log(e)
            logger.error(e)
        } finally {
            isRun = false;
        }
    }
});
