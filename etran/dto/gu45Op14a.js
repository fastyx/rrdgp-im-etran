const { BaseGu45 } = require('./baseGu45.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class gu45Op14a extends BaseGu45 {

    constructor(req, xmlCfg, res) {

        //BaseGu2b
        super(req, xmlCfg, res);

        //HandleOp
        this.transaction = "handleOp14a";

        //stateTransaction
        this.stateTransaction = 14;

        //opts
        this.opts = null;

        //idSmDoc      
        this.idSmDoc = null;

        //docTypeId
        this.docTypeId = 7;

        //signTrackDeliveryGu45Dt
        if (typeof xmlCfg.gu_45_doc_route.operdate === 'undefined') { this.signTrackDeliveryGu45Dt = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.signTrackDeliveryGu45Dt = xmlCfg.gu_45_doc_route.operdate;
        }
        //console.log("this.signTrackDeliveryGu45Dt = " + this.signTrackDeliveryGu45Dt);

        //epochSignTrackDeliveryGu45Dt 
        if (typeof xmlCfg.gu_45_doc_route.operdate === 'undefined') { this.epochSignTrackDeliveryGu45Dt = null; }
        else {
            this.epochSignTrackDeliveryGu45Dt = xmlCfg.gu_45_doc_route.operdate;
            this.a = this.epochSignTrackDeliveryGu45Dt.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochSignTrackDeliveryGu45Dt = this.a[0] + " " + this.a[1];
            this.epochSignTrackDeliveryGu45Dt = new Date(this.epochSignTrackDeliveryGu45Dt).getTime() / 1000;
        }
        //console.log("this.epochSignTrackDeliveryGu45Dt = " + this.epochSignTrackDeliveryGu45Dt);

        //emptyTrackDeliveryGu45Dt
        if (typeof carInDate === 'undefined') { this.emptyTrackDeliveryGu45Dt = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.emptyTrackDeliveryGu45Dt = carInDate[0];
        }
        //console.log("this.emptyTrackDeliveryGu45Dt = " + this.emptyTrackDeliveryGu45Dt);

        //epochEmptyTrackDeliveryGu45Dt
        //carInDate в другом формате, поэтому split делать не надо как в operDate
        if (typeof carInDate === 'undefined') { this.epochEmptyTrackDeliveryGu45Dt = null; }
        else {
            this.epochEmptyTrackDeliveryGu45Dt = carInDate[0];
            this.epochEmptyTrackDeliveryGu45Dt = new Date(this.epochEmptyTrackDeliveryGu45Dt).getTime() / 1000;
        }
        //console.log("this.epochEmptyTrackDeliveryGu45Dt = " + this.epochEmptyTrackDeliveryGu45Dt);

    }
}

module.exports.gu45Op14a = gu45Op14a;