const cron = require('node-cron');
const logger = require('../config/logger');
const config = require(`../init_config`);
const pool = require('../init_db_pool');
const reg_init = require(`../reg_init`)

const axiosDefaultConfig = {
    proxy: false
};
const axios = require('axios').create(axiosDefaultConfig);

logger.info(`Старт tableConsumerPreparing`);

cron.schedule('* * * * * *', async () => {

    var curPhase = config.stages.preparing;
    var nextPhase = config.stages.database;
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //nextPhase = curPhase;

    try {
        client = await pool.connect();
        var sql = `SELECT * from ${config.SYSTEM.dbFunctions.imesGetNext} ($1,$2)`;
        result = await client.query(sql, [config.MAIN.system, curPhase]);
        await client.release();

        if (result.rowCount !== 0) {
            for (row of result.rows) {
                try {

                    jsonObject = await preparing(JSON.parse(row.imes_body_ext));

                    var sql_imesEndPhase = `SELECT * from ${config.SYSTEM.dbFunctions.imesEndPhase} ($1,$2,$3,$4,$5,$6,$7,$8)`;
                    result_imesEndPhase = await client.query(sql_imesEndPhase, [row.imes_id, nextPhase, 0, "ok", true, false, jsonObject, 20]);
                } catch (e) {
                    await client.release();
                    reg_info = `Ошибка при обновлении информации в очереди процедурой ${config.SYSTEM.dbFunctions.imesEndPhase}`;
                    reg_init.regError(null, null, null, 2, 1, null, reg_info, sql_imesEndPhase, null, e);
                }
            }
        }
    }
    catch (e) {
        reg_info = `Ошибка при считывании информации из очереди процедурой ${config.SYSTEM.dbFunctions.imesGetNext}. Фаза 1`;
        reg_init.regError(null, null, null, 2, 1, null, reg_info, null, null, e);
    }

});

async function preparing(jsonObject) {
    if (jsonObject.data.message.hasOwnProperty('requestclaim')) {
        jsonObject.data.channels.orgList = await preparingOrgList(jsonObject.data.message, jsonObject);
    }

    return jsonObject;
}

async function preparingOrgList(message) {

    let orgList = new Array();

    // payer
    if (message.requestclaim.claim.hasOwnProperty('clmpayer')) {
        if (Array.isArray(message.requestclaim.claim.clmpayer)) {
            for (clmpayer of message.requestclaim.claim.clmpayer) {
                let orgMsp = await getMsp(clmpayer.payerid.$.value);
                if (orgMsp) {
                    orgList.push(orgMsp);
                }
            }
        }
        else {
            let orgMsp = await getMsp(message.requestclaim.claim.clmpayer.payerid.$.value);
            if (orgMsp) {
                orgList.push(orgMsp);
            }
        }
    }
    // otpr
    if (message.requestclaim.claim.hasOwnProperty('clmotpr')) {
        if (Array.isArray(message.requestclaim.claim.clmotpr)) {
            for (clmotpr of message.requestclaim.claim.clmotpr) {
                let orgMsp = await getMsp(clmotpr.otprrecipid.$.value);
                if (orgMsp) {
                    orgList.push(orgMsp);
                }
            }
        }
        else {
            let orgMsp = await getMsp(message.requestclaim.claim.clmotpr.otprrecipid.$.value);
            if (orgMsp) {
                orgList.push(orgMsp);
            }
        }
    }
    // sender
    if (message.requestclaim.claim.hasOwnProperty('clmsenderid')) {
        let orgMsp = await getMsp(message.requestclaim.claim.clmsenderid.$.value);
        if (orgMsp) {
            orgList.push(orgMsp);
        }
    }

    return orgList;
}

async function getMsp(orgId) {

    client = await pool.connect();

    let sql = `SELECT * from ${config.SYSTEM.dbTables.tnOrgpassport} where org_id = ($1) limit 1`;
    result = await client.query(sql, [orgId]);
    await client.release();

    if (result.rowCount !== 0) {
        return result.rows[0].org_msp;
    }

}