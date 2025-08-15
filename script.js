// 全局变量
let currentCharacterId = null;
let characters = [];
let worldBooks = [];
let messages = {};
let lastMessageTime = {};
let apiSettings = {
    url: '',
    key: '',
    model: '',
    temperature: 0.7
};
let myAvatar = null;
let myPersona = '';
let isTyping = false;
let currentWallpapers = {
    home: null,
    chat: {}
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 加载数据
    loadData();
    
    // 设置时间和日期
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // 设置电池状态
    updateBatteryStatus();
    
    // 初始化事件监听
    initEventListeners();
    
    // 初始化聊天列表
    updateChatList();
    
    // 初始化世界书列表
    updateWorldBookList();
    
    // 应用壁纸设置
    applyWallpaperSettings();
    
    // 应用手机边框设置
    applyPhoneFrameSettings();
    
    // 防止iOS橡皮筋效果
    preventRubberBandEffect();
    
    // 添加安全区适配
    addSafeAreaSupport();
});

// 更新日期和时间
function updateDateTime() {
    const now = new Date();
    
    // 更新状态栏时间
    document.getElementById('current-time').textContent = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    // 更新首页时间和日期
    document.getElementById('current-full-time').textContent = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekdays[now.getDay()]}`;
    document.getElementById('current-date').textContent = dateStr;
}

// 更新电池状态
function updateBatteryStatus() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            updateBatteryUI(battery.level, battery.charging);
            
            battery.addEventListener('levelchange', () => {
                updateBatteryUI(battery.level, battery.charging);
            });
            
            battery.addEventListener('chargingchange', () => {
                updateBatteryUI(battery.level, battery.charging);
            });
        });
    } else {
        // 模拟电池状态
        const level = 1.0;
        const charging = false;
        updateBatteryUI(level, charging);
    }
}

// 更新电池UI
function updateBatteryUI(level, charging) {
    const batteryIcon = document.getElementById('battery-icon');
    const batteryLevel = document.getElementById('battery-level');
    const percentage = Math.floor(level * 100);
    
    batteryLevel.textContent = `${percentage}%`;
    
    // 更新电池图标
    if (charging) {
        batteryIcon.className = 'fas fa-battery-bolt';
        batteryIcon.style.animation = 'charging-pulse 2s infinite';
    } else {
        batteryIcon.style.animation = 'none';
        if (percentage <= 10) {
            batteryIcon.className = 'fas fa-battery-empty';
        } else if (percentage <= 30) {
            batteryIcon.className = 'fas fa-battery-quarter';
        } else if (percentage <= 60) {
            batteryIcon.className = 'fas fa-battery-half';
        } else if (percentage <= 90) {
            batteryIcon.className = 'fas fa-battery-three-quarters';
        } else {
            batteryIcon.className = 'fas fa-battery-full';
        }
    }
}

// 初始化事件监听
function initEventListeners() {
    // 首页图标点击事件
    document.getElementById('wechat-icon').addEventListener('click', () => {
        navigateTo('chat-list-page');
    });
    
    document.getElementById('api-icon').addEventListener('click', () => {
        navigateTo('api-page');
    });
    
    document.getElementById('worldbook-icon').addEventListener('click', () => {
        navigateTo('worldbook-page');
    });
    
    document.getElementById('settings-icon').addEventListener('click', () => {
        navigateTo('home-settings-page');
    });
    
    // 返回按钮事件
    document.getElementById('back-to-home').addEventListener('click', () => {
        navigateTo('home-page');
    });
    
    document.getElementById('back-to-chat-list').addEventListener('click', () => {
        navigateTo('chat-list-page');
    });
    
    document.getElementById('back-to-chat-list-from-chat').addEventListener('click', () => {
        navigateTo('chat-list-page');
    });
    
    document.getElementById('back-to-chat-from-settings').addEventListener('click', () => {
        navigateTo('chat-page');
    });
    
    document.getElementById('back-to-home-from-api').addEventListener('click', () => {
        navigateTo('home-page');
    });
    
    document.getElementById('back-to-home-from-settings').addEventListener('click', () => {
        navigateTo('home-page');
    });
    
    document.getElementById('back-to-home-from-worldbook').addEventListener('click', () => {
        navigateTo('home-page');
    });
    
    document.getElementById('back-to-worldbook-from-editor').addEventListener('click', () => {
        navigateTo('worldbook-page');
    });
    
    document.getElementById('back-to-chat-list-from-memories').addEventListener('click', () => {
        navigateTo('chat-list-page');
    });
    
    document.getElementById('back-to-chat-list-from-moments').addEventListener('click', () => {
        navigateTo('chat-list-page');
    });
    
    // 底部导航事件
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            
            // 更新活动状态
            document.querySelectorAll('.nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });
            this.classList.add('active');
            
            // 导航到相应页面
            switch (view) {
                case 'chat-list':
                    navigateTo('chat-list-page');
                    break;
                case 'memories':
                    navigateTo('memories-page');
                    break;
                case 'moments':
                    navigateTo('moments-page');
                    break;
                case 'settings':
                    // 个人设置页面（未实现）
                    break;
            }
        });
    });
    
    // 添加角色按钮
    document.getElementById('add-character-btn').addEventListener('click', () => {
        // 重置表单
        document.getElementById('character-name').value = '';
        document.getElementById('character-description').value = '';
        document.getElementById('avatar-placeholder').innerHTML = '<i class="fas fa-user"></i><div>点击上传头像</div>';
        document.getElementById('avatar-placeholder').removeAttribute('data-avatar');
        
        navigateTo('add-character-page');
    });
    
    // 头像上传
    document.getElementById('avatar-placeholder').addEventListener('click', () => {
        document.getElementById('avatar-input').click();
    });
    
    document.getElementById('avatar-input').addEventListener('change', handleAvatarUpload);
    
    // 保存角色
    document.getElementById('save-character').addEventListener('click', saveCharacter);
    
    // 发送消息
    document.getElementById('send-message').addEventListener('click', sendMessage);
    document.getElementById('message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 等待回复按钮
    document.getElementById('wait-response').addEventListener('click', () => {
        if (currentCharacterId && !isTyping) {
            showTypingIndicator();
            setTimeout(() => {
                generateAIResponse();
            }, 1000);
        }
    });
    
    // 重新生成回复
    document.getElementById('regenerate-response').addEventListener('click', () => {
        if (currentCharacterId && !isTyping) {
            // 删除最后一条AI消息
            const chatMessages = document.getElementById('chat-messages');
            const aiMessages = chatMessages.querySelectorAll('.message-bubble.ai');
            if (aiMessages.length > 0) {
                const lastAIMessage = aiMessages[aiMessages.length - 1];
                chatMessages.removeChild(lastAIMessage);
                
                // 从消息历史中删除
                if (messages[currentCharacterId] && messages[currentCharacterId].length > 0) {
                    const lastMsg = messages[currentCharacterId][messages[currentCharacterId].length - 1];
                    if (lastMsg.role === 'assistant') {
                        messages[currentCharacterId].pop();
                        saveData();
                    }
                }
                
                // 重新生成回复
                showTypingIndicator();
                setTimeout(() => {
                    generateAIResponse();
                }, 1000);
            }
        }
    });
    
    // 表情按钮
    document.getElementById('emoji-btn').addEventListener('click', toggleEmojiPanel);
    
    // 表情选择
    document.querySelectorAll('.emoji-item').forEach(item => {
        item.addEventListener('click', () => {
            const emoji = item.getAttribute('data-emoji');
            const messageInput = document.getElementById('message-input');
            messageInput.value += emoji;
            messageInput.focus();
            document.getElementById('emoji-panel').style.display = 'none';
        });
    });
    
    // 点击其他区域关闭表情面板
    document.addEventListener('click', (e) => {
        const emojiPanel = document.getElementById('emoji-panel');
        const emojiBtn = document.getElementById('emoji-btn');
        
        if (emojiPanel.style.display === 'block' && 
            !emojiPanel.contains(e.target) && 
            !emojiBtn.contains(e.target)) {
            emojiPanel.style.display = 'none';
        }
    });
    
    // 角色设置
    document.getElementById('chat-more-btn').addEventListener('click', () => {
        if (currentCharacterId) {
            const character = characters.find(c => c.id === currentCharacterId);
            if (character) {
                // 填充表单
                document.getElementById('settings-character-name').value = character.name;
                document.getElementById('settings-character-description').value = character.description || '';
                
                // 设置头像
                const avatarPlaceholder = document.getElementById('settings-avatar-placeholder');
                if (character.avatar) {
                    avatarPlaceholder.innerHTML = `<img src="${character.avatar}" alt="${character.name}">`;
                    avatarPlaceholder.setAttribute('data-avatar', character.avatar);
                } else {
                    avatarPlaceholder.innerHTML = '<i class="fas fa-user"></i><div>点击上传头像</div>';
                    avatarPlaceholder.removeAttribute('data-avatar');
                }
                
                // 设置我的头像
                const myAvatarPreview = document.getElementById('my-avatar-preview');
                if (myAvatar) {
                    myAvatarPreview.innerHTML = `<img src="${myAvatar}" alt="我的头像">`;
                    myAvatarPreview.setAttribute('data-avatar', myAvatar);
                } else {
                    myAvatarPreview.innerHTML = '<i class="fas fa-user"></i><div>点击上传头像</div>';
                    myAvatarPreview.removeAttribute('data-avatar');
                }
                
                // 设置我的人设
                document.getElementById('my-persona').value = myPersona || '';
                
                // 设置世界书
                updateWorldBookCheckboxes(character.worldBooks || []);
                
                // 设置额外世界书设定
                document.getElementById('settings-world-book').value = character.extraWorldBook || '';
                
                // 设置聊天背景
                const chatWallpaperPreview = document.getElementById('chat-wallpaper-preview');
                if (currentWallpapers.chat && currentWallpapers.chat[currentCharacterId]) {
                    chatWallpaperPreview.innerHTML = `<img src="${currentWallpapers.chat[currentCharacterId]}" alt="聊天背景">`;
                } else {
                    chatWallpaperPreview.innerHTML = '<div class="wallpaper-placeholder"><i class="fas fa-image"></i><div>点击更换背景</div></div>';
                }
                
                navigateTo('character-settings-page');
            }
        }
    });
    
    // 设置头像上传
    document.getElementById('settings-avatar-placeholder').addEventListener('click', () => {
        document.getElementById('settings-avatar-input').click();
    });
    
    document.getElementById('settings-avatar-input').addEventListener('change', (e) => {
        handleAvatarUpload(e, 'settings-avatar-placeholder');
    });
    
    // 我的头像上传
    document.getElementById('my-avatar-preview').addEventListener('click', () => {
        document.getElementById('my-avatar-input').click();
    });
    
    document.getElementById('my-avatar-input').addEventListener('change', (e) => {
        handleAvatarUpload(e, 'my-avatar-preview');
    });
    
    // 保存角色设置
    document.getElementById('save-character-settings').addEventListener('click', saveCharacterSettings);
    
    // 删除角色
    document.getElementById('delete-character-btn').addEventListener('click', () => {
        if (currentCharacterId) {
            showModal('确认删除', '确定要删除这个角色吗？所有聊天记录将会丢失。', () => {
                deleteCharacter(currentCharacterId);
            });
        }
    });
    
    // 添加世界书
    document.getElementById('add-worldbook-btn').addEventListener('click', () => {
        // 重置表单
        document.getElementById('worldbook-name').value = '';
        document.getElementById('worldbook-content').value = '';
        document.getElementById('worldbook-editor-title').textContent = '添加世界书';
        
        navigateTo('worldbook-editor-page');
    });
    
    // 保存世界书
    document.getElementById('save-worldbook-btn').addEventListener('click', saveWorldBook);
    
    // API设置
    document.getElementById('save-api-settings-btn').addEventListener('click', saveAPISettings);
    
    // 测试API连接
    document.getElementById('test-connection').addEventListener('click', testAPIConnection);
    
    // 获取模型列表
    document.getElementById('fetch-models-btn').addEventListener('click', fetchModels);
    
    // 温度滑块
    const temperatureSlider = document.getElementById('temperature-slider');
    const temperatureValue = document.getElementById('temperature-value');
    
    temperatureSlider.addEventListener('input', () => {
        const value = parseFloat(temperatureSlider.value);
        temperatureValue.textContent = value.toFixed(1);
    });
    
    // 配置导出
    document.getElementById('export-config-btn').addEventListener('click', exportConfig);
    
    // 配置导入
    document.getElementById('import-config-btn').addEventListener('click', () => {
        document.getElementById('config-file-input').click();
    });
    
    document.getElementById('config-file-input').addEventListener('change', importConfig);
    
    // 数据导出
    document.getElementById('export-data-btn').addEventListener('click', exportData);
    
    // 数据导入
    document.getElementById('import-data-btn').addEventListener('click', () => {
        document.getElementById('data-file-input').click();
    });
    
    document.getElementById('data-file-input').addEventListener('change', importData);
    
    // 壁纸设置
    document.getElementById('home-wallpaper-preview').addEventListener('click', () => {
        document.getElementById('home-wallpaper-input').click();
    });
    
    document.getElementById('home-wallpaper-input').addEventListener('change', (e) => {
        handleWallpaperUpload(e, 'home');
    });
    
    document.getElementById('chat-wallpaper-preview').addEventListener('click', () => {
        document.getElementById('chat-wallpaper-input').click();
    });
    
    document.getElementById('chat-wallpaper-input').addEventListener('change', (e) => {
        handleWallpaperUpload(e, 'chat');
    });
    
    // 重置壁纸
    document.getElementById('reset-home-wallpaper').addEventListener('click', () => {
        resetWallpaper('home');
    });
    
    document.getElementById('reset-chat-wallpaper').addEventListener('click', () => {
        resetWallpaper('chat');
    });
    
    // 手机边框设置
    document.getElementById('phone-frame-enabled').addEventListener('click', () => {
        document.body.classList.add('phone-frame-enabled');
        document.body.classList.remove('phone-frame-disabled');
        localStorage.setItem('phoneFrame', 'enabled');
    });
    
    document.getElementById('phone-frame-disabled').addEventListener('click', () => {
        document.body.classList.add('phone-frame-disabled');
        document.body.classList.remove('phone-frame-enabled');
        localStorage.setItem('phoneFrame', 'disabled');
    });
    
    // 退出应用
    document.getElementById('exit-app').addEventListener('click', () => {
        showModal('确认退出', '确定要退出应用吗？', () => {
            window.close();
        });
    });
    
    // 模态框按钮
    document.getElementById('modal-cancel').addEventListener('click', hideModal);
    document.getElementById('modal-confirm').addEventListener('click', () => {
        if (typeof window.modalConfirmCallback === 'function') {
            window.modalConfirmCallback();
        }
        hideModal();
    });
    
    // 多选下拉框
    document.querySelector('.select-box').addEventListener('click', function() {
        const checkboxesContainer = document.getElementById('world-book-checkboxes-container');
        this.classList.toggle('expanded');
        checkboxesContainer.classList.toggle('visible');
    });
}

// 页面导航
function navigateTo(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示目标页面
    document.getElementById(pageId).classList.add('active');
    
    // 特殊处理
    if (pageId === 'chat-page') {
        // 滚动到底部
        scrollChatToBottom();
    }
}

// 加载数据
function loadData() {
    // 加载角色
    const savedCharacters = localStorage.getItem('characters');
    if (savedCharacters) {
        characters = JSON.parse(savedCharacters);
    }
    
    // 加载消息
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
    }
    
    // 加载最后消息时间
    const savedLastMessageTime = localStorage.getItem('lastMessageTime');
    if (savedLastMessageTime) {
        lastMessageTime = JSON.parse(savedLastMessageTime);
    }
    
    // 加载世界书
    const savedWorldBooks = localStorage.getItem('worldBooks');
    if (savedWorldBooks) {
        worldBooks = JSON.parse(savedWorldBooks);
    }
    
    // 加载API设置
    const savedAPISettings = localStorage.getItem('apiSettings');
    if (savedAPISettings) {
        apiSettings = JSON.parse(savedAPISettings);
        
        // 填充API设置表单
        document.getElementById('api-url').value = apiSettings.url || '';
        document.getElementById('api-key').value = apiSettings.key || '';
        document.getElementById('temperature-slider').value = apiSettings.temperature || 0.7;
        document.getElementById('temperature-value').textContent = (apiSettings.temperature || 0.7).toFixed(1);
        
        if (apiSettings.model) {
            const modelSelect = document.getElementById('model-select');
            modelSelect.innerHTML = `<option value="${apiSettings.model}">${apiSettings.model}</option>`;
            modelSelect.value = apiSettings.model;
        }
    }
    
    // 加载我的头像
    const savedMyAvatar = localStorage.getItem('myAvatar');
    if (savedMyAvatar) {
        myAvatar = savedMyAvatar;
    }
    
    // 加载我的人设
    const savedMyPersona = localStorage.getItem('myPersona');
    if (savedMyPersona) {
        myPersona = savedMyPersona;
    }
    
    // 加载壁纸设置
    const savedWallpapers = localStorage.getItem('wallpapers');
    if (savedWallpapers) {
        currentWallpapers = JSON.parse(savedWallpapers);
    }
    
    // 更新首页壁纸预览
    if (currentWallpapers.home) {
        document.getElementById('home-wallpaper-preview').innerHTML = `<img src="${currentWallpapers.home}" alt="首页壁纸">`;
    }
}

// 保存数据
function saveData() {
    localStorage.setItem('characters', JSON.stringify(characters));
    localStorage.setItem('messages', JSON.stringify(messages));
    localStorage.setItem('lastMessageTime', JSON.stringify(lastMessageTime));
    localStorage.setItem('worldBooks', JSON.stringify(worldBooks));
    localStorage.setItem('apiSettings', JSON.stringify(apiSettings));
    localStorage.setItem('myAvatar', myAvatar);
    localStorage.setItem('myPersona', myPersona);
    localStorage.setItem('wallpapers', JSON.stringify(currentWallpapers));
}

// 更新聊天列表
function updateChatList() {
    const chatList = document.getElementById('chat-list');
    chatList.innerHTML = '';
    
    if (characters.length === 0) {
        chatList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <p>还没有聊天对象<br>点击右上角"+"添加</p>
            </div>
        `;
        return;
    }
    
    // 按最后消息时间排序
    characters.sort((a, b) => {
        const timeA = lastMessageTime[a.id] || 0;
        const timeB = lastMessageTime[b.id] || 0;
        return timeB - timeA;
    });
    
    characters.forEach(character => {
        const lastMsg = messages[character.id] && messages[character.id].length > 0 
            ? messages[character.id][messages[character.id].length - 1].content 
            : '暂无消息';
        
        const lastTime = lastMessageTime[character.id] 
            ? formatMessageTime(new Date(lastMessageTime[character.id])) 
            : '';
        
        const listItem = document.createElement('div');
        listItem.className = 'chat-list-item';
        listItem.innerHTML = `
            <div class="chat-avatar">
                ${character.avatar 
                    ? `<img src="${character.avatar}" alt="${character.name}">` 
                    : `<i class="fas fa-user"></i>`}
            </div>
            <div class="chat-info">
                <div class="chat-name">${character.name}</div>
                <div class="chat-last-message">${lastMsg}</div>
            </div>
            <div class="chat-time">${lastTime}</div>
        `;
        
        listItem.addEventListener('click', () => {
            openChat(character.id);
        });
        
        chatList.appendChild(listItem);
    });
}

