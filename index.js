'use strict';

const fs = require('fs');
const temp = require('temp').track();
const path = require('path');
const async = require('async');
const { exec } = require('child_process');

exports.convert = (document, format, filter, customBinaryPaths, callback) => {
    return async.auto({
        soffice: (callback) => {
            let paths = [];
            const darwinPaths = ['/Applications/LibreOffice.app/Contents/MacOS/soffice'];
            const linuxPaths = ['/usr/bin/libreoffice', '/usr/bin/soffice'];
            const win32Paths = [
                path.join(process.env['PROGRAMFILES(X86)'], 'LIBREO~1/program/soffice.exe'),
                path.join(process.env['PROGRAMFILES(X86)'], 'LibreOffice/program/soffice.exe'),
                path.join(process.env.PROGRAMFILES, 'LibreOffice/program/soffice.exe'),
            ];
            const customBinaryCondition = customBinaryPaths && customBinaryPaths.isArray;
            switch (process.platform) {
                case 'darwin': customBinaryCondition ? paths = customBinaryPaths : paths = darwinPaths;
                    break;
                case 'linux': customBinaryCondition ? paths = customBinaryPaths : paths = linuxPaths;
                    break;
                case 'win32': customBinaryCondition ? paths = customBinaryPaths : paths = win32Paths;
                    break;
                default:
                    return callback(new Error(`Operating system not yet supported: ${process.platform}`));
            }

            return async.filter(
                paths,
                (filePath, callback) => fs.access(filePath, err => callback(null, !err)),
                (err, res) => {
                    if (res.length === 0) {
                        return callback(new Error('Could not find soffice binary'));
                    }

                    return callback(null, process.platform === 'win32' ? `"${res[0]}"` : res[0]);
                }
            );
        },
        tempDir: callback => temp.mkdir('libreofficeConvert', callback),
        saveSource: ['tempDir', (results, callback) => fs.writeFile(path.join(results.tempDir, 'source'), document, callback)],
        convert: ['soffice', 'saveSource', (results, callback) => {
            let command = `${results.soffice} --headless --convert-to ${format}`;
            if (filter !== undefined) {
                command += `:"${filter}"`;
            }
            command += ` --outdir ${results.tempDir} ${path.join(results.tempDir, 'source')}`;

            return exec(command, callback);
        }],
        loadDestination: ['convert', (results, callback) =>
            async.retry({
                times: 3,
                interval: 200
            }, (callback) => fs.readFile(path.join(results.tempDir, `source.${format}`), callback), callback)
        ]
    }, (err, res) => {
        temp.cleanup();

        if (err) {
            return callback(err);
        }

        return callback(null, res.loadDestination);
    });
};
