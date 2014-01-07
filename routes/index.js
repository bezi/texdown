// GET: /, home page
module.exports = function (req, res) {
    res.render("index", { user: req.user });
};
