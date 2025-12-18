// private-messages-linzhong-all-read.js
// 林中的猫用户私信系统 - 确保所有消息都显示已读

// 确保全局消息对象存在
if (typeof window.privateMessages === 'undefined') {
    window.privateMessages = {};
}

// 从本地存储加载现有消息
try {
    const storedMessages = localStorage.getItem('privateMessages');
    if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        window.privateMessages = { ...window.privateMessages, ...parsed };
    }
} catch (e) {
    console.error('加载本地存储消息失败:', e);
}

// 为林中的猫用户初始化私信 - 强制所有消息为已读
function initLinzhongdeMaoMessages() {
    // 确保使用全局变量
    window.privateMessages = window.privateMessages || {};
    
    if (!window.privateMessages['林中的猫']) {
        window.privateMessages['林中的猫'] = [];
    }

    const existingMessages = window.privateMessages['林中的猫'];

    // 预定义的私信对话 - 所有消息都设置为已读
    const predefinedMessages = [
        {
            from: 'Q',
            content: '你好！欢迎入住静乔公寓！请记住，如若遭遇窥探时，请寻找公寓内最不起眼的角落。那里的结构是最厚的屏障~以及，物理钥匙比电子设备更可靠。祝你在公寓安然无虞。',
            timestamp: new Date('2022-9-12 10:30:00').toISOString(),
            read: true  // 强制已读
        },
        {
            from: '林中的猫',
            content: '谢谢！我记住了，非常感谢您建造这栋公寓楼！',
            timestamp: new Date('2022-9-12 11:15:00').toISOString(),
            read: true
        },
        {
            from: 'Q',
            content: '有空可以去福叁咖啡店坐坐哦，那也是我们的产业。',
            timestamp: new Date('2022-10-02 14:20:00').toISOString(),
            read: true  // 强制已读
        },
        {
            from: '林中的猫',
            content: '好的！我已经去过啦~那里的桂花拿铁我很喜欢~',
            timestamp: new Date('2022-10-02 18:45:00').toISOString(),
            read: true
        },
        {
            from: 'Q',
            content: '有些事想私下和你聊聊，方便吗？',
            timestamp: new Date('2022-11-06 09:00:00').toISOString(),
            read: true  // 强制已读
        },
        {
            from: '林中的猫',
            content: '方便的，我们电话聊吧，我的手机号是138-XXXX-0290',
            timestamp: new Date('2022-11-06 10:35:00').toISOString(),
            read: true
        },
        {
            from: '系统',
            content: '欢迎登入，最近过的怎么样？',
            timestamp: new Date('2025-09-07 18:00:00').toISOString(),
            read: true  // 系统消息也设为已读
        }
    ];

    // 只添加尚未存在的消息
    let addedCount = 0;
    predefinedMessages.forEach(newMessage => {
        const messageExists = existingMessages.some(
            existing =>
                existing.from === newMessage.from &&
                existing.content === newMessage.content
        );

        if (!messageExists) {
            window.privateMessages['林中的猫'].push(newMessage);
            addedCount++;
        }
    });

    // 保存到本地存储
    if (addedCount > 0) {
        localStorage.setItem('privateMessages', JSON.stringify(window.privateMessages));
    }

    // 更新消息计数
    if (typeof updateMessageCount === 'function') {
        updateMessageCount();
    }
    
    return addedCount;
}

// 检查是否是林中的猫用户登录
function isLinzhongUserLoggedIn() {
    // 检查全局变量 currentUser
    if (typeof window.currentUser !== 'undefined' && window.currentUser === '林中的猫') {
        return true;
    }
    
    // 检查 localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser === '林中的猫') {
        window.currentUser = '林中的猫';
        return true;
    }
    
    return false;
}