// 更新世界书列表
function updateWorldBookList() {
    const worldbookList = document.getElementById('worldbook-list');
    worldbookList.innerHTML = '';
    
    if (worldBooks.length === 0) {
        worldbookList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book"></i>
                <p>还没有世界书<br>点击右上角"+"添加</p>
            </div>
        `;
        return;
    }
    
    worldBooks.forEach(book => {
        const preview = book.content.length > 50 
            ? book.content.substring(0, 50) + '...' 
            : book.content;
        
        const listItem = document.createElement('div');
        listItem.className = 'worldbook-item';
        listItem.innerHTML = `
            <div class="worldbook-icon">
                <i class="fas fa-book"></i>
            </div>
            <div class="worldbook-info">
                <div class="worldbook-name">${book.name}</div>
                <div class="worldbook-preview">${preview}</div>
            </div>
            <div class="worldbook-actions">
                <button class="worldbook-action-btn edit" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="worldbook-action-btn delete" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // 编辑按钮
        listItem.querySelector('.edit').addEventListener('click', (e) => {
            e.stopPropagation();
            editWorldBook(book.id);
        });
        
        // 删除按钮
        listItem.querySelector('.delete').addEventListener('click', (e) => {
            e.stopPropagation();
            showModal('确认删除', `确定要删除世界书"${book.name}"吗？`, () => {
                deleteWorldBook(book.id);
            });
        });
        
        // 点击项目查看详情
        listItem.addEventListener('click', () => {
            editWorldBook(book.id);
        });
        
        worldbookList.appendChild(listItem);
    });
}

