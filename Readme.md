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

## Options

`convertWithOptions(document, format, filter, options, callback)` accepts these options:

- `tmpOptions` – options passed to [tmp](https://www.npmjs.com/package/tmp) when creating temp directories
- `asyncOptions` – `{ times, interval }` retry options for reading the converted file
- `execOptions` – options passed to `child_process.execFile`
- `fileName` – name (with extension) used for the source file, helps LibreOffice detect the input format
- `sofficeBinaryPaths` – extra paths to look for the `soffice` binary
- `sofficeAdditionalArgs` – extra command-line arguments passed to `soffice`
- `profileTemplate` – path to an existing LibreOffice user profile directory. It is copied into the fresh per-conversion profile, so `soffice` skips creating a new profile on every run, which speeds up conversions. The template itself is never modified.

A profile template can be generated once with:

```sh
soffice -env:UserInstallation=file:///path/to/profile-template --headless --terminate_after_init
```
