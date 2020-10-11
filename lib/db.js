/** 
 * db.js - DB layer. Auto creates the DB with the DDL if needed.
 * 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
const fs = require("fs");
const util = require("util");
const sqlite3 = require("sqlite3");
const mkdirAsync = util.promisify(fs.mkdir);
const accessAsync = util.promisify(fs.access);
const DB_DIR = `${KLOUD_CONSTANTS.ROOTDIR}/db`;
const DB_PATH = require("path").resolve(`${KLOUD_CONSTANTS.ROOTDIR}/db/kloudust.db`);
const DB_CREATION_SQLS = [
    "BEGIN TRANSACTION",
    "CREATE TABLE users(id varchar not null primary key, name varchar, pwph varchar, org varchar, totpsec varchar, user_pw_hashed_rootkey varchar, role varchar, approved integer)",
    "CREATE TABLE hosts(hostname varchar not null primary key, type varchar, rootid varchar, rootpw varchar, hostkey varchar)",
    "COMMIT TRANSACTION"
]

let dbInstance, dbRunAsync, dbAllAsync;

/**
 * Runs the given SQL command e.g. insert, delete etc.
 * @param {string} cmd The command to run
 * @param {array} params The params for SQL
 * @return true on success, and false on error
 */
exports.runCmd = async (cmd, params=[]) => {
    await _initDB(); params = Array.isArray(params)?params:[params];
    try {await dbRunAsync(cmd, params); return true}
    catch (err) {KLOUD_CONSTANTS.LOGERROR(`DB error running, ${cmd}, with params ${params}, error: ${err}`); return false;}
}

/**
 * Runs the given query e.g. select and returns the rows from the result.
 * @param {string} cmd The command to run
 * @param {array} params The params for SQL
 * @return rows array on success, and false on error 
 */
exports.getQuery = async(cmd, params=[]) => {
    await _initDB(); params = Array.isArray(params)?params:[params];
    try {return await dbAllAsync(cmd, params);}
    catch (err) {KLOUD_CONSTANTS.LOGERROR(`DB error running, ${cmd}, with params ${params}, error: ${err}`); return false;}
}

async function _initDB() {
    if (!await _createDB()) return false;
    if (!await _openDB()) return false; else return true;
}

async function _createDB() {
    try {
        await accessAsync(DB_PATH, fs.constants.F_OK | fs.constants.W_OK); 
        return true;
    } catch (err) {  // db doesn't exist
        KLOUD_CONSTANTS.LOGWARN("DB doesn't exist, creating and initializing");
        try{await mkdirAsync(DB_DIR)} catch(err){if (err.code != "EEXIST") {KLOUD_CONSTANTS.LOGERROR(`Error creating DB dir, ${err}`); return false;}}   
        if (!await _openDB()) return false; // creates the DB file
        
        for (const dbCreationSQL of DB_CREATION_SQLS) if (!await exports.runCmd(dbCreationSQL)) return false;
        KLOUD_CONSTANTS.LOGINFO("DB created successfully."); return true;
    }
}

function _openDB() {
    return new Promise(resolve => {
		if (!dbInstance) dbInstance = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE|sqlite3.OPEN_CREATE, err => {
            if (err) {KLOUD_CONSTANTS.LOGERROR(`Error opening DB, ${err}`); resolve(false);} 
            else {
                dbRunAsync = util.promisify(dbInstance.run.bind(dbInstance)); 
                dbAllAsync = util.promisify(dbInstance.all.bind(dbInstance)); 
                resolve(true);
            }
		}); else resolve(true);
	});
}