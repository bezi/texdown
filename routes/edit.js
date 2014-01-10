// GET: /edit
module.exports = function (db) {
    var files = db.get('files');
    return function (req, res) {
        var data = {};
        if (req.user) {
            data.user = req.user; 
        }
        
        if (req.params.id) {
            files.find({"_id": req.params.id}, {}, function (err, docs){
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
                    res.send('edit', {"statMesg": "Sorry, you don't own this file."});
                    return;
                }
                data.file = {};
                data.file.name = doc.name;
                data.file.id = doc._id;
                data.file.content = doc.content;
                res.render('edit', data);
                return;
            });
        }
        res.render('edit', data);
    };
};
