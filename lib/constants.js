/* 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
const path = require("path");
const colors = require("colors");

exports.COLORED_OUT = false;
const _getColoredMessage = (s, colorfunc) => exports.COLORED_OUT?colorfunc(s):s;

exports.LIBDIR = path.resolve(__dirname);
exports.ROOTDIR = path.resolve(`${__dirname}/../`);
exports.CRYPTCONF = exports.ROOTDIR+"/conf/crypt.json";

exports.LOGBARE = s => console.info(_getColoredMessage(`${s}\n`, colors.green));
exports.LOGINFO = s => console.info(_getColoredMessage(`[INFO] ${s}\n`, colors.green));
exports.LOGERROR = e => console.error(_getColoredMessage(`[ERROR] ${_getErrorMessage(e)}\n`, colors.red));
exports.LOGWARN = s => console.warn(_getColoredMessage(`[WARN] ${s}\n`, colors.yellow));
exports.LOGEXEC = s => console.info(_getColoredMessage(`[EXEC] ${s}\n`, colors.blue));

exports.EXITOK = _ => {exports.LOGINFO("Success, done."); process.exit(0);}
exports.EXITFAILED = _ => {exports.LOGERROR("Failed."); process.exit(1);}

function _getErrorMessage(e) {
    if (e instanceof Error) return `${e.message}\n[ERROR] ${e.stack}`;

    const type = typeof e; const keys = Object.keys(e);
    if (type === 'function' || type === 'object' && !!e && keys.length) return JSON.stringify(e);

    return e;
}
