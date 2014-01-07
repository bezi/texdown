// GET: /, home page
module.exports = function (db) {
    var tdusers = db.get('tdusers'); 
    return function (req, res) {
        var user = req.user;
        if (!user) {
            console.log("User is not logged in.");
            res.render("index", {});
            return;
        }

        tdusers.find({id: user.id}, {}, function (err, docs) { 
            if (err) {
                res.send("There was an error with the database.");
            }
            if (docs.length == 0) {
                console.log("User is not in database.");
                // add user
                tdusers.insert({
                    "name": user.displayName,
                    "id": user.id,
                    "files": [],
                    "editor": ""
                });
                console.log("User is in database.  Rendering. . . ");
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
                console.log("User is in database.  Rendering. . . ");
                var doc = docs[0];
                user.editor = doc.editor;
                user.files = doc.files;
                res.render("index", { "user": user });
                return;
            }
        }); 
    }
};
