// precise-modal-fix.js - 修复版本
(function() {
    'use strict';
    
    
    
    let lastAlert = '';
    let lastAlertTime = 0;
    let lastConfirm = ''; // 新增：专门用于confirm的检测
    let lastConfirmTime = 0;
    let welcomeMessageShown = false;
    let isInitialized = false; // 防止重复初始化
    
    // 保存原始方法
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;
    
    // 系统消息关键词白名单 - 更全面的列表
    const SYSTEM_MESSAGE_KEYWORDS = [
        '系统日志', 'resonance', '日志', '模式', '记录', '状态',
        'auth', 'authentication', 'session', 'token', '验证'
    ];
    
    // 欢迎消息关键词
    const WELCOME_MESSAGE_KEYWORDS = [
        '登入系统模式', '欢迎进入系统模式', '欢迎进入系统',
        'welcome', '登录成功', 'login success'
    ];
    
    // 只拦截真正的重复alert，不影响系统功能
    window.alert = function(msg) {
        if (typeof msg !== 'string') {
            return originalAlert.call(window, msg);
        }
        
        const now = Date.now();
        const msgLower = msg.toLowerCase();
        
        // 系统相关消息直接通过，不拦截
        const isSystemMessage = SYSTEM_MESSAGE_KEYWORDS.some(keyword => 
            msgLower.includes(keyword.toLowerCase())
        );
        
        // 特别处理欢迎消息
        const isWelcomeMessage = WELCOME_MESSAGE_KEYWORDS.some(keyword =>
            msgLower.includes(keyword.toLowerCase())
        );
        
        if (isSystemMessage) {
            // 对于欢迎消息，只允许第一次显示，后续重复的阻止
            if (isWelcomeMessage) {
                if (welcomeMessageShown) {
                    
                    return;
                }
                welcomeMessageShown = true;
                
            }
            
            
            return originalAlert.call(window, msg);
        }
        
        // 普通消息：阻止重复（2秒内相同消息）
        if (msg === lastAlert && now - lastAlertTime < 2000) {
            
            return;
        }
        
        lastAlert = msg;
        lastAlertTime = now;
        
        // 🚨 修复关键：取消注释，让消息正常显示！
        // 调用原始alert显示消息
       /*  originalAlert.call(window, msg); */
        
        // 可选：同时显示自定义提示
        showCustomMessage(msg);
    };
    
    function showCustomMessage(msg) {
        try {
            let color = '#f44336'; // 默认红色
            
            if (msg.includes('成功') || msg.includes('完成')) {
                color = '#4CAF50'; // 绿色
            } else if (msg.includes('退出') || msg.includes('取消')) {
                color = '#2196F3'; // 蓝色
            } else if (msg.includes('警告') || msg.includes('错误')) {
                color = '#FF9800'; // 橙色
            }
            
            const div = document.createElement('div');
            
            // 移动端适配样式
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isTablet = /iPad|Android|Tablet/i.test(navigator.userAgent);
            
            let fontSize = '14px';
            let padding = '15px';
            let maxWidth = '300px';
            let borderRadius = '5px';
            
            if (isMobile) {
                fontSize = '16px';
                padding = '12px 16px';
                maxWidth = '85%';
                borderRadius = '8px';
                
                if (isTablet) {
                    fontSize = '18px';
                    padding = '16px 20px';
                    maxWidth = '70%';
                }
            }
            
            div.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${color};
                color: white;
                padding: ${padding};
                border-radius: ${borderRadius};
                z-index: 10000;
                max-width: ${maxWidth};
                font-size: ${fontSize};
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                word-wrap: break-word;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                line-height: 1.4;
                transition: opacity 0.3s ease;
            `;
            div.textContent = msg;
            document.body.appendChild(div);
            
            // 添加淡出效果
            setTimeout(() => {
                div.style.opacity = '0';
            }, 2700);
            
            setTimeout(() => {
                if (div.parentNode) {
                    document.body.removeChild(div);
                }
            }, 3000);
            
        } catch (error) {
            console.error('显示自定义消息时出错:', error);
        }
    }
    
    // 精准模态框保护 - 针对自定义模态框
    function preventModalCloseOnOutsideClick() {
        
        
        // 更全面的模态框检测
        function findAuthModals() {
            const modals = [];
            
            // 通过ID检测
            const idSelectors = [
                'login-modal', 'register-modal', 'auth-modal',
                'loginModal', 'registerModal', 'authModal'
            ];
            
            idSelectors.forEach(id => {
                const modal = document.getElementById(id);
                if (modal) modals.push(modal);
            });
            
            // 通过class检测
            const classSelectors = [
                '.login-modal', '.register-modal', '.auth-modal',
                '.modal-login', '.modal-register'
            ];
            
            classSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => modals.push(el));
            });
            
            return modals;
        }
        
        function isCloseButton(element) {
            if (!element) return false;
            
            const closeSelectors = [
                '.close', '.modal-close', '.btn-close', 
                '[data-dismiss="modal"]', '[aria-label="Close"]',
                '[data-bs-dismiss="modal"]' // Bootstrap 5
            ];
            
            for (const selector of closeSelectors) {
                if (element.matches(selector) || element.closest(selector)) {
                    return true;
                }
            }
            
            const text = (element.textContent || '').trim();
            const closeTexts = ['关闭', '×', 'X', 'close', 'Cancel', '取消'];
            if (closeTexts.includes(text)) {
                return true;
            }
            
            return false;
        }
        
        // 改进的触摸事件处理
        function addTouchHandlers() {
            let startY = 0;
            let startX = 0;
            
            document.addEventListener('touchstart', function(e) {
                if (e.touches.length > 0) {
                    startY = e.touches[0].clientY;
                    startX = e.touches[0].clientX;
                }
            }, { passive: true });
            
            document.addEventListener('touchend', function(e) {
                if (e.changedTouches.length > 0) {
                    const endY = e.changedTouches[0].clientY;
                    const endX = e.changedTouches[0].clientX;
                    
                    // 如果是轻微的滑动，不触发关闭检查
                    if (Math.abs(endY - startY) < 10 && Math.abs(endX - startX) < 10) {
                        handleModalClick(e.changedTouches[0].target);
                    }
                }
            }, { passive: true });
        }
        
        function handleModalClick(target) {
            const authModals = findAuthModals();
            let visibleModal = null;
            
            // 找到第一个可见的认证模态框
            for (const modal of authModals) {
                if (isModalVisible(modal)) {
                    visibleModal = modal;
                    break;
                }
            }
            
            if (!visibleModal) return;
            
            // 检查是否点击了模态框内容区域内部
            if (visibleModal.contains(target)) {
                return; // 点击在模态框内部，不处理
            }
            
            // 检查是否点击了关闭按钮
            if (isCloseButton(target)) {
                return; // 点击了关闭按钮，允许正常关闭
            }
            
            // 检查是否点击了模态框外部
            if (!visibleModal.contains(target)) {
                // 弹出确认框询问是否关闭
                const modalId = visibleModal.id || 'unknown';
                const confirmMsg = modalId.includes('login') ? 
                    '确定要退出登录吗？' : '确定要退出注册吗？';
                
                // 使用setTimeout避免立即执行导致的事件冲突
                setTimeout(() => {
                    if (originalConfirm.call(window, confirmMsg)) {
                        
                        hideModal(visibleModal);
                    } else {
                        
                    }
                }, 10);
            }
        }
        
        function isModalVisible(modal) {
            if (!modal) return false;
            
            try {
                const style = getComputedStyle(modal);
                return style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       parseFloat(style.opacity) > 0 &&
                       modal.offsetParent !== null;
            } catch (error) {
                console.error('检查模态框可见性时出错:', error);
                return false;
            }
        }
        
        function hideModal(modal) {
            try {
                // 多种隐藏方式兼容
                if (modal.style) {
                    modal.style.display = 'none';
                }
                
                // 尝试触发可能的关闭事件
                if (typeof jQuery !== 'undefined' && jQuery.fn.modal && jQuery(modal).modal) {
                    jQuery(modal).modal('hide');
                }
                
                // 触发自定义事件
                const event = new Event('modalHide', { bubbles: true });
                modal.dispatchEvent(event);
                
            } catch (error) {
                console.error('隐藏模态框时出错:', error);
            }
        }
        
        // 改进的事件监听器管理
        let eventHandlersAdded = false;
        
        function addEventHandlers() {
            if (eventHandlersAdded) return;
            
            document.addEventListener('click', function(e) {
                handleModalClick(e.target);
            }, true);
            
            addTouchHandlers();
            eventHandlersAdded = true;
            
            
        }
        
        // 初始化事件处理
        addEventHandlers();
        
        // 监控模态框显示状态
        const observer = new MutationObserver(function(mutations) {
            let shouldCheckModals = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes') {
                    const target = mutation.target;
                    if (target.id && target.id.includes('modal') || 
                        Array.from(target.classList).some(cls => cls.includes('modal'))) {
                        shouldCheckModals = true;
                    }
                } else if (mutation.type === 'childList') {
                    shouldCheckModals = true;
                }
            });
            
            if (shouldCheckModals) {
                
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'id']
        });
    }
    
    // 修复确认框重复问题
    window.confirm = function(msg) {
        if (typeof msg !== 'string') {
            return originalConfirm.call(window, msg);
        }
        
        const now = Date.now();
        
        // 针对退出登录的确认框，防止重复显示
        if ((msg.includes('退出') || msg.includes('logout')) && 
            !SYSTEM_MESSAGE_KEYWORDS.some(keyword => msg.includes(keyword))) {
            
            // 🚨 修复：使用专门的confirm检测变量
            if (msg === lastConfirm && now - lastConfirmTime < 2000) {
                
                return false;
            }
            lastConfirm = msg;
            lastConfirmTime = now;
        }
        
        return originalConfirm.call(window, msg);
    };
    
    // 添加移动端viewport适配
    function ensureViewportMeta() {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.head.appendChild(viewport);
            
        }
    }
    
    // 初始化所有功能
    function init() {
        if (isInitialized) {
            
            return;
        }
        
        try {
            ensureViewportMeta();
            preventModalCloseOnOutsideClick();
            isInitialized = true;
            
            
            
            
        } catch (error) {
            console.error('❌ 初始化失败:', error);
        }
    }
    
    // DOM加载后立即执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100); // 延迟执行确保DOM完全就绪
    }
    
})();
