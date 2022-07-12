const cron = require('node-cron');
const logger = require('../config/logger');
const config = require(`../init_config`);
const reg_init = require(`../reg_init`)

logger.info(`Старт tableConsumerPreparing`);

let isRun = false;

cron.schedule('* * * * * *', async () => {

    if (!isRun) {
        isRun = true;

        let currentPhase = config.stages.preparing;
        let nextPhase = config.stages.database;
        //let nextPhase = config.stages.preparing;

        try {
            let sql = `SELECT * from ${config.SYSTEM.dbFunctions.imesGetNext} ($1,$2)`;
            const result = await client.query(sql, [config.MAIN.system, currentPhase]);

            if (result.rowCount !== 0) {
                for (row of result.rows) {

                    console.log(`${row.imes_id}. tableConsumerPreparing`);

                    let sql_imesEndPhase = null;
                    try {
                        let jsonObject = await preparing(JSON.parse(row.imes_body_ext));
                        sql_imesEndPhase = `SELECT * from ${config.SYSTEM.dbFunctions.imesEndPhase} ($1,$2,$3,$4,$5,$6,$7,$8)`;
                        await client.query(sql_imesEndPhase, [row.imes_id, nextPhase, 0, "ok", true, false, jsonObject, 20]);
                    } catch (e) {
                        console.log(`tableConsumerPreparing`);
                        console.log(e)
                        reg_info = `Ошибка при обновлении информации в очереди процедурой ${config.SYSTEM.dbFunctions.imesEndPhase}`;
                        reg_init.regError(null, null, null, 2, 1, null, reg_info, sql_imesEndPhase, null, e);
                    }
                }
            }
        }
        catch (e) {
            console.log(`tableConsumerPreparing`);
            console.log(e)
            reg_info = `Ошибка при считывании информации из очереди процедурой ${config.SYSTEM.dbFunctions.imesGetNext}. Фаза 1`;
            reg_init.regError(null, null, null, 2, 1, null, reg_info, null, null, e);
        } finally {
            isRun = false;
        }
    }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function preparing(jsonObject) {
    if (jsonObject.data.message.hasOwnProperty('requestclaim')) {
        jsonObject.data.channels = await channels(jsonObject.data.message, jsonObject);
    }

    return jsonObject;
}

async function channels(message, jsonObject) {

    // канал
    channel = `channel_` + jsonObject.data.idSm;

    // клиенты
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

    return {"channel": channel, "orgList": orgList};
}

async function getMsp(orgId) {

    let sql = `SELECT * from ${config.SYSTEM.dbTables.tnOrgpassport} where org_id = ($1) limit 1`;
    let result = await client.query(sql, [orgId]);

    if (result.rowCount !== 0) {
        return result.rows[0].org_msp;
    }

}