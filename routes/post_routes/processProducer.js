/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const logger = require('../../config/logger')
const config = require('../../init_config');
const bh = require('../../kafka/ProducerHandler');
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var appRouter = async function (app) {
    app.post(`/${config.SYSTEM.restConfig.etranService.name}`, async function (req, res) {
        var eventResult = `<responseClaim><status>1</status><message>Error in request process</message></responseClaim>`;   // Default response (filled manually for reliability)
        try {
            eventResult = await bh.producerHandler(req);
        } catch (e) {
            logger.error(e);
        } finally {
            await res.send(eventResult);
        }
    });
}
module.exports = appRouter;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////