const { BaseDocument } = require('./baseDocument.js')
const xml = require('xml');

class BaseClaim extends BaseDocument {

    constructor(req, xmlCfg) {

        try {

            //BaseDocument
            super(req);

            //idSm
            if (typeof xmlCfg.claim_root_route.idsm === 'undefined' || xmlCfg.claim_root_route.idsm === "") { this.idSm = null; }
            else { this.idSm = xmlCfg.claim_root_route.idsm; }

            //claimID
            if (typeof xmlCfg.claim_doc_route.claimid === 'undefined') { this.claimId = null; }
            else { this.claimId = xmlCfg.claim_doc_route.claimid.$.value; }
            //console.log("this.claimId = " + this.claimId);

            //claimNumber
            if (typeof xmlCfg.claim_doc_route.claimnumber === 'undefined') { this.claimNumber = null; }
            else { this.claimNumber = xmlCfg.claim_doc_route.claimnumber.$.value; }
            //console.log("this.claimNumber = " + this.claimNumber);

            //clmSenderOKPO
            if (typeof xmlCfg.claim_doc_route.clmsenderokpo === 'undefined') { this.clmSenderOkpo = null; }
            else { this.clmSenderOkpo = xmlCfg.claim_doc_route.clmsenderokpo.$.value; }
            //console.log("this.clmSenderOkpo = " + this.clmSenderOkpo);

            //clmSenderId
            if (typeof xmlCfg.claim_doc_route.clmsenderid === 'undefined') { this.clmSenderId = null; }
            else { this.clmSenderId = xmlCfg.claim_doc_route.clmsenderid.$.value; }
            //console.log("this.clmSenderId = " + this.clmSenderId);

            //otprRecipOKPO
            this.otprRecipOkpo = new Array();
            if (typeof xmlCfg.claim_doc_route.clmotpr === 'undefined') { this.otprRecipOkpo[0] = 0; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmotpr)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmotpr.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmotpr[i].otprrecipokpo === 'undefined') { this.otprRecipOkpo[i] = 0; }
                        else { this.otprRecipOkpo[i] = xmlCfg.claim_doc_route.clmotpr[i].otprrecipokpo.$.value; }
                        //console.log("this.otprRecipOkpo[" + i + "] = " + this.otprRecipOkpo[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmotpr.otprrecipokpo === 'undefined') { this.otprRecipOkpo[i] = 0; }
                    else { this.otprRecipOkpo[i] = xmlCfg.claim_doc_route.clmotpr.otprrecipokpo.$.value; }
                    //console.log("this.otprRecipOkpo(не массив)[" + i + "] = " + this.otprRecipOkpo[i]);
                }
            }

            //otprRecipId
            this.otprRecipId = new Array();
            if (typeof xmlCfg.claim_doc_route.clmotpr === 'undefined') { this.otprRecipId[0] = 0; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmotpr)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmotpr.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmotpr[i].otprrecipid === 'undefined') { this.otprRecipId[i] = 0; }
                        else { this.otprRecipId[i] = xmlCfg.claim_doc_route.clmotpr[i].otprrecipid.$.value; }
                        //console.log("this.otprRecipId[" + i + "] = " + this.otprRecipId[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmotpr.otprrecipid === 'undefined') { this.otprRecipId[i] = 0; }
                    else { this.otprRecipId[i] = xmlCfg.claim_doc_route.clmotpr.otprrecipid.$.value; }
                    //console.log("this.otprRecipId(не массив)[" + i + "] = " + this.otprRecipId[i]);
                }
            }

            // claimStateID
            if (typeof xmlCfg.claim_doc_route.claimstateid === 'undefined') { this.claimStateID = null; }
            else { this.claimStateID = xmlCfg.claim_doc_route.claimstateid.$.value; }
            //console.log("this.claimStateID = " + this.claimStateID);

            // claimState
            if (typeof xmlCfg.claim_doc_route.claimstate === 'undefined') { this.claimState = ''; }
            else { this.claimState = xmlCfg.claim_doc_route.claimstate.$.value; }
            //console.log("this.claimStateID = " + this.claimStateID);

            // claimVersion
            if (typeof xmlCfg.claim_doc_route.claimversion === 'undefined') { this.claimVersion = null; }
            else { this.claimVersion = xmlCfg.claim_doc_route.claimversion.$.value; }
            //console.log("this.claimVersion = " + this.claimVersion);

            // clm_send_kind_name
            if (typeof xmlCfg.claim_doc_route.clmsendkindname === 'undefined') { this.clmSendKindName = null; }
            else { this.clmSendKindName = xmlCfg.claim_doc_route.clmsendkindname.$.value; }
            //console.log("this.clmSendKindName = " + this.clmSendKindName);

            // clmSenderName
            if (typeof xmlCfg.claim_doc_route.clmsendername === 'undefined') { this.clmSenderName = null; }
            else { this.clmSenderName = xmlCfg.claim_doc_route.clmsendername.$.value; }
            //console.log("this.clmSenderName = " + this.clmSenderName);

            // clmSenderAddress
            if (typeof xmlCfg.claim_doc_route.clmsenderaddress === 'undefined') { this.clmSenderAddress = null; }
            else { this.clmSenderAddress = xmlCfg.claim_doc_route.clmsenderaddress.$.value; }
            //console.log("this.clmSenderAddress = " + this.clmSenderAddress);

            // clmFromStationCode
            if (typeof xmlCfg.claim_doc_route.clmfromstationcode === 'undefined') { this.clmFromStationCode = null; }
            else { this.clmFromStationCode = xmlCfg.claim_doc_route.clmfromstationcode.$.value; }
            //console.log("this.clmFromStationCode = " + this.clmFromStationCode);

            // clmFromStationName
            if (typeof xmlCfg.claim_doc_route.clmfromstationname === 'undefined') { this.clmFromStationName = null; }
            else { this.clmFromStationName = xmlCfg.claim_doc_route.clmfromstationname.$.value; }
            //console.log("this.clmFromStationName = " + this.clmFromStationName);

            // otprRecipName
            this.otprRecipName = new Array();
            if (typeof xmlCfg.claim_doc_route.clmotpr === 'undefined') { this.otprRecipName[0] = 0; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmotpr)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmotpr.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmotpr[i].otprrecipname === 'undefined') { this.otprRecipName[i] = 0; }
                        else { this.otprRecipName[i] = xmlCfg.claim_doc_route.clmotpr[i].otprrecipname.$.value; }
                        //console.log("this.otprRecipName[" + i + "] = " + this.otprRecipName[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmotpr.otprrecipname === 'undefined') { this.otprRecipName[i] = 0; }
                    else { this.otprRecipName[i] = xmlCfg.claim_doc_route.clmotpr.otprrecipname.$.value; }
                    //console.log("this.otprRecipName(не массив)[" + i + "] = " + this.otprRecipName[i]);
                }
            }

            //otprRecipAddress
            this.otprRecipAddress = new Array();
            if (typeof xmlCfg.claim_doc_route.clmotpr === 'undefined') { this.otprRecipAddress[0] = 0; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmotpr)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmotpr.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmotpr[i].otprrecipaddress === 'undefined') { this.otprRecipAddress[i] = 0; }
                        else { this.otprRecipAddress[i] = xmlCfg.claim_doc_route.clmotpr[i].otprrecipaddress.$.value; }
                        //console.log("this.otprRecipAddress[" + i + "] = " + this.otprRecipAddress[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmotpr.otprrecipaddress === 'undefined') { this.otprRecipAddress[i] = 0; }
                    else { this.otprRecipAddress[i] = xmlCfg.claim_doc_route.clmotpr.otprrecipaddress.$.value; }
                    //console.log("this.otprRecipAddress(не массив)[" + i + "] = " + this.otprRecipAddress[i]);
                }
            }

            //otprRvContName
            this.otprRvContName = new Array();
            if (typeof xmlCfg.claim_doc_route.clmotpr === 'undefined') { this.otprRvContName[0] = ''; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmotpr)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmotpr.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmotpr[i].otprrvcontname === 'undefined') { this.otprRvContName[i] = ''; }
                        else { this.otprRvContName[i] = xmlCfg.claim_doc_route.clmotpr[i].otprrvcontname.$.value; }
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmotpr.otprrvcontname === 'undefined') { this.otprRvContName[i] = ''; }
                    else { this.otprRvContName[i] = xmlCfg.claim_doc_route.clmotpr.otprrvcontname.$.value; }
                }
            }

            //otprToStationCode
            this.otprToStationCode = new Array();
            if (typeof xmlCfg.claim_doc_route.clmotpr === 'undefined') { this.otprToStationCode[0] = 0; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmotpr)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmotpr.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmotpr[i].otprtostationcode === 'undefined') { this.otprToStationCode[i] = 0; }
                        else { this.otprToStationCode[i] = xmlCfg.claim_doc_route.clmotpr[i].otprtostationcode.$.value; }
                        //console.log("this.otprToStationCode[" + i + "] = " + this.otprToStationCode[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmotpr.otprtostationcode === 'undefined') { this.otprToStationCode[i] = 0; }
                    else { this.otprToStationCode[i] = xmlCfg.claim_doc_route.clmotpr.otprtostationcode.$.value; }
                    //console.log("this.otprToStationCode(не массив)[" + i + "] = " + this.otprToStationCode[i]);
                }
            }

            //otprToStationName
            this.otprToStationName = new Array();
            if (typeof xmlCfg.claim_doc_route.clmotpr === 'undefined') { this.otprToStationName[0] = 0; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmotpr)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmotpr.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmotpr[i].otprtostationname === 'undefined') { this.otprToStationName[i] = 0; }
                        else { this.otprToStationName[i] = xmlCfg.claim_doc_route.clmotpr[i].otprtostationname.$.value; }
                        //console.log("this.otprToStationName[" + i + "] = " + this.otprToStationName[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmotpr.otprtostationname === 'undefined') { this.otprToStationName[i] = 0; }
                    else { this.otprToStationName[i] = xmlCfg.claim_doc_route.clmotpr.otprtostationname.$.value; }
                    //console.log("this.otprToStationName(не массив)[" + i + "] = " + this.otprToStationName[i]);
                }
            }

            //otprFreightName
            this.otprFreightName = new Array();
            if (typeof xmlCfg.claim_doc_route.clmotpr === 'undefined') { this.otprFreightName[0] = 0; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmotpr)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmotpr.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmotpr[i].otprfreightname === 'undefined') { this.otprFreightName[i] = 0; }
                        else { this.otprFreightName[i] = xmlCfg.claim_doc_route.clmotpr[i].otprfreightname.$.value; }
                        //console.log("this.otprFreightName[" + i + "] = " + this.otprFreightName[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmotpr.otprfreightname === 'undefined') { this.otprFreightName[i] = 0; }
                    else { this.otprFreightName[i] = xmlCfg.claim_doc_route.clmotpr.otprfreightname.$.value; }
                    //console.log("this.otprFreightName(не массив)[" + i + "] = " + this.otprFreightName[i]);
                }
            }

            // otprFreightGngName
            this.otprFreightGngName = new Array();
            if (typeof xmlCfg.claim_doc_route.clmotpr === 'undefined') { this.otprFreightGngName[0] = 0; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmotpr)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmotpr.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmotpr[i].otprfreightgngname === 'undefined') { this.otprFreightGngName[i] = 0; }
                        else { this.otprFreightGngName[i] = xmlCfg.claim_doc_route.clmotpr[i].otprfreightgngname.$.value; }
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmotpr.otprfreightgngname === 'undefined') { this.otprFreightGngName[i] = 0; }
                    else { this.otprFreightGngName[i] = xmlCfg.claim_doc_route.clmotpr.otprfreightgngname.$.value; }
                }
            }

            //otprFreightWeight
            this.otprFreightWeight = new Array();
            if (typeof xmlCfg.claim_doc_route.clmotpr === 'undefined') { this.otprFreightWeight[0] = 0; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmotpr)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmotpr.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmotpr[i].otprfreightweight === 'undefined') { this.otprFreightWeight[i] = 0; }
                        else { this.otprFreightWeight[i] = xmlCfg.claim_doc_route.clmotpr[i].otprfreightweight.$.value; }
                        //console.log("this.otprFreightWeight[" + i + "] = " + this.otprFreightWeight[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmotpr.otprfreightweight === 'undefined') { this.otprFreightWeight[i] = 0; }
                    else { this.otprFreightWeight[i] = xmlCfg.claim_doc_route.clmotpr.otprfreightweight.$.value; }
                    //console.log("this.otprFreightWeight(не массив)[" + i + "] = " + this.otprFreightWeight[i]);
                }
            }

            //otprCarTypeName
            this.otprCarTypeName = new Array();
            if (typeof xmlCfg.claim_doc_route.clmotpr === 'undefined') { this.otprCarTypeName[0] = 0; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmotpr)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmotpr.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmotpr[i].otprcartypename === 'undefined') { this.otprCarTypeName[i] = 0; }
                        else { this.otprCarTypeName[i] = xmlCfg.claim_doc_route.clmotpr[i].otprcartypename.$.value; }
                        //console.log("this.otprCarTypeName[" + i + "] = " + this.otprCarTypeName[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmotpr.otprcartypename === 'undefined') { this.otprCarTypeName[i] = 0; }
                    else { this.otprCarTypeName[i] = xmlCfg.claim_doc_route.clmotpr.otprcartypename.$.value; }
                    //console.log("this.otprCarTypeName(не массив)[" + i + "] = " + this.otprCarTypeName[i]);
                }
            }

            //otprCarOwnerName
            this.otprCarOwnerName = new Array();
            if (typeof xmlCfg.claim_doc_route.clmotpr === 'undefined') { this.otprCarOwnerName[0] = 0; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmotpr)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmotpr.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmotpr[i].otprcarownername === 'undefined') { this.otprCarOwnerName[i] = 0; }
                        else { this.otprCarOwnerName[i] = xmlCfg.claim_doc_route.clmotpr[i].otprcarownername.$.value; }
                        //console.log("this.otprCarOwnerName[" + i + "] = " + this.otprCarOwnerName[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmotpr.otprcarownername === 'undefined') { this.otprCarOwnerName[i] = 0; }
                    else { this.otprCarOwnerName[i] = xmlCfg.claim_doc_route.clmotpr.otprcarownername.$.value; }
                    //console.log("this.otprCarOwnerName(не массив)[" + i + "] = " + this.otprCarOwnerName[i]);
                }
            }

            //otprDaysDelivery
            this.otprDaysDelivery = new Array();
            if (typeof xmlCfg.claim_doc_route.clmotpr === 'undefined') { this.otprDaysDelivery[0] = 0; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmotpr)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmotpr.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmotpr[i].otprdaysdelivery === 'undefined') { this.otprDaysDelivery[i] = 0; }
                        else { this.otprDaysDelivery[i] = xmlCfg.claim_doc_route.clmotpr[i].otprdaysdelivery.$.value; }
                        //console.log("this.otprDaysDelivery[" + i + "] = " + this.otprDaysDelivery[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmotpr.otprdaysdelivery === 'undefined') { this.otprDaysDelivery[i] = 0; }
                    else { this.otprDaysDelivery[i] = xmlCfg.claim_doc_route.clmotpr.otprdaysdelivery.$.value; }
                    //console.log("this.otprDaysDelivery(не массив)[" + i + "] = " + this.otprDaysDelivery[i]);
                }
            }

            //payerOKPO
            this.payerOKPO = new Array();
            if (typeof xmlCfg.claim_doc_route.clmpayer === 'undefined') { this.payerOKPO = null; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmpayer)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmpayer.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmpayer[i].payerokpo === 'undefined') { this.payerOKPO[i] = null; }
                        else { this.payerOKPO[i] = xmlCfg.claim_doc_route.clmpayer[i].payerokpo.$.value; }
                        //console.log("this.payerOKPO[" + i + "] = " + this.payerOKPO[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmpayer.payerokpo === 'undefined') { this.payerOKPO[i] = null; }
                    else { this.payerOKPO[i] = xmlCfg.claim_doc_route.clmpayer.payerokpo.$.value; }
                    //console.log("this.payerOKPO(не массив)[" + i + "] = " + this.payerOKPO[i]);
                }
            }

            //payerId
            this.payerId = new Array();
            if (typeof xmlCfg.claim_doc_route.clmpayer === 'undefined') { this.payerId = null; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmpayer)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmpayer.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmpayer[i].payerid === 'undefined') { this.payerId[i] = null; }
                        else { this.payerId[i] = xmlCfg.claim_doc_route.clmpayer[i].payerid.$.value; }
                        //console.log("this.payerId[" + i + "] = " + this.payerId[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmpayer.payerid === 'undefined') { this.payerId[i] = null; }
                    else { this.payerId[i] = xmlCfg.claim_doc_route.clmpayer.payerid.$.value; }
                    //console.log("this.payerId(не массив)[" + i + "] = " + this.payerId[i]);
                }
            }


            //payerName
            this.payerName = new Array();
            if (typeof xmlCfg.claim_doc_route.clmpayer === 'undefined') { this.payerName = null; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmpayer)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmpayer.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmpayer[i].payername === 'undefined') { this.payerName[i] = null; }
                        else { this.payerName[i] = xmlCfg.claim_doc_route.clmpayer[i].payername.$.value; }
                        //console.log("this.payerName[" + i + "] = " + this.payerName[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmpayer.payername === 'undefined') { this.payerName[i] = null; }
                    else { this.payerName[i] = xmlCfg.claim_doc_route.clmpayer.payername.$.value; }
                    //console.log("this.payerName(не массив)[" + i + "] = " + this.payerName[i]);
                }
            }

            //payerAddress
            this.payerAddress = new Array();
            if (typeof xmlCfg.claim_doc_route.clmpayer === 'undefined') { this.payerAddress = null; }
            else {
                if (Array.isArray(xmlCfg.claim_doc_route.clmpayer)) {
                    for (let i = 0; i < xmlCfg.claim_doc_route.clmpayer.length; i++) {

                        if (typeof xmlCfg.claim_doc_route.clmpayer[i].payeraddress === 'undefined') { this.payerAddress[i] = null; }
                        else { this.payerAddress[i] = xmlCfg.claim_doc_route.clmpayer[i].payeraddress.$.value; }
                        //console.log("this.payerAddress[" + i + "] = " + this.payerAddress[i]);
                    }
                }
                else {
                    let i = 0;

                    if (typeof xmlCfg.claim_doc_route.clmpayer.payeraddress === 'undefined') { this.payerAddress[i] = null; }
                    else { this.payerAddress[i] = xmlCfg.claim_doc_route.clmpayer.payeraddress.$.value; }
                    //console.log("this.payerAddress(не массив)[" + i + "] = " + this.payerAddress[i]);
                }
            }

            //operDate
            if (typeof xmlCfg.claim_doc_route.operdate === 'undefined') { this.operDate = "0001-01-01 00:00:00.00000+00"; }
            else {
                this.operDate = xmlCfg.claim_doc_route.operdate.$.value;
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