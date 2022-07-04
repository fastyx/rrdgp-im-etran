const cron = require('node-cron');
const logger = require('../config/logger');
const config = require(`../init_config`);
const pool = require('../init_db_pool');
const reg_init = require(`../reg_init`)
var parseString = require('xml2js').parseString;

const axiosDefaultConfig = {
    proxy: false
};
const axios = require('axios').create(axiosDefaultConfig);


cron.schedule('* * * * * *', async () => {

    logger.info(`Старт tableConsumerBC`);

    try {
        client = await pool.connect();
        var sql = `SELECT * from ${config.SYSTEM.dbFunctions.imesGetNext} ($1,$2)`;
        result = await client.query(sql, [config.MAIN.system, config.stages.blockchain]);
        await client.release();


        a = `{
            "transaction": "handleOp1",
            "contractId": "afffdab7-9a07-4cbf-ade4-f70b391327a2",
            "contractIdInvoice": "00000000-0000-0000-0000-000000000000",
            "payload": {
                "checkSum": "68332506a87fd485f7bc7e3df63c0fd73ec4f0c6a0bcba2c99c6206b15441cc0",
                "claimId": "1164460556",
                "claimNumber": "0037377789",
                "clmSenderOKPO": "34296408",
                "otprRecipOKPO": "592152",
                "claimRegDate": 1626855656,
                "clmStartDate": 1626642000
            },
            "opts": null
        }`;

        if (result.rowCount !== 0) {

            for (row of result.rows) {
                console.log("jasjkashjksd");
                console.log(a);
                console.log(JSON.parse(a));

                try {
                response = await axios.post(`http://${config.SYSTEM.restConfig.invoke.host}:${config.SYSTEM.restConfig.invoke.port}/${config.SYSTEM.restConfig.invoke.name}`, JSON.parse(a))
                } catch(e){
                    console.log(e)
                }
                console.log(`Успешный ответ`)

            }
        }
    }
    catch {
        await client.release();
        reg_info = `Ошибка при считывании информации из очереди процедурой ${config.SYSTEM.dbFunctions.imesGetNext}. Фаза 2`;
        reg_init.regError(null, null, null, 2, 1, null, reg_info, null, null, e);
    }

});
