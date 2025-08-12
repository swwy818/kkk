// 全局变量
let characters = [];
let currentCharacter = null;
let myProfile = {
    name: '我',
    avatar: null,
    description: ''
};
let apiSettings = {
    url: '',
    key: '',
    model: '',
    temperature: 0.7
};

// 页面切换功能
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// 时间更新功能
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
    const dateString = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    document.getElementById('current-time').textContent = timeString;
    document.getElementById('time-display').textContent = timeString;
    document.getElementById('date-display').textContent = dateString;
}

// 电池电量更新
function updateBatteryLevel() {
    const batteryLevel = document.getElementById('battery-level');
    const batteryPercentage = document.getElementById('battery-percentage');
    
    // 模拟电池电量变化
    let currentLevel = parseInt(localStorage.getItem('batteryLevel') || '85');
    
    // 随机变化 ±1%
    const change = Math.random() > 0.5 ? 1 : -1;
    currentLevel = Math.max(20, Math.min(100, currentLevel + change));
    
    localStorage.setItem('batteryLevel', currentLevel.toString());
    
    batteryLevel.style.width = currentLevel + '%';
    batteryPercentage.textContent = currentLevel + '%';
    
    // 低电量时改变颜色
    if (currentLevel <= 20) {
        batteryLevel.style.backgroundColor = '#ff4444';
    } else {
        batteryLevel.style.backgroundColor = 'white';
    }
}

// 自定义弹窗功能
function showCustomAlert(message, title = '提示') {
    const overlay = document.getElementById('custom-modal-overlay');
    const modal = document.querySelector('.modal');
    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // 只显示确定按钮
    cancelBtn.style.display = 'none';
    confirmBtn.textContent = '确定';
    
    overlay.style.display = 'flex';
    
    return new Promise((resolve) => {
        confirmBtn.onclick = () => {
            overlay.style.display = 'none';
            resolve(true);
        };
    });
}

function showCustomConfirm(message, title = '确认') {
    const overlay = document.getElementById('custom-modal-overlay');
    const modal = document.querySelector('.modal');
    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // 显示取消和确定按钮
    cancelBtn.style.display = 'inline-block';
    confirmBtn.textContent = '确定';
    
    overlay.style.display = 'flex';
    
    return new Promise((resolve) => {
        confirmBtn.onclick = () => {
            overlay.style.display = 'none';
            resolve(true);
        };
        
        cancelBtn.onclick = () => {
            overlay.style.display = 'none';
            resolve(false);
        };
    });
}

// 首页图标点击事件
document.getElementById('wechat-icon').addEventListener('click', () => {
    showPage('chat-list-page');
    loadCharacters();
});

document.getElementById('api-icon').addEventListener('click', () => {
    showPage('api-page');
    loadApiSettings();
});

document.getElementById('worldbook-icon').addEventListener('click', () => {
    showPage('worldbook-page');
});

document.getElementById('settings-icon').addEventListener('click', () => {
    showCustomAlert('设置功能开发中...');
});

// 返回首页按钮
document.getElementById('back-to-home-from-chat-list').addEventListener('click', () => {
    showPage('home-page');
});

document.getElementById('back-to-home-from-api').addEventListener('click', () => {
    showPage('home-page');
});

document.getElementById('back-to-home-from-worldbook').addEventListener('click', () => {
    showPage('home-page');
});

// 角色管理功能
document.getElementById('add-character-btn').addEventListener('click', () => {
    showPage('add-character-page');
    clearCharacterForm();
});

document.getElementById('back-to-chat-list').addEventListener('click', () => {
    showPage('chat-list-page');
});

// 头像上传功能
document.querySelector('.avatar-placeholder').addEventListener('click', () => {
    document.getElementById('avatar-input').click();
});

