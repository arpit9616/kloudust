/** 
 * listVMs.js - Lists the host VMs - either all or running (default)
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

const {xforge} = require(`${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/xforge`);

/**
 * Lists the host VMs - either all or running (default)
 * @param {array} params The incoming params - must be - type (centos8 only for now), ip, user id, password, ssh hostkey, [all|running] optional param, defaults to running
 */
module.exports.exec = async function(params) {
    if (params[0].toLowerCase() != "centos8") {KLOUD_CONSTANTS.LOGERROR("Only centos8 is supported."); return false;}

    const xforgeArgs = {
        colors: KLOUD_CONSTANTS.COLORED_OUT, 
        file: `${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/samples/remoteCmd.xf.js`,
        other: [
            params[1], params[2], params[3], params[4], 
            `${KLOUD_CONSTANTS.LIBDIR}/cmd/scripts/listVMs.sh`,
            params[5]=="all"?"list --all":"list"
        ]
    }

    return (await xforge(xforgeArgs)==0)?true:false;
}