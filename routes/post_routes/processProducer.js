/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const logger = require('../../config/logger')
const config = require('../../init_config');
const bh = require('../../kafka/ProducerHandler');
const pool = require('../../init_db_pool');
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var appRouter = async function (app) {
    app.post(`/${config.SYSTEM.restConfig.etranService.name}New`, async function (req, res) {
        var eventResult = `<responseClaim><status>1</status><message>Error in request process</message></responseClaim>`;   // Default response (filled manually for reliability)
        try {
            //logger.debug(JSON.stringify(config));

            client = await pool.connect();
            try {
                eventResult = await bh.producerHandler(req);
            } finally {
                await client.release();
            }
        } catch (e) {
            logger.error(e);
        } finally {
            await res.send(eventResult);
        }
    });
}
module.exports = appRouter;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////