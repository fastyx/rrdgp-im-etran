const { BaseGu45 } = require('./baseGu45.js')

class gu45Op14b extends BaseGu45 {

    constructor(message){

        //BaseGu2b
        super(message);

        //HandleOp
        this.transaction = "handleOp14b";

        //stateTransaction
        this.stateTransaction = 14;

        //opts
        this.opts = null;

        //idSmDoc      
        this.idSmDoc = null;

        //docTypeId
        this.docTypeId = 7;

        //rejectTrackDeliveryGu45Dt
        if (typeof message.requestnotification.pps.operdate === 'undefined') { this.rejectTrackDeliveryGu45Dt = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.rejectTrackDeliveryGu45Dt = message.requestnotification.pps.operdate;
        }
        //console.log("this.rejectTrackDeliveryGu45Dt = " + this.rejectTrackDeliveryGu45Dt);

        //epochRejectTrackDeliveryGu45Dt 
        if (typeof message.requestnotification.pps.operdate === 'undefined') { this.epochRejectTrackDeliveryGu45Dt = null; }
        else {
            this.epochRejectTrackDeliveryGu45Dt = message.requestnotification.pps.operdate;
            this.a = this.epochRejectTrackDeliveryGu45Dt.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochRejectTrackDeliveryGu45Dt = this.a[0] + " " + this.a[1];
            this.epochRejectTrackDeliveryGu45Dt = new Date(this.epochRejectTrackDeliveryGu45Dt).getTime() / 1000;
        }
        //console.log("this.epochRejectTrackDeliveryGu45Dt = " + this.epochRejectTrackDeliveryGu45Dt);

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

module.exports.gu45Op14b = gu45Op14b;