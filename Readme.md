# libreoffice-convert

A simple and fast node.js module for converting office documents to different formats.

## Dependency

Please install libreoffice in /Applications (Mac), with your favorite package manager (Linux), or with the msi (Windows)
(On Windows, add `PROGRAMFILES` environment variable for Windows program files path to your local project)

## Usage example

```javascript
'use strict';

const path = require('path');
const fs = require('fs').promises;

const libre = require('libreoffice-convert');
libre.convertAsync = require('util').promisify(libre.convert);

async function main() {
    const ext = '.pdf'
    const inputPath = path.join(__dirname, '/resources/example.docx');
    const outputPath = path.join(__dirname, `/resources/example${ext}`);

    // Read file
    const docxBuf = await fs.readFile(inputPath);

    // Convert it to pdf format with undefined filter (see Libreoffice docs about filter)
    let pdfBuf = await libre.convertAsync(docxBuf, ext, undefined);
    
    // Here in done you have pdf file which you can save or transfer in another stream
    await fs.writeFile(outputPath, pdfBuf);
}

main().catch(function (err) {
    console.log(`Error converting file: ${err}`);
});
```
