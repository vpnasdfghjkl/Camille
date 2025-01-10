const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 加密函数
function encrypt(content, password) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.createHash('sha256').update(password).digest('base64').substr(0, 32); // 密钥
  const iv = crypto.randomBytes(16); // 初始化向量
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([cipher.update(content, 'utf8'), cipher.final()]);
  return {
    iv: iv.toString('hex'),
    data: encrypted.toString('hex'),
  };
}

// 加密文件函数
function encryptFile(inputFile, outputFile, password) {
  const content = fs.readFileSync(inputFile, 'utf8');
  const encrypted = encrypt(content, password);

  fs.writeFileSync(outputFile, JSON.stringify(encrypted, null, 2), 'utf8');
  console.log(`加密完成：${outputFile}`);
}

// 批量加密目录中的 `.md` 文件
function encryptDirectory(dir, password) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      encryptDirectory(filePath, password); // 递归处理子目录
    } else if (file.endsWith('.md')) {
      const encryptedFile = `${filePath}.enc`;
      encryptFile(filePath, encryptedFile, password);

      // 可选：删除原始文件
    //   fs.unlinkSync(filePath);
    }
  });
}

// 执行加密
const password = 'ldltjwmymxh'; // 自定义密码
const targetDir = '/home/camille/app/blog/Camille/posts/time-schedule'; // 目标目录
encryptDirectory(targetDir, password);
