const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();                                 // using!!!!!!!!!!!!!! not delete!!!!!!!!!!!!
chai.use(chaiHttp);
const config = require('../init_config');
const server = require(`../app`);                           // без этого тоже ничего не работает... сразу не может найти should
var parseString = require('xml2js').parseString;
const version = require('../package.json')

describe("undidined", function () {
    it("request test: check address", (done) => {
        assert.equal(config.SYSTEM.restConfig.etranService.host, `localhost`);
        assert.equal(config.SYSTEM.restConfig.etranService.port, `3030`);
        assert.equal(config.SYSTEM.restConfig.etranService.name, `api/etran/claim`);
        done();
    });


    it('send <test></test> request: тестовый запрос', (done) => {
        let testReq = `<test></test>`;
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 0);
                    assert.equal(result.responseClaim.version[0], version.version);
                    done();
                });
            });
    });

    it('send <undifined></undifined> request: не определен тип входных данных', (done) => {
        let testReq = `<undifined></undifined>`;
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .post(`/${config.SYSTEM.restConfig.etranService.name}`)
            .send(testReq)
            .set("Content-Type", "application/xml")
            .end((err, res) => {
                parseString(res.text, function (err, result) {
                    res.should.have.status(200);
                    assert.equal(result.responseClaim.status[0], 1);
                    assert.equal(result.responseClaim.message[0], `Info: тип входных данных не определен`);
                    done();
                });
            });
    });
});
