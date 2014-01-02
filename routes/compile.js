var marked = require('marked');

// POST to /compile
module.exports = function(req, res) {
    res.send({
        text: compiled
    });
};
