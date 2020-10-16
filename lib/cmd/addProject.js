/** 
 * addProject.js - Adds the given project to the current org
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

const dbAbstractor = require(`${KLOUD_CONSTANTS.LIBDIR}/dbAbstractor.js`);

/**
 * Adds the given project to the current org
 */
module.exports.exec = async _ => {
    const project = await dbAbstractor.getProject(KLOUD_CONSTANTS.env.prj);
    return project.name == KLOUD_CONSTANTS.env.prj;
}