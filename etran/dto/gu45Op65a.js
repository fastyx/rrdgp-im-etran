const { BaseGu45 } = require('./baseGu45.js')
const { v4: getuuid } = require('uuid');                   //для генерации уникального uuid

class gu45Op65a extends BaseGu45 {

    constructor(req, xmlCfg, res) {

        //BaseGu2b
        super(req, xmlCfg, res);

        //HandleOp
        this.transaction = "handleOp65a";

        //stateTransaction
        this.stateTransaction = 65;

        //opts
        this.opts = null;

        //idSmDoc      
        this.idSmDoc = null;

        //docTypeId
        this.docTypeId = 7;

        //signTrackLeaveGu45Dt
        if (typeof xmlCfg.gu_45_doc_route.operdate === 'undefined') { this.signTrackLeaveGu45Dt = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.signTrackLeaveGu45Dt = xmlCfg.gu_45_doc_route.operdate;
        }
        //console.log("this.signTrackLeaveGu45Dt = " + this.signTrackLeaveGu45Dt);

        //epochSignTrackLeaveGu45Dt
        if (typeof xmlCfg.gu_45_doc_route.operdate === 'undefined') { this.epochSignTrackLeaveGu45Dt = null; }
        else {
            this.epochSignTrackLeaveGu45Dt = xmlCfg.gu_45_doc_route.operdate;
            this.a = this.epochSignTrackLeaveGu45Dt.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochSignTrackLeaveGu45Dt = this.a[0] + " " + this.a[1];
            this.epochSignTrackLeaveGu45Dt = new Date(this.epochSignTrackLeaveGu45Dt).getTime() / 1000;
        }
        //console.log("this.epochSignTrackLeaveGu45Dt = " + this.epochSignTrackLeaveGu45Dt);



        //emptyTrackLeaveGu45Dt
        if (typeof carOutDate === 'undefined') { this.emptyTrackLeaveGu45Dt = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.emptyTrackLeaveGu45Dt = carOutDate[0];
        }
        //console.log("this.emptyTrackLeaveGu45Dt = " + this.emptyTrackLeaveGu45Dt);

        //epochEmptyTrackLeaveGu45Dt
        //carOutDate в другом формате, поэтому split делать не надо как в operDate
        if (typeof carOutDate === 'undefined') { this.epochEmptyTrackLeaveGu45Dt = null; }
        else {
            this.epochEmptyTrackLeaveGu45Dt = carOutDate[0];
            this.epochEmptyTrackLeaveGu45Dt = new Date(this.epochEmptyTrackLeaveGu45Dt).getTime() / 1000;
        }
        //console.log("this.epochEmptyTrackLeaveGu45Dt = " + this.epochEmptyTrackLeaveGu45Dt);

    }
}

module.exports.gu45Op65a = gu45Op65a;