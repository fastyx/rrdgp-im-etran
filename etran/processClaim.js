const xml = require('xml');                                 //для работы с XML
const logger = require('../config/logger');
// Заявка
const opClaim = require('./handleOpClaim');
const { BaseClaim } = require('./dto/baseClaim.js')
const { ClaimOp01 } = require('./dto/claimOp01.js')
const { ClaimOp02 } = require('./dto/claimOp02.js')
const { ClaimOp2102 } = require('./dto/claimOp2102.js')

const reg_init = require('../reg_init');

exports.processClaim = async function (req, res, client, config, xmlCfg) {

    claim = new BaseClaim(req, xmlCfg);

    switch (Number(xmlCfg.claim_doc_route.claimstateid.$.value)) {
        case 70:
            claim = new ClaimOp01(req, xmlCfg);
            break;
        case 71: case 72: case 73: case 77: case 124: case 74: case 219:
            claim = new ClaimOp02(req, xmlCfg);
            break;
        case 162:
            claim = new ClaimOp2102(req, xmlCfg);
            break;
        default:
            reg_info = `Claim: не найден handleOp для xmlCfg.claim_doc_route.claimstateid=${xmlCfg.claim_doc_route.claimstateid.$.value}`;
            reg_init.regError(claim.idSm, 12, claim.checkSum, 2, 1, claim.claimStateID, reg_info, null, null, null);
            return xml({ responseClaim: [{ status: 1 }, { message: reg_info }] });     
    }

    return await opClaim.handleOpClaim(req, res, client, config, xmlCfg, claim);
}