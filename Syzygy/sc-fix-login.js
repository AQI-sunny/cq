(function() {
    'use strict';

    console.log('搜索权限修复模块 (兼容版 v2.0) 加载...');

    // ====== 1. 防止重复执行 ======
    const EXECUTION_MARKER = 'searchAuthFix_initialized';
    if (window[EXECUTION_MARKER]) {
        return; // 如果已经运行过，直接退出
    }
    window[EXECUTION_MARKER] = true;

    // ====== 配置 ======
    const CONFIG = {
        // 白名单：即使未登录也允许搜索的词（解决与 tanzi.js 的冲突）
        ALLOW_KEYWORDS: ['坛子'], 
        INPUT_ID: 'search-input',
        BTN_ID: 'search-btn'
    };

    // ====== 2. 核心修复：安全的函数劫持 ======
    function fixSearchAuth() {
        // 如果已经处理过，不再重复包裹
        if (window.performSearch && window.performSearch._authFixed) {
            return;
        }

        // 保存原始函数（可能是原生的，也可能是 tanzi.js 包装过的）
        // 如果页面还没加载 performSearch，给一个空函数占位
        let originalPerformSearch = window.performSearch || function() {
            console.warn('原始搜索函数未定义');
        };

        // 重写 performSearch
        window.performSearch = function() {
            // 获取当前搜索词
            const searchInput = document.getElementById(CONFIG.INPUT_ID);
            const query = searchInput ? searchInput.value.trim() : '';

            // 权限判断逻辑：
            // 1. 如果用户已登录 (window.currentUser 存在) -> 放行
            // 2. 或者搜索词是 "坛子" (白名单) -> 放行
            if (window.currentUser || CONFIG.ALLOW_KEYWORDS.includes(query)) {
                // 调用原始逻辑（这样 tanzi.js 就能收到调用了）
                return originalPerformSearch.apply(this, arguments);
            }

            // 否则 -> 拦截并显示提示
            console.log(`拦截未登录搜索: ${query}`);
            showLoginRequiredForSearch();
            return false;
        };

        // 标记已修复，并保留原始属性
        window.performSearch._authFixed = true;
        for (let key in originalPerformSearch) {
            if (originalPerformSearch.hasOwnProperty(key)) {
                window.performSearch[key] = originalPerformSearch[key];
            }
        }
        
        console.log('搜索权限已修复 (已允许特权关键词)');
    }

    // ====== 3. UI 交互修复 ======
    function fixSearchUI() {
        const searchInput = document.getElementById(CONFIG.INPUT_ID);
        if (!searchInput) return;

        // 仅修改提示文字，不禁用输入框，否则没法输入"坛子"
        if (!window.currentUser) {
            if (!CONFIG.ALLOW_KEYWORDS.includes(searchInput.value.trim())) {
                searchInput.placeholder = '请登录后搜索...';
            }
        } else {
            searchInput.placeholder = '搜索帖子、用户...';
        }
    }
    
    // 监听输入：如果用户输入了"坛子"，去掉警告色
    function setupInputListener() {
        const searchInput = document.getElementById(CONFIG.INPUT_ID);
        if (searchInput && !searchInput._uiListenerAttached) {
            searchInput.addEventListener('input', function() {
                if (!window.currentUser) {
                    if (CONFIG.ALLOW_KEYWORDS.includes(this.value.trim())) {
                        this.style.backgroundColor = ''; // 恢复正常
                    }
                }
            });
            searchInput._uiListenerAttached = true;
        }
    }

    // ====== 4. 弹窗提示逻辑 ======
    function showLoginRequiredForSearch() {
        // 移除旧提示
        const oldPrompt = document.querySelector('.search-login-prompt');
        if (oldPrompt) oldPrompt.remove();
        
        const main = document.getElementById('main-posts');
        // 如果找不到主区域或者主区域已经有内容，只显示右上角通知
        if (!main || main.querySelector('.post, .result')) {
            showNotification('请先登录以使用搜索功能');
            return;
        }
        
        // 创建大卡片提示
        const loginPrompt = document.createElement('div');
        loginPrompt.className = 'search-login-prompt';
        loginPrompt.style.cssText = `
            text-align: center; padding: 40px 20px; margin: 40px auto;
            max-width: 500px; background: #f8f9fa; border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); animation: fadeIn 0.3s ease-out;
        `;
        
        loginPrompt.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
            <h3 style="color: #343a40; margin-bottom: 15px;">需要登录</h3>
            <p style="color: #6c757d; margin-bottom: 25px;">搜索功能仅对已登录用户开放。</p>
            <button id="prompt-login-btn" style="padding: 10px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">登录</button>
        `;
        
        main.appendChild(loginPrompt);
        
        document.getElementById('prompt-login-btn').onclick = function(e) {
            e.preventDefault();
            const loginModal = document.getElementById('login-modal');
            if (loginModal) loginModal.style.display = 'block';
            else if (typeof window.showLoginModal === 'function') window.showLoginModal();
            else alert('请点击右上角登录');
        };
    }
    
    function showNotification(msg) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed; top: 20px; right: 20px; background: #dc3545; color: white;
            padding: 12px 20px; border-radius: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000; animation: fadeIn 0.3s;
        `;
        notif.textContent = msg;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    }
    
    // 添加基础样式
    const style = document.createElement('style');
    style.textContent = `@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`;
    document.head.appendChild(style);

    // ====== 5. 启动 ======
    function init() {
        fixSearchAuth();
        fixSearchUI();
        setupInputListener();

        // 简单的轮询，检查用户登录状态变化
        let lastUser = window.currentUser;
        setInterval(() => {
            if (window.currentUser !== lastUser) {
                lastUser = window.currentUser;
                fixSearchUI();
            }
        }, 1000);
        
        // 简单的观察器，只处理动态添加的搜索框，不再重置核心逻辑
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            for (const m of mutations) {
                if (m.type === 'childList') {
                    for (const node of m.addedNodes) {
                        if (node.nodeType === 1 && 
                           (node.id === CONFIG.BTN_ID || node.id === CONFIG.INPUT_ID)) {
                            shouldUpdate = true;
                        }
                    }
                }
            }
            if (shouldUpdate) {
                setTimeout(() => { fixSearchAuth(); fixSearchUI(); setupInputListener(); }, 100);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(init, 300));
    } else {
        setTimeout(init, 300);
    }

})();
