# TODO

## `/`
- I don't think we should need a fileid/filename before `GET /edit`
- **I think we still need more things here, but I want to pull your lastest commits.**

## `/edit`
- [ ] `data-fileid="<file.fileid>"` attached to `input#filename`
    - should be read into `app.file.fileid` on page load
    - should be sent as `data.fileid` to `POST /save` and `POST /rename`
- [ ] `data-filename="<file.filename>"` attached to `input#filename`
    - should also be placed in `value` attribute of the input
    - should be read into `app.file.filename` on page load
    - should be sent as `data.filename` to `POST /save` and `POST /rename`
- [ ] `<file.text>` set inner HTML of `#editor-pane`
    - should not be read into `public/js/app.js` until trigger of `app.save`
    - should be sent as `data.text` to `POST /save`
