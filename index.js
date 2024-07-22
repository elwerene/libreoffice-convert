'use strict';

const fs = require('fs');
const path = require('path');
const url = require('url');
const async = require('async');
const tmp = require('tmp');
const { execFile } = require('child_process');

const convertWithOptions = (document, format, filter, options, callback) => {
    const tmpOptions = (options || {}).tmpOptions || {};
    const asyncOptions = (options || {}).asyncOptions || {};
    const execOptions = (options || {}).execOptions || {};
    const fileName = (options || {}).fileName || 'source';
    const tempDir = tmp.dirSync({prefix: 'libreofficeConvert_', unsafeCleanup: true, ...tmpOptions});
    const installDir = tmp.dirSync({prefix: 'soffice', unsafeCleanup: true, ...tmpOptions});
    return async.auto({
        soffice: (callback) => {
            let paths = (options || {}).sofficeBinaryPaths || [];
            switch (process.platform) {
                case 'darwin': paths = [...paths, '/Applications/LibreOffice.app/Contents/MacOS/soffice'];
                    break;
                case 'linux': paths = [...paths, '/usr/bin/libreoffice', '/usr/bin/soffice', '/snap/bin/libreoffice', '/opt/libreoffice/program/soffice', '/opt/libreoffice7.6/program/soffice'];
                    break;
                case 'win32': paths = [
                    ...paths,
                    path.join(process.env['PROGRAMFILES(X86)'], 'LIBREO~1/program/soffice.exe'),
                    path.join(process.env['PROGRAMFILES(X86)'], 'LibreOffice/program/soffice.exe'),
                    path.join(process.env.PROGRAMFILES, 'LibreOffice/program/soffice.exe'),
                ];
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

                    return callback(null, res[0]);
                }
            );
        },
        saveSource: callback => fs.writeFile(path.join(tempDir.name, fileName), document, callback),
        convert: ['soffice', 'saveSource', (results, callback) => {
            let filterParam = filter?.length ? `:${filter}` : "";
            let fmt = !(filter ?? "").includes(" ") ? `${format}${filterParam}` : `"${format}${filterParam}"`;
            let args = [];
            args.push(`-env:UserInstallation=${url.pathToFileURL(installDir.name)}`);
            args.push('--headless');
            args.push('--convert-to');
            args.push(fmt);
            args.push('--outdir');
            args.push(tempDir.name);
            args.push(path.join(tempDir.name, fileName));
          
            return execFile(results.soffice, args, execOptions, callback);
        }],
        loadDestination: ['convert', (results, callback) =>
            async.retry({
                times: asyncOptions.times || 3,
                interval: asyncOptions.interval || 200
            }, (callback) => fs.readFile(path.join(tempDir.name, `${fileName}.${format.split(":")[0]}`), callback), callback)
        ]
    }).then( (res) => {
        return callback(null, res.loadDestination);
    }).catch( (err) => {
        return callback(err);
    }).finally( () => {
        tempDir.removeCallback();
        installDir.removeCallback();
    });
};

const convert = (document, format, filter, callback) => {
    return convertWithOptions(document, format, filter, {}, callback)
};

module.exports = {
    convert,
    convertWithOptions
};
