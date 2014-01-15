// GET: /about
module.exports = function (req, res) {
    var data = {};
    data.file = {}
    data.file.name = "About";
    data.file.content = "#About![TeXDown](/images/texdown-logo-darkgray-200.png)\n--- \nHey there!.  This site was made by [Oscar Bezi](http://oscarbezi.com) and [Jake Zimmerman](http://jacobzimmerman.me), and aims to provide efficient note-taking and document editing using Markdown and embedded \n[\\( \\mathrm\\LaTeX \\)](http://en.wikipedia.org/wiki/LaTeX).\n\n## Built with...\n---\nThe front end was designed with [Bootstrap](http://getbootstrap.com/), and \nuses a [CodeMirror](http://codemirror.net/) editor pane\nand [marked.js](https://github.com/chjj/marked) to compile the Markdown.  The \nmathematics are rendered with [MathJax](http://www.mathjax.org/).\n\nThe back end is built with [Node.js](http://nodejs.org/) and \n[Express](http://expressjs.com/), using [MongoDB](http://www.mongodb.org/)\nthrough [MongoLab](https://mongolab.com/).  We're hosting on \n[Heroku](http://heroku.com/).\n\n## Development\n---\nWe're currently in an open beta, so <s>some things</s> a lot of things need \nfixing, and more super awesome features are already in the works. If you see something you think needs fixing, please email us at \n<admin@texdown.org>.  We're also on Github and love pull requests, especially \nif you don't like the shade of green we use.\n\n## Yay Google!\n---\nYou may notice that you have to log in with Google.  We've decided that it's \neasier than making a new account for you to remember the credentials for, and \nit may later lead to fun things with Google Drive integration!  We do not \nstore any personal information on our servers other than your notes, which \nare connected to a Google ID number. #googlewhore\n\nWe hope you enjoy the service!";
    res.render('about', data);
    return;
};
