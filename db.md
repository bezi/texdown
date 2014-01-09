# Database logic

## `user`

### Example
These are all the fields from the above link that work (i.e. I have ommited 
photos because it didn't work) and what they output for me.
#### Input
~~~
p= "user.provider: " + user.provider
p= "user.id: " + user.id
p= "user.displayName: " + user.displayName
p= "user.name: " + user.name
p= "user.name.familyName: " + user.name.familyName
p= "user.name.givenName: " + user.name.givenName
p= "user.name.middleName: " + user.name.middleName
for email in user.emails
    p= "email.value: " + email.value
    p= "email.type: " + email.value
~~~
#### Output
user.provider: google  
user.id: 104843575070748777243  
user.displayName: Jacob Zimmerman  
user.name: [object Object]  
user.name.familyName: Zimmerman  
user.name.givenName: Jacob  
user.name.middleName: undefined  
email.value: zimmerman.jake@gmail.com  
email.type: zimmerman.jake@gmail.com  

See [this link](http://passportjs.org/guide/profile/) for more complete information as to what these all mean.

### `user.files`
array of file ids this person owns
### `user.editor`
Either `''`, `'vim'`, or `'emacs'`

File
----
### FileName
File name
### Text
Contents of file
### Tags
array of tags
### Owner
owner id
### Permissions
'R', 'RW', or 'P' for read, read/write, or private
