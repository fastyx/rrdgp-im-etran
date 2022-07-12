const checksum = require('json-checksum'); 
const logger = require('../../config/logger');

class BaseClaim {

    constructor(message) {

        try {

            //Входной документ
            this.inputDocument = message;                //rawBody - исходный XML документ

            //Контрольная сумма
            this.checkSum = checksum(JSON.stringify(message));         //контрольная сумма по исходному документу

            //idSm
            if (typeof message.requestclaim.idsm === 'undefined' || message.requestclaim.idsm === "") { this.idSm = null; }
            else { this.idSm = message.requestclaim.idsm; }

            //claimID
            if (typeof message.requestclaim.claim.claimid === 'undefined') { this.claimId = null; }
            else { this.claimId = message.requestclaim.claim.claimid.$.value; }
            //console.log("this.claimId = " + this.claimId);

            //claimNumber
            if (typeof message.requestclaim.claim.claimnumber === 'undefined') { this.claimNumber = null; }
            else { this.claimNumber = message.requestclaim.claim.claimnumber.$.value; }
            //console.log("this.claimNumber = " + this.claimNumber);

            //clmSenderOKPO
            if (typeof message.requestclaim.claim.clmsenderokpo === 'undefined') { this.clmSenderOkpo = null; }
            else { this.clmSenderOkpo = message.requestclaim.claim.clmsenderokpo.$.value; }
            //console.log("this.clmSenderOkpo = " + this.clmSenderOkpo);

            //clmSenderId
            if (typeof message.requestclaim.claim.clmsenderid === 'undefined') { this.clmSenderId = null; }
            else { this.clmSenderId = message.requestclaim.claim.clmsenderid.$.value; }
            //console.log("this.clmSenderId = " + this.clmSenderId);

            //otprRecipOKPO
            this.otprRecipOkpo = new Array();
            if (typeof message.requestclaim.claim.clmotpr === 'undefined') { this.otprRecipOkpo[0] = 0; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmotpr)) {
                    for (let i = 0; i < message.requestclaim.claim.clmotpr.length; i++) {

                        if (typeof message.requestclaim.claim.clmotpr[i].otprrecipokpo === 'undefined') { this.otprRecipOkpo[i] = 0; }
                        else { this.otprRecipOkpo[i] = message.requestclaim.claim.clmotpr[i].otprrecipokpo.$.value; }
                        //console.log("this.otprRecipOkpo[" + i + "] = " + this.otprRecipOkpo[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmotpr.otprrecipokpo === 'undefined') { this.otprRecipOkpo[i] = 0; }
                    else { this.otprRecipOkpo[i] = message.requestclaim.claim.clmotpr.otprrecipokpo.$.value; }
                    //console.log("this.otprRecipOkpo(не массив)[" + i + "] = " + this.otprRecipOkpo[i]);
                }
            }

            //otprRecipId
            this.otprRecipId = new Array();
            if (typeof message.requestclaim.claim.clmotpr === 'undefined') { this.otprRecipId[0] = 0; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmotpr)) {
                    for (let i = 0; i < message.requestclaim.claim.clmotpr.length; i++) {

                        if (typeof message.requestclaim.claim.clmotpr[i].otprrecipid === 'undefined') { this.otprRecipId[i] = 0; }
                        else { this.otprRecipId[i] = message.requestclaim.claim.clmotpr[i].otprrecipid.$.value; }
                        //console.log("this.otprRecipId[" + i + "] = " + this.otprRecipId[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmotpr.otprrecipid === 'undefined') { this.otprRecipId[i] = 0; }
                    else { this.otprRecipId[i] = message.requestclaim.claim.clmotpr.otprrecipid.$.value; }
                    //console.log("this.otprRecipId(не массив)[" + i + "] = " + this.otprRecipId[i]);
                }
            }

            // claimStateID
            if (typeof message.requestclaim.claim.claimstateid === 'undefined') { this.claimStateID = null; }
            else { this.claimStateID = message.requestclaim.claim.claimstateid.$.value; }
            //console.log("this.claimStateID = " + this.claimStateID);

            // claimState
            if (typeof message.requestclaim.claim.claimstate === 'undefined') { this.claimState = ''; }
            else { this.claimState = message.requestclaim.claim.claimstate.$.value; }
            //console.log("this.claimStateID = " + this.claimStateID);

