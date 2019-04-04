var fs = require('fs');
var temp = require('temp').track();
var path = require('path');
var async = require('async');
var exec = require('child_process').exec;


exports.convert = function(document, format, filter, callback) {
    return async.auto({
        soffice: function(callback) {
            function paths() {
                switch (process.platform) {
                    case 'darwin': return ['/Applications/LibreOffice.app/Contents/MacOS/soffice'];
                    case 'linux': return ['/usr/bin/libreoffice', '/usr/bin/soffice'];
                    case 'win32': return [path.join(process.env['PROGRAMFILES(X86)'], 'LIBREO~1/program/soffice.exe'), 
                        path.join(process.env['PROGRAMFILES(X86)'], 'LibreOffice/program/soffice.exe'),
                        path.join(process.env['PROGRAMFILES'], 'LibreOffice/program/soffice.exe')];
                }
            }

            if (!paths(process.platform)) {
                return callback('Operating system not yet supported: '+ process.platform);
            }

            return async.map(paths(process.platform), function(path, callback) {
                return fs.exists(path, function(exists) {
                    if (exists === true) {
                        return callback(null, path);
                    }

                    return callback();
                });
            }, function(err, res) {
                for (var i in res) {
                    if (res[i]) {
                        return callback(null, process.platform === 'win32' ? '"' + res[i] + '"' : res[i]);
                    }
                }
                return callback('Could not find soffice binary');
            });
        },
        tempDir: function(callback) {
            return temp.mkdir('libreofficeConvert', function(err, dir) {
                if (err) {
                    return callback(err);
                }

                return callback(null, dir);
            });
        },
        saveSource: ['tempDir', function(callback, results) {
            return fs.writeFile(path.join(results.tempDir, 'source'), document, callback);
        }],
        convert: ['soffice', 'saveSource', function(callback, results) {
            var command = results.soffice + ' --headless --convert-to '+format;
            if (filter !== undefined) {
                command += ':"'+filter+'"';
            }
            command += ' --outdir '+results.tempDir+' '+path.join(results.tempDir, 'source');

            return exec(command, function (err, stdout, stderr) {
                if (err) {
                    return callback(err);
                }

                return callback();
            });
        }],
        loadDestination: ['convert', function(callback, results) {
            return fs.readFile(path.join(results.tempDir, 'source.'+format), function(err, destination) {
                if (err) {
                    return callback(err);
                }

                return callback(null, destination);
            });
        }]
    }, function(err, res) {
        temp.cleanup();

        if (err) {
            return callback(err);
        }

        return callback(null, res.loadDestination);
    });
};
