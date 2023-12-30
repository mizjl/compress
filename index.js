#!/usr/bin/env node
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const archiver = require('archiver');

const sourcePath = process.argv[2];

const compress = async (sourcePath) => {
  const destinationPath = sourcePath + '.zip';

  if (!fs.existsSync(sourcePath)) {
    console.error(`错误: ${sourcePath} 不存在`);
    return;
  }

  const output = fs.createWriteStream(destinationPath);
  const archive = archiver('zip', {
    zlib: { level: zlib.constants.Z_BEST_COMPRESSION }
  });

  output.on('close', () => {
    console.log(`压缩完成: ${destinationPath}`);
  });

  archive.on('error', err => {
    throw err;
  });

  archive.on('progress', progressData => {
    const percent = Math.round((progressData.fs.processedBytes / progressData.fs.totalBytes) * 100);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`已压缩 ${percent}%`);
  });

  if (fs.statSync(sourcePath).isFile()) {
    archive.file(sourcePath, { name: path.basename(sourcePath) });
  } else {
    archive.glob('**', {
      cwd: sourcePath,
      ignore: ['node_modules/**'],
      dot: true,
      onlyFiles: false
    });
  }

  archive.pipe(output);
  archive.finalize();
};

// 异步执行压缩函数
(async () => {
  await compress(sourcePath);
})();
