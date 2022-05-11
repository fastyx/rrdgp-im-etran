const { assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();                                 // using!!!!!!!!!!!!!! not delete!!!!!!!!!!!!
chai.use(chaiHttp);
const config = require('../init_config');
const server = require(`../app`);                           // без этого тоже ничего не работает... сразу не может найти should

describe("isrun", async function () {
    it("request test", (done) => {
        assert.equal(config.SYSTEM.restConfig.isrun.name, `appinfo/isrun`);
        assert.equal(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`, `localhost:3030`)
        done();
    });
    it("response test", (done) => {
        chai.request(`${config.SYSTEM.restConfig.etranService.host}:${config.SYSTEM.restConfig.etranService.port}`)
            .get(`/${config.SYSTEM.restConfig.isrun.name}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.text.should.be.eql('Ok!');              // res.text (not a res.body), because the type of answear is not a XML or JSON
                done();
            })
    });
});
