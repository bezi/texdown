// GET: /edit
module.exports = function (db) {
    var files = db.get('files');
    return function (req, res) {
        var data = {};
        if (req.body.user) {
           data.user = req.body.user; 
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

                data.filename = doc.name;
                data.fileid = doc._id;
                data.filecontent = doc.content;
                res.render('edit', data);
                return;
            });
        }
        res.render('edit', data});
    };
};
