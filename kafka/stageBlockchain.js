const config = require(`../init_config`);
const axiosDefaultConfig = {
    proxy: false
};
const axios = require('axios').create(axiosDefaultConfig);

exports.stageBlockchain = async function (jsonObject) {

    try {
        let success = true;
        for (message of jsonObject.data.transactions) {

            response = await axios.post(`http://${config.SYSTEM.restConfig.invoke.host}:${config.SYSTEM.restConfig.invoke.port}/${config.SYSTEM.restConfig.invoke.name}`, message)

            if (response.data.code !== 0) {
                console.log(response)
                success = false;
            }
        }
        if (success) {
            jsonObject.data.violations = response.data.data.condCheckList;
            return { "status": 0, "data": jsonObject };
        }
    } catch (e) {
        console.log(e)
    }
    return { "status": 1 };
}
