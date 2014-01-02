// GET: /files
module.exports = function (db) {
    return function (req, res) {
        var files = db.get('files');
        var data = {};
        files.find("", {}, function(err, docs) {
            if (err) { 
                console.log(err); 
                return; 
            }
            data.files = docs;
            res.render("files", data);
        });        
    };
};
