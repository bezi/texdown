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

## `GET /edit/:fileid`
### Request
~~~Javascript
:fileid                                // the id of the file to be edited (*)
{
    "user": <object>                   // user object managed by Passport (*)
}

/**
 * Notes
 * 
 * (*) - denotes required field
 * 
 * Requires the use of Passport for user authentication.
 * Responds with 401 Unauthorized if the user is not logged in or not valid.
 */
~~~

### Response
Certain key return data is embeded in the HTML content of the webpage. For the most part, this data is embedded in `data-*` attributes in various places.
~~~HTML
<body data-userid="<user.id>">         // <user.id>: id of logged in user, 
    ...                                //   must be saved for later use in 
</body>                                //   /save and /delete

<input id="filename"                   // id for easy Javascript/JQuery access
       value="<file.filename>"         // <file.filename>: name of the 
       data-filename="<file.filename>" //   requested file
       data-fileid="<file.id>">        // <file.id>: id of the requested file
</input>

<div id="editor-pane">                 // id for easy Javascript/JQuery access
    <file.text>                        // <file.text>: the content of the 
</div>                                 //   requested file
~~~

## `POST /save`
### Request
~~~Javascript
{
    "user": {                          // object describing current user (*)
        "id": <int>                    // authenticated id of current user (1, 2)
    }
    "file": {                          // object describing file (*)
        "id": <int>,                   // id of file (1, 3) (*)
        "filename": <string>,          // name of file (4) (*)
        "text": <string>               // raw (TeXDown) content of the note
    }
}

/**
 * Notes
 * 
 * (*) - denotes required field
 * 
 * 1. Must be unique.
 * 2. If not present, responds with 401 Unauthorized.
 * 3. If empty string, creates the file.
 * 4. If id exists for user and this string does not match the current name,
 *    the database is updated to match this name.
 */
~~~
### Response
#### == 200
Indicates save was successful. No useful response body.
#### != 200
~~~Javascript
{
    "statMesg": <string>            // a short message describing the error
}

/**
 * Notes
 * 
 * If you tried to save something without being logged in, you will get a 
 * 401 Unauthorized error.
 */
~~~

## `POST /compile`
### Request
~~~Javascript
{
    "text": <string>                   // raw TeXDown to be converted into HTML
}
~~~
### Response
~~~Javascript
{
    "text": <string>                  // headless HTML, the result of 
                                      //   a) processing all occurrences of 
                                      //      `\(`, `\)`, `\[`, and `\]` with
                                      //      <script type="math/tex"> tags, 
                                      //   b) using marked to generate GFM
}
~~~

## `DELETE /delete`
### Request
~~~Javascript
{
    "user": {                          // object describing current user (*)
        "id": <int>                    // authenticated id of current user (1, 2)
    }
    "file": {                          // object describing file (*)
        "id": <int>                    // ID of file to delete (1, 2)
    }
}

/**
 * Notes
 * 
 * (*) - denotes required field
 * 
 * 1. Must be unique.
 * 2. If not present, responds with 401 Unauthorized.
 */
~~~
### Response
#### == 200
Indicates delete was successful. No useful response body.
#### != 200
~~~Javascript
{
    "statMesg": <string>            // a short message describing the error
}

/**
 * Notes
 * 
 * If you tried to delete something without being logged in, you will get a 
 * 401 Unauthorized error.
 */
~~~
