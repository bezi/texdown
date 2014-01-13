# Database
There are two databases which hold all the data: one for users and one for files.

## Models
### User

### File

## Views
### `/`
The Jade template is rendered with an object of the following form: 
~~~Javascript
{
    "user": {
        "id": <string>,
        "settings": {
            "editor": <string>         // either "", "vim", or "emacs"
        },
        "files": <list>,               // array of zero or more objects 
                                       //   (see below for format)
        "tags": <list>                 // array of strings
    }
}
// Syntax for one object in "files"
{
    "name": <string>,                  // title of the file
    "tags": <array>,                   // one or more user-defined tags
    "content": <string>,
    "owner": <string>,                 // the owner's id
    "created": <int>,                  // time of creation (UNIX timestamp)
    "modified": <int>                  // time of last mod. (UNIX timestamp)
}
~~~

### `/edit`
The Jade template is rendered with the following object: 
~~~Javascript
{
    "user": <object>,                  // ???
    "file": <object>                   // Relevant information about file
                                       //   (see below for format)
}
// Syntax for one object in "files"
{
    "name": <string>,                  // title of the file
    "tags": <array>,                   // one or more user-defined tags
    "content": <string>,               // The raw (texdown) of the file
    "owner": <string>,                 // the owner's id
    "created": <int>,                  // time of creation (UNIX timestamp)
    "modified": <int>                  // time of last mod. (UNIX timestamp)
}
~~~
