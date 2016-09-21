var bcrypt = require('bcrypt');


var hashPassword = module.exports.hashPassword = function(password, callback) {
    console.log('passw: '+password);

    bcrypt.genSalt(function(err, salt) {
        if (err) {
            return callback(err);
        }
        bcrypt.hash(password, salt, function(err, hash) {
            if (err) {
                return callback(err);
            }
            console.log('hashedPassword register: '+hash);
            callback(null, hash);
        });
    });
};

module.exports.checkPassword = function(textEnteredInLoginForm, hashedPasswordFromDatabase, callback) {
bcrypt.compare(textEnteredInLoginForm, hashedPasswordFromDatabase, function (err, doesMatch) {
    if (err) {
        return callback(err);
    }
    console.log(doesMatch);
    callback(null, doesMatch);
});
};
