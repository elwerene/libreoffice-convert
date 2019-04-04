# libreoffice-convert #

A simple and fast node.js module for converting office documents to different formats.

## Dependency ##

Please install libreoffice in /Applications (Mac), with your favorite package manager (Linux), or with the msi (Windows).


## Usage example ##
```javascript
// Read file
const docx = _fs.readFileSync(_path.join(__dirname, '/resources/hello.docx'));
// Convert it to pdf format with undefined filter (see Libreoffice doc about filter)
convert(docx, 'pdf', undefined, (done) => {
    // Here in done you have pdf file which you can save or transfer in another stream
    _fs.writeFileSync("hello.pdf", done);
});
```

