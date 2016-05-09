var _chai = require('chai'),
    _fs = require('fs'),
    _path = require('path'),
    convert = require('../index').convert;

describe('convert', function () {
    function expectHello(done) {
        return function (err, result) {
            if (err) {
                done(err);
            } else {
                _chai.expect(result.toString().trim()).to.match(/[^\w]*hello[^\w]*/);
                done();
            }
        };
    }

    it('should convert a word document to text', function (done) {
        const docx = _fs.readFileSync(_path.join(__dirname, '/resources/hello.docx'));
        convert(docx, 'txt', undefined, expectHello(done));
    });
});