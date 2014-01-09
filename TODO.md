# TODO

## `/`
- 

## `/edit`
- [ ] `data-userid="<user.id>"` attached to `body`
    - should be read into `app.userid` on page load
    - should be sent as `data.user.id` to `POST /save` and `DELETE /:id`
- [ ] `data-fileid="<file.id>"` attached to `input#filename`
    - should be read into `app.file.fileid` on page load
    - should be sent as `data.file.id` to `POST /save`
    - should be sent in URL to `DELETE /:id`
- [ ] `data-filename="<file.filename>"` attached to `input#filename`
    - should also be placed in `value` attribute of `input#filename`
    - should be read into `app.file.filename` on page load
    - should be sent as `data.file.filename` to `POST /save`
- [ ] `<file.text>` set to inner HTML of `#editor-pane`
    - should not be read into `public/js/app.js` until trigger of `app.save`
    - should be sent as `data.file.text` to `POST /save`

# API

## `GET /`

## `GET /auth/google`

## `GET /edit`

## `POST /save`
### Request
~~~Javascript
{
    "user": {                          // object describing current user (*)
        "id": <int>                    // authenticated id of current user (1, 2)
    }
    "file": {                          // object describing file (*)
        "id": <int>,                   // id of file (1, 3)
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
 * 3. If not present, creates the file.
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

## `DELETE /:fileid`
### Request
~~~Javascript
:fileid                                // the id of the file to be delete (*)
{
    "user": {                          // object describing current user (*)
        "id": <int>                    // authenticated id of current user (1, 2)
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
