const { BaseGu45 } = require('./baseGu45.js')

class gu45Op58a extends BaseGu45 {

    constructor(message) {

        //BaseGu2b
        super(message);

        //HandleOp
        this.transaction = "handleOp58a";

        //stateTransaction
        this.stateTransaction = 58;

        //opts
        this.opts = null;

        //idSmDoc      
        this.idSmDoc = null;

        //docTypeId
        this.docTypeId = 7;

        //signTrackDeliveryGu45Dt
        if (typeof message.requestnotification.pps.operdate === 'undefined') { this.signTrackDeliveryGu45Dt = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.signTrackDeliveryGu45Dt = message.requestnotification.pps.operdate;
        }
        //console.log("this.signTrackDeliveryGu45Dt = " + this.signTrackDeliveryGu45Dt);

        //epochSignTrackDeliveryGu45Dt
        if (typeof message.requestnotification.pps.operdate === 'undefined') { this.epochSignTrackDeliveryGu45Dt = null; }
        else {
            this.epochSignTrackDeliveryGu45Dt = message.requestnotification.pps.operdate;
            this.a = this.epochSignTrackDeliveryGu45Dt.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochSignTrackDeliveryGu45Dt = this.a[0] + " " + this.a[1];
            this.epochSignTrackDeliveryGu45Dt = new Date(this.epochSignTrackDeliveryGu45Dt).getTime() / 1000;
        }
        //console.log("this.epochSignTrackDeliveryGu45Dt = " + this.epochSignTrackDeliveryGu45Dt);


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

module.exports.gu45Op58a = gu45Op58a;