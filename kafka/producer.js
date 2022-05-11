const logger = require(`../config/logger`);
const config = require('../init_config');
const xml = require('xml');

exports.push = async function (key, request) {

    payloads = [{ topic: 'etranTopic', key: key, messages: request }];

    if (config.SYSTEM.kafkaConfig.producer.status === 1) {
        producer.send(payloads, (err, data) => {
            if (err) {
                logger.debug("producer error: ");
                logger.debug(err);
            }
        });
        return xml({ responseClaim: [{idSm: key}, { status: 0 }, { message: "Ок" }] });
    }
    else {
        return xml({ responseClaim: [{ status: 1 }, { message: "Ошибка. Очередь Kafka недоступна" }] });
    }
}