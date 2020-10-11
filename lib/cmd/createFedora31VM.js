/** 
 * createFedora31VM.js - Creates Fedora 31 VM from Internet download or catalog image
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

const {xforge} = require(`${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/xforge`);
const dbAbstractor = require(`${KLOUD_CONSTANTS.LIBDIR}/dbAbstractor.js`);

/**
 * Creates Fedora 31 VM from Internet download or catalog image
 * @param {array} params The incoming params - must be - type (centos8 only for now), ip, user id, password, ssh hostkey, VM name, VM description, vCPUs, RAM, disk size in GB, optional catalog ISO name
 */
module.exports.exec = async function(params) {
    const hostInfo = await dbAbstractor.getHostEntry(params[0]); 
    if (!hostInfo) {KLOUD_CONSTANTS.LOGERROR("Bad hostname or host not found"); return false;}

    const xforgeArgs = {
        colors: KLOUD_CONSTANTS.COLORED_OUT, 
        file: `${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/samples/remoteCmd.xf.js`,
        other: [
            hostInfo.hostname, hostInfo.rootid, hostInfo.rootpw, hostInfo.hostkey,
            `${KLOUD_CONSTANTS.LIBDIR}/cmd/scripts/createFedora31VM.sh`,
            params[1], params[2], params[3], params[4], params[5], params[6]?`--cdrom /kloudust/catalog/${params[6]}`:"--location https://dl.fedoraproject.org/pub/fedora/linux/releases/31/Server/x86_64/os/"
        ]
    }

    return (await xforge(xforgeArgs)==0)?true:false;
}