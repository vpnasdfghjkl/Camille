#!/usr/bin/env node
/**
 * 数据查看脚本
 * 用于查看本地和云端的数据状态
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function colorLog(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function inspectLocalData() {
  colorLog(colors.blue + colors.bold, '\n═══ 本地数据检查 ═══');
  
  const dataPath = path.join(__dirname, '..', 'data', 'checkins.json');
  
  try {
    await fs.access(dataPath);
    const data = await fs.readFile(dataPath, 'utf-8');
    const checkins = JSON.parse(data);
    
    colorLog(colors.green, `✓ 本地数据文件存在: ${dataPath}`);
    colorLog(colors.white, `📊 记录数量: ${checkins.length}`);
    
    if (checkins.length > 0) {
      // 按日期排序
      checkins.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      colorLog(colors.cyan, '\n最近的记录:');
      checkins.slice(0, 5).forEach((checkin, index) => {
        const completedTasks = checkin.focusTasksCompleted || 0;
        const totalTasks = checkin.focusTasks?.length || 0;
        colorLog(colors.white, `  ${index + 1}. ${checkin.date} - 完成任务: ${completedTasks}/${totalTasks} - ${checkin.workPlan || '无计划'}`);
      });
      
      // 统计信息
      colorLog(colors.yellow, '\n📈 统计信息:');
      const dateRange = {
        earliest: checkins.reduce((min, c) => c.date < min ? c.date : min, checkins[0].date),
        latest: checkins.reduce((max, c) => c.date > max ? c.date : max, checkins[0].date)
      };
      
      const totalCompleted = checkins.reduce((sum, c) => sum + (c.focusTasksCompleted || 0), 0);
      const avgCompleted = (totalCompleted / checkins.length).toFixed(1);
      
      colorLog(colors.white, `  • 日期范围: ${dateRange.earliest} 到 ${dateRange.latest}`);
      colorLog(colors.white, `  • 总完成任务数: ${totalCompleted}`);
      colorLog(colors.white, `  • 平均每天完成: ${avgCompleted} 个任务`);
    }
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      colorLog(colors.red, `✗ 本地数据文件不存在: ${dataPath}`);
      colorLog(colors.yellow, '💡 提示: 当你在本地创建第一个任务时，文件会自动生成');
    } else {
      colorLog(colors.red, `✗ 读取本地数据失败: ${error.message}`);
    }
  }
}

async function inspectCloudData() {
  colorLog(colors.blue + colors.bold, '\n═══ 云端数据检查 ═══');
  
  // 检查是否有Vercel部署URL
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  let deployUrl = null;
  
  try {
    const packageData = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageData);
    // 可以从package.json的homepage字段或其他地方获取部署URL
    deployUrl = packageJson.homepage || 'https://your-app.vercel.app';
  } catch (error) {
    deployUrl = 'https://your-app.vercel.app';
  }
  
  colorLog(colors.white, '🌐 云端数据特性:');
  colorLog(colors.yellow, '  • 云端使用内存存储 (MemoryAdapter)');
  colorLog(colors.yellow, '  • 每次部署都会重置数据');
  colorLog(colors.yellow, '  • 数据不会持久化到文件系统');
  colorLog(colors.yellow, '  • 多个用户之间数据隔离');
  
  colorLog(colors.cyan, '\n🔍 查看云端数据的方法:');
  colorLog(colors.white, `  1. 访问: ${deployUrl}`);
  colorLog(colors.white, '  2. 创建一些任务记录');
  colorLog(colors.white, '  3. 查看贡献图的可视化数据');
  colorLog(colors.white, '  4. 使用浏览器开发者工具查看网络请求');
  
  colorLog(colors.magenta, '\n🛠️  检查云端API的命令:');
  colorLog(colors.white, `  curl "${deployUrl}/api/checkins"`);
  colorLog(colors.white, `  curl "${deployUrl}/api/stats"`);
}

function explainDataArchitecture() {
  colorLog(colors.blue + colors.bold, '\n═══ 数据架构说明 ═══');
  
  colorLog(colors.green, '🏠 本地开发环境:');
  colorLog(colors.white, '  • 使用 FileSystemAdapter');
  colorLog(colors.white, '  • 数据存储在 ./data/checkins.json');
  colorLog(colors.white, '  • 数据持久化，重启服务数据不丢失');
  colorLog(colors.white, '  • 只有你能看到这些数据');
  
  colorLog(colors.cyan, '\n☁️  云端部署环境 (Vercel/Netlify):');
  colorLog(colors.white, '  • 使用 MemoryAdapter');
  colorLog(colors.white, '  • 数据存储在内存中');
  colorLog(colors.white, '  • 每次部署都会清空数据');
  colorLog(colors.white, '  • 无法写入文件系统 (serverless限制)');
  
  colorLog(colors.yellow, '\n🔒 数据隔离性:');
  colorLog(colors.white, '  • 本地数据 ≠ 云端数据');
  colorLog(colors.white, '  • 本地更改不会影响云端');
  colorLog(colors.white, '  • 云端更改不会影响本地');
  colorLog(colors.white, '  • 两个环境完全独立');
  
  colorLog(colors.red, '\n⚠️  重要提醒:');
  colorLog(colors.white, '  • 云端数据在每次部署时重置');
  colorLog(colors.white, '  • 如需持久化云端数据，需集成数据库');
  colorLog(colors.white, '  • 建议：重要数据在本地备份');
}

function showDataManagementCommands() {
  colorLog(colors.blue + colors.bold, '\n═══ 数据管理命令 ═══');
  
  colorLog(colors.green, '📁 本地数据管理:');
  colorLog(colors.white, '  # 查看数据文件');
  colorLog(colors.cyan, '  cat ./data/checkins.json | jq .');
  colorLog(colors.white, '  # 备份数据');
  colorLog(colors.cyan, '  cp ./data/checkins.json ./data/checkins-backup-$(date +%Y%m%d).json');
  colorLog(colors.white, '  # 清空本地数据');
  colorLog(colors.cyan, '  rm ./data/checkins.json');
  
  colorLog(colors.yellow, '\n🌐 云端数据查看:');
  colorLog(colors.white, '  # 查看API数据 (替换为你的实际URL)');
  colorLog(colors.cyan, '  curl "https://your-app.vercel.app/api/checkins" | jq .');
  colorLog(colors.cyan, '  curl "https://your-app.vercel.app/api/stats" | jq .');
  
  colorLog(colors.magenta, '\n🔄 同步选项 (如果需要):');
  colorLog(colors.white, '  • 方案1: 集成数据库 (推荐生产环境)');
  colorLog(colors.white, '  • 方案2: 手动导入/导出 JSON 文件');
  colorLog(colors.white, '  • 方案3: 使用 localStorage + API 混合方案');
}

async function main() {
  colorLog(colors.magenta + colors.bold, '🔍 Camille 数据检查工具');
  colorLog(colors.white, '═'.repeat(50));
  
  await inspectLocalData();
  await inspectCloudData();
  explainDataArchitecture();
  showDataManagementCommands();
  
  colorLog(colors.green + colors.bold, '\n✨ 检查完成!');
  colorLog(colors.white, '如有问题，请参考上面的说明或联系开发者。');
}

main().catch(console.error);