var marked = require('marked');

marked.setOptions({
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  langPrefix: 'language-',
  highlight: function(code, lang) {
    if (lang === 'js') {
      return highlighter.javascript(code);
    }
    return code;
  }
});

// POST to /compile
module.exports = function(req, res) {
    var string = req.body.text.replace(new RegExp('\\\(', "g"), '\\(')
    string = string.replace(new RegExp('\\\)', "g"), '\\)');
    string = string.replace(new RegExp('\\\[', "g"), '\\[');
    string = string.replace(new RegExp('\\\]', "g"), '\\]');
    marked(string, function(err, compiled) {
        if (err) return;
        res.send({
            text: compiled
        });
    });
};
