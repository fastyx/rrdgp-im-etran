const config = require(`../init_config`);
const axiosDefaultConfig = {
    proxy: false
};
const axios = require('axios').create(axiosDefaultConfig);

exports.stageChannel = async function (jsonObject) {

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

                        return { "status": 0, "data": jsonObject };
                    } catch (e) {
                        console.log(e)
                    }
                }
                else{
                    console.log(response)
                }
            } catch (e) {
                console.log(e);
            }
        } else {
            console.log("считываем значение канала");
            jsonObject.data.channels.channel = result.rows[0].channel_name;
            return { "status": 0, "data": jsonObject };
        }
    } catch (e) {
        console.log(e);
    }
    return { "status": 1 };
}