// 在现有私信模态框中显示林中的猫的消息
function displayLinzhongMessagesInModal() {
    // 检查是否是林中的猫
    if (!isLinzhongUserLoggedIn()) {
        return;
    }
    
    // 确保消息已初始化
    if (!window.privateMessages || !window.privateMessages['林中的猫']) {
        initLinzhongdeMaoMessages();
    }
    
    const messages = window.privateMessages['林中的猫'];
    const messageList = document.getElementById('message-list');
    
    if (!messageList) {
        return;
    }
    
    // 清空并填充消息列表
    messageList.innerHTML = '';
    
    // 添加标题
    const header = document.createElement('div');
    header.className = 'message-header';
    header.innerHTML = `
        <h4 style="margin: 0 0 10px 0; color: #333;">私信对话</h4>
        <div style="color: #666; font-size: 14px; margin-bottom: 15px;">
            共 ${messages.length} 条消息 · 全部已读
        </div>
    `;
    messageList.appendChild(header);
    
    // 添加消息
    messages.forEach(msg => {
        const messageItem = document.createElement('div');
        messageItem.className = 'message-item read';
        messageItem.style.cssText = `
            padding: 12px;
            margin-bottom: 12px;
            border-radius: 8px;
            background: #f9f9f9;
            border-left: 4px solid ${msg.from === 'Q' ? '#4a6fa5' : msg.from === '系统' ? '#ff8e53' : '#66bb6a'};
        `;
        
        const time = new Date(msg.timestamp).toLocaleString('zh-CN');
        
        messageItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: ${msg.from === 'Q' ? '#4a6fa5' : msg.from === '系统' ? '#ff8e53' : '#66bb6a'}">${msg.from}</strong>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 12px; color: #888;">${time}</span>
                </div>
            </div>
            <div style="color: #333; line-height: 1.5; white-space: pre-wrap;">${msg.content}</div>
        `;
        
        messageList.appendChild(messageItem);
    });
    
    // 添加关闭按钮
    const actions = document.createElement('div');
    actions.className = 'message-actions';
    actions.style.cssText = 'display: flex; gap: 10px; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;';
    
    actions.innerHTML = `
        <button onclick="closeMessageModal()" 
                style="background: #4a6fa5; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; margin-left: auto;">
            关闭
        </button>
    `;
    
    messageList.appendChild(actions);
}

// 标记单条消息为已读
function markMessageAsRead(user, messageIndex) {
    if (window.privateMessages[user] && window.privateMessages[user][messageIndex]) {
        window.privateMessages[user][messageIndex].read = true;
        localStorage.setItem('privateMessages', JSON.stringify(window.privateMessages));
        
        if (typeof updateMessageCount === 'function') {
            updateMessageCount();
        }
    }
}

// 标记所有消息为已读
function markAllMessagesAsRead(user) {
    if (window.privateMessages[user]) {
        window.privateMessages[user].forEach(msg => {
            msg.read = true;
        });
        localStorage.setItem('privateMessages', JSON.stringify(window.privateMessages));
        
        if (typeof updateMessageCount === 'function') {
            updateMessageCount();
        }
    }
}

// 更新未读计数显示
function updateUnreadCount() {
    if (!isLinzhongUserLoggedIn()) return;
    
    const messages = window.privateMessages?.['林中的猫'];
    if (!messages) return;
    
    const unreadCount = messages.filter(msg => !msg.read).length;
    
    // 更新私信按钮的未读徽章
    const messageBtn = document.querySelector('[onclick*="message"], [href*="message"], button:contains("私信")');
    if (messageBtn) {
        // 移除现有的徽章
        const existingBadge = messageBtn.querySelector('.unread-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
    }
}

// 打开私信模态框并显示林中的猫的消息
function openLinzhongMessageModal() {
    // 显示你的现有模态框
    const messageModal = document.getElementById('message-modal');
    if (messageModal) {
        messageModal.style.display = 'block';
        
        // 填充消息
        displayLinzhongMessagesInModal();
    }
}

// 关闭私信模态框
function closeMessageModal() {
    const messageModal = document.getElementById('message-modal');
    if (messageModal) {
        messageModal.style.display = 'none';
    }
}

// 林中的猫登录成功处理
function onLinzhongLogin() {
    // 初始化私信
    initLinzhongdeMaoMessages();
    
    // 更新未读计数
    updateUnreadCount();
}

// 集成到现有系统
function integrateWithExistingSystem() {
    // 监听模态框打开事件
    const messageModal = document.getElementById('message-modal');
    if (messageModal) {
        // 当模态框显示时，检查是否是林中的猫
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style') {
                    const display = messageModal.style.display;
                    if (display === 'block' && isLinzhongUserLoggedIn()) {
                        // 延迟一点确保DOM已更新
                        setTimeout(displayLinzhongMessagesInModal, 50);
                    }
                }
            });
        });
        
        observer.observe(messageModal, { attributes: true });
    }
    
    // 监听关闭按钮
    const closeBtn = document.getElementById('close-message');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMessageModal);
    }
}

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 集成到现有系统
    integrateWithExistingSystem();
    
    // 检查是否已登录林中的猫
    if (isLinzhongUserLoggedIn()) {
        initLinzhongdeMaoMessages();
        updateUnreadCount();
    }
});

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initLinzhongdeMaoMessages,
        displayLinzhongMessagesInModal,
        onLinzhongLogin,
        openLinzhongMessageModal
    };
}
