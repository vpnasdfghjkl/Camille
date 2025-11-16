/**
 * 测试打卡功能的脚本
 * 验证API和存储功能是否正常工作
 */

const BASE_URL = 'http://localhost:5173';

// 测试数据
const testCheckin = {
  date: '2025-01-01',
  wakeUpTime: '07:30',
  workStartTime: '09:00', 
  workPlan: '测试工作计划',
  focusTasks: [
    { id: 'deep-work', name: '深度工作', icon: '🎯', description: '测试任务1', isCompleted: true },
    { id: 'learning', name: '学习充电', icon: '📚', description: '测试任务2', isCompleted: false }
  ],
  focusTasksCompleted: 1,
  notes: '这是一个测试记录'
};

// 测试函数
async function testAPI() {
  console.log('🧪 开始测试打卡API...\n');

  try {
    // 1. 测试创建打卡记录
    console.log('📝 测试创建打卡记录...');
    const createResponse = await fetch(`${BASE_URL}/api/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCheckin)
    });
    
    if (!createResponse.ok) {
      throw new Error(`创建失败: ${createResponse.status}`);
    }
    
    const createResult = await createResponse.json();
    console.log('✅ 创建成功:', createResult.message);
    
    // 2. 测试获取单个记录
    console.log('\n📖 测试获取单个记录...');
    const getResponse = await fetch(`${BASE_URL}/api/checkin?date=${testCheckin.date}`);
    const getResult = await getResponse.json();
    
    if (getResult.success && getResult.data) {
      console.log('✅ 获取成功:', {
        date: getResult.data.date,
        workPlan: getResult.data.workPlan,
        completedTasks: getResult.data.focusTasksCompleted
      });
    } else {
      throw new Error('获取记录失败');
    }

    // 3. 测试获取所有记录
    console.log('\n📋 测试获取所有记录...');
    const allResponse = await fetch(`${BASE_URL}/api/checkin`);
    const allResult = await allResponse.json();
    
    if (allResult.success) {
      console.log(`✅ 获取成功: 共 ${allResult.data.length} 条记录`);
    } else {
      throw new Error('获取所有记录失败');
    }

    // 4. 测试更新记录
    console.log('\n🔄 测试更新记录...');
    const updatedData = { 
      ...testCheckin, 
      workPlan: '更新后的工作计划',
      focusTasksCompleted: 2
    };
    
    const updateResponse = await fetch(`${BASE_URL}/api/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    
    const updateResult = await updateResponse.json();
    if (updateResult.success) {
      console.log('✅ 更新成功:', updateResult.message);
    } else {
      throw new Error('更新记录失败');
    }

    // 5. 测试删除记录
    console.log('\n🗑️  测试删除记录...');
    const deleteResponse = await fetch(`${BASE_URL}/api/checkin?date=${testCheckin.date}`, {
      method: 'DELETE'
    });
    
    const deleteResult = await deleteResponse.json();
    if (deleteResult.success) {
      console.log('✅ 删除成功:', deleteResult.message);
    } else {
      throw new Error('删除记录失败');
    }

    console.log('\n🎉 所有测试通过！打卡功能正常工作');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.log('\n💡 请确保开发服务器正在运行: npm run dev');
  }
}

// 运行测试
testAPI();