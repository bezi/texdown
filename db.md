Database logic
==============

User
----
All of the values at [their profile](http://passportjs.org/guide/profile/)
### files
array of file ids this person owns
### editor
Either '', 'vim', or 'emacs'

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
