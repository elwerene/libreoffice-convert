# libreoffice-convert

A simple and fast node.js module for converting office documents to different formats.

## Dependency

Please install libreoffice in /Applications (Mac), with your favorite package manager (Linux), or with the msi (Windows).

## Usage example

```javascript
const libre = require('libreoffice-convert');

const path = require('path');
const fs = require('fs');

const ext = '.pdf'
const inputPath = path.join(__dirname, '/resources/example.docx');
const outputPath = path.join(__dirname, `/resources/example${ext}`);

// Read file
const docxBuf = fs.readFileSync(inputPath);

// Convert it to pdf format with undefined filter (see Libreoffice docs about filter)
libre.convert(docxBuf, ext, undefined, (err, pdfBuf) => {
    if (err) {
      console.log(`Error converting file: ${err}`);
    }
    
    // Here in done you have pdf file which you can save or transfer in another stream
    fs.writeFileSync(outputPath, pdfBuf);
});
```