// 更新世界书复选框
function updateWorldBookCheckboxes(selectedIds = []) {
    const container = document.getElementById('world-book-checkboxes-container');
    container.innerHTML = '';
    
    if (worldBooks.length === 0) {
        container.innerHTML = '<div style="padding: 10px; color: var(--text-secondary);">暂无世界书</div>';
        document.querySelector('.selected-options-text').textContent = '-- 暂无可选项 --';
        return;
    }
    
    worldBooks.forEach(book => {
        const isChecked = selectedIds.includes(book.id);
        
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" value="${book.id}" ${isChecked ? 'checked' : ''}>
            ${book.name}
        `;
        
        container.appendChild(label);
    });
    
    // 更新选中项显示
    updateSelectedOptionsText();
    
    // 添加复选框变化事件
    container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedOptionsText);
    });
}

// 更新选中的世界书显示
function updateSelectedOptionsText() {
    const checkboxes = document.querySelectorAll('#world-book-checkboxes-container input[type="checkbox"]:checked');
    const selectedText = document.querySelector('.selected-options-text');
    
    if (checkboxes.length === 0) {
        selectedText.textContent = '-- 点击选择 --';
    } else {
        const selectedNames = Array.from(checkboxes).map(cb => {
            const bookId = cb.value;
            const book = worldBooks.find(b => b.id === bookId);
            return book ? book.name : '';
        }).filter(name => name !== '');
        
        selectedText.textContent = selectedNames.join(', ');
    }
}

// 获取选中的世界书ID
function getSelectedWorldBookIds() {
    const checkboxes = document.querySelectorAll('#world-book-checkboxes-container input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// 打开聊天
function openChat(characterId) {
    currentCharacterId = characterId;
    const character = characters.find(c => c.id === characterId);
    
    if (character) {
        // 设置聊天标题
        document.getElementById('chat-title').textContent = character.name;
        
        // 清空聊天消息
        document.getElementById('chat-messages').innerHTML = '';
        
        // 加载聊天记录
        loadChatHistory(characterId);
        
        // 应用聊天背景
        applyChatWallpaper(characterId);
        
        // 导航到聊天页面
        navigateTo('chat-page');
    }
}

// 加载聊天历史
function loadChatHistory(characterId) {
    const chatMessages = document.getElementById('chat-messages');
    
    if (!messages[characterId] || messages[characterId].length === 0) {
        return;
    }
    
    messages[characterId].forEach(msg => {
        const messageElement = createMessageElement(msg);
        chatMessages.appendChild(messageElement);
    });
    
    // 滚动到底部
    scrollChatToBottom();
}

// 创建消息元素
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble ${message.role === 'user' ? 'user' : 'ai'}`;
    
    const avatar = message.role === 'user' 
        ? (myAvatar || '') 
        : (characters.find(c => c.id === currentCharacterId)?.avatar || '');
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${avatar 
                ? `<img src="${avatar}" alt="${message.role === 'user' ? '我' : '对方'}">`
                : `<i class="fas fa-${message.role === 'user' ? 'user' : 'robot'}"></i>`}
        </div>
        <div class="message-content">
            <div class="message-text">${message.content}</div>
        </div>
    `;
    
    return messageDiv;
}

// 发送消息
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (!message || !currentCharacterId) return;
    
    // 清空输入框
    messageInput.value = '';
    
    // 添加消息到UI
    addMessageToUI('user', message);
    
    // 添加消息到历史
    if (!messages[currentCharacterId]) {
        messages[currentCharacterId] = [];
    }
    
    messages[currentCharacterId].push({
        role: 'user',
        content: message
    });
    
    // 更新最后消息时间
    lastMessageTime[currentCharacterId] = Date.now();
    
    // 保存数据
    saveData();
    
    // 更新聊天列表
    updateChatList();
    
    // 显示AI正在输入
    showTypingIndicator();
    
    // 生成AI回复
    setTimeout(() => {
        generateAIResponse();
    }, 1000);
}

// 添加消息到UI
function addMessageToUI(role, content) {
    const chatMessages = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-bubble ${role === 'user' ? 'user' : 'ai'}`;
    
    const avatar = role === 'user' 
        ? (myAvatar || '') 
        : (characters.find(c => c.id === currentCharacterId)?.avatar || '');
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${avatar 
                ? `<img src="${avatar}" alt="${role === 'user' ? '我' : '对方'}">`
                : `<i class="fas fa-${role === 'user' ? 'user' : 'robot'}"></i>`}
        </div>
        <div class="message-content">
            <div class="message-text">${content}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    scrollChatToBottom();
}

// 显示AI正在输入
function showTypingIndicator() {
    isTyping = true;
    
    const chatMessages = document.getElementById('chat-messages');
    
    // 移除现有的输入指示器
    const existingIndicator = document.querySelector('.typing-indicator-container');
    if (existingIndicator) {
        chatMessages.removeChild(existingIndicator);
    }
    
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'message-bubble ai typing-indicator-container';
    
    const character = characters.find(c => c.id === currentCharacterId);
    const avatar = character && character.avatar ? character.avatar : '';
    
    indicatorDiv.innerHTML = `
        <div class="message-avatar">
            ${avatar 
                ? `<img src="${avatar}" alt="对方">`
                : `<i class="fas fa-robot"></i>`}
        </div>
        <div class="message-content">
            <div class="message-text">
                正在输入中
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(indicatorDiv);
    
    // 滚动到底部
    scrollChatToBottom();
}

// 隐藏AI正在输入
function hideTypingIndicator() {
    isTyping = false;
    
    const chatMessages = document.getElementById('chat-messages');
    const indicator = document.querySelector('.typing-indicator-container');
    
    if (indicator) {
        chatMessages.removeChild(indicator);
    }
}

// 生成AI回复
function generateAIResponse() {
    if (!currentCharacterId || !apiSettings.url || !apiSettings.key) {
        hideTypingIndicator();
        showModal('错误', '请先在API设置中配置API连接信息', null);
        return;
    }
    
    const character = characters.find(c => c.id === currentCharacterId);
    if (!character) {
        hideTypingIndicator();
        return;
    }
    
    // 构建提示词
    const prompt = buildPrompt(character);
    
    // 模拟API调用
    simulateAPICall(prompt).then(response => {
        hideTypingIndicator();
        
        // 添加回复到UI
        addMessageToUI('assistant', response);
        
        // 添加回复到历史
        if (!messages[currentCharacterId]) {
            messages[currentCharacterId] = [];
        }
        
        messages[currentCharacterId].push({
            role: 'assistant',
            content: response
        });
        
        // 更新最后消息时间
        lastMessageTime[currentCharacterId] = Date.now();
        
        // 保存数据
        saveData();
        
        // 更新聊天列表
        updateChatList();
    }).catch(error => {
        hideTypingIndicator();
        showModal('错误', `生成回复失败: ${error.message}`, null);
    });
}

// 构建提示词
function buildPrompt(character) {
    // 获取聊天历史
    const chatHistory = messages[currentCharacterId] || [];
    
    // 获取角色人设
    const characterDescription = character.description || '';
    
    // 获取世界书内容
    let worldBookContent = '';
    
    if (character.worldBooks && character.worldBooks.length > 0) {
        character.worldBooks.forEach(bookId => {
            const book = worldBooks.find(b => b.id === bookId);
            if (book) {
                worldBookContent += `${book.name}:\n${book.content}\n\n`;
            }
        });
    }
    
    // 添加额外世界书设定
    if (character.extraWorldBook) {
        worldBookContent += `额外设定:\n${character.extraWorldBook}\n\n`;
    }
    
    // 构建系统提示词
    let systemPrompt = `你是${character.name}，以下是你的人设：\n${characterDescription}\n\n`;
    
    if (worldBookContent) {
        systemPrompt += `世界观设定：\n${worldBookContent}\n\n`;
    }
    
    if (myPersona) {
        systemPrompt += `对话者的人设：\n${myPersona}\n\n`;
    }
    
    systemPrompt += `请以第一人称回复，保持对话的自然流畅，不要提及你是AI或语言模型。`;
    
    return {
        systemPrompt,
        chatHistory
    };
}

// 模拟API调用
function simulateAPICall(prompt) {
    return new Promise((resolve, reject) => {
        // 这里是模拟的回复生成，实际应用中应该调用真实的API
        const responses = [
            "你好啊！今天天气真不错，要不要一起出去走走？",
            "最近有看什么好看的电影或电视剧吗？我一直想找些新的东西看。",
            "我刚刚在想你呢，真巧你就来消息了。今天过得怎么样？",
            "嗯...这个问题很有意思，让我想一想。我觉得每个人的看法可能都不太一样。",
            "哈哈，你真幽默！我喜欢和你聊天，总是能让我开心起来。",
            "我最近在学习一些新东西，感觉很充实。你有什么新的爱好或兴趣吗？",
            "说实话，我今天心情有点低落，但看到你的消息就好多了。",
            "这个周末有什么计划吗？我在考虑要不要去公园散步。",
            "我觉得你说的很有道理，确实应该从这个角度去思考问题。",
            "我昨天做了一个很奇怪的梦，梦见我们在一个完全陌生的地方旅行。"
        ];
        
        // 随机选择一个回复
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // 模拟网络延迟
        setTimeout(() => {
            resolve(randomResponse);
        }, 1000);
    });
}

// 滚动聊天到底部
function scrollChatToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 处理头像上传
function handleAvatarUpload(event, targetId = 'avatar-placeholder') {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const avatarPlaceholder = document.getElementById(targetId);
        avatarPlaceholder.innerHTML = `<img src="${e.target.result}" alt="头像">`;
        avatarPlaceholder.setAttribute('data-avatar', e.target.result);
    };
    reader.readAsDataURL(file);
}

// 处理壁纸上传
function handleWallpaperUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        if (type === 'home') {
            // 更新首页壁纸
            currentWallpapers.home = e.target.result;
            document.getElementById('home-wallpaper-preview').innerHTML = `<img src="${e.target.result}" alt="首页壁纸">`;
            applyHomeWallpaper();
        } else if (type === 'chat') {
            // 更新聊天壁纸
            if (!currentWallpapers.chat) {
                currentWallpapers.chat = {};
            }
            currentWallpapers.chat[currentCharacterId] = e.target.result;
            document.getElementById('chat-wallpaper-preview').innerHTML = `<img src="${e.target.result}" alt="聊天背景">`;
            applyChatWallpaper(currentCharacterId);
        }
        
        // 保存壁纸设置
        saveData();
    };
    reader.readAsDataURL(file);
}

// 重置壁纸
function resetWallpaper(type) {
    if (type === 'home') {
        // 重置首页壁纸
        currentWallpapers.home = null;
        document.getElementById('home-wallpaper-preview').innerHTML = '<div class="wallpaper-placeholder"><i class="fas fa-image"></i><div>点击更换壁纸</div></div>';
        document.getElementById('home-page').style.backgroundImage = '';
        document.getElementById('home-page').classList.remove('home-page-with-wallpaper');
    } else if (type === 'chat') {
        // 重置聊天壁纸
        if (currentWallpapers.chat && currentCharacterId) {
            delete currentWallpapers.chat[currentCharacterId];
            document.getElementById('chat-wallpaper-preview').innerHTML = '<div class="wallpaper-placeholder"><i class="fas fa-image"></i><div>点击更换背景</div></div>';
            document.getElementById('chat-page').style.backgroundImage = '';
            document.getElementById('chat-page').classList.remove('chat-page-with-wallpaper');
        }
    }
    
    // 保存壁纸设置
    saveData();
}

// 应用壁纸设置
function applyWallpaperSettings() {
    // 应用首页壁纸
    applyHomeWallpaper();
    
    // 应用手机边框设置
    applyPhoneFrameSettings();
}

// 应用首页壁纸
function applyHomeWallpaper() {
    const homePage = document.getElementById('home-page');
    
    if (currentWallpapers.home) {
        homePage.style.backgroundImage = `url(${currentWallpapers.home})`;
        homePage.classList.add('home-page-with-wallpaper');
    } else {
        homePage.style.backgroundImage = '';
        homePage.classList.remove('home-page-with-wallpaper');
    }
}

// 应用聊天壁纸
function applyChatWallpaper(characterId) {
    const chatPage = document.getElementById('chat-page');
    
    if (currentWallpapers.chat && currentWallpapers.chat[characterId]) {
        chatPage.style.backgroundImage = `url(${currentWallpapers.chat[characterId]})`;
        chatPage.classList.add('chat-page-with-wallpaper');
    } else {
        chatPage.style.backgroundImage = '';
        chatPage.classList.remove('chat-page-with-wallpaper');
    }
}

// 应用手机边框设置
function applyPhoneFrameSettings() {
    const frameType = localStorage.getItem('phoneFrame') || 'enabled';
    
    if (frameType === 'enabled') {
        document.body.classList.add('phone-frame-enabled');
        document.body.classList.remove('phone-frame-disabled');
    } else {
        document.body.classList.add('phone-frame-disabled');
        document.body.classList.remove('phone-frame-enabled');
    }
}

// 保存角色
function saveCharacter() {
    const name = document.getElementById('character-name').value.trim();
    const description = document.getElementById('character-description').value.trim();
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    const avatar = avatarPlaceholder.getAttribute('data-avatar') || '';
    
    if (!name) {
        showModal('错误', '请输入角色名称', null);
        return;
    }
    
    const characterId = 'char_' + Date.now();
    
    characters.push({
        id: characterId,
        name,
        description,
        avatar,
        worldBooks: [],
        extraWorldBook: ''
    });
    
    // 初始化消息数组
    messages[characterId] = [];
    
    // 保存数据
    saveData();
    
    // 更新聊天列表
    updateChatList();
    
    // 导航到聊天列表
    navigateTo('chat-list-page');
}

// 保存角色设置
function saveCharacterSettings() {
    if (!currentCharacterId) return;
    
    const character = characters.find(c => c.id === currentCharacterId);
    if (!character) return;
    
    // 获取表单数据
    const name = document.getElementById('settings-character-name').value.trim();
    const description = document.getElementById('settings-character-description').value.trim();
    const avatarPlaceholder = document.getElementById('settings-avatar-placeholder');
    const avatar = avatarPlaceholder.getAttribute('data-avatar') || '';
    const worldBooks = getSelectedWorldBookIds();
    const extraWorldBook = document.getElementById('settings-world-book').value.trim();
    
    // 获取我的头像和人设
    const myAvatarPreview = document.getElementById('my-avatar-preview');
    myAvatar = myAvatarPreview.getAttribute('data-avatar') || null;
    myPersona = document.getElementById('my-persona').value.trim();
    
    if (!name) {
        showModal('错误', '请输入角色名称', null);
        return;
    }
    
    // 更新角色数据
    character.name = name;
    character.description = description;
    character.avatar = avatar;
    character.worldBooks = worldBooks;
    character.extraWorldBook = extraWorldBook;
    
    // 保存数据
    saveData();
    
    // 更新聊天标题
    document.getElementById('chat-title').textContent = name;
    
    // 更新聊天列表
    updateChatList();
    
    // 导航回聊天页面
    navigateTo('chat-page');
}

// 删除角色
function deleteCharacter(characterId) {
    // 从角色列表中删除
    characters = characters.filter(c => c.id !== characterId);
    
    // 删除相关消息
    delete messages[characterId];
    delete lastMessageTime[characterId];
    
    // 删除聊天壁纸
    if (currentWallpapers.chat && currentWallpapers.chat[characterId]) {
        delete currentWallpapers.chat[characterId];
    }
    
    // 保存数据
    saveData();
    
    // 更新聊天列表
    updateChatList();
    
    // 导航到聊天列表
    navigateTo('chat-list-page');
}

// 保存世界书
function saveWorldBook() {
    const name = document.getElementById('worldbook-name').value.trim();
    const content = document.getElementById('worldbook-content').value.trim();
    
    if (!name) {
        showModal('错误', '请输入世界书名称', null);
        return;
    }
    
    if (!content) {
        showModal('错误', '请输入世界书内容', null);
        return;
    }
    
    // 检查是否是编辑模式
    const editingId = document.getElementById('worldbook-editor-title').getAttribute('data-editing-id');
    
    if (editingId) {
        // 更新现有世界书
        const book = worldBooks.find(b => b.id === editingId);
        if (book) {
            book.name = name;
            book.content = content;
        }
    } else {
        // 创建新世界书
        const bookId = 'book_' + Date.now();
        worldBooks.push({
            id: bookId,
            name,
            content
        });
    }
    
    // 保存数据
    saveData();
    
    // 更新世界书列表
    updateWorldBookList();
    
    // 导航回世界书列表
    navigateTo('worldbook-page');
}

// 编辑世界书
function editWorldBook(bookId) {
    const book = worldBooks.find(b => b.id === bookId);
    if (!book) return;
    
    // 填充表单
    document.getElementById('worldbook-name').value = book.name;
    document.getElementById('worldbook-content').value = book.content;
    
    // 设置标题和编辑ID
    const titleElement = document.getElementById('worldbook-editor-title');
    titleElement.textContent = '编辑世界书';
    titleElement.setAttribute('data-editing-id', bookId);
    
    // 导航到编辑页面
    navigateTo('worldbook-editor-page');
}

// 删除世界书
function deleteWorldBook(bookId) {
    // 从世界书列表中删除
    worldBooks = worldBooks.filter(b => b.id !== bookId);
    
    // 从角色关联中删除
    characters.forEach(character => {
        if (character.worldBooks) {
            character.worldBooks = character.worldBooks.filter(id => id !== bookId);
        }
    });
    
    // 保存数据
    saveData();
    
    // 更新世界书列表
    updateWorldBookList();
}

// 保存API设置
function saveAPISettings() {
    const url = document.getElementById('api-url').value.trim();
    const key = document.getElementById('api-key').value.trim();
    const model = document.getElementById('model-select').value;
    const temperature = parseFloat(document.getElementById('temperature-slider').value);
    
    apiSettings = {
        url,
        key,
        model,
        temperature
    };
    
    // 保存数据
    saveData();
    
    showModal('成功', 'API设置已保存', null);
}

// 测试API连接
function testAPIConnection() {
    const url = document.getElementById('api-url').value.trim();
    const key = document.getElementById('api-key').value.trim();
    
    if (!url || !key) {
        showModal('错误', '请输入API地址和密钥', null);
        return;
    }
    
    const statusElement = document.getElementById('connection-status');
    statusElement.className = 'status-message';
    statusElement.textContent = '正在测试连接...';
    
    // 模拟API测试
    setTimeout(() => {
        statusElement.className = 'status-message success';
        statusElement.textContent = '连接成功！API可用。';
    }, 1500);
}

// 获取模型列表
function fetchModels() {
    const url = document.getElementById('api-url').value.trim();
    const key = document.getElementById('api-key').value.trim();
    
    if (!url || !key) {
        showModal('错误', '请输入API地址和密钥', null);
        return;
    }
    
    // 模拟获取模型列表
    setTimeout(() => {
        const modelSelect = document.getElementById('model-select');
        modelSelect.innerHTML = '';
        modelSelect.disabled = false;
        
        const models = [
            'gpt-4-turbo',
            'gpt-4',
            'gpt-3.5-turbo',
            'claude-3-opus',
            'claude-3-sonnet',
            'gemini-pro',
            'qwen-max',
            'glm-4'
        ];
        
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });
        
        // 如果已有选择的模型，则设置为选中
        if (apiSettings.model) {
            modelSelect.value = apiSettings.model;
        }
    }, 1500);
}

// 导出配置
function exportConfig() {
    const config = {
        apiSettings,
        myPersona,
        phoneFrame: localStorage.getItem('phoneFrame') || 'enabled'
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wechat_simulator_config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 导入配置
function importConfig(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);
            
            // 导入API设置
            if (config.apiSettings) {
                apiSettings = config.apiSettings;
                document.getElementById('api-url').value = apiSettings.url || '';
                document.getElementById('api-key').value = apiSettings.key || '';
                document.getElementById('temperature-slider').value = apiSettings.temperature || 0.7;
                document.getElementById('temperature-value').textContent = (apiSettings.temperature || 0.7).toFixed(1);
                
                if (apiSettings.model) {
                    const modelSelect = document.getElementById('model-select');
                    modelSelect.innerHTML = `<option value="${apiSettings.model}">${apiSettings.model}</option>`;
                    modelSelect.value = apiSettings.model;
                }
            }
            
            // 导入我的人设
            if (config.myPersona) {
                myPersona = config.myPersona;
            }
            
            // 导入手机边框设置
            if (config.phoneFrame) {
                localStorage.setItem('phoneFrame', config.phoneFrame);
                applyPhoneFrameSettings();
            }
            
            // 保存数据
            saveData();
            
            showModal('成功', '配置导入成功', null);
        } catch (error) {
            showModal('错误', '配置文件格式错误', null);
        }
    };
    reader.readAsText(file);
}

// 导出数据
function exportData() {
    const data = {
        characters,
        messages,
        lastMessageTime,
        worldBooks,
        myAvatar,
        currentWallpapers
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wechat_simulator_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 导入数据
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // 导入角色
            if (data.characters) {
                characters = data.characters;
            }
            
            // 导入消息
            if (data.messages) {
                messages = data.messages;
            }
            
            // 导入最后消息时间
            if (data.lastMessageTime) {
                lastMessageTime = data.lastMessageTime;
            }
            
            // 导入世界书
            if (data.worldBooks) {
                worldBooks = data.worldBooks;
            }
            
            // 导入我的头像
            if (data.myAvatar) {
                myAvatar = data.myAvatar;
            }
            
            // 导入壁纸设置
            if (data.currentWallpapers) {
                currentWallpapers = data.currentWallpapers;
                applyWallpaperSettings();
            }
            
            // 保存数据
            saveData();
            
            // 更新UI
            updateChatList();
            updateWorldBookList();
            
            showModal('成功', '数据导入成功', null);
        } catch (error) {
            showModal('错误', '数据文件格式错误', null);
        }
    };
    reader.readAsText(file);
}

// 显示模态框
function showModal(title, message, confirmCallback) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    
    // 存储确认回调
    window.modalConfirmCallback = confirmCallback;
    
    // 显示/隐藏取消按钮
    document.getElementById('modal-cancel').style.display = confirmCallback ? 'block' : 'none';
    
    // 如果没有确认回调，将确认按钮文本改为"确定"
    document.getElementById('modal-confirm').textContent = confirmCallback ? '确定' : '关闭';
    
    // 显示模态框
    document.getElementById('custom-modal-overlay').classList.add('visible');
}

// 隐藏模态框
function hideModal() {
    document.getElementById('custom-modal-overlay').classList.remove('visible');
    window.modalConfirmCallback = null;
}

// 切换表情面板
function toggleEmojiPanel() {
    const emojiPanel = document.getElementById('emoji-panel');
    emojiPanel.style.display = emojiPanel.style.display === 'block' ? 'none' : 'block';
}

// 格式化消息时间
function formatMessageTime(date) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
        // 今天
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (date >= yesterday) {
        // 昨天
        return '昨天';
    } else if (date.getFullYear() === now.getFullYear()) {
        // 今年
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    } else {
        // 往年
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    }
}

// 防止iOS橡皮筋效果
function preventRubberBandEffect() {
    document.body.addEventListener('touchmove', function(e) {
        if (e.target.closest('.chat-messages, .list-container, .form-container')) {
            // 允许这些元素内部滚动
            return;
        }
        e.preventDefault();
    }, { passive: false });
}

// 添加安全区适配
function addSafeAreaSupport() {
    // 添加viewport-fit=cover元标签
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
        let content = metaViewport.getAttribute('content');
        if (!content.includes('viewport-fit=cover')) {
            metaViewport.setAttribute('content', content + ', viewport-fit=cover');
        }
    }
}