document.getElementById('avatar-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const avatarPlaceholder = document.querySelector('.avatar-placeholder');
            avatarPlaceholder.innerHTML = `<img src="${e.target.result}" alt="头像" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        };
        reader.readAsDataURL(file);
    }
});

// 保存角色
document.getElementById('save-character').addEventListener('click', () => {
    const name = document.getElementById('character-name').value.trim();
    const description = document.getElementById('character-description').value.trim();
    
    if (!name) {
        showCustomAlert('请输入角色名称');
        return;
    }
    
    if (!description) {
        showCustomAlert('请输入角色描述');
        return;
    }
    
    // 获取头像
    const avatarImg = document.querySelector('.avatar-placeholder img');
    const avatar = avatarImg ? avatarImg.src : null;
    
    const newCharacter = {
        id: Date.now(),
        name: name,
        description: description,
        avatar: avatar,
        chatHistory: []
    };
    
    characters.push(newCharacter);
    saveCharacters();
    
    showCustomAlert('角色创建成功！');
    showPage('chat-list-page');
    loadCharacters();
});

// 加载角色列表
function loadCharacters() {
    const savedCharacters = localStorage.getItem('characters');
    if (savedCharacters) {
        characters = JSON.parse(savedCharacters);
    }
    
    const chatList = document.getElementById('chat-list');
    
    if (characters.length === 0) {
        chatList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-plus" style="font-size: 48px; color: #ddd; margin-bottom: 16px;"></i>
                <p style="color: #999; text-align: center;">还没有添加任何角色<br>点击右上角"+"开始创建吧！</p>
            </div>
        `;
        return;
    }
    
    chatList.innerHTML = characters.map(character => {
        const lastMessage = character.chatHistory.length > 0 
            ? character.chatHistory[character.chatHistory.length - 1]
            : null;
        
        return `
            <div class="chat-item" onclick="openChat(${character.id})">
                <div class="chat-avatar">
                    ${character.avatar 
                        ? `<img src="${character.avatar}" alt="${character.name}">` 
                        : `<i class="fas fa-user"></i>`
                    }
                </div>
                <div class="chat-info">
                    <div class="chat-name">${character.name}</div>
                    <div class="chat-preview">${lastMessage ? lastMessage.content.substring(0, 30) + '...' : '开始聊天吧'}</div>
                </div>
                <div class="chat-time">${lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'}) : ''}</div>
            </div>
        `;
    }).join('');
}

// 保存角色到本地存储
function saveCharacters() {
    localStorage.setItem('characters', JSON.stringify(characters));
}

// 清空角色表单
function clearCharacterForm() {
    document.getElementById('character-name').value = '';
    document.getElementById('character-description').value = '';
    document.querySelector('.avatar-placeholder').innerHTML = `
        <i class="fas fa-user"></i>
        <div>点击上传头像</div>
    `;
}

// 打开聊天
function openChat(characterId) {
    currentCharacter = characters.find(c => c.id === characterId);
    if (!currentCharacter) return;
    
    document.getElementById('chat-title').textContent = currentCharacter.name;
    showPage('chat-page');
    loadChatHistory();
}

