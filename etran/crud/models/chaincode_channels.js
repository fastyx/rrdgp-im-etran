// bundle_history

const config = require('../../../init_config');

var chaincodeChannels = {};

module.exports = chaincodeChannels;

chaincodeChannels.insert = async function (channelName, idSm, channelConfig) {

    var sql = `INSERT INTO ${config.SYSTEM.dbTables.chaincodeChannels} 
        (
        channel_name,
        id_sm,
        channel_config
        ) VALUES 
        ($1,$2,$3)`;
    await client.query(sql, [
        channelName,
        idSm,
        channelConfig
    ]);
}