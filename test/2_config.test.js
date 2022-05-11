const { assert } = require('chai');
const version = require('../package.json')

// config test
describe("config test", async function () {
    it('local config test', async (done) => {
        config = require('../config/config.local.json');
        await checkConfig(config);

        assert.equal(config.SYSTEM.privateCollection, "_implicit_org_Org1MSP")
        assert.equal(config.SYSTEM.loggerLevel, "info")

        assert.equal(config.SYSTEM.dbConnections.dbrzd.host, "127.0.0.1")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.port, "5432")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.database, "dbrzd")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.user, "postgres")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.password, "fender")

        assert.equal(config.SYSTEM.restConfig.invoke.host, "localhost")
        assert.equal(config.SYSTEM.restConfig.invoke.port, "3001")
        assert.equal(config.SYSTEM.restConfig.invoke.name, "v1/invoke")

        assert.equal(config.SYSTEM.restConfig.etranService.host, "localhost")
        assert.equal(config.SYSTEM.restConfig.etranService.port, "3030")
        assert.equal(config.SYSTEM.restConfig.etranService.name, "api/etran/claim")

        assert.equal(config.SYSTEM.restConfig.isrun.name, "appinfo/isrun")
        assert.equal(config.SYSTEM.dbConfig.max, 2)

        done();
    });

    it('development config test', async (done) => {
        config = require('../config/config.development.json');
        await checkConfig(config);

        assert.equal(config.SYSTEM.privateCollection, "CollTest2")
        assert.equal(config.SYSTEM.loggerLevel, "info")

        assert.equal(config.SYSTEM.dbConnections.dbrzd.host, "192.168.8.53")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.port, "5432")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.database, "dbrzd")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.user, "app_im_etran")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.password, "app")

        assert.equal(config.SYSTEM.restConfig.invoke.host, "192.168.8.48")
        assert.equal(config.SYSTEM.restConfig.invoke.port, "80")
        assert.equal(config.SYSTEM.restConfig.invoke.name, "v1/invoke")

        assert.equal(config.SYSTEM.restConfig.etranService.host, "localhost")
        assert.equal(config.SYSTEM.restConfig.etranService.port, "3030")
        assert.equal(config.SYSTEM.restConfig.etranService.name, "api/etran/claim")

        assert.equal(config.SYSTEM.restConfig.isrun.name, "appinfo/isrun")
        assert.equal(config.SYSTEM.dbConfig.max, 1)

        done();
    });

    it('test config test', async (done) => {
        config = require('../config/config.test.json');
        await checkConfig(config);

        assert.equal(config.SYSTEM.privateCollection, "CollTest2")
        assert.equal(config.SYSTEM.loggerLevel, "info")

        assert.equal(config.SYSTEM.dbConnections.dbrzd.host, "10.39.105.40")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.port, "5432")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.database, "dbrzd")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.user, "app_im_etran")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.password, "app")

        assert.equal(config.SYSTEM.restConfig.invoke.host, "10.39.105.37")
        assert.equal(config.SYSTEM.restConfig.invoke.port, "3003")
        assert.equal(config.SYSTEM.restConfig.invoke.name, "v1/invoke")

        assert.equal(config.SYSTEM.restConfig.etranService.host, "10.32.4.147")
        assert.equal(config.SYSTEM.restConfig.etranService.port, "3030")
        assert.equal(config.SYSTEM.restConfig.etranService.name, "api/etran/claim")

        assert.equal(config.SYSTEM.restConfig.isrun.name, "appinfo/isrun")
        assert.equal(config.SYSTEM.dbConfig.max, 1)

        done();
    });

    it('production config test', async (done) => {
        config = require('../config/config.production.json');
        await checkConfig(config);

        assert.equal(config.SYSTEM.privateCollection, "CollTest2")
        assert.equal(config.SYSTEM.loggerLevel, "info")

        assert.equal(config.SYSTEM.dbConnections.dbrzd.host, "10.39.105.237")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.port, "5432")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.database, "dbrzd")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.user, "app_im_etran")
        assert.equal(config.SYSTEM.dbConnections.dbrzd.password, "app")

        assert.equal(config.SYSTEM.restConfig.invoke.host, "10.39.105.236")
        assert.equal(config.SYSTEM.restConfig.invoke.port, "80")
        assert.equal(config.SYSTEM.restConfig.invoke.name, "v1/invoke")

        assert.equal(config.SYSTEM.restConfig.etranService.host, "10.32.2.102")
        assert.equal(config.SYSTEM.restConfig.etranService.port, "3030")
        assert.equal(config.SYSTEM.restConfig.etranService.name, "api/etran/claim")

        assert.equal(config.SYSTEM.restConfig.isrun.name, "appinfo/isrun")
        assert.equal(config.SYSTEM.dbConfig.max, 1)
        
        done();
    });

    it('configs structure compare', async (done) => {

        config = require('../config/config.local.json');

        config_dev = require('../config/config.development.json');

        config_test = require('../config/config.test.json');

        config_prod = require('../config/config.production.json');

        assert.equal(String(Object.keys(config.SYSTEM)), String(Object.keys(config_dev.SYSTEM)))
        assert.equal(String(Object.keys(config.SYSTEM.dbTables)), String(Object.keys(config_dev.SYSTEM.dbTables)))
        assert.equal(String(Object.keys(config.SYSTEM.dbFunctions)), String(Object.keys(config_dev.SYSTEM.dbFunctions)))
        assert.equal(String(Object.keys(config.SYSTEM.dbConnections)), String(Object.keys(config_dev.SYSTEM.dbConnections)))
        assert.equal(String(Object.keys(config.SYSTEM.dbConfig)), String(Object.keys(config_dev.SYSTEM.dbConfig)))
        assert.equal(String(Object.keys(config.SYSTEM.restConfig)), String(Object.keys(config_dev.SYSTEM.restConfig)))

        assert.equal(String(Object.keys(config.SYSTEM)), String(Object.keys(config_test.SYSTEM)))
        assert.equal(String(Object.keys(config.SYSTEM.dbTables)), String(Object.keys(config_test.SYSTEM.dbTables)))
        assert.equal(String(Object.keys(config.SYSTEM.dbFunctions)), String(Object.keys(config_test.SYSTEM.dbFunctions)))
        assert.equal(String(Object.keys(config.SYSTEM.dbConnections)), String(Object.keys(config_test.SYSTEM.dbConnections)))
        assert.equal(String(Object.keys(config.SYSTEM.dbConfig)), String(Object.keys(config_test.SYSTEM.dbConfig)))
        assert.equal(String(Object.keys(config.SYSTEM.restConfig)), String(Object.keys(config_test.SYSTEM.restConfig)))

        assert.equal(String(Object.keys(config.SYSTEM)), String(Object.keys(config_prod.SYSTEM)))
        assert.equal(String(Object.keys(config.SYSTEM.dbTables)), String(Object.keys(config_prod.SYSTEM.dbTables)))
        assert.equal(String(Object.keys(config.SYSTEM.dbFunctions)), String(Object.keys(config_prod.SYSTEM.dbFunctions)))
        assert.equal(String(Object.keys(config.SYSTEM.dbConnections)), String(Object.keys(config_prod.SYSTEM.dbConnections)))
        assert.equal(String(Object.keys(config.SYSTEM.dbConfig)), String(Object.keys(config_prod.SYSTEM.dbConfig)))
        assert.equal(String(Object.keys(config.SYSTEM.restConfig)), String(Object.keys(config_prod.SYSTEM.restConfig)))

        done();
    });
});