// 加载聊天记录
function loadChatHistory() {
    const chatMessages = document.getElementById('chat-messages');
    
    if (!currentCharacter.chatHistory || currentCharacter.chatHistory.length === 0) {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="chat-message ai">
                    <div class="message-avatar">
                        ${currentCharacter.avatar 
                            ? `<img src="${currentCharacter.avatar}" alt="${currentCharacter.name}">` 
                            : `<i class="fas fa-user"></i>`
                        }
                    </div>
                    <div class="message-content">
                        <div class="message-sender">${currentCharacter.name}</div>
                        <div class="message-text">你好！我是${currentCharacter.name}，很高兴认识你！</div>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    chatMessages.innerHTML = currentCharacter.chatHistory.map(msg => {
        const isUser = msg.role === 'user';
        const senderName = isUser ? myProfile.name : currentCharacter.name;
        const avatar = isUser 
            ? (myProfile.avatar ? `<img src="${myProfile.avatar}" alt="${myProfile.name}">` : `<i class="fas fa-user"></i>`)
            : (currentCharacter.avatar ? `<img src="${currentCharacter.avatar}" alt="${currentCharacter.name}">` : `<i class="fas fa-user"></i>`);
        
        return `
            <div class="chat-message ${isUser ? 'user' : 'ai'}">
                <div class="message-avatar">
                    ${avatar}
                </div>
                <div class="message-content">
                    <div class="message-sender">${senderName}</div>
                    <div class="message-text">${msg.content}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 发送消息
document.getElementById('send-message').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message || !currentCharacter) return;
    
    // 添加用户消息
    const userMessage = {
        role: 'user',
        content: message,
        timestamp: Date.now()
    };
    
    currentCharacter.chatHistory.push(userMessage);
    messageInput.value = '';
    
    // 更新显示
    loadChatHistory();
    saveCharacters();
    
    // 显示"正在输入"状态
    showTypingStatus();
    
    // 发送到AI
    try {
        const aiResponse = await sendToAI(message);
        hideTypingStatus();
        
        if (aiResponse) {
            const aiMessage = {
                role: 'assistant',
                content: aiResponse,
                timestamp: Date.now()
            };
            
            currentCharacter.chatHistory.push(aiMessage);
            loadChatHistory();
            saveCharacters();
        }
    } catch (error) {
        hideTypingStatus();
        showCustomAlert('发送失败：' + error.message);
    }
}

// 显示正在输入状态
function showTypingStatus() {
    const chatStatus = document.getElementById('chat-status');
    chatStatus.textContent = '正在输入中...';
    chatStatus.style.display = 'block';
}

// 隐藏正在输入状态
function hideTypingStatus() {
    const chatStatus = document.getElementById('chat-status');
    chatStatus.textContent = '';
    chatStatus.style.display = 'none';
}

// 发送到AI
async function sendToAI(message) {
    if (!apiSettings.url || !apiSettings.key) {
        throw new Error('请先配置API设置');
    }
    
    // 构建消息历史
    let systemPrompt = `你是${currentCharacter.name}。${currentCharacter.description}`;
    
    // 添加我的人设信息
    if (myProfile.description) {
        systemPrompt += `\n\n用户信息：${myProfile.description}`;
    }
    
    const messages = [
        {
            role: 'system',
            content: systemPrompt
        }
    ];
    
    // 添加聊天历史（最近10条）
    const recentHistory = currentCharacter.chatHistory.slice(-10);
    messages.push(...recentHistory);
    
    const response = await fetch(apiSettings.url + '/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiSettings.key}`
        },
        body: JSON.stringify({
            model: apiSettings.model,
            messages: messages,
            temperature: apiSettings.temperature,
            max_tokens: 1000
        })
    });
    
    if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

// 聊天设置
document.getElementById('chat-more-btn').addEventListener('click', () => {
    if (!currentCharacter) return;
    
    // 加载当前角色设置
    document.getElementById('settings-character-name').value = currentCharacter.name;
    document.getElementById('settings-character-description').value = currentCharacter.description;
    
    // 加载我的设置
    document.getElementById('my-name').value = myProfile.name;
    document.getElementById('my-description').value = myProfile.description;
    
    // 设置头像
    const settingsAvatarPlaceholder = document.getElementById('settings-avatar-placeholder');
    if (currentCharacter.avatar) {
        settingsAvatarPlaceholder.innerHTML = `<img src="${currentCharacter.avatar}" alt="头像" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        settingsAvatarPlaceholder.innerHTML = `<i class="fas fa-user"></i><div>点击更换角色头像</div>`;
    }
    
    const myAvatarPlaceholder = document.getElementById('my-avatar-placeholder');
    if (myProfile.avatar) {
        myAvatarPlaceholder.innerHTML = `<img src="${myProfile.avatar}" alt="头像" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
    } else {
        myAvatarPlaceholder.innerHTML = `<i class="fas fa-user"></i><div>点击更换我的头像</div>`;
    }
    
    showPage('character-settings-page');
});

// 设置页面头像上传
document.getElementById('settings-avatar-placeholder').addEventListener('click', () => {
    document.getElementById('settings-avatar-input').click();
});

document.getElementById('settings-avatar-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const avatarPlaceholder = document.getElementById('settings-avatar-placeholder');
            avatarPlaceholder.innerHTML = `<img src="${e.target.result}" alt="头像" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('my-avatar-placeholder').addEventListener('click', () => {
    document.getElementById('my-avatar-input').click();
});

document.getElementById('my-avatar-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const avatarPlaceholder = document.getElementById('my-avatar-placeholder');
            avatarPlaceholder.innerHTML = `<img src="${e.target.result}" alt="头像" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        };
        reader.readAsDataURL(file);
    }
});

