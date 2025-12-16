// tanchuang.js - 完全修复版（包含周哲叙，Resonance不触发）
(function() {
    'use strict';
    
    console.log('tanchuang.js加载中...');
    
    // 全局变量
    let themeTimer = null;
    let lastMatchedTime = 0;
    let currentUser = null;
    let azhePopup = null;
    let azhePopupObserver = null;
    
    // 关键词列表 - 已添加周哲叙
    const KEYWORDS = ['黑色笔记本', '窥命司', '阿哲', '周哲叙'];
    
    // ==================== 辅助函数 ====================
    
    // 更新当前用户信息
    function updateCurrentUser() {
        // 方法1: 从window对象获取
        if (window.currentUser) {
            currentUser = window.currentUser;
            console.log('从window.currentUser获取用户:', currentUser);
        }
        // 方法2: 从localStorage获取
        else if (localStorage.getItem('currentUser')) {
            currentUser = localStorage.getItem('currentUser');
            console.log('从localStorage获取用户:', currentUser);
        }
        // 方法3: 从sessionStorage获取
        else if (sessionStorage.getItem('currentUser')) {
            currentUser = sessionStorage.getItem('currentUser');
        }
        // 方法4: 从页面提取
        else {
            const userFromPage = extractUsernameFromPage();
            currentUser = userFromPage || '匿名用户';
            console.log('从页面提取用户:', currentUser);
        }
        
        return currentUser;
    }
    
    // 从页面提取用户名
    function extractUsernameFromPage() {
        const selectors = [
            '.username', '.user-name', '#username', '#user-name',
            '[class*="user"]', '[id*="user"]',
            '.user-info', '#user-info'
        ];
        
        for (let selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (let element of elements) {
                const text = (element.textContent || '').trim();
                if (text && text.length < 50) {
                    return text;
                }
            }
        }
        
        return null;
    }
    
    // 检查是否为特殊用户（Resonance或林中的猫）
    function isSpecialUser() {
        updateCurrentUser();
        
        if (!currentUser) return false;
        
        const userLower = currentUser.toLowerCase();
        return userLower === 'resonance' || currentUser === '林中的猫';
    }
    
    // ==================== 阿哲弹窗函数 ====================
    
    // 检查是否为Resonance用户
    window.isResonanceUser = function() {
        updateCurrentUser();
        
        if (!currentUser) return false;
        
        const userLower = currentUser.toLowerCase();
        
        if (userLower === 'resonance') {
            console.log('检测到Resonance用户');
            return true;
        }
        
        return false;
    };
    
    // 创建全新的阿哲弹窗（每次触发都新建）
    function createNewAzhePopup() {
        // 移除旧的弹窗和观察者
        if (azhePopup) {
            azhePopup.remove();
            azhePopup = null;
        }
        if (azhePopupObserver) {
            azhePopupObserver.disconnect();
            azhePopupObserver = null;
        }
        
        // 创建新弹窗
        azhePopup = document.createElement('div');
        azhePopup.id = 'azhe-popup-' + Date.now(); // 使用唯一ID
        
        // 强制性的内联样式，避免被外部CSS覆盖
        azhePopup.style.cssText = `
            /* 基本布局 */
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            
            /* 外观 */
            background: #000000 !important;
            color: #ff0000 !important;
            border: 8px solid #ff0000 !important;
            border-radius: 15px !important;
            
            /* 尺寸和间距 */
            padding: 40px 50px !important;
            min-width: 500px !important;
            max-width: 90vw !important;
            box-sizing: border-box !important;
            
            /* 文字 */
            font-family: Arial, "Microsoft YaHei", sans-serif !important;
            font-size: 24px !important;
            font-weight: bold !important;
            text-align: center !important;
            line-height: 1.5 !important;
            
            /* 效果 */
            box-shadow: 0 0 80px rgba(255, 0, 0, 0.9),
                        0 0 40px rgba(255, 0, 0, 0.6) inset !important;
            text-shadow: 0 0 15px #ff0000 !important;
            
            /* 显示控制 - 最重要的部分 */
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            
            /* 层级 - 最高优先级 */
            z-index: 2147483647 !important;
            
            /* 防止被外部样式影响 */
            all: initial !important;
            font: initial !important;
            color: initial !important;
            background: initial !important;
            border: initial !important;
        `;
        
        // 创建内部内容容器，使用独立的样式
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = `
            all: initial !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;
        
        // 消息文本
        const message = document.createElement('p');
        message.id = 'azhe-message-' + Date.now();
        message.textContent = `❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗❗${currentUser}你这个臭邻居！！！ 乱搜我的名字干什么！！不想活了吗！！！`;
        message.style.cssText = `
            all: initial !important;
            display: block !important;
            margin: 0 0 30px 0 !important;
            padding: 0 !important;
            font-family: Arial, "Microsoft YaHei", sans-serif !important;
            font-size: 28px !important;
            font-weight: bold !important;
            color: #ff0000 !important;
            text-shadow: 0 0 20px #ff0000 !important;
            line-height: 1.4 !important;
            white-space: normal !important;
            word-wrap: break-word !important;
        `;
        
        // 警告文本
        const warning = document.createElement('p');
        warning.textContent = '⚠️ 不要再搜索任何东西了！你会没命的！！！';
        warning.style.cssText = `
            all: initial !important;
            display: block !important;
            margin: 15px 0 40px 0 !important;
            padding: 0 !important;
            font-family: Arial, "Microsoft YaHei", sans-serif !important;
            font-size: 20px !important;
            font-weight: bold !important;
            color: #ff6666 !important;
        `;
        
        // 关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭 (10秒后自动关闭)';
        closeButton.style.cssText = `
            all: initial !important;
            display: inline-block !important;
            visibility: visible !important;
            opacity: 1 !important;
            
            /* 按钮样式 */
            background: #ff0000 !important;
            color: #000000 !important;
            border: 3px solid #ffffff !important;
            border-radius: 10px !important;
            
            /* 尺寸和间距 */
            padding: 18px 36px !important;
            margin: 0 !important;
            
            /* 文字 */
            font-family: Arial, "Microsoft YaHei", sans-serif !important;
            font-size: 20px !important;
            font-weight: bold !important;
            text-align: center !important;
            
            /* 效果 */
            cursor: pointer !important;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.7) !important;
            
            /* 交互效果 */
            transition: all 0.2s !important;
        `;
        
        // 按钮悬停效果
        closeButton.onmouseover = function() {
            this.style.cssText += 'background: #ff3333 !important; transform: scale(1.05) !important;';
        };
        closeButton.onmouseout = function() {
            this.style.cssText = closeButton.style.cssText.replace('background: #ff3333 !important;', 'background: #ff0000 !important;')
                .replace('transform: scale(1.05) !important;', '');
        };
        
        // 按钮点击事件
        closeButton.onclick = function() {
            window.closeAzhePopup();
        };
        
        // 组装弹窗
        contentDiv.appendChild(message);
        contentDiv.appendChild(warning);
        contentDiv.appendChild(closeButton);
        azhePopup.appendChild(contentDiv);
        
        // 添加到页面最前面
        document.body.insertBefore(azhePopup, document.body.firstChild);
        
        console.log('已创建新的阿哲弹窗，ID:', azhePopup.id);
        
        // 添加监控，防止被隐藏
        monitorPopupVisibility();
        
        return azhePopup;
    }
    
    // 监控弹窗可见性
    function monitorPopupVisibility() {
        if (!azhePopup) return;
        
        // 使用MutationObserver监控样式变化
        azhePopupObserver = new MutationObserver(function(mutations) {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const computedStyle = window.getComputedStyle(azhePopup);
                    const display = computedStyle.display;
                    const visibility = computedStyle.visibility;
                    const opacity = computedStyle.opacity;
                    
                    if (display === 'none' || visibility === 'hidden' || opacity === '0') {
                        console.log('弹窗被隐藏，强制重新显示！');
                        
                        // 立即强制显示
                        azhePopup.style.setProperty('display', 'block', 'important');
                        azhePopup.style.setProperty('visibility', 'visible', 'important');
                        azhePopup.style.setProperty('opacity', '1', 'important');
                        azhePopup.style.setProperty('z-index', '2147483647', 'important');
                        
                        // 使用requestAnimationFrame确保执行
                        requestAnimationFrame(() => {
                            azhePopup.style.setProperty('display', 'block', 'important');
                        });
                    }
                }
            }
        });
        
        // 开始监控
        azhePopupObserver.observe(azhePopup, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        // 持续检查弹窗可见性
        let checkCount = 0;
        const maxChecks = 100; // 10秒 * 100ms间隔
        
        const checkVisibility = setInterval(() => {
            if (!azhePopup || !azhePopup.isConnected) {
                clearInterval(checkVisibility);
                return;
            }
            
            const rect = azhePopup.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;
            
            if (!isVisible && checkCount < maxChecks) {
                console.log(`弹窗不可见，重新显示 (检查次数: ${checkCount + 1})`);
                
                // 强制重置样式
                azhePopup.style.cssText = `
                    position: fixed !important;
                    top: 50% !important;
                    left: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    z-index: 2147483647 !important;
                    background: #000 !important;
                    color: #f00 !important;
                    border: 8px solid #f00 !important;
                    padding: 40px !important;
                `;
            }
            
            checkCount++;
            if (checkCount >= maxChecks) {
                clearInterval(checkVisibility);
            }
        }, 100); // 每100ms检查一次
        
        // 10秒后停止检查
        setTimeout(() => {
            clearInterval(checkVisibility);
        }, 10000);
    }
    
    // 触发阿哲弹窗
    window.triggerAzhePopup = function() {
        console.log('触发阿哲弹窗...');
        
        // 更新用户信息
        updateCurrentUser();
        
        // 检查是否为特殊用户（Resonance或林中的猫）
        if (isSpecialUser()) {
            console.log(`${currentUser}是特殊用户，跳过阿哲弹窗`);
            return false;
        }
        
        // 标记为已触发
        localStorage.setItem('azheTriggered', 'true');
        
        // 切换到黑红样式
        document.body.classList.add('resonance-theme');
        console.log('已应用resonance-theme样式');
        
        // 创建新弹窗
        const popup = createNewAzhePopup();
        
        // 清除之前的定时器
        if (window.azheTimeout) {
            clearTimeout(window.azheTimeout);
        }
        
        // 设置10秒后关闭弹窗
        window.azheTimeout = setTimeout(() => {
            window.closeAzhePopup();
        }, 10000);
        
        // 添加全局点击事件，点击页面其他地方也可以关闭
        const globalClickListener = function(e) {
            if (popup && !popup.contains(e.target)) {
                window.closeAzhePopup();
                document.removeEventListener('click', globalClickListener);
            }
        };
        
        // 延迟添加点击事件，避免立即触发
        setTimeout(() => {
            document.addEventListener('click', globalClickListener);
        }, 100);
        
        // 添加ESC键关闭功能
        const escKeyListener = function(e) {
            if (e.key === 'Escape') {
                window.closeAzhePopup();
                document.removeEventListener('keydown', escKeyListener);
            }
        };
        document.addEventListener('keydown', escKeyListener);
        
        console.log('阿哲弹窗已显示');
        return true;
    };
    
    // 关闭阿哲弹窗
    window.closeAzhePopup = function() {
        console.log('关闭阿哲弹窗...');
        
        // 移除弹窗
        if (azhePopup) {
            azhePopup.remove();
            azhePopup = null;
        }
        
        // 停止观察
        if (azhePopupObserver) {
            azhePopupObserver.disconnect();
            azhePopupObserver = null;
        }
        
        // 如果不是Resonance用户，移除主题
        if (!window.isResonanceUser()) {
            document.body.classList.remove('resonance-theme');
            console.log('已移除resonance-theme样式');
        }
        
        // 清除定时器
        if (window.azheTimeout) {
            clearTimeout(window.azheTimeout);
            window.azheTimeout = null;
        }
        
        console.log('阿哲弹窗已关闭');
    };
    
    // ==================== 其他弹窗函数 ====================
    
    // 处理搜索逻辑
    window.handleSearch = function(query) {
        const lowerQuery = query.toLowerCase().trim();
        console.log('处理搜索:', query);
        
        // 搜索"阿哲"或"周哲叙"
        if (lowerQuery.includes('阿哲') || lowerQuery.includes('周哲叙')) {
            // 检查是否为特殊用户（Resonance或林中的猫）
            if (isSpecialUser()) {
                console.log(`${currentUser}是特殊用户，搜索"${query}"跳过弹窗`);
                return false; // 返回false表示不触发弹窗，继续正常搜索
            }
            
            console.log('搜索到"阿哲"或"周哲叙"，触发弹窗');
            return window.triggerAzhePopup();
        }
        
        // 搜索"窥命司"
        if (lowerQuery.includes('窥命司')) {
            console.log('搜索到"窥命司"');
            
            // 应用主题
            document.body.classList.add('resonance-theme');
            lastMatchedTime = Date.now();
            clearTimeout(themeTimer);
            
            // 5秒后移除主题
            setTimeout(() => {
                if (!window.isResonanceUser()) {
                    document.body.classList.remove('resonance-theme');
                }
            }, 5000);
            
            // 显示相应弹窗
            showKeywordPopup();
            
            return true;
        }
        
        return false;
    };
    
    // 显示关键词弹窗
    function showKeywordPopup() {
        // 简单弹窗实现
        const popup = document.createElement('div');
        popup.id = 'keyword-popup-' + Date.now();
        
        popup.style.cssText = `
            position: fixed !important;
            top: 20% !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background: rgba(0, 0, 0, 0.9) !important;
            color: #ff0000 !important;
            padding: 20px 30px !important;
            border: 3px solid #ff0000 !important;
            border-radius: 10px !important;
            z-index: 2147483646 !important;
            font-size: 18px !important;
            font-weight: bold !important;
            text-align: center !important;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.5) !important;
            display: block !important;
        `;
        
        if (window.isResonanceUser()) {
            popup.textContent = '危险词警告！';
        } else if (currentUser && currentUser !== '匿名用户') {
            popup.textContent = '你在找我吗？';
        } else {
            popup.textContent = '需要更高权限';
        }
        
        document.body.appendChild(popup);
        
        // 3秒后移除
        setTimeout(() => {
            if (popup && popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 3000);
    }
    
    // ==================== 输入监控和主题管理 ====================
    
    // 监控输入框
    function monitorSearchInputs() {
        console.log('开始监控输入框...');
        
        // 更新用户信息
        updateCurrentUser();
        
        // 如果是Resonance用户
        if (window.isResonanceUser()) {
            console.log('Resonance用户，应用永久主题');
            document.body.classList.add('resonance-theme');
            
            // 确保主题不会被移除
            const observer = new MutationObserver(function(mutations) {
                for (const mutation of mutations) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (!document.body.classList.contains('resonance-theme')) {
                            document.body.classList.add('resonance-theme');
                        }
                    }
                }
            });
            
            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['class']
            });
            
            return;
        }
        
        // 监控所有输入框
        const inputs = document.querySelectorAll('input[type="text"], input[type="search"], textarea');
        console.log('找到输入框数量:', inputs.length);
        
        inputs.forEach(input => {
            if (!input.dataset.monitoring) {
                // 输入事件
                input.addEventListener('input', function() {
                    const value = this.value;
                    const matched = KEYWORDS.some(keyword => 
                        value.toLowerCase().includes(keyword.toLowerCase())
                    );
                    
                    if (matched) {
                        console.log('输入时匹配到关键词:', value);
                        document.body.classList.add('resonance-theme');
                        lastMatchedTime = Date.now();
                        clearTimeout(themeTimer);
                    } else {
                        scheduleThemeRemoval(3000);
                    }
                });
                
                // 回车键事件
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.keyCode === 13) {
                        const value = this.value;
                        
                        // 检查是否触发了特殊搜索
                        const handled = window.handleSearch(value);
                        
                        if (!handled) {
                            // 普通关键词匹配
                            const matched = KEYWORDS.some(keyword => 
                                value.toLowerCase().includes(keyword.toLowerCase())
                            );
                            
                            if (matched) {
                                console.log('回车搜索匹配到关键词');
                                document.body.classList.add('resonance-theme');
                                lastMatchedTime = Date.now();
                                clearTimeout(themeTimer);
                                scheduleThemeRemoval(5000); // 5秒
                            }
                        }
                    }
                });
                
                input.dataset.monitoring = 'true';
            }
        });
    }
    
    // 安排主题移除
    function scheduleThemeRemoval(delay = 5000) {
        clearTimeout(themeTimer);
        
        const timeSinceLastMatch = Date.now() - lastMatchedTime;
        if (timeSinceLastMatch < delay) {
            const remainingTime = delay - timeSinceLastMatch;
            themeTimer = setTimeout(() => {
                if (!window.isResonanceUser()) {
                    document.body.classList.remove('resonance-theme');
                }
            }, remainingTime);
        } else {
            themeTimer = setTimeout(() => {
                if (!window.isResonanceUser()) {
                    document.body.classList.remove('resonance-theme');
                }
            }, delay);
        }
    }
    
    // ==================== 初始化 ====================
    
    // 初始化函数
    function init() {
        console.log('初始化tanchuang.js...');
        
        // 更新用户信息
        updateCurrentUser();
        console.log('当前用户:', currentUser);
        
        // 如果是Resonance用户，立即应用主题
        if (window.isResonanceUser()) {
            document.body.classList.add('resonance-theme');
            console.log('Resonance用户，应用永久主题');
        }
        
        // 监控输入框
        setTimeout(() => {
            monitorSearchInputs();
        }, 1000);
        
        // 监听动态内容加载
        const observer = new MutationObserver(function(mutations) {
            setTimeout(monitorSearchInputs, 500);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('tanchuang.js初始化完成');
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();