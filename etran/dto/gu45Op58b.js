const { BaseGu45 } = require('./baseGu45.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class gu45Op58b extends BaseGu45 {

    constructor(req, xmlCfg, res) {

        //BaseGu2b
        super(req, xmlCfg, res);

        //HandleOp
        this.transaction = "handleOp58b";

        //stateTransaction
        this.stateTransaction = 58;

        //opts
        this.opts = null;

        //idSmDoc      
        this.idSmDoc = null;

        //docTypeId
        this.docTypeId = 7;

        //rejectTrackDeliveryGu45Dt
        if (typeof xmlCfg.gu_45_doc_route.operdate === 'undefined') { this.rejectTrackDeliveryGu45Dt = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.rejectTrackDeliveryGu45Dt = xmlCfg.gu_45_doc_route.operdate;
        }
        //console.log("this.rejectTrackDeliveryGu45Dt = " + this.rejectTrackDeliveryGu45Dt);

        //epochRejectTrackDeliveryGu45Dt
        if (typeof xmlCfg.gu_45_doc_route.operdate === 'undefined') { this.epochRejectTrackDeliveryGu45Dt = null; }
        else {
            this.epochRejectTrackDeliveryGu45Dt = xmlCfg.gu_45_doc_route.operdate;
            this.a = this.epochRejectTrackDeliveryGu45Dt.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochRejectTrackDeliveryGu45Dt = this.a[0] + " " + this.a[1];
            this.epochRejectTrackDeliveryGu45Dt = new Date(this.epochRejectTrackDeliveryGu45Dt).getTime() / 1000;
        }
        //console.log("this.epochRejectTrackDeliveryGu45Dt = " + this.epochRejectTrackDeliveryGu45Dt);

        //emptyTrackDeliveryGu45Dt
        if (typeof carInDate === 'undefined') { this.ladenTrackDeliveryGu45Dt = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.ladenTrackDeliveryGu45Dt = carInDate[0];
        }
        //console.log("this.ladenTrackDeliveryGu45Dt = " + this.emptyTrackDeliveryGu45Dt);

        //epochLadenTrackDeliveryGu45Dt
        //carInDate в другом формате, поэтому split делать не надо как в operDate
        if (typeof carInDate === 'undefined') { this.epochLadenTrackDeliveryGu45Dt = null; }
        else {
            this.epochLadenTrackDeliveryGu45Dt = carInDate[0];
            this.epochLadenTrackDeliveryGu45Dt = new Date(this.epochLadenTrackDeliveryGu45Dt).getTime() / 1000;
        }
        //console.log("this.epochLadenTrackDeliveryGu45Dt = " + this.epochEmptyTrackDeliveryGu45Dt);

    }
}

module.exports.gu45Op58b = gu45Op58b;