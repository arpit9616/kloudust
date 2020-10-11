/** 
 * addHost.js - Initializes the host machine to become a Kloudust hypervisor and adds 
 *              it to the Kloudust catalog
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
const cryptoMod = require("crypto");
const {xforge} = require(`${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/xforge`);
const dbAbstractor = require(`${KLOUD_CONSTANTS.LIBDIR}/dbAbstractor.js`);

/**
 * Initializes and adds the given machine to become a Kloudust hypervisor
 * @param {array} params The incoming params - must be - type (centos8 only for now), ip, user id (must have root access), password, ssh hostkey
 */
module.exports.exec = async function(params) {
    if (params[0].toLowerCase() != "centos8") {KLOUD_CONSTANTS.LOGERROR("Only centos8 is supported."); return false;}

    const newPassword = cryptoMod.randomBytes(32).toString("hex");
    const xforgeArgs = {
        colors: KLOUD_CONSTANTS.COLORED_OUT, 
        file: `${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/samples/remoteCmd.xf.js`,
        other: [
            params[1], params[2], params[3], params[4], 
            `${KLOUD_CONSTANTS.LIBDIR}/cmd/scripts/addHost.sh`,
            newPassword
        ]
    }

    if (await xforge(xforgeArgs)==0) {
        if (dbAbstractor.addHostToDB(params[1], params[2], newPassword, params[4])) return true;
        else {_showError(newPassword, params[2], params[3]); return false;}
    } else {_showError(newPassword, params[2], params[3]); return false;}
}

function _showError(newPassword, userid, oldPassword) {
    KLOUD_CONSTANTS.LOGERROR("Host initialization failed. Password may be changed");
    KLOUD_CONSTANTS.LOGERROR(`Login password for ${userid} is one of these now: ${oldPassword} or ${newPassword}`);
}