/** 
 * dbAbstractor.js - All DB queries, so we can change DB easily if needed
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
const util = require("util");
const cryptoMod = require("crypto");
const bcryptjs = require("bcryptjs");
const db = require(`${KLOUD_CONSTANTS.LIBDIR}/db.js`);
const crypt = require(`${KLOUD_CONSTANTS.LIBDIR}/crypt.js`);
const bcryptjs_hash = async text => await (util.promisify(bcryptjs.hash))(text, 12);

/**
 * Adds the given host to the catalog
 * @param {string} hostname The hostname
 * @param {string} rootid The admin user id
 * @param {string} rootpw The admin password
 * @param {string} hostkey The hostkey
 * @return true on success or false otherwise
 */
exports.addHostToDB = async (hostname, type, rootid, rootpw, hostkey) => {
    if (!KLOUD_CONSTANTS.env.rootkey) {KLOUD_CONSTANTS.LOGERROR("Admin not logged in, no rootkey"); return false;}

    const rootpw_encrypted = crypt.encrypt(rootpw, KLOUD_CONSTANTS.env.rootkey);
    const query = "insert into hosts(hostname, type, rootid, rootpw, hostkey) values (?,?,?,?,?)";
    return await db.runCmd(query, [hostname, type, rootid, rootpw_encrypted, hostkey]);
}

/**
 * Returns the host entry object for the given hostname
 * @param {string} hostname The host name or IP
 * @return {hostname, rootid, rootpw, hostkey} or null
 */
exports.getHostEntry = async hostname => {
    if (!KLOUD_CONSTANTS.env.rootkey) {KLOUD_CONSTANTS.LOGERROR("Admin not logged in, no rootkey"); return null;}

    const hosts = await db.getQuery("select * from hosts where hostname = ?", hostname);
    if (!hosts || !hosts.length) return null;

    hosts[0].rootpw = crypt.decrypt(hosts[0].rootpw, KLOUD_CONSTANTS.env.rootkey);  // decrypt the password, in-memory only
    return hosts[0];
}

/**
 * Adds the given user with given role to the DB
 * @param {string} email The user's email, must be unique
 * @param {string} name The user's name 
 * @param {string} org The user's organization
 * @param {string} password The user's password
 * @param {string} totpsec The user's OTP secret
 * @param {string} role The user's role
 * @param {boolean} approved true if the user is approved, false otherwise
 * @return true on succes, false otherwise
 */
exports.addUserToDB = async (email, name, org, password, totpsec, role, approved) => {
    const pwph = await bcryptjs_hash(email+password); const rootkey = cryptoMod.randomBytes(32).toString("hex");
    const user_pw_hashed_rootkey = crypt.encrypt(rootkey, email+password);

    const query = "insert into users(id, name, org, pwph, totpsec, user_pw_hashed_rootkey, role, approved) values (?,?,?,?,?,?,?,?)";
    return await db.runCmd(query, [email.toLocaleLowerCase(), name, org, pwph, totpsec, user_pw_hashed_rootkey, role, approved?1:0]);
}

/**
 * Returns all currently registered admins, could be null in case of error
 */
exports.getAllAdmins = async _=>{
    const users = await db.getQuery("select * from users");
    return users;
}

/**
 * Returns user account for the given email address
 * @param {string} email Expected email address
 * @return The account object or null on error
 */
exports.getAdminForEmail = async email => {
    const users = await db.getQuery("select * from users where id = ?", email.toLocaleLowerCase());
    if (users && users.length) {
        delete users[0].pwph; delete users[0].user_pw_hashed_rootkey;   // cleanup stuff we generated and we don't know the user's real password either
        return users[0];
    } else return null;
}

/**
 * Logs the given user in and sets up for environment variables
 * @param {string} email The email
 * @param {string} password The password
 * @return true on success and false otherwise
 */
exports.loginUser = async (email,password) => {
    const users = await db.getQuery("select * from users where id = ?", email.toLocaleLowerCase());
    if (!users || !users.length) return false;
    else if (!await (util.promisify(bcryptjs.compare))(email+password, users[0].pwph)) return false;

    KLOUD_CONSTANTS.env.pwph = users[0].pwph;
    KLOUD_CONSTANTS.env.user = users[0].email;
    KLOUD_CONSTANTS.env.rootkey = crypt.decrypt(users[0].user_pw_hashed_rootkey, email+password);
    return true;
}
