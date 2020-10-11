/** 
 * addUser.js - Adds the given user to the catalog as an operator
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
const cryptoMod = require("crypto");
const bcryptjs = require("bcryptjs");
const db = require(`${KLOUD_CONSTANTS.LIBDIR}/db.js`);
const totp = require(`${KLOUD_CONSTANTS.LIBDIR}/totp.js`);
const crypt = require(`${KLOUD_CONSTANTS.LIBDIR}/crypt.js`);

/**
 * Adds the given user to the catalog as an operator. User is auto approved if they are
 * the first admin, else the one of the old admins must approve them manually.
 * @param {array} params The incoming params - must be - email, name, password, org
 */
module.exports.exec = async function(params) {
    const email = params[0], name = params[1], password = params[2], org = params[3], totpsec = totp.getSecret();
    if (await _accountExists(email)) {KLOUD_CONSTANTS.LOGERROR("Account already exists"); return false;}  

    const pwph = await _bcryptjs_hash(email+password); const rootkey = cryptoMod.randomBytes(32).toString("hex");
    const user_pw_hashed_rootkey = crypt.encrypt(rootkey, email+password);
    const query = "insert into users(id, name, org, pwph, totpsec, user_pw_hashed_rootkey, role, approved) values (?,?,?,?,?,?,?,?)";
    return db.runCmd(query, [email, name, org, pwph, totpsec, user_pw_hashed_rootkey, "root", await _isFirstAdmin()?1:0]);
}

async function _isFirstAdmin() {
    const users = await db.getQuery("select * from users");
    if (!users || users.length == 0) return true; else return false;
}

async function _accountExists(email) {
    const users = await db.getQuery("select * from users where id = ?", email);
    return users.length?true:false;
}

function _bcryptjs_hash(text) {
    return new Promise((resolve, reject) => bcryptjs.hash(text, 12,(err, hash)=> {if (err) reject(err); else resolve(hash)}));
}