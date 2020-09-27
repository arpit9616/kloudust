/**
 * utils.js - Utility functions 
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

/**
 * Parses incoming string, and returns an array of parsed arguments. The arguments
 * can be split by spaces, or have spaces included if quoted. Quotes can be escaped by
 * \\" and slashes can be escaped by \\ i.e. \\\\ = \ and \\" = " 
 * 
 * And yes I have no idea what the heck this is, but it works. 
 * 
 * From: https://stackoverflow.com/questions/4031900/split-a-string-by-whitespace-keeping-quoted-segments-allowing-escaped-quotes
 * 
 * Bug: Will eat and combine multiple spaces into one i.e. "Dream     Rock" will become "Dream Rock"
 * 
 * @param {string} cmd 
 * @return Parsed array of arguments
 */
exports.parseArgs = cmd => { 
    return cmd.match(/\\?.|^$/g).reduce((p, c) => {
        if(c === '"') p.quote ^= 1;
        else if(!p.quote && c === ' ')p.a.push('');
        else p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
        return  p;
    }, {a: ['']}).a;
}