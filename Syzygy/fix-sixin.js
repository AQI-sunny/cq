// private-messages-linzhong-corrected.js
// 林中的猫用户私信系统 - 修正已读状态版本

/* console.log('林中的猫私信系统加载...'); */

// 确保全局消息对象存在
if (typeof window.privateMessages === 'undefined') {
    window.privateMessages = {};
}

// 从本地存储加载现有消息
try {
    const storedMessages = localStorage.getItem('privateMessages');
    if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        // 合并消息，避免覆盖
        window.privateMessages = { ...window.privateMessages, ...parsed };
    }
} catch (e) {
    /* console.error('加载本地存储消息失败:', e); */
}

// 为林中的猫用户初始化私信
function initLinzhongdeMaoMessages() {
    /* console.log('初始化林中的猫私信...'); */
    
    // 确保使用全局变量
    window.privateMessages = window.privateMessages || {};
    
    if (!window.privateMessages['林中的猫']) {
        window.privateMessages['林中的猫'] = [];
    }

    const existingMessages = window.privateMessages['林中的猫'];

    // 预定义的私信对话 - 修正：Q的私信都是已读的，只有系统消息是未读
    const predefinedMessages = [
        {
            from: 'Q',
            content: '你好！欢迎入住静乔公寓！请记住，如若遭遇窥探时，请寻找公寓内最不起眼的角落。那里的结构是最厚的屏障~以及，物理钥匙比电子设备更可靠。祝你在公寓安然无虞。',
            timestamp: new Date('2022-9-12 10:30:00').toISOString(),
            read: true  // Q的消息：已读
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
            read: true  // Q的消息：已读
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
            read: true  // Q的消息：已读
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
            read: false  // 只有系统消息：未读
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
        /* console.log(`林中的猫私信初始化完成，添加了 ${addedCount} 条新消息`); */
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
        console.error('找不到 message-list 元素！');
        return;
    }
    
    // 计算未读消息数
    const unreadCount = messages.filter(msg => !msg.read).length;
    
    // 清空并填充消息列表
    messageList.innerHTML = '';
    
    // 添加标题
    const header = document.createElement('div');
    header.className = 'message-header';
    header.innerHTML = `
        <h4 style="margin: 0 0 10px 0; color: #333;">私信对话</h4>
        <div style="color: #666; font-size: 14px; margin-bottom: 15px;">
            共 ${messages.length} 条消息${unreadCount > 0 ? ` · ${unreadCount} 条未读` : ' · 全部已读'}
        </div>
    `;
    messageList.appendChild(header);
    
    // 添加消息
    messages.forEach(msg => {
        const messageItem = document.createElement('div');
        messageItem.className = `message-item ${msg.read ? 'read' : 'unread'}`;
        messageItem.style.cssText = `
            padding: 12px;
            margin-bottom: 12px;
            border-radius: 8px;
            background: ${msg.read ? '#f9f9f9' : '#f0f7ff'};
            border-left: 4px solid ${msg.from === 'Q' ? '#4a6fa5' : msg.from === '系统' ? '#ff6b6b' : '#66bb6a'};
        `;
        
        const time = new Date(msg.timestamp).toLocaleString('zh-CN');
        
        messageItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <strong style="color: ${msg.from === 'Q' ? '#4a6fa5' : msg.from === '系统' ? '#ff6b6b' : '#66bb6a'}">${msg.from}</strong>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 12px; color: #888;">${time}</span>
                    ${!msg.read ? '<span style="background: #ff6b6b; color: white; font-size: 11px; padding: 1px 6px; border-radius: 10px;">未读</span>' : ''}
                </div>
            </div>
            <div style="color: #333; line-height: 1.5; white-space: pre-wrap;">${msg.content}</div>
        `;
        
        // 点击未读消息标记为已读
        if (!msg.read) {
            messageItem.onclick = function() {
                markMessageAsRead('林中的猫', messages.indexOf(msg));
                messageItem.style.background = '#f9f9f9';
                messageItem.style.borderLeft = '4px solid #ddd';
                const badge = messageItem.querySelector('span[style*="background: #ff6b6b"]');
                if (badge) badge.remove();
                updateUnreadCount();
            };
            messageItem.style.cursor = 'pointer';
        }
        
        messageList.appendChild(messageItem);
    });
    
    // 添加操作按钮
    const actions = document.createElement('div');
    actions.className = 'message-actions';
    actions.style.cssText = 'display: flex; gap: 10px; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;';
    
    actions.innerHTML = `
        <button onclick="markAllMessagesAsRead('林中的猫')" 
                style="background: #4a6fa5; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">
            标记全部已读
        </button>
        <button onclick="closeMessageModal()" 
                style="background: #ddd; color: #333; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px;">
            关闭
        </button>
    `;
    
    messageList.appendChild(actions);
    
    // 更新未读计数
    updateUnreadCount();
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
        
        // 刷新显示
        displayLinzhongMessagesInModal();
        
        if (typeof updateMessageCount === 'function') {
            updateMessageCount();
        }
        
        /* console.log('所有消息已标记为已读'); */
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
        
        // 如果有未读消息，添加徽章
        if (unreadCount > 0) {
            const badge = document.createElement('span');
            badge.className = 'unread-badge';
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff6b6b;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            messageBtn.style.position = 'relative';
            messageBtn.appendChild(badge);
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
   /*  console.log('林中的猫登录成功，初始化私信...'); */
    
    // 初始化私信
    const addedCount = initLinzhongdeMaoMessages();
    
    // 更新未读计数
    updateUnreadCount();
    
    // 如果有未读系统消息，显示提示
    const messages = window.privateMessages?.['林中的猫'];
    if (messages) {
        const systemUnread = messages.filter(msg => msg.from === '系统' && !msg.read).length;
        if (systemUnread > 0) {
            showNewMessageNotification(systemUnread);
        }
    }
}

// 显示新消息通知（无alert）
function showNewMessageNotification(count) {
    // 创建通知
    const notification = document.createElement('div');
    notification.id = 'new-message-notification';
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        cursor: pointer;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">📨</span>
            <div>
                <div style="font-weight: bold;">系统新消息</div>
                <div style="font-size: 12px; opacity: 0.9;">你有${count}条系统消息未读</div>
            </div>
        </div>
    `;
    
    notification.onclick = function() {
        openLinzhongMessageModal();
        this.remove();
    };
    
    document.body.appendChild(notification);
    
    // 5秒后自动消失
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
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
   /*  console.log('林中的猫私信系统初始化...'); */
    
    // 集成到现有系统
    integrateWithExistingSystem();
    
    // 检查是否已登录林中的猫
    if (isLinzhongUserLoggedIn()) {
        console.log('检测到林中的猫已登录，初始化私信...');
        initLinzhongdeMaoMessages();
        updateUnreadCount();
    }
});

// 在你的登录代码中调用这个
/* console.log('在你的登录成功代码中添加：');
console.log(`
if (username === '林中的猫') {
    window.currentUser = '林中的猫';
    localStorage.setItem('currentUser', '林中的猫');
    
    if (typeof onLinzhongLogin === 'function') {
        onLinzhongLogin();
    }
}
`); */

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initLinzhongdeMaoMessages,
        displayLinzhongMessagesInModal,
        onLinzhongLogin,
        openLinzhongMessageModal
    };
}
