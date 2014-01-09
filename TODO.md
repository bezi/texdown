# TODO

## `/`

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

