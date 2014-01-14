// GET: /, home page
module.exports = function (db) {
    var tdusers = db.get('tdusers'); 
    var files = db.get('files'); 
    return function (req, res) {
        if (!req.user) {
            res.render("index", {});
            return;
        }

        tdusers.find({id: req.user.id}, {}, function (err, docs) { 
            if (err || !(docs.length === 0 || docs.length === 1)) {
                var data = {}; data.error = {};
                data.error.code = 500; 
                data.error.message = "Something went wrong with the database.";
                res.render("500", data);
                return;
            }

            if (docs.length == 0) {
                // add user
                var data = {
                    "id": req.user.id,
                    "settings": { 
                        "editor": "" 
                    }
                };
                tdusers.insert(data, function (err) {
                    if (err) { 
                        var data = {}; data.error = {};
                        data.error.code = 500; 
                        data.error.message = "Something went wrong with the database.";
                        res.render("500", data);
                        return;
                    }
                    data.files = [];
                    res.render("index", { "user": data });
                    return;
                });
            }

            var user = req.user;
            var doc = docs[0];
            user.settings = doc.settings;
            files.find({"owner": user.id}, {}, function (err, docs) {
                if (err) { 
                    var data = {}; data.error = {};
                    data.error.code = 500; 
                    data.error.message = "Something went wrong with the database.";
                    res.render("500", data);
                    return;
                }

                user.files = docs;
                user.tags = [];
                for (var i = 0; i < user.files.length; ++i) {
                    delete(user.files[i].content);
                    for (var j = 0; j < user.files[i].tags.length; ++j) {
                        var tag = user.files[i].tags[j];
                        if (user.tags.indexOf(tag) === -1) {
                            user.tags.push(tag);
                        }
                    }
                }
                user.files.sort(function(b, a) {
                    return Number(a.modified) - Number(b.modified);
                });
                res.render("index", {"user": user});
            });
        }); 
    }
};
