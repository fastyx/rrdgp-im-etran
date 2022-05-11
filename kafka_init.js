const logger = require("./config/logger");
const kafka = require('kafka-node');
const config = require(`./init_config`);

if (config.SYSTEM.kafkaConfig.producer.active) {
    HighLevelProducer = kafka.HighLevelProducer;
    client = new kafka.KafkaClient({ kafkaHost: `${config.SYSTEM.kafkaConfig.producer.nodes}` });
    producer = new HighLevelProducer(client);
    producer.on('ready', function () {
        logger.info(`Kafka producer готов к работе ${config.SYSTEM.kafkaConfig.producer.nodes}`)
        config.SYSTEM.kafkaConfig.producer.status = 1;
    });

    producer.on('error', function (err) {
        logger.debug("Ошибка при запуске Kafka producer")
        logger.debug(err);
        config.SYSTEM.kafkaConfig.producer.status = 0;
    })
} else{
    logger.info("Producer kafka выключен");
}
