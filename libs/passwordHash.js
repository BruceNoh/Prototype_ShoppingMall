var crypto = require('crypto');
var mysalt = "hyperledger";

module.exports = function(password){
    // sha512로 암호화한 후 mysalt를 덧붙인다. 후에 digest base64 기반의 캐릭터를 덧붙인다.
    return crypto.createHash('sha512').update( password + mysalt).digest('base64');
};







