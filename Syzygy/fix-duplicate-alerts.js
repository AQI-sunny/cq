// precise-modal-fix.js
(function() {
    'use strict';
    
    console.log('精准模态框修复启动...');
    
    let lastAlert = '';
    let lastAlertTime = 0;
    let systemMessageCount = 0;
    let welcomeMessageShown = false;
    
    // 保存原始方法
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;
    
    // 只拦截真正的重复alert，不影响系统功能
    window.alert = function(msg) {
        const now = Date.now();
        
        // 系统相关消息直接通过，不拦截
        const isSystemMessage = msg.includes('系统') || 
                               msg.includes('resonance') || 
                               msg.includes('日志') ||
                               msg.includes('模式');
        
        // 特别处理欢迎消息
        const isWelcomeMessage = msg.includes('登入系统模式') || 
                                msg.includes('欢迎进入系统模式') ||
                                msg.includes('欢迎进入系统');
        
        if (isSystemMessage) {
            // 对于欢迎消息，只允许第一次显示，后续重复的阻止
            if (isWelcomeMessage) {
                if (welcomeMessageShown) {
                    console.log('阻止重复欢迎消息:', msg);
                    return;
                }
                welcomeMessageShown = true;
                console.log('首次显示欢迎消息:', msg);
            }
            
            // 系统日志和其他系统消息正常显示
            const isSystemLog = msg.includes('系统日志') || 
                               msg.includes('日志记录') ||
                               msg.includes('resonance');
            
            if (isSystemLog) {
                console.log('显示系统日志:', msg);
                return originalAlert.call(window, msg);
            }
            
            // 其他系统消息也正常显示
            return originalAlert.call(window, msg);
        }
        
        // 普通消息：阻止重复（2秒内相同消息）
        if (msg === lastAlert && now - lastAlertTime < 2000) {
            console.log('阻止重复alert:', msg);
            return;
        }
        
        lastAlert = msg;
        lastAlertTime = now;
        
        // 调用原始alert
        /* originalAlert.call(window, msg); */
        
        // 可选：同时显示自定义提示
        showCustomMessage(msg);
    };
    
    function showCustomMessage(msg) {
        let color = '#f44336'; // 默认红色
        
        if (msg.includes('成功') || msg.includes('注册成功')) {
            color = '#4CAF50'; // 绿色
        } else if (msg.includes('退出')) {
            color = '#2196F3'; // 蓝色
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
            fontSize = '16px'; // 移动端字体稍大
            padding = '12px 16px';
            maxWidth = '85%';
            borderRadius = '8px';
            
            if (isTablet) {
                fontSize = '18px'; // 平板字体更大
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
        `;
        div.textContent = msg;
        document.body.appendChild(div);
        
        setTimeout(() => {
            if (div.parentNode) document.body.removeChild(div);
        }, 3000);
    }
    
    // 精准模态框保护 - 针对自定义模态框
    function preventModalCloseOnOutsideClick() {
        console.log('启动精准模态框保护...');
        
        // 检查是否为登录或注册模态框
        function isAuthModal(modal) {
            if (!modal) return false;
            
            const id = modal.id || '';
            const classList = Array.from(modal.classList);
            
            // 检查ID是否包含登录或注册相关关键词
            if (id.includes('login') || id.includes('register')) {
                return true;
            }
            
            // 检查class是否包含登录或注册相关关键词
            for (const cls of classList) {
                if (cls.includes('login') || cls.includes('register')) {
                    return true;
                }
            }
            
            return false;
        }
        
        function isCloseButton(element) {
            if (!element) return false;
            
            const closeSelectors = [
                '.close', '.modal-close', '.btn-close', 
                '[data-dismiss="modal"]', '[aria-label="Close"]'
            ];
            
            for (const selector of closeSelectors) {
                if (element.matches(selector) || element.closest(selector)) {
                    return true;
                }
            }
            
            const text = element.textContent || '';
            if (text.includes('关闭') || text.includes('×') || text === '×' || text === 'X' || text === 'close') {
                return true;
            }
            
            return false;
        }
        
        // 移动端触摸事件处理
        function addTouchHandlers() {
            let startY = 0;
            let startX = 0;
            
            document.addEventListener('touchstart', function(e) {
                startY = e.touches[0].clientY;
                startX = e.touches[0].clientX;
            }, { passive: true });
            
            document.addEventListener('touchend', function(e) {
                const endY = e.changedTouches[0].clientY;
                const endX = e.changedTouches[0].clientX;
                
                // 如果是轻微的滑动，不触发关闭检查
                if (Math.abs(endY - startY) < 10 && Math.abs(endX - startX) < 10) {
                    handleModalClick(e.changedTouches[0].target);
                }
            }, { passive: true });
        }
        
        function handleModalClick(target) {
            // 检查是否有登录或注册模态框正在显示
            const loginModal = document.getElementById('login-modal');
            const registerModal = document.getElementById('register-modal');
            
            // 检查哪个模态框当前是可见的
            let visibleModal = null;
            let modalType = null;
            
            if (loginModal && isModalVisible(loginModal)) {
                visibleModal = loginModal;
                modalType = 'login';
            } else if (registerModal && isModalVisible(registerModal)) {
                visibleModal = registerModal;
                modalType = 'register';
            }
            
            // 如果有可见的认证模态框
            if (visibleModal) {
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
                    const confirmMsg = modalType === 'login' ? '确定要退出登录吗？' : '确定要退出注册吗？';
                    
                    if (originalConfirm.call(window, confirmMsg)) {
                        console.log('用户确认关闭模态框');
                        // 隐藏模态框
                        hideModal(visibleModal);
                    } else {
                        console.log('用户取消关闭模态框');
                        return false;
                    }
                }
            }
        }
        
        function isModalVisible(modal) {
            const style = getComputedStyle(modal);
            return style.display !== 'none' && 
                   style.visibility !== 'hidden' && 
                   style.opacity !== '0' &&
                   modal.offsetParent !== null;
        }
        
        function hideModal(modal) {
            // 多种隐藏方式兼容
            if (modal.style) {
                modal.style.display = 'none';
            }
            
            // 尝试触发可能的关闭事件
            if (typeof jQuery !== 'undefined' && jQuery(modal).modal) {
                jQuery(modal).modal('hide');
            }
            
            // 触发自定义事件
            const event = new Event('modalHide', { bubbles: true });
            modal.dispatchEvent(event);
        }
        
        // 精准点击事件处理 - 使用事件委托，避免重复绑定
        let clickHandlerAdded = false;
        
        function addClickHandler() {
            if (clickHandlerAdded) return;
            
            document.addEventListener('click', function(e) {
                handleModalClick(e.target);
            }, true);
            
            clickHandlerAdded = true;
        }
        
        // 初始化事件处理
        addClickHandler();
        addTouchHandlers();
        
        // 监控模态框显示状态
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    const target = mutation.target;
                    if (target.id === 'login-modal' || target.id === 'register-modal') {
                        // 模态框样式发生变化，可能显示/隐藏
                        console.log('模态框状态变化:', target.id, target.style.display);
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
    
    // 修复确认框重复问题
    window.confirm = function(msg) {
        // 针对退出登录的确认框，防止重复显示
        if ((msg.includes('退出') || msg.includes('logout')) && 
            !(msg.includes('系统') || msg.includes('resonance') || msg.includes('日志') || msg.includes('模式'))) {
            const now = Date.now();
            if (msg === lastAlert && now - lastAlertTime < 2000) {
                console.log('阻止重复确认框:', msg);
                return false; // 直接返回false，不执行退出操作
            }
            lastAlert = msg;
            lastAlertTime = now;
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
        ensureViewportMeta();
        preventModalCloseOnOutsideClick();
        console.log('修复完成：点击登录注册框外部需要确认才关闭，系统消息不被拦截，其他功能正常');
        console.log('设备信息:', navigator.userAgent);
    }
    
    // DOM加载后立即执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
