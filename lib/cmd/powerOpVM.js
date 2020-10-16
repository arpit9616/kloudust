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
    const vm = await dbAbstractor.getVM(params[0]);
    if (!vm) {KLOUD_CONSTANTS.LOGERROR("Bad VM name or VM not found"); return false;}
    
    const hostInfo = await dbAbstractor.getHostEntry(vm.hostname); 
    if (!hostInfo) {KLOUD_CONSTANTS.LOGERROR("Bad hostname or host not found"); return false;}

    const xforgeArgs = {
        colors: KLOUD_CONSTANTS.COLORED_OUT, 
        file: `${KLOUD_CONSTANTS.LIBDIR}/3p/xforge/samples/remoteCmd.xf.js`,
        other: [
            hostInfo.hostname, hostInfo.rootid, hostInfo.rootpw, hostInfo.hostkey,
            `${KLOUD_CONSTANTS.LIBDIR}/cmd/scripts/powerOpVM.sh`,
            params[0], params[1].toLowerCase()=="start"?"start":(params[1].toLowerCase()=="stop"?"shutdown":
                (params[1].toLowerCase()=="reboot"?"reboot":(params[1].toLowerCase()=="forcestop"?"destroy":
                (params[1].toLowerCase()=="autostart"?"autostart": (params[1].toLowerCase()=="noautostart"?
                "autostart --disable":(params[1].toLowerCase()=="pause"?"managedsave":"start")))))) //yea not proud of this maze
        ]
    }

    return (await xforge(xforgeArgs)==0)?true:false;
}