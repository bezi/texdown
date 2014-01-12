// GET: /edit
module.exports = function (db) {
    var files = db.get('files');
    return function (req, res) {
        var data = {};
        if (!req.params.id) {
            // no id
            if (req.user) {
                data.user = req.user; 
            }
            res.render('edit', data);
            return;
        }
        
        // has id
        if (!req.user) {
            res.redirect('/edit');
            return;
        }
        data.user = req.user;

        files.find({"_id": req.params.id}, {}, function (err, docs) {
            if (err || !(docs.length === 1 || docs.length === 0)) {
                res.render('edit', {"statMesg": "There was an error with the database."});
                return;
            }

            if (docs.length === 0) {
                res.render('edit', {"statMesg": "File does not exist."});
                return;
            }

            var doc = docs[0];
            if (!(req.user.id === doc.owner)) {
                res.send('edit', {"statMesg": "You don't own this file."});
                return;
            }

            data.file = doc;
            res.render('edit', data);
            return;
        });
    };
};
