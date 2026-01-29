var _jest = require('jest'),
    _fs = require('fs'),
    _path = require('path'),
    { exec } = require('child_process'),
    convert = require('../index').convert,
    convertWithOptions = require('../index').convertWithOptions;

describe('convert', () => {
    function expectHello(done) {
        return function (err, result) {
            if (err) {
                done(err);
            } else {
                expect(result.toString().trim()).toMatch(/[^\w]*hello[^\w]*/);
                done();
            }
        };
    }

    it('should convert a word document to text',  (done) => {
        const docx = _fs.readFileSync(_path.join(__dirname, '/resources/hello.docx'));
        convert(docx, 'txt', undefined, expectHello(done));
    });


    it('should convert a word document to text with options', (done) => {
        const docx = _fs.readFileSync(_path.join(__dirname, '/resources/hello.docx'));
        convertWithOptions(docx, 'txt', undefined, { fileName: 'hello.docx' }, expectHello(done));
    });


    it('if an another instance of soffice exists, should convert a word document to text',  (done) => {
        exec("soffice  --headless")
        // this command create an instance of soffice. This instance will get a failure "Error: source file could not be loaded"
        // but only after we ask a new convert. So this is enought to reproduce fail when an another instance is open
        setTimeout(()=> {
            const docx = _fs.readFileSync(_path.join(__dirname, '/resources/hello.docx'));
            convert(docx, 'txt', undefined, expectHello(done));
        }, 100);
    });

    it('should fail when libreoffice encounters an error', (done) => {
        // call with invalid document: a buffer starting with PNG header but data is missing
        const badPng = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
        convert(badPng, 'txt', undefined, (err, result) => {
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toMatch(/Error calling soffice:/);
            done();
        });
    });
});
