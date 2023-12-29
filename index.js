const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const archiver = require('archiver');

const compress = (source, destination) => {
  const sourcePath = path.join(__dirname, source);
  const destinationPath = path.join(__dirname, destination);

  // 检查源文件/目录是否存在
  if (!fs.existsSync(sourcePath)) {
    console.error(`错误: ${source} 不存在`);
    return;
  }

  const output = fs.createWriteStream(destinationPath);
  const archive = archiver('zip', {
    zlib: { level: zlib.constants.Z_BEST_COMPRESSION }
  });

  output.on('close', () => {
    console.log(`压缩完成: ${destination}`);
  });

  archive.on('error', err => {
    throw err;
  });

  // 如果是文件，则压缩文件
  if (fs.statSync(sourcePath).isFile()) {
    archive.file(sourcePath, { name: path.basename(sourcePath) });
  } else { // 如果是目录，则压缩目录内容
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

module.exports = {
  compress
}