            // claimVersion
            if (typeof message.requestclaim.claim.claimversion === 'undefined') { this.claimVersion = null; }
            else { this.claimVersion = message.requestclaim.claim.claimversion.$.value; }
            //console.log("this.claimVersion = " + this.claimVersion);

            // clm_send_kind_name
            if (typeof message.requestclaim.claim.clmsendkindname === 'undefined') { this.clmSendKindName = null; }
            else { this.clmSendKindName = message.requestclaim.claim.clmsendkindname.$.value; }
            //console.log("this.clmSendKindName = " + this.clmSendKindName);

            // clmSenderName
            if (typeof message.requestclaim.claim.clmsendername === 'undefined') { this.clmSenderName = null; }
            else { this.clmSenderName = message.requestclaim.claim.clmsendername.$.value; }
            //console.log("this.clmSenderName = " + this.clmSenderName);

            // clmSenderAddress
            if (typeof message.requestclaim.claim.clmsenderaddress === 'undefined') { this.clmSenderAddress = null; }
            else { this.clmSenderAddress = message.requestclaim.claim.clmsenderaddress.$.value; }
            //console.log("this.clmSenderAddress = " + this.clmSenderAddress);

            // clmFromStationCode
            if (typeof message.requestclaim.claim.clmfromstationcode === 'undefined') { this.clmFromStationCode = null; }
            else { this.clmFromStationCode = message.requestclaim.claim.clmfromstationcode.$.value; }
            //console.log("this.clmFromStationCode = " + this.clmFromStationCode);

            // clmFromStationName
            if (typeof message.requestclaim.claim.clmfromstationname === 'undefined') { this.clmFromStationName = null; }
            else { this.clmFromStationName = message.requestclaim.claim.clmfromstationname.$.value; }
            //console.log("this.clmFromStationName = " + this.clmFromStationName);

