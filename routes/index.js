// GET: /, home page
module.exports = function (db) {
    var tdusers = db.get('tdusers'); 
    return function (req, res) {
        var user = req.user;
        if (!user) {
            res.render("index", {});
            return;
        }

        tdusers.find({id: user.id}, {}, function (err, docs) { 
            if (err) {
                res.send("There was an error with the database.");
                return;
            }
            if (docs.length == 0) {
                // add user
                tdusers.insert({
                    "name": user.displayName,
                    "id": user.id,
                    "files": [],
                    "editor": ""
                });
                tdusers.find({id: user.id}, {}, function (err, docs) { 
                    if (err) {
                        res.send("There was an error with the database.");
                    }
                    var doc = docs[0];
                    user.editor = doc.editor;
                    user.files = doc.files;
                    res.render("index", { "user": user });
                    return;
                });
                return;
            }

            if (docs.length == 1) {
                var doc = docs[0];
                user.editor = doc.editor;
                user.files = doc.files;
                res.render("index", { "user": user });
                return;
            }
            res.send("There was an error with the database.");
            return;
        }); 
    }
};
