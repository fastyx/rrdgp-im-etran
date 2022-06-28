// bundle_history

const config = require('../../../init_config');

var bundleHistory = {};

module.exports = bundleHistory;

bundleHistory.insert = async function (idHistory, idSm, idSmInvoice, idSmCar, idSmCont, idSmDoc, stateId, dateOp, statusInvoice, typeOp) {

    if (idSmInvoice === null) idSmInvoice = '00000000-0000-0000-0000-000000000000';
    if (idSmCar === null) idSmCar = '00000000-0000-0000-0000-000000000000';
    if (idSmCont === null) idSmCont = '00000000-0000-0000-0000-000000000000';
    if (idSmDoc === null) idSmDoc = '00000000-0000-0000-0000-000000000000';

    var sql = `INSERT INTO ${config.SYSTEM.dbTables.bundleHistory} 
        (
        id_history,
        id_sm,
        id_sm_invoice,
        id_sm_car,
        id_sm_cont,
        id_sm_doc,
        state_id,
        date_op,
        status_invoice,
        type_op
        ) VALUES 
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;
    await client.query(sql, [
        idHistory,
        idSm,
        idSmInvoice,
        idSmCar,
        idSmCont,
        idSmDoc,
        stateId,
        dateOp,
        statusInvoice,
        typeOp
    ]);
}