/** 
 * deleteSnapshot.js - Deletes a VM snapshot
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

const {xforge} = require(`${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/xforge`);
const dbAbstractor = require(`${KLOUD_CONSTANTS.LIBDIR}/dbAbstractor.js`);

/**
 * Deletes a VM snapshot
 * @param {array} params The incoming params - must be - type (centos8 only for now), ip, user id, password, ssh hostkey, VM name, Snapshot name
 */
module.exports.exec = async function(params) {
    const hostInfo = await dbAbstractor.getHostEntry(params[0]); 
    if (!hostInfo) {KLOUD_CONSTANTS.LOGERROR("Bad hostname or host not found"); return false;}

    const xforgeArgs = {
        colors: KLOUD_CONSTANTS.COLORED_OUT, 
        file: `${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/samples/remoteCmd.xf.js`,
        other: [
            hostInfo.hostname, hostInfo.rootid, hostInfo.rootpw, hostInfo.hostkey,  
            `${KLOUD_CONSTANTS.LIBDIR}/cmd/scripts/deleteSnapshot.sh`,
            params[1], params[2]
        ]
    }

    return (await xforge(xforgeArgs)==0)?true:false;
}