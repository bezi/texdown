var marked = require('marked');

// POST to /compile
module.exports = function(req, res) {
    if (req.body.text) {
        marked(req.body.text, function(err, compiled) {
            if (err) return;
            res.send({
                text: compiled
            });
        });
    }
};
