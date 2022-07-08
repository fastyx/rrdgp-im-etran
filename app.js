/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const express = require('express');
const xmlparser = require('express-xml-bodyparser');
const xml = require('xml');
const logger = require('./config/logger');
const config = require('./init_config');
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Логирование запуска текущей версии
logger.info(`Server: сервер RRD_GP_ETRAN запущен. Текущая версия: Version: ${config.MAIN.version}`);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var app = express();
app.use(xmlparser({ trim: false, explicitArray: false }));
app.use(function (err, req, res, next) {
    logger.error(err.stack);
    res.send(xml({ responseClaim: [{ status: 1 }, { message: "Error: ошибка при парсинге XML. В некоторых случаях приводит к остановке сервиса и требуется перезапуск" }] }));
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(config.SYSTEM.restConfig.etranService.port, () => {
    logger.info(`Server: сервер запущен. Порт: ${config.SYSTEM.restConfig.etranService.port}`);
    logger.info(JSON.stringify(config));

    let httpRequestDurationMicroseconds = null;
    require("./routes/get_routes/prom.js")(app, httpRequestDurationMicroseconds);
    require("./routes/post_routes/processConsumer.js")(app, httpRequestDurationMicroseconds);
    require("./routes/post_routes/processProducer.js")(app);
    require("./routes/get_routes/isrun.js")(app);
    require(`./kafka/tableConsumerPreparing.js`);
    require(`./kafka/tableConsumerDatabase.js`);
    //require(`./kafka/tableConsumerChannel.js`);
    //require(`./kafka/tableConsumerBlockchain.js`);
    //require(`./kafka/tableConsumerViolation.js`);
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
