const crypto = require('crypto');

/*
 * Return a salted and hashed password entry from a
 * clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry
 * where passwordEntry is an object with two string
 * properties:
 *      salt - The salt used for the password.
 *      hash - The sha1 hash of the password and salt
 */
function makePasswordEntry(clearTextPassword) {
  var salt = crypto.randomBytes(8).toString('hex');
  var sha1 = crypto.createHash('SHA1');
  sha1.update(clearTextPassword + salt);
  return passwordEntry = {
    salt: salt,
    hash: sha1.digest('hex')
  };
}

/*
 * Return true if the specified clear text password
 * and salt generates the specified hash.
 * @param {string} hash
 * @param {string} salt
 * @param {string} clearTextPassword
 * @return {boolean}
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {
  var sha1 = crypto.createHash('SHA1');
  sha1.update(clearTextPassword + salt);
  return hash === sha1.digest('hex');
}


module.exports = {
  makePasswordEntry,
  doesPasswordMatch
}