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
const { TestData } = require('../test/testData.js')

data = new TestData(null);

describe("claim", function () {

    before(async function () {
        try {
            client = await pool.connect();
        } catch (e) {
            console.log(e)
        }
    });

    after(async function () {

    });


    it('send <claim_70> request: MAIN PATH', async (done) => {
        let testReq = fs.readFileSync('./test/test_data/claim_70.xml', 'utf8');
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, async function (err, result) {
                    res.should.have.status(200);
                    assert.notEqual(result.responseClaim.idSm[0], null);
                    assert.equal(result.responseClaim.status[0], 0);
                    assert.equal(result.responseClaim.message[0], `Ок`);
                    data.idSm = result.responseClaim.idSm[0];
                    parseString(testReq, async function (err, request) {
                        //var xmlCfg = require(`../xml_config`).getXmlConfig(request);
                        //claim = new ClaimOp01(request, xmlCfg);

                        // bundle_claim
                        //client.query(`SELECT * from ${config.SYSTEM.dbTables.bundleClaim} where id_sm=($1) and claim_id=($2) and claim_number=($3) `, [idSm, request.requestClaim.claim[0].claimID[0].$.value, request.requestClaim.claim[0].claimNumber[0].$.value], (err, res) => {
                        await client.query(`SELECT * from ${config.SYSTEM.dbTables.bundleClaim} where id_sm=($1)`, [data.idSm], (err, res) => {
                            assert.equal(res.rowCount, 1);
                        });
                        // source_information
                        await client.query(`SELECT * from ${config.SYSTEM.dbTables.sourceInformation} where id_sm=($1)`, [data.idSm], (err, res) => {
                            assert.equal(res.rowCount, 1);
                        });
                        // etran_claim
                        await client.query(`SELECT * from ${config.SYSTEM.dbTables.etranClaim} where id_sm=($1)`,
                            [data.idSm], (err, res) => {
                                assert.equal(res.rowCount, 1);
                            });
                        // etran_claim_otpr
                        await client.query(`SELECT * from ${config.SYSTEM.dbTables.etranClaimOtpr} where id_sm=($1)`,
                            [data.idSm], (err, res) => {
                                assert.equal(res.rowCount, 1);
                            });
                        // etran_claim_payer
                        await client.query(`SELECT * from ${config.SYSTEM.dbTables.etranClaimPayer} where id_sm=($1)`,
                            [data.idSm], (err, res) => {
                                assert.equal(res.rowCount, 1);
                            });
                        // role_org 
                        await client.query(`SELECT * from ${config.SYSTEM.dbTables.roleOrg} where id_sm=($1) and role_id in ('sender','recip','payer','carrier')`,
                            [data.idSm], (err, res) => {
                                assert.equal(res.rowCount, 4);
                            });
                        // objects_tracking
                        await client.query(`SELECT * from ${config.SYSTEM.dbTables.objectsTracking} where id_sm=($1) and claim_number=($2)`,
                            [data.idSm, request.requestClaim.claim[0].claimNumber[0].$.value], async (err, resObjectsTracking) => {
                                assert.equal(resObjectsTracking.rowCount, 1);
                                // event_tracking
                                await client.query(`SELECT * from ${config.SYSTEM.dbTables.eventTracking} where id_track=($1)`,
                                    [resObjectsTracking.rows[0].id_track], async (err, res) => {
                                        assert.equal(res.rowCount, 1);
                                    });
                            });
                        // regSql
                        await client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                            assert.equal(res.rowCount, 0);
                        });

                        // violation_reg
                        done();
                    });
                });
            });
    });

    it('send <claim_71> request: MAIN PATH', async (done) => {
        // delete from role_org
        client.query(`delete from ${config.SYSTEM.dbTables.roleOrg}`, async (err, res) => {
            let testReq = fs.readFileSync('./test/test_data/claim_71.xml', 'utf8');
            testReq = replaceall("xxxxxxxxxxxxxxxxxxxxx", data.idSm, testReq);       // подстановка idSm
            chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
                .post(`/${config.SYSTEM.restConfig.etranService.name}`)
                .send(testReq)
                .set("Content-Type", "application/xml")
                .end((err, res) => {
                    parseString(res.text, async function (err, result) {
                        res.should.have.status(200);
                        assert.equal(result.responseClaim.status[0], 0);
                        assert.equal(result.responseClaim.message[0], `Ок`);
                        parseString(testReq, async function (err, request) {
                            //var xmlCfg = require(`../xml_config`).getXmlConfig(request);
                            //claim = new ClaimOp01(request, xmlCfg);

                            // bundle_claim
                            await client.query(`SELECT * from ${config.SYSTEM.dbTables.bundleClaim} where id_sm=($1) and claim_number=($2)`, [data.idSm, request.requestClaim.claim[0].claimNumber[0].$.value], (err, res) => {
                                assert.equal(res.rowCount, 1);
                            });
                            // source_information
                            await client.query(`SELECT * from ${config.SYSTEM.dbTables.sourceInformation} where id_sm=($1) and document_number=($2)`, [data.idSm, request.requestClaim.claim[0].claimNumber[0].$.value], (err, res) => {
                                assert.equal(res.rowCount, 1);
                            });
                            // etran_claim
                            await client.query(`SELECT * from ${config.SYSTEM.dbTables.etranClaim} where id_sm=($1) and claim_number=($2)`,
                                [data.idSm, request.requestClaim.claim[0].claimNumber[0].$.value], (err, res) => {
                                    assert.equal(res.rowCount, 1);
                                });
                            // etran_claim_otpr
                            await client.query(`SELECT * from ${config.SYSTEM.dbTables.etranClaimOtpr} where id_sm=($1)`,
                                [data.idSm], (err, res) => {
                                    assert.equal(res.rowCount, 2);
                                });
                            // etran_claim_payer
                            await client.query(`SELECT * from ${config.SYSTEM.dbTables.etranClaimPayer} where id_sm=($1)`,
                                [data.idSm], (err, res) => {
                                    assert.equal(res.rowCount, 2);
                                });
                            // role_org 
                            await client.query(`SELECT * from ${config.SYSTEM.dbTables.roleOrg} where id_sm=($1) and role_id in ('sender','recip','payer','carrier')`,
                                [data.idSm], (err, res) => {
                                    assert.equal(res.rowCount, 3);
                                });
                            // objects_tracking
                            await client.query(`SELECT * from ${config.SYSTEM.dbTables.objectsTracking} where id_sm=($1) and claim_number=($2)`,
                                [data.idSm, request.requestClaim.claim[0].claimNumber[0].$.value], (err, resObjectsTracking) => {
                                    assert.equal(resObjectsTracking.rowCount, 0);
                                });
                            // regSql
                            await client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                                assert.equal(res.rowCount, 0);
                            });

                            done();
                        });
                    });
                });
        });
    });

    /*
    it('send <claim_70> request: не передан claimStateID', (done) => {
        let testReq = fs.readFileSync('./test/error_data/claim_70_error_2.xml', 'utf8');
        testReq = replaceall("xxxxxxxxxxxxxxxxxxxxx", data.idSm, testReq);       // подстановка idSm
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.equal(result.responseClaim.message[0], `Claim: не найден путь xmlCfg.claim_doc_route.claimstateid`);
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        done();
                    });
                });
            });
    });

    it('send <claim_70> request: передан несуществующий claimStateID', (done) => {
        let testReq = fs.readFileSync('./test/error_data/claim_70_error_1.xml', 'utf8');
        testReq = replaceall("xxxxxxxxxxxxxxxxxxxxx", data.idSm, testReq);       // подстановка idSm
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.equal(result.responseClaim.message[0], `Claim: не найден handleOp для xmlCfg.claim_doc_route.claimstateid=666`);
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        done();
                    });
                });
            });
    });

    it('send <claim_70> request: etran_claim ошибка чтения', (done) => {
        let testReq = fs.readFileSync('./test/test_data/claim_70.xml', 'utf8');
        config.SYSTEM.dbTables.etranClaim = 'etranClaim$$$';
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.equal(result.responseClaim.message[0], `Claim: ошибка при чтении таблицы ${config.SYSTEM.dbTables.etranClaim} по claim_number=0037377788`);
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        config.SYSTEM.dbTables.etranClaim = "public.etran_claim";
                        done();
                    });
                });
            });
    });

    it('send <claim_70> request: по claim_number не обнаружен id_sm в etran_claim', (done) => {
        let testReq = fs.readFileSync('./test/error_data/claim_70_error_5.xml', 'utf8');
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.equal(result.responseClaim.message[0], `Claim: по claim_number=0037377789 в БД не обнаружен id_sm=0047861d-bd0d-473f-b437-8ecf60063955`);
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        done();
                    });
                });
            });
    });

    it('send <claim_70> по claim_number и id_sm не найдены данные в etran_claim', (done) => {
        let testReq = fs.readFileSync('./test/error_data/claim_70_error_6.xml', 'utf8');
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.equal(result.responseClaim.message[0], `Claim: по claim_number=0037377790 и idSm=0047861d-bd0d-473f-b437-8ecf60063955 данные в БД не найдены`);
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        done();
                    });
                });
            });
    });


    it('send <claim_71> request: не передан idSm', (done) => {
        let testReq = fs.readFileSync('./test/error_data/claim_71_error_3.xml', 'utf8');
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.equal(result.responseClaim.message[0], `не передан idSm`);
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        done();
                    });
                });
            });
    });

    it('send <claim_162> request: не передан idSm', (done) => {
        let testReq = fs.readFileSync('./test/error_data/claim_162_error_4.xml', 'utf8');
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.equal(result.responseClaim.message[0], `не передан idSm`);
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        done();
                    });
                });
            });
    });

    it('send <claim_71> handleOpclaim: response.data.code !== 0 (handleConditions)', (done) => {
        let testReq = fs.readFileSync('./test/error_data/claim_71_error_7.xml', 'utf8');
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.notEqual(result.responseClaim.message[0], 'Error in request process');
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        done();
                    });
                });
            });
    });

    it('send <claim_162> handleOpclaim: response.data.code !== 0 (handleOp)', (done) => {
        let testReq = fs.readFileSync('./test/error_data/claim_162_error_8.xml', 'utf8');
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.notEqual(result.responseClaim.message[0], 'Error in request process');
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        done();
                    });
                });
            });
    });
    */

    /*it('send <claim_70> ОhandleOpclaim. Ошибка при вызове сервиса', (done) => {
        let testReq = fs.readFileSync('./test/test_data/claim_70.xml', 'utf8');
        config.SYSTEM.restConfig.invoke.name = 'test';
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.notEqual(result.responseClaim.message[0], 'Error in request process');
                    // regSql
                    client.query(`SELECT * from ${config.SYSTEM.dbTables.regSql}`, (err, res) => {
                        assert.equal(res.rowCount, 1);
                        client.query(`delete from ${config.SYSTEM.dbTables.regSql}`);
                        config.SYSTEM.restConfig.invoke.name = "localhost";
                        done();
                    });
                });
            });
    });*/

});