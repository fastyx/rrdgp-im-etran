const { BaseGu45 } = require('./baseGu45.js')

class gu45Op26b extends BaseGu45 {

    constructor(message){

        //BaseGu2b
        super(message);

        //HandleOp
        this.transaction = null;                                                        // "handleOp26b" "handleOp126b"

        //stateTransaction
        this.stateTransaction = null;                                                   // 26 126

        //opts
        this.opts = null;

        //idSmDoc      
        this.idSmDoc = null;

        //docTypeId
        this.docTypeId = 7;

        //rejectTrackLeaveGu45Dt
        if (typeof message.requestnotification.pps.operdate === 'undefined') { this.rejectTrackLeaveGu45Dt = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.rejectTrackLeaveGu45Dt = message.requestnotification.pps.operdate;
        }
        //console.log("this.rejectTrackLeaveGu45Dt = " + this.rejectTrackLeaveGu45Dt);

        //epochRejectTrackLeaveGu45Dt
        if (typeof message.requestnotification.pps.operdate === 'undefined') { this.epochRejectTrackLeaveGu45Dt = null; }
        else {
            this.epochRejectTrackLeaveGu45Dt = message.requestnotification.pps.operdate;
            this.a = this.epochRejectTrackLeaveGu45Dt.split(" ");
            this.a[0] = this.a[0].split(".").reverse().join(".");
            this.epochRejectTrackLeaveGu45Dt = this.a[0] + " " + this.a[1];
            this.epochRejectTrackLeaveGu45Dt = new Date(this.epochRejectTrackLeaveGu45Dt).getTime() / 1000;
        }
        //console.log("this.epochRejectTrackLeaveGu45Dt = " + this.epochRejectTrackLeaveGu45Dt);

        //ladenTrackLeaveGu45Dt (26)
        if (typeof carOutDate === 'undefined') { this.ladenTrackLeaveGu45Dt = "0001-01-01 00:00:00.00000+00"; }
        else {
            this.ladenTrackLeaveGu45Dt = carOutDate[0];
        }
        //console.log("this.ladenTrackLeaveGu45Dt = " + this.ladenTrackLeaveGu45Dt);

        //epochLadenTrackLeaveGu45Dt
        //carOutDate в другом формате, поэтому split делать не надо как в operDate
        if (typeof carOutDate === 'undefined') { this.epochLadenTrackLeaveGu45Dt = null; }
        else {
            this.epochLadenTrackLeaveGu45Dt = carOutDate[0];
            this.epochLadenTrackLeaveGu45Dt = new Date(this.epochLadenTrackLeaveGu45Dt).getTime() / 1000;
        }
        //console.log("this.epochLadenTrackLeaveGu45Dt = " + this.epochLadenTrackLeaveGu45Dt);

        //emptyTrackLeaveGu45Dt (126)
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

module.exports.gu45Op26b = gu45Op26b;