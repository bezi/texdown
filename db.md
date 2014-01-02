Database logic
==============

Schema
------

### User
#### Name
Human readable name, e.g. "Oscar"
#### Email
Email address for logging in
#### Password
Password for logging in, possibly handled by Django
#### Dropbox username
For dropbox integration
#### Dropbox authentication token
Possibly a password (don't like the thought of storing people's passwords)
#### GDrive username
For GDrive integration
#### GDrive authentication token
Same as Dropbox
#### Filesystem
Of schema type `Directory`, the root of the filesystem associated with the user.  Is its own parent directory

### Directory
#### Files
Of schema type `File`, one to many relationship
#### Subdirectories
Of schema type `Directory`, one to many relationship.
#### Parent
Of schema type `Directory`, the parent of the directory.  Equivalent to Linux `..`
#### Owner
Of schema type `User`, the owner of the directory
#### Shared
Of schema type `UserPermission`, one to many relationship with people allowed to see/edit this directory

### File
#### Name
File name within directory
#### Directory
Of schema type `Directory`, the directory in which the file resides
#### Text
Contents of file
#### Tags
One to many relationship with text tags associated with this file
#### Owner
Of schema type `User`, the owner of the file
#### Shared
Of schema type `UserPermission`, one to many relationship with people allowed to see/edit this file

### UserPermission
#### User
`User` this permission is associated with
#### Permission
Either "R" or "RW".
