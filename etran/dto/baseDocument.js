const checksum = require('json-checksum');                    //Для расчета контрольной суммы документа
const logger = require('../../config/logger');

class BaseDocument {

    constructor(req) {
        try {

            //Входной документ
            this.inputDocument = req.rawBody;                //rawBody - исходный XML документ

            //Контрольная сумма
            this.checkSum = checksum(req.rawBody);         //контрольная сумма по исходному документу
        }
        catch (e) {
            logger.error(`baseDocument: ошибка парсинга базовых показателей document`);
            logger.error(e);
        }
    }
}

module.exports.BaseDocument = BaseDocument;