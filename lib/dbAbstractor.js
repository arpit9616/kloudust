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
const totpmod = require(`${KLOUD_CONSTANTS.LIBDIR}/totp.js`);
const bcryptjs_hash = async text => await (util.promisify(bcryptjs.hash))(text, 12);

/**
 * Adds the given host to the catalog, if it exists, it will delete and reinsert it
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
    await this.deleteHostFromDB(hostname); return await db.runCmd(query, [hostname, type, rootid, rootpw_encrypted, hostkey]);
}

/**
 * Deletes the given host from the catalog
 * @param {string} hostname The hostname
 * @return true on success or false otherwise
 */
exports.deleteHostFromDB = async (hostname) => {
    if (!KLOUD_CONSTANTS.env.rootkey) {KLOUD_CONSTANTS.LOGERROR("Admin not logged in, no rootkey"); return false;}

    const query = "delete from hosts where hostname = ?";
    return await db.runCmd(query, [hostname]);
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
 * Adds the given VM to the catalog.
 * @param {string} name The VM name
 * @param {string} description The VM description
 * @param {string} hostname The hostname
 * @param {string} os The OS
 * @param {integer} cpus The CPU
 * @param {integer} memory The memory
 * @param {integer} disk The disk
 * @return true on success or false otherwise
 */
exports.addVMToDB = async (name, description, hostname, os, cpus, memory, disk) => {
    if (!KLOUD_CONSTANTS.env.rootkey) {KLOUD_CONSTANTS.LOGERROR("Admin not logged in, no rootkey"); return false;}

    const project = KLOUD_CONSTANTS.env.prj, org = KLOUD_CONSTANTS.env.org, id = `${org}_${project}_${name}`
    const query = "insert into vms(id, name, description, hostname, org, project, os, cpus, memory, disk) values (?,?,?,?,?,?,?,?,?,?)";
    return await db.runCmd(query, [id, name, description, hostname, org, project, os, cpus, memory, disk]);
}

/**
 * Returns the VM for the current user, org and project given its name. 
 * @param {string} name The VM Name
 * @return VM object or null
 */
exports.getVM = async name => {
    if (!KLOUD_CONSTANTS.env.rootkey) {KLOUD_CONSTANTS.LOGERROR("Admin not logged in, no rootkey"); return false;}

    const project = KLOUD_CONSTANTS.env.prj, org = KLOUD_CONSTANTS.env.org, id = `${org}_${project}_${name}`;
    const results = await db.getQuery("select * from vms where id = ?", [id]);
    return results?results[0]:null;
}

/**
 * Renames the VM for the current user, org and project given its name. 
 * @param {string} name The VM name
 * @param {string} newname The VM new name
 * @return true on success or false otherwise
 */
exports.renameVM = async (name, newname) => {
    const vm = await exports.getVM(name); if (!vm) return false;
    if (!await exports.addVMToDB(newname, vm.description, vm.hostname, vm.os, vm.cpus, vm.memory, vm.disk)) return false;
    return await exports.deleteVM(name); 
}

/**
 * Deletes the VM for the current user, org and project given its name. 
 * @param {string} name The VM Name
 * @return true on success or false otherwise
 */
exports.deleteVM = async name => {
    if (!KLOUD_CONSTANTS.env.rootkey) {KLOUD_CONSTANTS.LOGERROR("Admin not logged in, no rootkey"); return false;}

    const project = KLOUD_CONSTANTS.env.prj, org = KLOUD_CONSTANTS.env.org, id = `${org}_${project}_${name}`;
    return await db.runCmd("delete from vms where id = ?", [id]);
}

/**
 * Returns VMs for the given host and / or current project. All VMs for the current project
 * are returned if hostname is skipped.
 * @param {string} hostname The host (optional)
 * @param {boolean} dontUseProject Return list of VMs for the host irrespective of project
 */
exports.listVMs = async (hostname, dontUseProject) => {
    const project = KLOUD_CONSTANTS.env.prj
    const query = hostname? (dontUseProject ? "select * from vms where hostname = ?" : "select * from vms where hostname = ? and project = ?") : "select * from vms where project = ?";
    const results = await db.getQuery(query, hostname?dontUseProject?[hostname]:[hostname,project]:[project]);
    return results;
}

/**
 * Adds the project to the DB if it doesn't exist for this org
 * @param {string} name The project name
 * @param {string} description The project description 
 * @return true on success or false otherwise
 */
exports.addProject = async(name, description="") => {
    const org = KLOUD_CONSTANTS.env.org, id = `${name.toLocaleLowerCase()}_${org}`;
    if ((await exports.getProject(name,org)).length == 0) return await db.runCmd("insert into projects (id, name, org, description) values (?,?,?,?)",
        [id, name, org, description]);
    else return true;
}

/**
 * Returns the project or all if name is null
 * @param {string} name Project name
 */
exports.getProject = async name => {
    const org = KLOUD_CONSTANTS.env.org, id = `${name.toLocaleLowerCase()}_${org}`;
    const query = name?"select * from projects where id = ?":"select * from projects where org = ?";
    const results = await db.getQuery(query,[name?id:org]);
    return _getArrayOrObjectIfLength1(results);
}

/**
 * Deletes the project from the DB for this org
 * @param {string} name The project name
 * @return true on success or false otherwise
 */
exports.deleteProject = async name => {
    const org = KLOUD_CONSTANTS.env.org, id = `${name.toLocaleLowerCase()}_${org}`;
    return await db.runCmd("delete from projects where id = ?", [id]);
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
 * Returns all currently registered admins, for an org, could be null in case of error
 * @param org The org, a case insensitive search will be performed
 */
exports.getAllAdmins = async org => {
    const users = await db.getQuery("select * from users where org = ? collate nocase", [org]);
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
 * @param {totp} totp The OTP, if given will be verified, optional
 * @return true on success and false otherwise
 */
exports.loginUser = async (email, password, totp) => {
    const users = await db.getQuery("select * from users where id = ?", email.toLocaleLowerCase());
    if (!users || !users.length) return false;  // bad ID
    else if (!await (util.promisify(bcryptjs.compare))(email+password, users[0].pwph)) return false;    // bad pass
    else if (totp && !totpmod.verifyTOTP(users[0].totpsec, totp)) return false;    // bad OTP

    KLOUD_CONSTANTS.env.pwph = users[0].pwph;
    KLOUD_CONSTANTS.env.user = users[0].email;
    KLOUD_CONSTANTS.env.org = users[0].org;
    KLOUD_CONSTANTS.env.rootkey = crypt.decrypt(users[0].user_pw_hashed_rootkey, email+password);
    return users[0];
}

/**
 * Returns the user's TOTP secret
 * @param {string} email The email
 */
exports.getUsersTOTPSecret = async email => {
    const users = await db.getQuery("select totpsec from users where id = ?", email.toLocaleLowerCase());
    if (!users || !users.length) return false;  // bad ID
    else return users[0].totpsec;
}

/**
 * Changes the user's password to the given password
 * @param {string} email The email
 * @param {string} oldpassword The old password
 * @param {string} password The password
 */
exports.changeUserPassword = async (email, oldpassword, password) => {
    const users = await db.getQuery("select user_pw_hashed_rootkey from users where id = ?", email.toLocaleLowerCase());
    if (!users || !users.length) return false;  // bad ID

    const pwph = await bcryptjs_hash(email+password); 
    const rootkey = crypt.decrypt(users[0].user_pw_hashed_rootkey, email+oldpassword);
    const user_pw_hashed_rootkey = crypt.encrypt(rootkey, email+password);

    const query = "update users set pwph = ?, user_pw_hashed_rootkey = ? where id = ?";
    return await db.runCmd(query, [pwph, user_pw_hashed_rootkey, email.toLocaleLowerCase()]);
}

const _getArrayOrObjectIfLength1 = results => results.length == 1?results[0]:results;
