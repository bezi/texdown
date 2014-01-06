var marked = require('marked');

marked.setOptions({
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: true,
  langPrefix: 'language-',
});

// POST to /compile
module.exports = function(req, res) {
    var markdown = req.body.text;
    // This is how the math is processed by MathJax internally.
    // By doing it early, we can save it from being altered by marked.
    var texdown = markdown.replace(/\\\(/g, '<script type="math/tex">')
        .replace(/\\\)/g, '</script>')
        .replace(/\\\[/g, '<script type="math/tex; mode=display">')
        .replace(/\\\]/g, '</script>')
    marked(texdown, function(err, compiled) {
        if (err) return;
        res.send({
            text: compiled
        });
    });
};
