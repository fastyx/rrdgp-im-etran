
const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();                                 // using!!!!!!!!!!!!!! not delete!!!!!!!!!!!!
chai.use(chaiHttp);
const server = require(`../app`);                           // без этого тоже ничего не работает... сразу не может найти should
var parseString = require('xml2js').parseString;
const version = require('../package.json')
const fs = require('fs');
var replaceall = require("replaceall");
const pool = require(`../init_db_pool`);
const config = require('../init_config');
const { ClientRequest } = require('http');

async function clearDb(client) {
    // claim
    await client.query(`delete from ${config.SYSTEM.dbTables.bundleClaim}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.etranClaim}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.etranClaimOtpr}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.etranClaimPayer}`);
    // invoice
    await client.query(`delete from ${config.SYSTEM.dbTables.etranInvoice}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.bundleInvoice}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.bundleCar}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.rrdgpCar}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.bundleCont}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.rrdgpCont}`);
    //await client.query(`delete from ${config.SYSTEM.dbTables.violation}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.dues}`);
    // document
    await client.query(`delete from ${config.SYSTEM.dbTables.bundleDocument}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.unreportCar}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.unreportDocument}`);
    // others
    await client.query(`delete from ${config.SYSTEM.dbTables.sourceInformation}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.roleOrg}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.objectsTracking}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.eventTracking}`);
    // registration
    await client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
    await client.query(`delete from ${config.SYSTEM.dbTables.regMessage}`);
}


describe("start test", async function () {


    it("delete data", async (done) => {
        client = await pool.connect();
        await clearDb(client);

        await assert.equal(1, 1)

        await client.release();

        done();
    });
});