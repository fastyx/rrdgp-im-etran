const logger = require('./config/logger');
const config = require('./init_config');

var reg_init = {};

module.exports = reg_init;

// Registration in reg_message
reg_init.regMessage = function (id_sm, doc_type, message, check_sum, reg_type, system_type, state_id, doc_number, doc_id) {
  logger.debug(`reg_init.regMessage: регистрация запроса. Тип регистрационной записи: ${reg_type}`);
  try {
    var sql = `insert into ${config.SYSTEM.dbTables.regMessage} (id_sm, doc_type, message, check_sum, reg_type, system_type, state_id, doc_number, doc_id) 
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
    client.query(sql, [id_sm, doc_type, message, check_sum, reg_type, system_type, state_id, doc_number, doc_id]);
  } catch (e) {
    logger.error(e);
    logger.error(`reg_init. regMessage. Ошибка при вставке в таблицу регистрации ${config.SYSTEM.dbTables.regMessage}. Тип регистрационной записи: ${reg_type}`);
  }
};

// Registration in reg_sql
reg_init.regError = function (id_sm, doc_type, check_sum, reg_type, system_type, state_id, reg_info, reg_text, reg_parms, reg_code) {
  logger.debug(`reg_sql.regSql: регистрация запроса. Тип регистрационной записи: ${reg_type}`);
  try {
    var sql = `insert into ${config.SYSTEM.dbTables.regSql} (id_sm, doc_type, check_sum, reg_type, system_type, state_id, reg_info, reg_text, reg_parms, reg_code) 
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;
    client.query(sql, [id_sm, doc_type, check_sum, reg_type, system_type, state_id, reg_info, reg_text, reg_parms, reg_code]);
  } catch (e) {
    logger.error(e);
    logger.error(`reg_sql. regMessage. Ошибка при вставке в таблицу регистрации ${config.SYSTEM.dbTables.regSql}. Тип регистрационной записи: ${reg_type}`);
  }
};