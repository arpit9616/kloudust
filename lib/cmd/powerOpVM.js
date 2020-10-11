/** 
 * powerOpVM.js - Performs the given power operation on the VM
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

const {xforge} = require(`${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/xforge`);
const dbAbstractor = require(`${KLOUD_CONSTANTS.LIBDIR}/dbAbstractor.js`);

/**
 * Performs the given power operation on the VM
 * @param {array} params The incoming params - must be - type (centos8 only for now), ip, user id, password, ssh hostkey, VM name, [start|pause|stop|forcestop|reboot|autostart|noautostart] - default is start
 */
module.exports.exec = async function(params) {
    const hostInfo = await dbAbstractor.getHostEntry(params[0]); 
    if (!hostInfo) {KLOUD_CONSTANTS.LOGERROR("Bad hostname or host not found"); return false;}

    const xforgeArgs = {
        colors: KLOUD_CONSTANTS.COLORED_OUT, 
        file: `${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/samples/remoteCmd.xf.js`,
        other: [
            hostInfo.hostname, hostInfo.rootid, hostInfo.rootpw, hostInfo.hostkey,
            `${KLOUD_CONSTANTS.LIBDIR}/cmd/scripts/powerOpVM.sh`,
            params[1], params[2].toLowerCase()=="start"?"start":(params[2].toLowerCase()=="stop"?"shutdown":
                (params[2].toLowerCase()=="reboot"?"reboot":(params[2].toLowerCase()=="forcestop"?"destroy":
                (params[2].toLowerCase()=="autostart"?"autostart": (params[2].toLowerCase()=="noautostart"?
                "autostart --disable":(params[2].toLowerCase()=="pause"?"managedsave":"start"))))))
        ]
    }

    return (await xforge(xforgeArgs)==0)?true:false;
}