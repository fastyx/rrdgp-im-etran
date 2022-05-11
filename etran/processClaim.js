const xml = require('xml');                                 //для работы с XML
const logger = require('../config/logger');
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

// Заявка
const opClaim = require('./handleOpClaim');
const { BaseClaim } = require('./dto/baseClaim.js')
const { ClaimOp01 } = require('./dto/claimOp01.js')
const { ClaimOp02 } = require('./dto/claimOp02.js')
const { ClaimOp2102 } = require('./dto/claimOp2102.js')

const reg_init = require('../reg_init');

exports.processClaim = async function (req, res, client, config, xmlCfg) {

    claim = new BaseClaim(req, xmlCfg);

    if (!(typeof xmlCfg.claim_doc_route.claimstateid === 'undefined')) {
        logger.debug(`Claim: найден xmlCfg.claim_doc_route.claimstateid=${xmlCfg.claim_doc_route.claimstateid.$.value}`);
        switch (Number(xmlCfg.claim_doc_route.claimstateid.$.value)) {
            case 70:
                claim = new ClaimOp01(req, xmlCfg);

                try {
                    logger.debug(`Claim: определяем id_sm из ${config.SYSTEM.dbTables.etranClaim} по claim_number=${claim.claimNumber}`);
                    sql = `select id_sm from ${config.SYSTEM.dbTables.etranClaim} where claim_number=($1)`
                    result = await client.query(sql, [claim.claimNumber]);
                } catch (e) {
                    reg_info = `Claim: ошибка при чтении таблицы ${config.SYSTEM.dbTables.etranClaim} по claim_number=${claim.claimNumber}`;
                    reg_init.regError(claim.idSm, 12, claim.checkSum, 1, 1, claim.claimStateID, reg_info, sql, null, e);
                    return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });                  //+++ tests (send <claim_70> request: etran_claim ошибка чтения) +++
                }

                // На все случаи жизни. Смотрим, что нам дал ЭТРАН, и в зависимости от этого что-то делаем. Или не делаем.
                if (result.rowCount === 0 && claim.idSm === null) {
                    logger.debug(`Claim: случай 1.  данные по claim_number=${claim.claimNumber} не найдены в ${config.SYSTEM.dbTables.etranClaim}. idSm не передан. Генерируется новый idSm`);
                    claim.idSm = getuuid();
                }
                else if (result.rowCount !== 0 && claim.idSm === null) {
                    logger.debug(`Claim: случай 2. данные по claim_number=${claim.claimNumber} найдены в ${config.SYSTEM.dbTables.etranClaim}. idSm не передан. Присваивается idSm из таблицы`);
                    claim.idSm = result.rows[0].id_sm;
                }
                else if (result.rowCount !== 0 && claim.idSm !== null) {
                    logger.debug(`Claim: случай 3. данные по claim_number=${claim.claimNumber} найдены в ${config.SYSTEM.dbTables.etranClaim}. Передан idSm=${claim.idSm}`);
                    if (claim.idSm === result.rows[0].id_sm) {
                        logger.debug(`Claim: случай 3. idSm(из таблицы)-${result.rows[0].id_sm} === idSm(переданный в документе)-${claim.idSm}. Работаем с этим значением`);
                    }
                    else {
                        // Регистрация в reg_sql
                        reg_info = `Claim: по claim_number=${claim.claimNumber} в БД не обнаружен id_sm=${claim.idSm}`;         
                        reg_init.regError(claim.idSm, 12, claim.checkSum, 2, 1, claim.claimStateID, reg_info, sql, null, null);
                        return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });                                          // +++ tests (send <claim_70> request: по claim_number не обнаружен id_sm в etran_claim') +++
                    }
                }
                else if (result.rowCount === 0 && claim.idSm !== null) {
                    logger.debug(`Claim: случай 4. данные по claim_number=${claim.claimNumber} не найдены в ${config.SYSTEM.dbTables.etranClaim}. Передан idSm=${claim.idSm}`);
                    reg_info = `Claim: по claim_number=${claim.claimNumber} и idSm=${claim.idSm} данные в БД не найдены`;
                    reg_init.regError(claim.idSm, 12, claim.checkSum, 2, 1, claim.claimStateID, reg_info, sql, null, null);
                    return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });                                              // +++ tests (send <claim_70> по claim_number и id_sm не найдены данные в etran_claim) +++
                }
                break;
            case 71: case 72: case 73: case 77: case 124: case 74: case 219:
                claim = new ClaimOp02(req, xmlCfg);
                if (claim.idSm === null) {
                    reg_info = `не передан idSm`;
                    reg_init.regError(claim.idSm, 12, claim.checkSum, 2, 1, claim.claimStateID, reg_info, null, null, null);
                    return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });      //+++ tests (send <claim_71> request: не передан idSm) +++
                }
                break;
            case 162:
                claim = new ClaimOp2102(req, xmlCfg);
                if (claim.idSm === null) {
                    reg_info = `не передан idSm`;
                    reg_init.regError(claim.idSm, 12, claim.checkSum, 2, 1, claim.claimStateID, reg_info, null, null, null);
                    return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });      //+++ tests (send <claim_162> request: не передан idSm) +++
                }
                break;
            default:
                reg_info = `Claim: не найден handleOp для xmlCfg.claim_doc_route.claimstateid=${xmlCfg.claim_doc_route.claimstateid.$.value}`;
                reg_init.regError(claim.idSm, 12, claim.checkSum, 2, 1, claim.claimStateID, reg_info, null, null, null);
                return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });      //+++ tests (Claim: не найден handleOp для xmlCfg.claim_doc_route.claimstateid=666) +++
        }
    }
    else {
        reg_info = `Claim: не найден путь xmlCfg.claim_doc_route.claimstateid`;
        reg_init.regError(claim.idSm, 12, claim.checkSum, 2, 1, claim.claimStateID, reg_info, null, null, null);
        return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });;     //+++ tests (Claim: не найден путь xmlCfg.claim_doc_route.claimstateid) +++
    }
    return await opClaim.handleOpClaim(req, res, client, config, xmlCfg, claim);
}