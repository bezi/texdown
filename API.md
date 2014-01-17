# API

## `GET /`
This route renders two different HTML pages depending on user authentication, which is handled by [Passport.js](http://passportjs.org/). Passport.js handles the creation of all user session objects. Unauthenticated users are merely sent to a landing page describing features of TeXDown. The following descrbes the requests and responses for authenticated users.
### Request
~~~Javascript
Empty
~~~

### Response
This reponse is a bare frame UI, which also loads a JavaScript file which makes another request on the page load to get the rest of the information. (This makes the API RESTful as well as makes it easier to manage the file/tag data within `list.js`.)

Embeded within the body is the user's id for further later use. 
~~~HTML
<body data-userid="<user.id>">         // <user.id>: id of logged in user, 
    ...                                //   must be saved for later use in 
</body>                                //   /save and /delete
~~~

## `GET /edit`
If the user is not authenticated by Passport before reaching this page, it is used solely for demonstration/trial purposes. You cannot directly save any work you create on this page. 

For authenticated users, this route is used as a graphical web interface for creating new files. For authenticated users looking to edit already-created files, see `/edit/:fileid`.

### Request
~~~Javascript
Empty
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
If no tags are specified, then tag 'All Notes' will be applied.  If there is no
content, the file will be made blank. The filename cannot be blank.

> ### Note
> Any route beginning with `/files` requires a Passport session cookie to be
> successful.

###Request 
~~~Javascript
{
    'file': {
        'name': <string>,              // file name
        'tags': [<string>, ...],       // tags, optional
        'content': <string>            // file content, optional
    }
}
~~~
###Response: 
The following are all the status codes that the server might respond with and 
their assciated causes.
~~~
200 : "application/json" {             // Successful file creation
    'id': <string>                     // id of newly created file
}
400 : "text/plain"                     // Missing required parameters
    : 'Malformed request.'
401 : "text/plain"                     // User is not authenticated with
    : 'Not logged in.'                 //   Passport session cookie
409 : "text/plain"                     // The file name was blank
    : 'Blank name.'
409 : "text/plain"                     // The file name has already been stored
    : 'Not logged in.'                 //   for this user in the database
500 : "text/plain"                     // A technical error occured
    : '<server error>'                 // A (descriptive?) error message
~~~

## `PUT /files/:id`
This will update the file with the id provided in the URL. Providing this id is
not optional, but the parameters of of `file` below are. Only those provided 
will be updated in the database, while the rest will be left untouched. The 
file name still cannot be blank.
### Request 
~~~Javascript
{
    'file': {
        'name': <string>,              // file name, optional
        'tags': [<string>, . . .],     // tags, optional
        'content': <string>            // file content, optional
    }
}
~~~

### Response 
~~~
200 : ''                               // Successfully updated file
400 : "text/plain"                     // Missing required parameters
    : 'Malformed request.'
401 : "text/plain"                     // User is not authenticated with a
    : 'Not logged in.'                 //   Passport session cookie
404 : "text/plain"                     // The lookup of the file id for the
    : 'File not found.'                //   current user failed
409 : "text/plain"                     // The file name was blank
    : 'Blank name.'
500 : "text/plain"                     // A technical error occured
    : '<server error>'                 // A (descriptive?) error message
~~~

## `GET: /files/[:id]`
This method can be used to retrieve files owned by a specific user. An optional
file id can be specified in the URL, in which case only this file will load.
###Request
~~~
Empty
~~~

###Response
~~~Javascript
200 : "application/json" {
    'files': <list>,                   // One or more file objects (see below)
    'tags': {
        'tag_1': <int>,                  // An object of tag_name : taq_quanity
             ...                       //   pairs, which tell a tag's name and
        'tag_n': <int>                   //   how many files have that tag
    }
}
/**
 * <file>: {
 *     name: <string>,                 // The name of this file
 *     tags: <list>,                   // A list of strings representing tags
 *     owner: <id>,                    // The owner's id for this file
 *     created: <int>,                 // UNIX timestamp of creation date
 *     modified: <int>,                // UNIX timestamp of last modified date
 *     content: <string>               // The raw (TeXDown) content for note
 * }

401 : "text/plain"                     // User is not authenticated with a
    : 'Not logged in.'                 //   Passport session cookie
404 : "text/plain"                     // The lookup of the file id for the
    : 'File not found.'                //   current user failed
403 : "text/plain"                     // User attempted to access a file 
    : 'You do not own that file.'      //   without first owning it
500 : "text/plain"                     // A technical error occured
    : '<server error>'                 // A (descriptive?) error message
~~~

## `DELETE /files/:id`
This route can be used to delete a particular file. Note that this id _is_
required for this route.
###Request
~~~
Empty
~~~
###Response
~~~Javascript
200 : ''                               // The file deletion was successful
401 : "text/plain"                     // User is not authenticated with a
    : 'Not logged in.'                 //   Passport session cookie
404 : "text/plain"                     // The lookup of the file id for the
    : 'File not found.'                //   current user failed
403 : "text/plain"                     // User attempted to access a file 
    : 'You do not own that file.'      //   without first owning it
500 : "text/plain"                     // A technical error occured
    : '<server error>'                 // A (descriptive?) error message
~~~


## `POST /settings`
This method can be used to save settings for a logged in user so that they will be available upon the next request. It should represent the entire settings object for the current user--any settings not in this setting object will no longer be tracked after this request.
###Request
~~~JavaScript
{
   'settings': {                       // Contains all the settings the user wants to store
        'setting_1': <string>,         // Name of the first setting, and then
                 ...                   //   the value to be set.
        'setting_n': <string>          //   (see below for available settings)
    }
}
/**
 * Settings:
 * 
 * 'editor' : ('' | 'vim' | 'emacs')   // Sets the editor keybindings
 * 'autosave' : (true | false)         // Sets or unsets the autosave feature
 * 'autocomp' : (true | false)         // Sets or unsets the auto compile feature
 */
~~~
