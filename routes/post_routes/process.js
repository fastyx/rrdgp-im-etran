/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const logger = require('../../config/logger')
const config = require('../../init_config');
const pool = require('../../init_db_pool');
const bh = require('../../etran/baseHandler');
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var appRouter = async function (app) {
    app.post(`/${config.SYSTEM.restConfig.etranService.name}`, async function (req, res) {
        var eventResult = `<responseClaim><status>1</status><message>Error in request process</message></responseClaim>`;   // Default response (filled manually for reliability)
        try {
            logger.debug(JSON.stringify(config));
            logger.debug(req.rawBody);

            client = await pool.connect();
            try {
                eventResult = await bh.baseHandler(req, res, client, config);
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