const config = require(`../init_config`);

exports.stageViolation = async function (jsonObject) {
    
    try {
        const sql = `SELECT ${config.SYSTEM.dbFunctions.violationReg} ($1,$2)`;
        const response = await client.query(sql, [jsonObject.data.idSm, jsonObject.data.violations[0]]);
        if (response.rows[0].violation_reg == 0) {
            return { "status": 0, "data": jsonObject };
        }
    } catch (e) {
        console.log(e)
    }
    return { "status": 1 };
}