async function checkConfig(config) {
    // version
    assert.equal(config.MAIN.version, version.version)
    // tables
    assert.equal(config.SYSTEM.dbTables.bundleClaim, "public.bundle_claim")
    assert.equal(config.SYSTEM.dbTables.sourceInformation, "public.source_information")
    assert.equal(config.SYSTEM.dbTables.etranClaim, "public.etran_claim")
    assert.equal(config.SYSTEM.dbTables.etranClaimOtpr, "public.etran_claim_otpr")
    assert.equal(config.SYSTEM.dbTables.etranClaimPayer, "public.etran_claim_payer")
    assert.equal(config.SYSTEM.dbTables.bundleInvoice, "public.bundle_invoice")
    assert.equal(config.SYSTEM.dbTables.bundleCar, "public.bundle_car")
    assert.equal(config.SYSTEM.dbTables.bundleCont, "public.bundle_cont")
    assert.equal(config.SYSTEM.dbTables.etranInvoice, "public.etran_invoice")
    assert.equal(config.SYSTEM.dbTables.rrdgpCar, "public.rrdgp_car")
    assert.equal(config.SYSTEM.dbTables.rrdgpCont, "public.rrdgp_cont")
    assert.equal(config.SYSTEM.dbTables.bundleDocument, "public.bundle_document")
    assert.equal(config.SYSTEM.dbTables.transportation, "public.transportation")
    assert.equal(config.SYSTEM.dbTables.transportationReg, "public.transportation_reg")
    assert.equal(config.SYSTEM.dbTables.objectsTracking, "public.objects_tracking")
    assert.equal(config.SYSTEM.dbTables.eventTracking, "public.event_tracking")
    assert.equal(config.SYSTEM.dbTables.unreportCar, "public.unreport_car")
    assert.equal(config.SYSTEM.dbTables.unreportDocument, "public.unreport_document")
    assert.equal(config.SYSTEM.dbTables.roleOrg, "public.role_org")
    assert.equal(config.SYSTEM.dbTables.tnSootStopStnV, "nsi.tn_soot_stop_stn_v")
    assert.equal(config.SYSTEM.dbTables.tnNormMop, "nsi.tn_norm_mop")
    assert.equal(config.SYSTEM.dbTables.tnProverNorm, "nsi.tn_prover_norm")
    assert.equal(config.SYSTEM.dbTables.askmpnpContractsIdrt, "public.askmpnp_contracts_idrt")
    assert.equal(config.SYSTEM.dbTables.askmpnpContractsLun, "public.askmpnp_contracts_lun")
    assert.equal(config.SYSTEM.dbTables.askmpnpContracts, "public.askmpnp_contracts")
    assert.equal(config.SYSTEM.dbTables.regMessage, "public.reg_message")
    assert.equal(config.SYSTEM.dbTables.regSql, "public.reg_sql")
    assert.equal(config.SYSTEM.dbTables.dues, "public.dues")

    // functions
    assert.equal(config.SYSTEM.dbFunctions.editTracking, "public.edit_tracking")
    assert.equal(config.SYSTEM.dbFunctions.violationReg, "public.violation_reg")
    assert.equal(config.SYSTEM.dbFunctions.removeTracking, "public.remove_tracking")

    // others
    assert.equal(config.SYSTEM.dbConfig.idleTimeoutMillis, 30000)
    assert.equal(config.SYSTEM.dbConfig.connectionTimeoutMillis, 2000)
}   