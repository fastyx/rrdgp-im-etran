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



/*
describe("invoice", async function () {


    before(async function () {
        try {
            //client = await pool.connect();
        } catch (e) {
            console.log(e)
        }
    });

    after(async function () {
    });

    it('send <invoice_31> request: MAIN PATH', (done) => {
        let testReq = fs.readFileSync('./test/test_data/invoice_31.xml', 'utf8');
        testReq = replaceall("xxxxxxxxxxxxxxxxxxxxx", data.idSm, testReq);       // подстановка idSm
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 0);
                    assert.equal(result.responseClaim.message[0], `Ок`);
                    parseString(testReq, async function (err, request) {
                        // etran_invoice
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.etranInvoice} where id_sm=($1)`, [data.idSm]);
                        assert.equal(res.rowCount, 1);
                        // source_information
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.sourceInformation} where id_sm=($1) and document_number=($2)`, [data.idSm, request.requestInvoice.invoice[0].invNumber[0].$.value]);
                        assert.equal(res.rowCount, 1);
                        // bundle_invoice
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.bundleInvoice} where id_sm=($1)`, [data.idSm]);
                        assert.equal(res.rowCount, 1);
                        // bundle_car
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.bundleCar} where id_sm=($1)`, [data.idSm]);
                        assert.equal(res.rowCount, 3);
                        // rrdgp_car
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.rrdgpCar} where id_sm=($1)`, [data.idSm]);
                        assert.equal(res.rowCount, 3);
                        // bundle_cont
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.bundleCont} where id_sm=($1)`, [data.idSm]);
                        assert.equal(res.rowCount, 2);
                        // rrdgp_cont
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.rrdgpCont} where id_sm=($1)`, [data.idSm]);
                        assert.equal(res.rowCount, 2);
                        // role_org 
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.roleOrg} where id_sm=($1) and role_id in ('sender','recip','payer','carrier')`, [data.idSm]);
                        assert.equal(res.rowCount, 6);
                        // dues
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.dues} where id_sm=($1)`, [data.idSm]);
                        assert.equal(res.rowCount, 0);
                        // objects_tracking
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.objectsTracking} where id_sm=($1) and status_invoice=2`, [data.idSm]);
                        assert.equal(res.rowCount, 1);
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.objectsTracking} where id_sm=($1)`, [data.idSm]);
                        assert.equal(res.rowCount, 5);
                        // event_tracking
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.eventTracking}`);
                        assert.equal(res.rowCount, 20);
                        // regSql
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`);
                        assert.equal(res.rowCount, 0);

                        done();
                    });
                });
            });
    });

    it('send <invoice_35> request: MAIN PATH', async (done) => {
        let testReq = fs.readFileSync('./test/test_data/invoice_35.xml', 'utf8');
        testReq = replaceall("xxxxxxxxxxxxxxxxxxxxx", data.idSm, testReq);       // подстановка idSm
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 0);
                    assert.equal(result.responseClaim.message[0], `Ок`);
                    parseString(testReq, async function (err, request) {
                        // etran_invoice
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.etranInvoice} where id_sm=($1) and invoice_state_id=($2) and status_invoice=2`,
                            [data.idSm, request.requestInvoice.invoice[0].invoiceStateID[0].$.value]);
                        assert.equal(res.rowCount, 1);
                        // source_information
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.sourceInformation} where id_sm=($1) and document_state_id=($2)`,
                            [data.idSm, request.requestInvoice.invoice[0].invoiceStateID[0].$.value]);
                        assert.equal(res.rowCount, 1);
                        // bundle_invoice
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.bundleInvoice} where id_sm=($1)`,
                            [data.idSm]);
                        assert.equal(res.rowCount, 1);
                        // bundle_car
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.bundleCar} where id_sm=($1)`, [data.idSm]);
                        assert.equal(res.rowCount, 2);
                        // rrdgp_car
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.rrdgpCar} where id_sm=($1)`, [data.idSm]);
                        assert.equal(res.rowCount, 2);
                        // bundle_cont
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.bundleCont} where id_sm=($1)`, [data.idSm]);
                        assert.equal(res.rowCount, 1);
                        // rrdgp_cont
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.rrdgpCont} where id_sm=($1)`, [data.idSm]);
                        assert.equal(res.rowCount, 1);
                        // dues
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.dues} where id_sm=($1)`, [data.idSm]);
                        assert.equal(res.rowCount, 3);
                        // role_org 
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.roleOrg} where id_sm=($1) and role_id in ('sender','recip','payer','carrier')`, [data.idSm]);
                        assert.equal(res.rowCount, 6);
                        // objects_tracking
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.objectsTracking} where id_sm=($1) and car_end_date is not null`, [data.idSm]);
                        assert.equal(res.rowCount, 1);
                        // event_tracking
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.eventTracking} where status_track=2`);
                        assert.equal(res.rowCount, 6);
                        // regSql
                        res = await client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`);
                        assert.equal(res.rowCount, 0);

                        done();
                    });
                });
            });
    });


    it('send <invoice_31> Invoice: не найден путь xmlCfg.claim_doc_route.invoicestateid', (done) => {
        let testReq = fs.readFileSync('./test/error_data/invoice_31_error_1.xml', 'utf8');
        testReq = replaceall("xxxxxxxxxxxxxxxxxxxxx", data.idSm, testReq);       // подстановка idSm
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.equal(result.responseClaim.message[0], `Invoice: не найден путь xmlCfg.claim_doc_route.invoicestateid`);
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        done();
                    });
                });
            });
    });

    it(`send <invoice_31> Invoice: ошибка при чтении  ${config.SYSTEM.dbTables.bundleClaim}`, async (done) => {
        let testReq = fs.readFileSync('./test/test_data/invoice_31.xml', 'utf8');
        testReq = replaceall("xxxxxxxxxxxxxxxxxxxxx", data.idSm, testReq);       // подстановка idSm
        config.SYSTEM.dbTables.bundleClaim = 'bundleClaim$$$';
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.equal(result.responseClaim.message[0], `Invoice: ошибка при чтении  ${config.SYSTEM.dbTables.bundleClaim} idSm=${data.idSm}`);
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        config.SYSTEM.dbTables.bundleClaim = "public.bundle_claim";
                        done();
                    });
                });
            });
    });

    it(`send <invoice_31> Invoice. SQL_message: не найден claim_number по id_sm`, async (done) => {
        let testReq = fs.readFileSync('./test/error_data/invoice_31_error_2.xml', 'utf8');
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.equal(result.responseClaim.message[0], `Invoice. SQL_message: не найден claim_number по id_sm = e40cb41b-6d42-498e-ae1e-14847008e841 в ${config.SYSTEM.dbTables.bundleClaim}`);
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        done();
                    });
                });
            });
    });

    it(`send <invoice_31> Invoice. SQL_message: не найден xmlCfg.invoice_doc_route.invloadclaim_number или xmlCfg.invoice_doc_route.invclaimnumber`, async (done) => {
        let testReq = fs.readFileSync('./test/error_data/invoice_31_error_3.xml', 'utf8');
        testReq = replaceall("xxxxxxxxxxxxxxxxxxxxx", data.idSm, testReq);       // подстановка idSm
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.equal(result.responseClaim.message[0], `Invoice. SQL_message: не найден xmlCfg.invoice_doc_route.invloadclaim_number или xmlCfg.invoice_doc_route.invclaimnumber`);
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        done();
                    });
                });
            });
    });

    it(`send <invoice_31> Invoice: claim_number != invclaimnumber`, async (done) => {
        let testReq = fs.readFileSync('./test/error_data/invoice_31_error_4.xml', 'utf8');
        testReq = replaceall("xxxxxxxxxxxxxxxxxxxxx", data.idSm, testReq);       // подстановка idSm
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.equal(result.responseClaim.message[0], `Invoice: claim_number=0037377789 != invclaimnumber=0037377790`);
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        done();
                    });
                });
            });
    });


});
*/