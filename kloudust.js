#!/usr/bin/env node
/** 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
global.KLOUD_CONSTANTS = require(`${__dirname}/lib/constants.js`);

const fs = require("fs");
const path = require("path");
const args = require("commander");
const utils = require(`${KLOUD_CONSTANTS.LIBDIR}/utils.js`);

module.exports.kloudust = async function(inprocessArgs) {
    args.description("Kloudust - (C) TekMonks\nHybrid Cloud Platform")
    args.version("Kloudust v0.8.0");
    args.option("-f, --file <path>", "required, full path to the build file");
    args.option("-c, --colors", "produce colored output");
    args.option("-e, --execute <command>", "execute single command and exit");
    args.parse(inprocessArgs||process.argv);

    if (args.colors) KLOUD_CONSTANTS.COLORED_OUT = true;

    if (args.file) {
        let fileToExec = _resolvePath(args.file);
        KLOUD_CONSTANTS.LOGINFO(`Starting execution: ${fileToExec}`);

        fileToExec = fs.readFileSync(fileToExec);
        for (execLine of fileToExec.split(";")) if (!await _execCommand(utils.parseArgs(execLine)))
            KLOUD_CONSTANTS.EXITFAILED();

        KLOUD_CONSTANTS.EXITOK();
    } else if (args.execute) {
        if (await _execCommand(utils.parseArgs(args.execute))) KLOUD_CONSTANTS.EXITOK(); else KLOUD_CONSTANTS.EXITFAILED();
    } else runInterpretor();
}

async function _execCommand(params) {
    const command = params[0]; const cmdParams = params.slice(1);
    try {
        const module = require(`${KLOUD_CONSTANTS.LIBDIR}/cmd/${command}.js`);
        return await module.exec(cmdParams);
    } catch (err) {
        KLOUD_CONSTANTS.LOGERROR(err); return false;
    }
}
 
function _resolvePath(file) {
    if (fs.existsSync(file)) return path.resolve(file);
    else return (path.resolve(`${__dirname}/${file}`));
}

if (require.main === module) module.exports.kloudust();