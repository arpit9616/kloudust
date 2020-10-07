/** 
 * createFedora31VM.js - Creates Fedora 31 VM from Internet download or catalog image
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

const {xforge} = require(`${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/xforge`);

/**
 * Creates Fedora 31 VM from Internet download or catalog image
 * @param {array} params The incoming params - must be - type (centos8 only for now), ip, user id, password, ssh hostkey, VM name, VM description, vCPUs, RAM, disk size in GB, optional catalog ISO name
 */
module.exports.exec = async function(params) {
    if (params[0].toLowerCase() != "centos8") {KLOUD_CONSTANTS.LOGERROR("Only centos8 is supported."); return false;}

    const xforgeArgs = {
        colors: KLOUD_CONSTANTS.COLORED_OUT, 
        file: `${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/samples/remoteCmd.xf.js`,
        other: [
            params[1], params[2], params[3], params[4], 
            `${KLOUD_CONSTANTS.LIBDIR}/cmd/scripts/createCentOS8VM.sh`,
            params[5], params[6], params[7], params[8], params[9], params[10]?`--cdrom /kloudust/catalog/${params[10]}`:"--cdrom https://mirrors.oit.uci.edu/centos/8.2.2004/isos/x86_64/CentOS-8.2.2004-x86_64-minimal.iso"
        ]
    }

    return (await xforge(xforgeArgs)==0)?true:false;
}