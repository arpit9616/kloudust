/** 
 * createVM.js - Creates VM from Internet download or catalog image
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

const {xforge} = require(`${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/xforge`);
const dbAbstractor = require(`${KLOUD_CONSTANTS.LIBDIR}/dbAbstractor.js`);
const OS_MAPPINGS = {
    "genericlinux": ["linux","centos6.0"],
    "centos8": ["linux","centos8"],
    "fedora31": ["linux","fedora31"],
    "ubuntu19.10": ["linux","ubuntu19.10"],
    "win10": ["windows","win10"],
    "win2k16": ["windows","win2k16"],
    "win2k12r2": ["windows","win2k12r2"],
    "win2k19": ["windows","win2k19"]
}


/**
 * Creates VM from Internet download or catalog image
 * @param {array} params The incoming params - must be - Hostname, VM name, VM description, vCPUs, RAM, disk size in GB, optional catalog ISO name
 */
module.exports.exec = async function(params) {
    const hostInfo = await dbAbstractor.getHostEntry(params[0]); 
    if (!hostInfo) {KLOUD_CONSTANTS.LOGERROR("Bad hostname or host not found"); return false;}

    if (!params[7] || !OS_MAPPINGS[params[7]]) {
        KLOUD_CONSTANTS.LOGWARN("Missing VM type, or bad type, assuming generic Linux");
        params[7] = "genericlinux";
    }

    const xforgeArgs = {
        colors: KLOUD_CONSTANTS.COLORED_OUT, 
        file: `${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/samples/remoteCmd.xf.js`,
        other: [
            hostInfo.hostname, hostInfo.rootid, hostInfo.rootpw, hostInfo.hostkey,
            `${KLOUD_CONSTANTS.LIBDIR}/cmd/scripts/createVM.sh`,
            params[1], params[2], params[3], params[4], params[5], 
            params[6].indexOf("--")==-1 ? `--cdrom /kloudust/catalog/${params[6]}` : params[6],
            OS_MAPPINGS[params[7]][0], OS_MAPPINGS[params[7]][1], KLOUD_CONSTANTS.env.org, 
            KLOUD_CONSTANTS.env.prj
        ]
    }

    if (await xforge(xforgeArgs)==0) {
        if (await dbAbstractor.addVMToDB(params[1], params[2], params[0], params[6], params[3], params[4], params[5])) return true;
        else {KLOUD_CONSTANTS.LOGERROR("DB failed"); return false;}
    } else return false;
}