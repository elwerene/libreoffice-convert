'use strict';

const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');

const TMP_DIR = path.join(os.tmpdir(), 'libreoffice_convert');

const execFileAsync = promisify(execFile);

const convertWithOptions = async (source, format, filter, options = {}) => {
  const execOptions = options.execOptions || {};
  let fileName = options.fileName || 'source';
  if (!path.isAbsolute(fileName)) {
    fileName = path.join(TMP_DIR, `${fileName}.${format.split(":")[0]}`);
  }
  const outdir = path.dirname(fileName);
  let paths = (options || {}).sofficeBinaryPaths || [];
  switch (process.platform) {
    case 'darwin': paths = [...paths, '/Applications/LibreOffice.app/Contents/MacOS/soffice'];
      break;
    case 'linux': paths = [...paths, '/usr/bin/libreoffice', '/usr/bin/soffice', '/snap/bin/libreoffice', '/opt/libreoffice/program/soffice', '/opt/libreoffice7.6/program/soffice'];
      break;
    case 'win32': paths = [
      ...paths,
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'LIBREO~1/program/soffice.exe'),
      path.join(process.env['PROGRAMFILES(X86)'] || '', 'LibreOffice/program/soffice.exe'),
      path.join(process.env.PROGRAMFILES_X86 || '', 'LibreOffice/program/soffice.exe'),
      path.join(process.env.PROGRAMFILES || '', 'LibreOffice/program/soffice.exe'),
      process.env.LIBRE_OFFICE_EXE || '',
      'C:/Program Files/LibreOffice/program/soffice.exe'
    ];
      break;
    default:
      throw new Error(`Operating system not yet supported: ${process.platform}`);
  }

  paths = (await Promise.all(paths.map((filePath) => fs.access(filePath).then(() => [filePath, true]).catch(() => [filePath, false])))).filter(([filePath, exists]) => exists);
  if (paths.length === 0) {
    throw new Error('Could not find soffice binary');
  }
  const soffice = paths[0][0];

  const filterParam = filter?.length ? `:${filter}` : "";
  const fmt = !(filter ?? "").includes(" ") ? `${format}${filterParam}` : `"${format}${filterParam}"`;
  const args = [];
  args.push('--headless');
  args.push('--convert-to');
  args.push(fmt);
  args.push('--outdir');
  args.push(outdir);
  args.push(source);

  await execFileAsync(soffice, args, execOptions);
  return fileName;
};

const convert = (document, format, filter) => {
  return convertWithOptions(document, format, filter, {})
};

module.exports = {
  convert,
  convertWithOptions
};