// 返回聊天
document.getElementById('back-to-chat-from-settings').addEventListener('click', () => {
    showPage('chat-page');
});

// 保存角色设置
document.getElementById('save-character-settings').addEventListener('click', () => {
    if (!currentCharacter) return;
    
    // 保存角色设置
    currentCharacter.name = document.getElementById('settings-character-name').value.trim();
    currentCharacter.description = document.getElementById('settings-character-description').value.trim();
    
    // 保存角色头像
    const settingsAvatarImg = document.querySelector('#settings-avatar-placeholder img');
    if (settingsAvatarImg) {
        currentCharacter.avatar = settingsAvatarImg.src;
    }
    
    // 保存我的设置
    myProfile.name = document.getElementById('my-name').value.trim() || '我';
    myProfile.description = document.getElementById('my-description').value.trim();
    
    // 保存我的头像
    const myAvatarImg = document.querySelector('#my-avatar-placeholder img');
    if (myAvatarImg) {
        myProfile.avatar = myAvatarImg.src;
    }
    
    // 保存到本地存储
    saveCharacters();
    localStorage.setItem('myProfile', JSON.stringify(myProfile));
    
    // 更新聊天标题
    document.getElementById('chat-title').textContent = currentCharacter.name;
    
    showCustomAlert('设置保存成功！');
    showPage('chat-page');
});

// 删除角色
document.getElementById('delete-character-btn').addEventListener('click', async () => {
    if (!currentCharacter) return;
    
    const confirmed = await showCustomConfirm(`确定要删除角色"${currentCharacter.name}"吗？此操作不可撤销。`);
    if (confirmed) {
        characters = characters.filter(c => c.id !== currentCharacter.id);
        saveCharacters();
        
        showCustomAlert('角色已删除');
        showPage('chat-list-page');
        loadCharacters();
    }
});

// API设置功能
function loadApiSettings() {
    const saved = localStorage.getItem('apiSettings');
    if (saved) {
        apiSettings = JSON.parse(saved);
        document.getElementById('api-url').value = apiSettings.url;
        document.getElementById('api-key').value = apiSettings.key;
        document.getElementById('model-select').value = apiSettings.model;
        document.getElementById('temperature-slider').value = apiSettings.temperature;
        document.getElementById('temperature-value').textContent = apiSettings.temperature;
    }
}

// 保存API设置
document.getElementById('save-api-settings-btn').addEventListener('click', () => {
    apiSettings.url = document.getElementById('api-url').value.trim();
    apiSettings.key = document.getElementById('api-key').value.trim();
    apiSettings.model = document.getElementById('model-select').value;
    apiSettings.temperature = parseFloat(document.getElementById('temperature-slider').value);
    
    localStorage.setItem('apiSettings', JSON.stringify(apiSettings));
    showCustomAlert('API设置保存成功！');
});

