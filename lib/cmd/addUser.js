/** 
 * addUser.js - Adds the given user to the catalog as an operator
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
const totp = require(`${KLOUD_CONSTANTS.LIBDIR}/totp.js`);
const dbAbstractor = require(`${KLOUD_CONSTANTS.LIBDIR}/dbAbstractor.js`);
const accountExists = async email => await dbAbstractor.getAdminForEmail(email) != null;

/**
 * Adds the given user to the catalog as an operator. User is auto approved if they are
 * the first admin, else the one of the old admins must approve them manually.
 * @param {array} params The incoming params - must be - email, name, password, org
 */
module.exports.exec = async function(params) {
    const email = params[0], name = params[1], password = params[2], org = params[3], totpsec = totp.getSecret();
    if (await accountExists(email)) {KLOUD_CONSTANTS.LOGERROR("Account already exists"); return false;}  

    return await dbAbstractor.addUserToDB(email, name, org, password, totpsec, "root", (await dbAbstractor.getAllAdmins(org)).length==0);
}
