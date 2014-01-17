var db = null;
var moment = require('moment');

/**
 * init (database) : initializes the db variable of the module.
 */
function init (database) {
    db = database; 
    return;
}

/** 
 * POST /files
 * Makes a new file.  If a file with that name exists, it will return a 409 error.
 * If no tags are specified, then tag 'All Notes' will be applied.  If there is no
 * content, the file will be made blank
 * The filename cannot be blank
 * Request: {
        'file': {
            'name': <string>,                       // file name
            'tags': [<string>, . . .],              // tags, optional
            'content': <string>                     // file content, optional
        }
   }

    Response: 
        Success: 200, {
            'id': <string> // id of newly created file
        }
        
        Not logged in: 401, 'Not logged in.'
        Necessary parameters not included: 400, 'Malformed request.'
        Blank name: 409, 'Blank name.'
        Name taken: 409, 'Name <file.name> already used.'
        Server error: 500, <server error>
 */
function postFiles (req, res) {
    if (db === null) {
        res.send(500, 'App not initialized.');
        return;
    }

    // Validate request
    if (!(req.session.passport.user && req.session.passport.user.id)) {
        res.send(401, 'Not logged in.');
        return;
    }
    var user = req.session.passport.user.id;

    if (!(req.body.file && req.body.file.name)) {
        res.send(400, 'Malformed request.');
        return;
    }
    var file = {
        'name' : req.body.file.name,
        'tags' : (req.body.file.tags) ? req.body.file.tags : ['All Notes'],
        'owner' : user,
        'created' : Number(moment().format("X")),
        'modified' : this.created,
        'content' : (req.body.file.content) ? req.body.file.content : ''
    };
    

    if ("" === req.body.file.name) {
        res.send(409, 'Blank name.');
    }

    // Check that name is not taken
    db.files.get({
        'name': file.name,
        'owner': file.owner,
    }, {}, function (err, docs) {
        // Insert into database
        if (err) { res.send(500, 'Error querying file database'); return; }
        if (docs.length !== 0) { res.send(409, 'Name ' + file.name + ' already used.'); return; }
        db.files.insert(file, function (err, doc) {
            if (err) { res.send(500, 'Error inserting into file database'); return; }
            res.send(JSON.stringify({
                "id": doc._id
            }));
        });
    });
}

/**
 * PUT /files/:id
 * Updates file with given id.  Id is not optional.
 * The parameters of `file` are optional, as it will update only those specified.
 * The filename, if specified, cannot be blank.
 * Request: {
        'file': {
            'name': <string>,                       // file name, optional
            'tags': [<string>, . . .],              // tags, optional
            'content': <string>                     // file content, optional
        }
    }

    Response: 
        Success: 200
        No parameters to file: 400, 'Malformed request.'
        Inproper file id: 400, 'Malformed request.'
        Not logged in: 401, 'Not logged in.'
        User does not own file: 403, 'You do not own that file.'
        File not found: 404, 'File not found.'
        Blank name: 409, 'Blank name.'
        Server error: 500, <server error>
 */
function putFiles (req, res) {
    if (db === null) {
        res.send(500, 'App not initialized');
        return;
    }
    // Validate request
    if (!(req.session.passport.user && req.session.passport.user.id)) {
        res.send(401, 'Not logged in.');
        return;
    }
    var user = req.session.passport.user.id;

    if (!(req.body.file && (req.body.file.name || req.body.file.tags || req.body.file.content))) {
        res.send(400, 'Malformed request.');
        return;
    }

    var file = {};
    (req.body.file.name) ? file.name = req.body.file.name : true;
    (req.body.file.tags) ? file.tags = req.body.file.tags : true; 
    (req.body.file.content) ? file.content = req.body.file.content : true;
    file.modified = Number(moment().format("X"));

    file.id = req.params.id;
    if (file.id.length !== 24) {
        res.send(400, 'Malformed request.');
    }

    // Check that user owns file
    db.files.find({
        '_id': db.ObjectID(file.id)
    }, {}, function (err, docs) {
        if (err || docs.length > 1) { res.send(500, 'Error querying files database.'); return; }  
        if (docs.length == 0) { res.send(404, 'File not found.'); return; }
        var doc = docs[0];
        if (doc.owner !== user) { res.send(403, 'You do not own that file.'); return; }
        // Update values
        db.files.update({
            '_id': db.ObjectID(file.id)
        }, { $set: file }, function (err) {
            if (err) { res.send(500, 'Error updating file database.'); return; }
            res.send();
        });
    });
}

