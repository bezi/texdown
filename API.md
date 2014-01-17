# API

## `GET /`
This route renders two different HTML pages depending on user authentication, which is handled by [Passport.js](http://passportjs.org/). Passport.js handles the creation of all `user` objects which are sent via `GET`. Unauthenticated users are merely sent to a landing page describing features of TeXDown. The following descrbes the requests and responses for authenticated users.
### Request
~~~Javascript
{
    "user": <object>                   // user object managed by Passport (*)
}

/**
 * Notes
 * 
 * (*) - denotes required field
 * 
 * Requires the use of Passport for user authentication.
 */
~~~

### Response
The majority of this response is a webpage graphical user interface with links to every available file for the requested user. Following this links invokes the respective API's described below.

Embeded within the body is the user's id for further later use (i.e. with `POST`s). There are also file IDs and filenames attached in various places to make parsing the links easier.
~~~HTML
<body data-userid="<user.id>">         // <user.id>: id of logged in user, 
    ...                                //   must be saved for later use in 
</body>                                //   /save and /delete

// <file.id>: the id of the listed file
// <file.filename>: the filename of the listed file

// For center column of notes previews
<div id="preview">
    ...
    <div class="panel-heading">
        <button type="button" class="close" aria-hidden="true"
            data-fileid="<file.id>"
            data-filename="<file.filename>">...</button>
    </div>
    ...
</div>
...
// For sidebar nav list of notes
<div id="labels" class="list-group">
    ...
       <a class="list-group-item"
          href="/edit/<file.id>">
            "<file.filename>"
            <button type="button" class="close" aria-hidden="true"
                data-fileid="<file.id>"
                data-filename="<file.filename>"></button>
       </a>
    ...
</div>
~~~

## `GET /edit`
If the user is not authenticated by Passport before reaching this page, it is used solely for demonstration/trial purposes. You cannot directly save any work you create on this page. 

For authenticated users, this route is used as a graphical web interface for creating new files. For authenticated users looking to edit already-created files, see `/edit/:fileid`.

### Request
~~~Javascript
{
    "user": <object>                   // user object managed by Passport (*)
}

/**
 * Notes
 * 
 * (*) - denotes required field
 * 
 * Requires the use of Passport for user authentication.
 */
~~~

### Response
A blank editor and preview pane which will allow for easy interaction with the TeXDown backend.
~~~HTML
<body data-userid="<user.id>">         // <user.id>: id of logged in user, 
    ...                                //   must be saved for later use in 
</body>                                //   /save and /delete
~~~

## `POST /files`
Makes a new file.  If a file with that name exists, it will return a 409 error.
If no tags are specified, then tag 'All files' will be applied.  If there is no
content, the file will be made blank
The filename cannot be blank
###Request 
~~~Javascript
{
    'file': {
        'name': <string>,                       // file name
        'tags': [<string>, . . .],              // tags, optional
        'content': <string>                     // file content, optional
    }
}
~~~
###Response: 
~~~Javascript
Success: 200, {
    'id': <string> // id of newly created file
}

Not logged in: 401, 'Not logged in.'
Necessary parameters not included: 400, 'Malformed request.'
Blank name: 409, 'Blank name.'
Name taken: 409, 'Name <file.name> already used.'
Server error: 500, <server error>
~~~

## `PUT /files/:id`
Updates file with given id.  Id is not optional.
The parameters of `file` are optional, as it will update only those specified.
The filename, if specified, cannot be blank.
### Request 
~~~Javascript
{
    'file': {
        'name': <string>,                       // file name, optional
        'tags': [<string>, . . .],              // tags, optional
        'content': <string>                     // file content, optional
    }
}
~~~

### Response 

~~~Javascript
Success: 200
No parameters to file: 400, 'Malformed request.'
Not logged in: 401, 'Not logged in.'
File not found: 404, 'File not found.'
Blank name: 409, 'Blank name.'
Server error: 500, <server error>
~~~

## `GET: /files/:id`
Returns files that are owned by a user.  If an id is specified in the URL,
will return that particular file. `:id is optional`
###Request
Empty

###Response
~~~Javascript
Success: 200, {
    'files': [<file>, <file>, . . .], //could be one file if an id is specified
    'tags': {
        tag1: num,
        tag2: num,
        . . .
    }
}
Not logged in: 401, 'Not logged in.'
File not found: 404, 'File not found.'
User does not own file: 403, 'You do not own that file.'
Server error: 500, <server error>
~~~

## `DELETE /files/:id`
Deletes a file owned by a user.  Id is not an optional parameter.
###Request
Empty
###Response
~~~Javascript
Success: 200
Not logged in: 401, 'Not logged in.'
File not found: 404, 'File not found.'
User does not own file: 403, 'You do not own that file.'
Server error: 500, <server error>
~~~
