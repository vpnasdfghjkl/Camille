import fs from 'fs';
import crypto from 'crypto';

// 配置密钥和加密算法
const password = 'laidaoletianjinwei'; // 替换为你的密码
const algorithm = 'aes-256-cbc';

// AES 解密函数
function decrypt(encryptedText, password) {
    const [ivHex, encryptedHex] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedBuffer = Buffer.from(encryptedHex, 'hex');
    const key = crypto.createHash('sha256').update(password).digest();
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return decrypted.toString('utf8');
}

// 处理并解密 Markdown 文件
function processDecryptMarkdown(inputFile, outputFile) {
    const content = fs.readFileSync(inputFile, 'utf8');
    const lines = content.split('\n');
    let result = [];
    let isDecrypting = false;
    let buffer = [];

    for (let line of lines) {
        if (line.includes('<!-- encrypt:start -->')) {
            isDecrypting = true;
            result.push(line); // 保留标记
        } else if (line.includes('<!-- encrypt:end -->')) {
            isDecrypting = false;
            const decryptedText = decrypt(buffer.join('\n'), password);
            result.push(decryptedText);
            result.push(line); // 保留标记
        } else if (isDecrypting) {
            buffer.push(line); // 收集需要解密的内容
        } else {
            result.push(line); // 普通内容直接添加
        }
    }

    fs.writeFileSync(outputFile, result.join('\n'), 'utf8');
    // console.log(`文件已处理，生成解密文件：${outputFile}`);
}

// 示例：解密 Markdown 文件
const inputFile = 'posts/time-schedule/page.md'; // 输入文件名
const outputFile = 'posts/time-schedule/page.md'; // 输出文件名
processDecryptMarkdown(inputFile, outputFile);