/**
 * GET: /files/:id
 * Returns files that are owned by a user.  If an id is specified in the URL,
 * will return that particular file
 * Request: Empty
 * Response:
        Success: 200, {
            'files': [<file>, <file>, . . .], //could be one file if an id is specified
            'tags': {
                tag1: num,
                tag2: num,
                . . .
            }
        }
        Not logged in: 401, 'Not logged in.'
        Inproper file id: 400, 'Malformed request.'
        File not found: 404, 'File not found.'
        Server error: 500, <server error>
 */
function getFiles (req, res) {
    if (db === null) {
        res.send(500, 'App not initialized');
        return;
    }

    if (!(req.session.passport.user && req.session.passport.user.id)) {
        res.send(401, 'Not logged in.');
        return;
    }
    var user = req.session.passport.user.id;

    var id = null;
    if (req.params.id) {
        id = req.params.id; 
        if (id.length !== 24) {
            res.send(400, 'Malformed request.');
            return;
        }
    } 
    
    // query files
    db.files.find((id) ? { "_id" : db.ObjectId(id), "owner": user.id} : {"owner": user.id}, {}, function (err, docs) {
        if (err) { res.send(500, 'Error in querying file database.'); return; }
        var data = {};
        data.files = [];
        data.tags = {};
        if (docs.length === 0) {
            if (id) {
                res.send(404, 'File not found.');
                return;
            } else {
                res.send(JSON.stringify(data)); 
                return;
            }
        }
        for (var i = 0; i < docs.length; ++i) {
            (id) ? (delete(docs[i].content)): true;
            delete(docs([i]).owner);
            data.files.push(docs[i]);
            for (var j = 0; j < docs[i].tags.length; ++j) {
                (data.tags[docs[i].tags[j]]) ? data.tags[docs[i].tags[j]]++ : data.tags[docs[i].tags[j]] = 1;
            }
        }
        data.files.sort(function(b, a) {
            return Number(a.modified) - Number(b.modified);
        });
        res.send(JSON.stringify(data));
        return;
    });
}

/**
 * DELETE: /files/:id
 * Deletes a file owned by a user.  Id is not an optional parameter.
 * Request: Empty
 * Response:
        Success: 200
        Not logged in: 401, 'Not logged in.'
        File not found: 404, 'File not found.'
        User does not own file: 403, 'You do not own that file.'
        Server error: 500, <server error>
 */
function deleteFiles (req, res) {
    if (db === null) {
        res.send(500, 'App not initialized');
        return;
    }
    // Validate request
    if (!(req.session.passport.user && req.session.passport.user.id)) {
        res.send(401, 'Not logged in.');
        return;
    }
    var user = req.session.passport.user.id;
    
    file.id = req.params.id;
    if (file.id.length !== 24) {
        res.send(400, 'Malformed request.');
    }

    // Check that user owns file
    db.files.find({
        '_id': db.ObjectID(file.id)
    }, {}, function (err, docs) {
        if (err || docs.length > 1) { res.send(500, 'Error querying files database.'); return; }  
        if (docs.length == 0) { res.send(404, 'File not found.'); return; }
        var doc = docs[0];
        if (doc.owner !== user) { res.send(403, 'You do not own that file.'); return; }
        // Update values
        db.files.remove({
            '_id': db.ObjectID(file.id)
        }, function (err) {
            if (err) { res.send(500, 'Error deleting file from database.'); return; }
            res.send();
        });
    });
}

module.exports = function (db) {
    init(db);
    return {
        "post": postFiles,
        "get": getFiles,
        "delete": deleteFiles,
        "put": putFiles
    };
};
