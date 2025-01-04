import fs from 'fs';
import crypto from 'crypto';

// 配置密钥和加密算法
const password = 'laidaoletianjinwei'; // 替换为你的密码
const algorithm = 'aes-256-cbc';

// AES 加密函数
function encrypt(text, password) {
    const iv = crypto.randomBytes(16); // 随机生成 16 字节 IV
    const key = crypto.createHash('sha256').update(password).digest();
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

// 处理 Markdown 文件
function processMarkdown(inputFile, outputFile) {
    const content = fs.readFileSync(inputFile, 'utf8');
    const lines = content.split('\n');
    let result = [];
    let isEncrypting = false;
    let buffer = [];

    for (let line of lines) {
        if (line.includes('<!-- encrypt:start -->')) {
            isEncrypting = true;
            buffer = [];
            result.push(line); // 保留标记
        } else if (line.includes('<!-- encrypt:end -->')) {
            isEncrypting = false;
            const encryptedText = encrypt(buffer.join('\n'), password);
            result.push(encryptedText);
            result.push(line); // 保留标记
        } else if (isEncrypting) {
            buffer.push(line); // 收集需要加密的内容
        } else {
            result.push(line); // 普通内容直接添加
        }
    }

    fs.writeFileSync(outputFile, result.join('\n'), 'utf8');
    // console.log(`文件已处理，生成加密文件：${outputFile}`);
}

// 示例：处理 Markdown 文件
const inputFile = 'posts/time-schedule/page.md'; // 输入文件名
const outputFile = 'posts/time-schedule/page.md'; // 输出文件名
processMarkdown(inputFile, outputFile);