            // otprRecipName
            this.otprRecipName = new Array();
            if (typeof message.requestclaim.claim.clmotpr === 'undefined') { this.otprRecipName[0] = 0; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmotpr)) {
                    for (let i = 0; i < message.requestclaim.claim.clmotpr.length; i++) {

                        if (typeof message.requestclaim.claim.clmotpr[i].otprrecipname === 'undefined') { this.otprRecipName[i] = 0; }
                        else { this.otprRecipName[i] = message.requestclaim.claim.clmotpr[i].otprrecipname.$.value; }
                        //console.log("this.otprRecipName[" + i + "] = " + this.otprRecipName[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmotpr.otprrecipname === 'undefined') { this.otprRecipName[i] = 0; }
                    else { this.otprRecipName[i] = message.requestclaim.claim.clmotpr.otprrecipname.$.value; }
                    //console.log("this.otprRecipName(не массив)[" + i + "] = " + this.otprRecipName[i]);
                }
            }

            //otprRecipAddress
            this.otprRecipAddress = new Array();
            if (typeof message.requestclaim.claim.clmotpr === 'undefined') { this.otprRecipAddress[0] = 0; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmotpr)) {
                    for (let i = 0; i < message.requestclaim.claim.clmotpr.length; i++) {

                        if (typeof message.requestclaim.claim.clmotpr[i].otprrecipaddress === 'undefined') { this.otprRecipAddress[i] = 0; }
                        else { this.otprRecipAddress[i] = message.requestclaim.claim.clmotpr[i].otprrecipaddress.$.value; }
                        //console.log("this.otprRecipAddress[" + i + "] = " + this.otprRecipAddress[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmotpr.otprrecipaddress === 'undefined') { this.otprRecipAddress[i] = 0; }
                    else { this.otprRecipAddress[i] = message.requestclaim.claim.clmotpr.otprrecipaddress.$.value; }
                    //console.log("this.otprRecipAddress(не массив)[" + i + "] = " + this.otprRecipAddress[i]);
                }
            }

            //otprRvContName
            this.otprRvContName = new Array();
            if (typeof message.requestclaim.claim.clmotpr === 'undefined') { this.otprRvContName[0] = ''; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmotpr)) {
                    for (let i = 0; i < message.requestclaim.claim.clmotpr.length; i++) {

                        if (typeof message.requestclaim.claim.clmotpr[i].otprrvcontname === 'undefined') { this.otprRvContName[i] = ''; }
                        else { this.otprRvContName[i] = message.requestclaim.claim.clmotpr[i].otprrvcontname.$.value; }
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmotpr.otprrvcontname === 'undefined') { this.otprRvContName[i] = ''; }
                    else { this.otprRvContName[i] = message.requestclaim.claim.clmotpr.otprrvcontname.$.value; }
                }
            }

            //otprToStationCode
            this.otprToStationCode = new Array();
            if (typeof message.requestclaim.claim.clmotpr === 'undefined') { this.otprToStationCode[0] = 0; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmotpr)) {
                    for (let i = 0; i < message.requestclaim.claim.clmotpr.length; i++) {

                        if (typeof message.requestclaim.claim.clmotpr[i].otprtostationcode === 'undefined') { this.otprToStationCode[i] = 0; }
                        else { this.otprToStationCode[i] = message.requestclaim.claim.clmotpr[i].otprtostationcode.$.value; }
                        //console.log("this.otprToStationCode[" + i + "] = " + this.otprToStationCode[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmotpr.otprtostationcode === 'undefined') { this.otprToStationCode[i] = 0; }
                    else { this.otprToStationCode[i] = message.requestclaim.claim.clmotpr.otprtostationcode.$.value; }
                    //console.log("this.otprToStationCode(не массив)[" + i + "] = " + this.otprToStationCode[i]);
                }
            }

            //otprToStationName
            this.otprToStationName = new Array();
            if (typeof message.requestclaim.claim.clmotpr === 'undefined') { this.otprToStationName[0] = 0; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmotpr)) {
                    for (let i = 0; i < message.requestclaim.claim.clmotpr.length; i++) {

                        if (typeof message.requestclaim.claim.clmotpr[i].otprtostationname === 'undefined') { this.otprToStationName[i] = 0; }
                        else { this.otprToStationName[i] = message.requestclaim.claim.clmotpr[i].otprtostationname.$.value; }
                        //console.log("this.otprToStationName[" + i + "] = " + this.otprToStationName[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmotpr.otprtostationname === 'undefined') { this.otprToStationName[i] = 0; }
                    else { this.otprToStationName[i] = message.requestclaim.claim.clmotpr.otprtostationname.$.value; }
                    //console.log("this.otprToStationName(не массив)[" + i + "] = " + this.otprToStationName[i]);
                }
            }

            //otprFreightName
            this.otprFreightName = new Array();
            if (typeof message.requestclaim.claim.clmotpr === 'undefined') { this.otprFreightName[0] = 0; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmotpr)) {
                    for (let i = 0; i < message.requestclaim.claim.clmotpr.length; i++) {

                        if (typeof message.requestclaim.claim.clmotpr[i].otprfreightname === 'undefined') { this.otprFreightName[i] = 0; }
                        else { this.otprFreightName[i] = message.requestclaim.claim.clmotpr[i].otprfreightname.$.value; }
                        //console.log("this.otprFreightName[" + i + "] = " + this.otprFreightName[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmotpr.otprfreightname === 'undefined') { this.otprFreightName[i] = 0; }
                    else { this.otprFreightName[i] = message.requestclaim.claim.clmotpr.otprfreightname.$.value; }
                    //console.log("this.otprFreightName(не массив)[" + i + "] = " + this.otprFreightName[i]);
                }
            }

            // otprFreightGngName
            this.otprFreightGngName = new Array();
            if (typeof message.requestclaim.claim.clmotpr === 'undefined') { this.otprFreightGngName[0] = 0; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmotpr)) {
                    for (let i = 0; i < message.requestclaim.claim.clmotpr.length; i++) {

                        if (typeof message.requestclaim.claim.clmotpr[i].otprfreightgngname === 'undefined') { this.otprFreightGngName[i] = 0; }
                        else { this.otprFreightGngName[i] = message.requestclaim.claim.clmotpr[i].otprfreightgngname.$.value; }
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmotpr.otprfreightgngname === 'undefined') { this.otprFreightGngName[i] = 0; }
                    else { this.otprFreightGngName[i] = message.requestclaim.claim.clmotpr.otprfreightgngname.$.value; }
                }
            }

            //otprFreightWeight
            this.otprFreightWeight = new Array();
            if (typeof message.requestclaim.claim.clmotpr === 'undefined') { this.otprFreightWeight[0] = 0; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmotpr)) {
                    for (let i = 0; i < message.requestclaim.claim.clmotpr.length; i++) {

                        if (typeof message.requestclaim.claim.clmotpr[i].otprfreightweight === 'undefined') { this.otprFreightWeight[i] = 0; }
                        else { this.otprFreightWeight[i] = message.requestclaim.claim.clmotpr[i].otprfreightweight.$.value; }
                        //console.log("this.otprFreightWeight[" + i + "] = " + this.otprFreightWeight[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmotpr.otprfreightweight === 'undefined') { this.otprFreightWeight[i] = 0; }
                    else { this.otprFreightWeight[i] = message.requestclaim.claim.clmotpr.otprfreightweight.$.value; }
                    //console.log("this.otprFreightWeight(не массив)[" + i + "] = " + this.otprFreightWeight[i]);
                }
            }

            //otprCarTypeName
            this.otprCarTypeName = new Array();
            if (typeof message.requestclaim.claim.clmotpr === 'undefined') { this.otprCarTypeName[0] = 0; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmotpr)) {
                    for (let i = 0; i < message.requestclaim.claim.clmotpr.length; i++) {

                        if (typeof message.requestclaim.claim.clmotpr[i].otprcartypename === 'undefined') { this.otprCarTypeName[i] = 0; }
                        else { this.otprCarTypeName[i] = message.requestclaim.claim.clmotpr[i].otprcartypename.$.value; }
                        //console.log("this.otprCarTypeName[" + i + "] = " + this.otprCarTypeName[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmotpr.otprcartypename === 'undefined') { this.otprCarTypeName[i] = 0; }
                    else { this.otprCarTypeName[i] = message.requestclaim.claim.clmotpr.otprcartypename.$.value; }
                    //console.log("this.otprCarTypeName(не массив)[" + i + "] = " + this.otprCarTypeName[i]);
                }
            }

            //otprCarOwnerName
            this.otprCarOwnerName = new Array();
            if (typeof message.requestclaim.claim.clmotpr === 'undefined') { this.otprCarOwnerName[0] = 0; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmotpr)) {
                    for (let i = 0; i < message.requestclaim.claim.clmotpr.length; i++) {

                        if (typeof message.requestclaim.claim.clmotpr[i].otprcarownername === 'undefined') { this.otprCarOwnerName[i] = 0; }
                        else { this.otprCarOwnerName[i] = message.requestclaim.claim.clmotpr[i].otprcarownername.$.value; }
                        //console.log("this.otprCarOwnerName[" + i + "] = " + this.otprCarOwnerName[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmotpr.otprcarownername === 'undefined') { this.otprCarOwnerName[i] = 0; }
                    else { this.otprCarOwnerName[i] = message.requestclaim.claim.clmotpr.otprcarownername.$.value; }
                    //console.log("this.otprCarOwnerName(не массив)[" + i + "] = " + this.otprCarOwnerName[i]);
                }
            }

            //otprDaysDelivery
            this.otprDaysDelivery = new Array();
            if (typeof message.requestclaim.claim.clmotpr === 'undefined') { this.otprDaysDelivery[0] = 0; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmotpr)) {
                    for (let i = 0; i < message.requestclaim.claim.clmotpr.length; i++) {

                        if (typeof message.requestclaim.claim.clmotpr[i].otprdaysdelivery === 'undefined') { this.otprDaysDelivery[i] = 0; }
                        else { this.otprDaysDelivery[i] = message.requestclaim.claim.clmotpr[i].otprdaysdelivery.$.value; }
                        //console.log("this.otprDaysDelivery[" + i + "] = " + this.otprDaysDelivery[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmotpr.otprdaysdelivery === 'undefined') { this.otprDaysDelivery[i] = 0; }
                    else { this.otprDaysDelivery[i] = message.requestclaim.claim.clmotpr.otprdaysdelivery.$.value; }
                    //console.log("this.otprDaysDelivery(не массив)[" + i + "] = " + this.otprDaysDelivery[i]);
                }
            }

            //payerOKPO
            this.payerOKPO = new Array();
            if (typeof message.requestclaim.claim.clmpayer === 'undefined') { this.payerOKPO = null; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmpayer)) {
                    for (let i = 0; i < message.requestclaim.claim.clmpayer.length; i++) {

                        if (typeof message.requestclaim.claim.clmpayer[i].payerokpo === 'undefined') { this.payerOKPO[i] = null; }
                        else { this.payerOKPO[i] = message.requestclaim.claim.clmpayer[i].payerokpo.$.value; }
                        //console.log("this.payerOKPO[" + i + "] = " + this.payerOKPO[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmpayer.payerokpo === 'undefined') { this.payerOKPO[i] = null; }
                    else { this.payerOKPO[i] = message.requestclaim.claim.clmpayer.payerokpo.$.value; }
                    //console.log("this.payerOKPO(не массив)[" + i + "] = " + this.payerOKPO[i]);
                }
            }

            //payerId
            this.payerId = new Array();
            if (typeof message.requestclaim.claim.clmpayer === 'undefined') { this.payerId = null; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmpayer)) {
                    for (let i = 0; i < message.requestclaim.claim.clmpayer.length; i++) {

                        if (typeof message.requestclaim.claim.clmpayer[i].payerid === 'undefined') { this.payerId[i] = null; }
                        else { this.payerId[i] = message.requestclaim.claim.clmpayer[i].payerid.$.value; }
                        //console.log("this.payerId[" + i + "] = " + this.payerId[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmpayer.payerid === 'undefined') { this.payerId[i] = null; }
                    else { this.payerId[i] = message.requestclaim.claim.clmpayer.payerid.$.value; }
                    //console.log("this.payerId(не массив)[" + i + "] = " + this.payerId[i]);
                }
            }


            //payerName
            this.payerName = new Array();
            if (typeof message.requestclaim.claim.clmpayer === 'undefined') { this.payerName = null; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmpayer)) {
                    for (let i = 0; i < message.requestclaim.claim.clmpayer.length; i++) {

                        if (typeof message.requestclaim.claim.clmpayer[i].payername === 'undefined') { this.payerName[i] = null; }
                        else { this.payerName[i] = message.requestclaim.claim.clmpayer[i].payername.$.value; }
                        //console.log("this.payerName[" + i + "] = " + this.payerName[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmpayer.payername === 'undefined') { this.payerName[i] = null; }
                    else { this.payerName[i] = message.requestclaim.claim.clmpayer.payername.$.value; }
                    //console.log("this.payerName(не массив)[" + i + "] = " + this.payerName[i]);
                }
            }

            //payerAddress
            this.payerAddress = new Array();
            if (typeof message.requestclaim.claim.clmpayer === 'undefined') { this.payerAddress = null; }
            else {
                if (Array.isArray(message.requestclaim.claim.clmpayer)) {
                    for (let i = 0; i < message.requestclaim.claim.clmpayer.length; i++) {

                        if (typeof message.requestclaim.claim.clmpayer[i].payeraddress === 'undefined') { this.payerAddress[i] = null; }
                        else { this.payerAddress[i] = message.requestclaim.claim.clmpayer[i].payeraddress.$.value; }
                        //console.log("this.payerAddress[" + i + "] = " + this.payerAddress[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof message.requestclaim.claim.clmpayer.payeraddress === 'undefined') { this.payerAddress[i] = null; }
                    else { this.payerAddress[i] = message.requestclaim.claim.clmpayer.payeraddress.$.value; }
                    //console.log("this.payerAddress(не массив)[" + i + "] = " + this.payerAddress[i]);
                }
            }

            //operDate
            if (typeof message.requestclaim.claim.operdate === 'undefined') { this.operDate = "0001-01-01 00:00:00.00000+00"; }
            else {
                this.operDate = message.requestclaim.claim.operdate.$.value;
                this.a = this.operDate.split(" ");
                this.a[0] = this.a[0].split(".").reverse().join(".");
                this.operDate = this.a[0] + " " + this.a[1];
            }
            //console.log("this.operDate = " + this.operDate);
        } catch (e) {
            logger.error(`baseClaim: ошибка парсинга базовых показателей claim`);
            logger.error(e);
        }
    }
}

module.exports.BaseClaim = BaseClaim;