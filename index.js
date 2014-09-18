var fs = require('fs');
var temp = require('temp').track();
var path = require('path');
var async = require('async');
var sys = require('sys');
var exec = require('child_process').exec;

exports.convert = function(document, format, callback) {
    return async.auto({
        soffice: function(callback) {
            if (process.platform !== 'darwin') {
                return callback('Operating system not yet supported: '+process.platform);
            }

            var paths = [
                '/Applications/LibreOffice.app/Contents/MacOS/soffice'
            ];

            return async.map(paths, function(path, callback) {
                return fs.exists(path, function(exists) {
                    if (exists === true) {
                        return callback(null, path);
                    }

                    return callback();
                });
            }, function(err, res) {
                for (var i in res) {
                    return callback(null, res[i]);
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
            var command = results.soffice+' --headless --convert-to '+format+' --outdir '+results.tempDir+' '+path.join(results.tempDir, 'source');
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
