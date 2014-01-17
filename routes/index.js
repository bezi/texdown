// GET: /, home page
// REQUEST: user (*)
// RESPONSE: renders 'index' with
/**
{ 'user' {
    // Passport user
} 
}
**/
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
                    res.render("index", { "user": data });
                    return;
                });
                return;
            }   
            

            var user = req.user;
            var doc = docs[0];
            user.files = [];
            res.render("index", {"user": user});
        }); 
    }
};
