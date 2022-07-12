const cron = require('node-cron');
const logger = require('../config/logger');
const config = require(`../init_config`);
const reg_init = require(`../reg_init`)

const axiosDefaultConfig = {
    proxy: false
};
const axios = require('axios').create(axiosDefaultConfig);

logger.info(`Старт tableConsumerBlockchain`);

let isRun = false;

cron.schedule('* * * * * *', async () => {

    if (!isRun) {
        isRun = true;

        let currentPhase = config.stages.blockchain;
        let nextPhase = config.stages.violation;
        let process = true;

        try {
            let sql = `SELECT * from ${config.SYSTEM.dbFunctions.imesGetNext} ($1,$2)`;
            let result = await client.query(sql, [config.MAIN.system, currentPhase]);

            if (result.rowCount !== 0) {
                for (row of result.rows) {

                    console.log(`${row.imes_id}. tableConsumerBlockchain`);

                    let response = null;
                    try {
                        let jsonData = JSON.parse(row.imes_body_ext);
                        let success = true;
                        for (message of jsonData.data.transactions) {

                            // транзакции, которые не пишем в БЧ
                            if (message.transaction == 'handleDoc') {
                                nextPhase = config.stages.end;
                                process = false;
                                success = false;
                            }
                            else {
                                response = await axios.post(`http://${config.SYSTEM.restConfig.invoke.host}:${config.SYSTEM.restConfig.invoke.port}/${config.SYSTEM.restConfig.invoke.name}`, message)
                                if (response.data.code !== 0) {
                                    console.log(response)
                                    success = false;
                                    reg_info = `Ошибка. RC=${response.data.code} при вызове ${config.SYSTEM.restConfig.invoke.name}`;
                                    reg_init.regError(null, null, null, 2, 1, null, reg_info, sql, null, null);
                                }
                            }
                        }

                        let jsonObject = JSON.parse(row.imes_body_ext);
                        if (success) {
                            jsonObject.data.violations = response.data.data.condCheckList;
                        }

                        let sql_imesEndPhase = null;
                        try {
                            sql_imesEndPhase = `SELECT * from ${config.SYSTEM.dbFunctions.imesEndPhase} ($1,$2,$3,$4,$5,$6,$7,$8)`;
                            await client.query(sql_imesEndPhase, [row.imes_id, nextPhase, 0, "ok", process, false, jsonObject, 20]);
                        } catch (e) {
                            console.log('tableConsumerBlockchain');
                            console.log(row.proc_phase_num + " " + row.imes_id)
                            console.log(e)
                            reg_info = `Ошибка при обновлении информации в очереди процедурой ${config.SYSTEM.dbFunctions.imesEndPhase}`;
                            reg_init.regError(null, null, null, 2, 1, null, reg_info, sql_imesEndPhase, null, e);
                        }

                    } catch (e) {
                        console.log('tableConsumerBlockchain');
                        console.log(row.proc_phase_num + " " + row.imes_id)
                        console.log(e)
                    }
                }
            }
        }
        catch (e) {
            console.log('tableConsumerBlockchain');
            console.log(row.proc_phase_num + " " + row.imes_id)
            console.log(e)
            reg_info = `Ошибка при считывании информации из очереди процедурой ${config.SYSTEM.dbFunctions.imesGetNext}. Фаза 2`;
            reg_init.regError(null, null, null, 2, 1, null, reg_info, null, null, e);
        } finally {
            isRun = false;
        }
    }
});
