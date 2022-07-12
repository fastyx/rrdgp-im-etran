const config = require(`../init_config`);
const bh = require(`../etran/ConsumerHandlerNew`);


exports.stageDatabase = async function (jsonObject) {

    try {
        response = await bh.consumerHandlerNew(jsonObject.data.message);
        jsonObject.data.transactions = response.transactions;
        return { "status": 0, "data": jsonObject };
    } catch (e) {
        console.log(e)
    }
    return { "status": 1 };
}
