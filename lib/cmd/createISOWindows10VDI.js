/** 
 * createISOWindows10VDI.js - Creates Windows 10 VDI from ISO Image
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

const {xforge} = require(`${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/xforge`);

/**
 * Creates Windows 10 VDI from ISO Image
 * @param {array} params The incoming params - must be - type (centos8 only for now), ip, user id, password, ssh hostkey, VM name, VM description, vCPUs, RAM, disk size in GB, catalog image name
 */
module.exports.exec = async function(params) {
    if (params[0].toLowerCase() != "centos8") {KLOUD_CONSTANTS.LOGERROR("Only centos8 is supported."); return false;}

    const sockets = params[7]%2==0?2:1, coresPerSocket = params[7]/sockets, threads = 1;
    const cpuParam = `${params[7]},sockets=${sockets},cores=${coresPerSocket},threads=${threads}`;

    const xforgeArgs = {
        colors: KLOUD_CONSTANTS.COLORED_OUT, 
        file: `${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/samples/remoteCmd.xf.js`,
        other: [
            params[1], params[2], params[3], params[4], 
            `${KLOUD_CONSTANTS.LIBDIR}/cmd/scripts/createISOWindows10VDI.sh`,
            params[5], params[6], cpuParam, params[8], params[9], params[10]
        ]
    }

    return (await xforge(xforgeArgs)==0)?true:false;
}