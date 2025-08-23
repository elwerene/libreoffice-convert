const { convertWithOptions, convert } = require('libreoffice-convert');

var _jest = require('jest'),
  _fs = require('fs'),
  _path = require('path'),
  { exec } = require('child_process');

describe('convert', () => {

  it('should convert a word document to text', async () => {
    const source = _path.join(__dirname, '/resources/hello.docx');
    const fileName = _path.join(__dirname, '/resources/hello.txt');
    const res = await convertWithOptions(source, 'txt', undefined, { fileName });
    expect(res).toMatch(fileName);
    expect(_fs.existsSync(res)).toBe(true);
    expect(_fs.readFileSync(res).toString().trim()).toBe('hello');
  });


  // it('if an another instance of soffice exists, should convert a word document to text', async () => {
  //   exec("soffice  --headless")
  //   // this command create an instance of soffice. This instance will get a failure "Error: source file could not be loaded"
  //   // but only after we ask a new convert. So this is enought to reproduce fail when an another instance is open
  //   await new Promise((resolve) => setTimeout(async () => {
  //     const docx = _path.join(__dirname, '/resources/hello.docx');
  //     await convert(docx, 'txt', undefined);
  //     resolve();
  //   }, 100));
  // });
});