// 测试连接
document.getElementById('test-connection').addEventListener('click', async () => {
    const url = document.getElementById('api-url').value.trim();
    const key = document.getElementById('api-key').value.trim();
    
    if (!url || !key) {
        showCustomAlert('请填写完整的API信息');
        return;
    }
    
    const statusEl = document.getElementById('connection-status');
    statusEl.textContent = '正在测试连接...';
    statusEl.className = 'status-message';
    
    try {
        const response = await fetch(url + '/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10
            })
        });
        
        if (response.ok) {
            statusEl.textContent = '✅ 连接成功！';
            statusEl.className = 'status-message success';
        } else {
            statusEl.textContent = `❌ 连接失败: ${response.status}`;
            statusEl.className = 'status-message error';
        }
    } catch (error) {
        statusEl.textContent = `❌ 连接失败: ${error.message}`;
        statusEl.className = 'status-message error';
    }
});

// 获取模型列表
document.getElementById('fetch-models-btn').addEventListener('click', async () => {
    const url = document.getElementById('api-url').value.trim();
    const key = document.getElementById('api-key').value.trim();
    
    if (!url || !key) {
        showCustomAlert('请先填写API地址和密钥');
        return;
    }
    
    try {
        // 尝试获取模型列表
        const modelsUrl = url + '/models';
        const response = await fetch(modelsUrl, {
            headers: {
                'Authorization': `Bearer ${key}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const modelSelect = document.getElementById('model-select');
            modelSelect.innerHTML = '';
            
            data.data.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.id;
                modelSelect.appendChild(option);
            });
            
            modelSelect.disabled = false;
            showCustomAlert('模型列表获取成功！');
        } else {
            // 如果获取失败，提供常用模型选项
            const modelSelect = document.getElementById('model-select');
            modelSelect.innerHTML = `
                <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                <option value="gpt-4">gpt-4</option>
                <option value="gpt-4-turbo">gpt-4-turbo</option>
                <option value="claude-3-sonnet">claude-3-sonnet</option>
                <option value="claude-3-haiku">claude-3-haiku</option>
            `;
            modelSelect.disabled = false;
            showCustomAlert('无法获取模型列表，已提供常用模型选项');
        }
    } catch (error) {
        showCustomAlert('获取模型列表失败：' + error.message);
    }
});

// 温度滑块更新
document.getElementById('temperature-slider').addEventListener('input', (e) => {
    document.getElementById('temperature-value').textContent = e.target.value;
});

// 重新生成回复
document.getElementById('regenerate-btn').addEventListener('click', async () => {
    if (!currentCharacter || !currentCharacter.chatHistory.length) return;
    
    // 移除最后一条AI回复
    if (currentCharacter.chatHistory[currentCharacter.chatHistory.length - 1].role === 'assistant') {
        currentCharacter.chatHistory.pop();
    }
    
    // 获取最后一条用户消息
    const lastUserMessage = [...currentCharacter.chatHistory].reverse().find(msg => msg.role === 'user');
    if (!lastUserMessage) return;
    
    // 显示"正在输入"状态
    showTypingStatus();
    
    try {
        const aiResponse = await sendToAI(lastUserMessage.content);
        hideTypingStatus();
        
        if (aiResponse) {
            const aiMessage = {
                role: 'assistant',
                content: aiResponse,
                timestamp: Date.now()
            };
            
            currentCharacter.chatHistory.push(aiMessage);
            loadChatHistory();
            saveCharacters();
        }
    } catch (error) {
        hideTypingStatus();
        showCustomAlert('重新生成失败：' + error.message);
    }
});

// 等待回复按钮
document.getElementById('wait-response').addEventListener('click', () => {
    showCustomAlert('AI正在思考中，请稍等...');
});

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    updateBatteryLevel();
    loadCharacters();
    loadApiSettings();
    
    // 加载我的个人资料
    const savedProfile = localStorage.getItem('myProfile');
    if (savedProfile) {
        myProfile = JSON.parse(savedProfile);
    }
    
    // 每分钟更新一次时间
    setInterval(updateTime, 60000);
    
    // 每30秒更新一次电池电量
    setInterval(updateBatteryLevel, 30000);
});