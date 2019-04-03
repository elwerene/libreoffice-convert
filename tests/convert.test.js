var _jest = require('jest'),
    _fs = require('fs'),
    _path = require('path'),
    convert = require('../index').convert;

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
});
