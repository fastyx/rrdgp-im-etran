const config = require(`../init_config`);


exports.stagePreparing = async function (jsonObject) {

    try {
        jsonObject = await preparing(jsonObject);
        return { "status": 0, "data": jsonObject };
    } catch (e) {
        console.log(e)
    }
    return { "status": 1 };
}


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

    return { "channel": channel, "orgList": orgList };
}

async function getMsp(orgId) {

    let sql = `SELECT * from ${config.SYSTEM.dbTables.tnOrgpassport} where org_id = ($1) limit 1`;
    let result = await client.query(sql, [orgId]);

    if (result.rowCount !== 0) {
        return result.rows[0].org_msp;
    }

}