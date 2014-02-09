var util = require('util');
// GET: /edit
module.exports = function (db) {
    var files = db.get('files');
    var tdusers = db.get('tdusers');
    return function (req, res) {
        var data = {};
        if (!req.params.id) { // no id
            if (req.user) {
                data.user = req.user; 
                res.render('edit', data);
            } else {
                res.render('edit');
            }
        } else { // has id
            if (!req.user) {
                res.redirect('/edit');
                return;
            }
            data.user = req.user;
            data.fileid = req.params.id;
            res.render('edit', data);
        }
    };
};
