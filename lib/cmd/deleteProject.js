/** 
 * deleteProject.js - Deletes the given project
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

const dbAbstractor = require(`${KLOUD_CONSTANTS.LIBDIR}/dbAbstractor.js`);

/**
 * Deletes the given Project
 */
module.exports.exec = async _ => dbAbstractor.deleteProject(KLOUD_CONSTANTS.env.prj);