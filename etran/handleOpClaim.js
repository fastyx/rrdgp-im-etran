const bc = require("../app");
const xml = require('xml');                                 //для работы с XML
const fs = require('fs');
const logger = require('../config/logger');

const reg_init = require('../reg_init');

const axiosDefaultConfig = {
  proxy: false
};
const axios = require('axios').create(axiosDefaultConfig);

const insClaimOp = require('./crud/sqlClaimOp.js');

exports.handleOpClaim = async function (req, res, client, config, xmlCfg, claim) {

  logger.debug("handleOpClaim_called");

  var response;

  // Регистрация
  reg_init.regMessage(claim.idSm, 12, null, claim.checkSum, 1, 1, claim.claimStateID, claim.claimNumber, claim.claimId);

  // Передача нормативов в БЧ (а только после этого запись транзакции в БЧ)
  if (claim.transaction === 'handleOp2') {
    logger.debug(`handleOpClaim. handleOp2 called`);

    //Формируем объект для передачи
    logger.debug(`handleOpClaim. Вызов handleConditions`);
    var payload = await condGen(config, client, claim);
    //console.log(payload);
    let jsonObject = { transaction: "handleConditions", contractId: claim.idSm, payload: payload, opts: claim.opts };
    logger.info("Sending to BlockChain: " + JSON.stringify(jsonObject));              //console.log(jsonObject);

    try {
      response = await axios.post(`http://${config.SYSTEM.restConfig.invoke.host}:${config.SYSTEM.restConfig.invoke.port}/${config.SYSTEM.restConfig.invoke.name}`, jsonObject)
    } catch (e) {
      reg_info = `handleOpclaim. Ошибка при вызове транзакции handleConditions: ${JSON.stringify(e)}`;
      reg_init.regError(claim.idSm, 12, claim.checkSum, 0, 1, claim.claimStateID, reg_info, jsonObject, null, e);
      return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });      // +++ tests (send <claim_71> ОhandleOpclaim. handleOpclaim. Ошибка при вызове транзакции handleConditions) +++
    }
    logger.debug(`handleOpClaim. handleConditions called`);
    if (response.data.code !== 0) {
      reg_info = `handleOpclaim: response.data.code !== 0: ${JSON.stringify(response.data)}`;
      reg_init.regError(claim.idSm, 12, claim.checkSum, 2, 1, claim.claimStateID, reg_info, jsonObject, null, null);
      return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });    // +++ tests (send <claim_71> handleOpclaim: response.data.code !== 0 (handleCondition)) +++
    }
  }

  //Формируем объект для передачи
  payload = {
    checkSum: claim.checkSum,
    claimId: claim.claimId,
    claimNumber: claim.claimNumber,
    clmSenderOKPO: claim.clmSenderOkpo,
    otprRecipOKPO: claim.otprRecipOkpo[0],
    claimRegDate: claim.epochClaimRegDate,                            //handleOp1     //handleOp1000
    claimClmAgreementAgrDate: claim.epochClaimClmAgreementAgrDate,    //handleOp2
    claimEndDate: claim.epochClaimEndDate,                            //handleOp2102
    clmStartDate: claim.epochClmStartDate                             //handleOp1     //handleOp2
  };
  let jsonObject = { transaction: claim.transaction, contractId: claim.idSm, payload: payload, opts: claim.opts };
  logger.info("Sending to BlockChain: " + JSON.stringify(jsonObject));              //console.log(jsonObject);

  //Вызываем REST-сервис записи в БЧ
  res.set('Content-Type', 'text/xml');
  try {
    response = await axios.post(`http://${config.SYSTEM.restConfig.invoke.host}:${config.SYSTEM.restConfig.invoke.port}/${config.SYSTEM.restConfig.invoke.name}`, jsonObject)
  } catch (e) {
    reg_info = `handleOpclaim. Ошибка при вызове сервиса: ${JSON.stringify(e)}`;
    reg_init.regError(claim.idSm, 12, claim.checkSum, 0, 1, claim.claimStateID, reg_info, jsonObject, null, e);
    return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });      // +++ tests (send <claim_70> handleOpclaim. Ошибка при вызове сервиса) +++
  }
  logger.debug(`handleOpClaim. transaction called`);
  if (response.data.code === 0) {

    // Регистрация
    reg_init.regMessage(claim.idSm, 12, null, claim.checkSum, 2, 1, claim.claimStateID, claim.claimNumber, claim.claimId);

    // Запись в Postgres 
    await insClaimOp.sqlClaimOp(claim, client, config, response);

    if (claim.transaction === 'handleOp1') {
      return xml({ responseClaim: [{ idSm: claim.idSm.toString() }, { status: 0 }, { message: "Ок" }] });
    }
  }
  else {
    reg_info = `handleOpclaim: response.data.code !== 0: ${JSON.stringify(response.data)}`;
    reg_init.regError(claim.idSm, 12, claim.checkSum, 2, 1, claim.claimStateID, reg_info, jsonObject, null, null);
    return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });    // +++ tests (send <claim_162> handleOpclaim: response.data.code !== 0 (handleOp)) +++
  }
  return xml({ responseClaim: [{ status: 0 }, { message: "Ок" }] });
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function condGen(config, client, claim) {

  var askmpnpCondArray = [4, 6, 7, 10, 11];
  var askmpnpArray = [null, null, null, null, null]

  logger.debug(`Claim. HandleOpClaim. Нормативы. Читаем 1,2,3,5,9 по ${config.SYSTEM.dbTables.tnProverNorm}`);
  var normCondArray = [1, 2, 3, 5, 9];
  var normArray = new Array();

  for (let i = 0; i < normCondArray.length; i++) {
    try {
      var sql = `SELECT norm::int from ${config.SYSTEM.dbTables.tnProverNorm} where id_prover = ($1)`;
      resultTnProverNorm = await client.query(sql, [normCondArray[i]]);
      if (resultTnProverNorm.rowCount !== 0) {
        normArray[i] = resultTnProverNorm.rows[0].norm;
      }
      else {
        normArray[i] = 0;
      }
    } catch (e) {
      reg_info = `Claim. handleOpCalim: ошибка при чтении ${config.SYSTEM.dbTables.tnProverNorm} по id_prover=${condArray[i]}`;
      reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
    }
  }

  logger.debug(`Claim. HandleOpClaim. Нормативы. Читаем 12,13,14 по ${config.SYSTEM.dbTables.tnNormMop} по sender_okpo = ${claim.clmSenderOkpo} и from_station_code = ${claim.clmFromStationCode}`);
  logger.debug(`Claim. HandleOpClaim. Нормативы. Читаем 15,16 по ${config.SYSTEM.dbTables.tnNormMop} по recip_okpo = ${claim.otprRecipOkpo[0]} и otpr_to_station_code = ${claim.otprToStationCode[0]}`);

  var mopCondArray = [12, 13, 14, 15, 16];
  var mopArray = new Array();

  for (let i = 0; i < mopCondArray.length; i++) {
    // 12,13,14
    if (mopCondArray[i] === 12 || mopCondArray[i] === 13 || mopCondArray[i] === 14) {
      try {
        var sql = `SELECT norm from ${config.SYSTEM.dbTables.tnNormMop} where sender_okpo=($1) and from_station_code=($2) and cond_id=($3)`;
        resultTnNormMop = await client.query(sql, [claim.clmSenderOkpo, claim.clmFromStationCode, mopCondArray[i]]);

        if (resultTnNormMop.rowCount !== 0) {
          mopArray[i] = resultTnNormMop.rows[0].norm;
        }
        else {
          mopArray[i] = null;
        }
      } catch (e) {
        reg_info = `Claim. handleOpCalim: ошибка при чтении ${config.SYSTEM.dbTables.tnNormMop} по sender_okpo = ${claim.clmSenderOkpo} и from_station_code = ${claim.clmFromStationCode}`;
        reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
      }
    }
    // 15,16
    if (mopCondArray[i] === 15 || mopCondArray[i] === 16) {
      try {
        var sql = `SELECT norm::int from ${config.SYSTEM.dbTables.tnNormMop} where recip_okpo=($1) and to_station_code = ($2) and cond_id=($3)`;
        resultTnNormMop = await client.query(sql, [claim.otprRecipOkpo[0], claim.otprToStationCode[0], mopCondArray[i]]);
        if (resultTnNormMop.rowCount !== 0) {
          mopArray[i] = resultTnNormMop.rows[0].norm;
        }
        else {
          mopArray[i] = null;
        }
      } catch (e) {
        reg_info = `Claim. handleOpCalim: ошибка при чтении ${config.SYSTEM.dbTables.tnNormMop} по recip_okpo = ${claim.otprRecipOkpo[0]} и otpr_to_station_code = ${claim.otprToStationCode[0]}`;
        reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
      }
    }
  }

  // 4,6,7  (если 12,13,14 = null)
  if (mopArray[0] === null && mopArray[1] === null && mopArray[2] === null) {

    logger.debug(`Claim. handleOpCalim: condId-12,13,14 = null. Читаем ${config.SYSTEM.dbTables.askmpnpContracts} для condId-7`);

    try {
      sql = `select contract_id, carriage_remove_time::int  from ${config.SYSTEM.dbTables.askmpnpContracts} where c_owner=($1) and station=($2)
      and contract_date_from<=($3) and contract_date_to>=($3)`;
      resultAskmpnpContracts = await client.query(sql, [claim.clmSenderId, claim.clmFromStationCode, claim.clmStartDate]);
      if (resultAskmpnpContracts.rowCount !== 0) {
        try {
          if (resultAskmpnpContracts.rows[0].carriage_remove_time !== 0)
            askmpnpArray[2] = resultAskmpnpContracts.rows[0].carriage_remove_time * 3600;

          logger.debug(`Claim. handleOpCalim: condId-12,13,14 = null. Читаем ${config.SYSTEM.dbTables.askmpnpContractsLun} для condId-4,6`);
          sql = `select unloading_norm_common::int, unloading_common::int from ${config.SYSTEM.dbTables.askmpnpContractsLun} where contract_id=($1)`
          resultAskmpnpContractsLun = await client.query(sql, [resultAskmpnpContracts.rows[0].contract_id]);
          if (resultAskmpnpContractsLun.rowCount !== 0) {
            if (resultAskmpnpContractsLun.rows[0].unloading_norm_common !== 0)
              askmpnpArray[0] = resultAskmpnpContractsLun.rows[0].unloading_norm_common * 3600;
            if (resultAskmpnpContractsLun.rows[0].unloading_common !== 0)
              askmpnpArray[1] = resultAskmpnpContractsLun.rows[0].unloading_common * 3600;
          }
        } catch (e) {
          reg_info = `Claim. handleOpCalim: ошибка при чтении ${config.SYSTEM.dbTables.askmpnpContractsLun} по contract_id = ${resultAskmpnpContracts.rows[0].contract_id}`;
          reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
        }
      }
      else {
        logger.debug(`Claim. handleOpCalim. Не найдена инофрмация в ${config.SYSTEM.dbTables.askmpnpContracts} по c_owner=${claim.clmSenderId} и station=${claim.clmFromStationCode}`);
      }
    } catch (e) {
      reg_info = `Claim. handleOpCalim: ошибка при чтении ${config.SYSTEM.dbTables.askmpnpContracts} по clmSenderId = ${claim.clmSenderId} и clmFromStationCode = ${claim.clmFromStationCode}`;
      reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
    }
  }
  // 10,11 (если 15,16 = null)
  if (mopArray[3] === null && mopArray[4] === null) {

    logger.debug(`Claim. handleOpCalim: condId-15,16 = null. Читаем ${config.SYSTEM.dbTables.askmpnpContracts} для condId-10,11`);

    try {
      sql = `select contract_id from ${config.SYSTEM.dbTables.askmpnpContracts} where c_owner=($1) and station=($2)
      and contract_date_from<=($3) and contract_date_to>=($3)`;
      resultAskmpnpContracts = await client.query(sql, [claim.otprRecipId[0], claim.otprToStationCode[0], claim.clmStartDate]);
      if (resultAskmpnpContracts.rowCount !== 0) {
        try {
          sql = `select unloading_norm_common::int, unloading_common::int from ${config.SYSTEM.dbTables.askmpnpContractsLun} where contract_id=($1)`
          resultAskmpnpContractsLun = await client.query(sql, [resultAskmpnpContracts.rows[0].contract_id]);
          if (resultAskmpnpContractsLun.rowCount !== 0) {
            if (resultAskmpnpContractsLun.rows[0].unloading_norm_common !== 0)
              askmpnpArray[3] = resultAskmpnpContractsLun.rows[0].unloading_norm_common * 3600;
            if (resultAskmpnpContractsLun.rows[0].unloading_common !== 0)
              askmpnpArray[4] = resultAskmpnpContractsLun.rows[0].unloading_common * 3600;
          }
        } catch (e) {
          reg_info = `Claim. handleOpCalim: ошибка при чтении ${config.SYSTEM.dbTables.askmpnpContractsLun} по contract_id = ${resultAskmpnpContracts.rows[0].contract_id}`;
          reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
        }
      }
      else {
        logger.debug(`Claim. handleOpCalim. Не найдена инофрмация в ${config.SYSTEM.dbTables.askmpnpContracts} по otprRecipId=${claim.otprRecipId[0]} и otprToStationCode=${claim.otprToStationCode[0]}`);
      }
    } catch (e) {
      reg_info = `Claim. handleOpCalim: ошибка при чтении ${config.SYSTEM.dbTables.askmpnpContracts} по recip_okpo_id = ${claim.otprRecipId[0]} и otpr_to_station_code = ${claim.otprToStationCode[0]}`;
      reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
    }
  }

  var payload = {
    "conditions": [
      {
        "condId": 1,
        "norm": normArray[0]
      },
      //{
      //  "condId": 2,
      //  "norm": normArray[1]
      //},
      {
        "condId": 3,
        "norm": normArray[2]
      },
      {
        "condId": 4,
        "norm": askmpnpArray[0]
      },
      //{
      //  "condId": 5,
      //  "norm": normArray[3]
      //},
      {
        "condId": 6,
        "norm": askmpnpArray[1]
      },
      {
        "condId": 7,
        "norm": askmpnpArray[2]
      },
      {
        "condId": 8,
        "norm": 0
      },
      {
        "condId": 9,
        "norm": normArray[4]
      },
      {
        "condId": 10,
        "norm": askmpnpArray[3]
      },
      {
        "condId": 11,
        "norm": askmpnpArray[4]
      },
      {
        "condId": 12,
        "norm": mopArray[0]
      },
      //{
      //  "condId": 13,
      //  "norm": mopArray[1]
      //},
      //{
      //  "condId": 14,
      //  "norm": mopArray[2]
      //},
      {
        "condId": 15,
        "norm": mopArray[3]
      },
      //{
      //  "condId": 16,
      //  "norm": mopArray[4]
      //},
      {
        "condId": 17,
        "norm": 0
      }
    ]
  };

  return payload;
}