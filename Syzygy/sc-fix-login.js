(function() {
    'use strict';

    console.log('搜索权限修复模块加载...');

    // ====== 核心修复：在搜索前检查登录状态 ======
    
    /**
     * 修复搜索功能 - 添加登录检查
     */
    function fixSearchAuth() {
        // 方法1：重写 performSearch 函数
        if (typeof window.performSearch === 'function') {
            const originalPerformSearch = window.performSearch;
            
            window.performSearch = function() {
                // 检查是否已登录
                if (!window.currentUser) {
                    showLoginRequiredForSearch();
                    return;
                }
                
                // 调用原始搜索函数
                return originalPerformSearch.apply(this, arguments);
            };
            
            // 保留原始函数的属性
            Object.keys(originalPerformSearch).forEach(key => {
                window.performSearch[key] = originalPerformSearch[key];
            });
            
            console.log('已重写 performSearch 函数，添加登录检查');
        }
        
        // 方法2：直接拦截搜索按钮点击
        function interceptSearchButton() {
            const searchBtn = document.getElementById('search-btn');
            if (searchBtn) {
                // 保存原始点击事件
                const originalClick = searchBtn.onclick;
                
                searchBtn.onclick = function(e) {
                    // 检查登录状态
                    if (!window.currentUser) {
                        e.preventDefault();
                        e.stopPropagation();
                        showLoginRequiredForSearch();
                        return false;
                    }
                    
                    // 调用原始点击事件
                    if (originalClick) {
                        return originalClick.apply(this, arguments);
                    }
                };
                
                console.log('已拦截搜索按钮点击事件');
            }
        }
        
        // 方法3：拦截搜索输入框的回车键
        function interceptSearchInput() {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        if (!window.currentUser) {
                            e.preventDefault();
                            e.stopPropagation();
                            showLoginRequiredForSearch();
                        }
                    }
                }, true);
                
                console.log('已拦截搜索输入框回车键');
            }
        }
        
        // 初始化拦截
        setTimeout(() => {
            interceptSearchButton();
            interceptSearchInput();
        }, 1000);
        
        // 定期检查（处理动态加载的按钮）
        setInterval(() => {
            const searchBtn = document.getElementById('search-btn');
            if (searchBtn && !searchBtn.getAttribute('data-auth-checked')) {
                searchBtn.setAttribute('data-auth-checked', 'true');
                
                searchBtn.addEventListener('click', function(e) {
                    if (!window.currentUser) {
                        e.preventDefault();
                        e.stopPropagation();
                        showLoginRequiredForSearch();
                        return false;
                    }
                }, true);
            }
        }, 2000);
    }
    
    /**
     * 显示登录提示
     */
    function showLoginRequiredForSearch() {
        // 清除主内容区域
        const main = document.getElementById('main-posts');
        if (main) {
            while (main.firstChild) {
                main.removeChild(main.firstChild);
            }
            
            // 创建登录提示卡片
            const loginPrompt = document.createElement('div');
            loginPrompt.className = 'login-prompt';
            loginPrompt.style.cssText = `
                text-align: center;
                padding: 40px 20px;
                margin: 40px auto;
                max-width: 500px;
                background: #f8f9fa;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            `;
            
            loginPrompt.innerHTML = `
                <div style="font-size: 48px; margin-bottom: 20px; color: #6c757d;">🔍</div>
                <h3 style="color: #343a40; margin-bottom: 15px;">需要登录才能搜索</h3>
                <p style="color: #6c757d; margin-bottom: 25px; line-height: 1.6;">
                    搜索功能仅对已登录用户开放。<br>
                    请先登录或注册账户以使用搜索功能。
                </p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button id="prompt-login-btn" style="
                        padding: 12px 24px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 500;
                    ">
                        立即登录
                    </button>
                    <button id="prompt-register-btn" style="
                        padding: 12px 24px;
                        background: #28a745;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 500;
                    ">
                        注册新账户
                    </button>
                </div>
                <p style="margin-top: 20px; color: #999; font-size: 14px;">
                   
                </p>
            `;
            
            main.appendChild(loginPrompt);
            
            // 添加按钮事件
            setTimeout(() => {
                const loginBtn = document.getElementById('prompt-login-btn');
                const registerBtn = document.getElementById('prompt-register-btn');
                
                if (loginBtn) {
                    loginBtn.addEventListener('click', function() {
                        const loginModal = document.getElementById('login-modal');
                        if (loginModal) {
                            loginModal.style.display = 'block';
                        } else {
                            // 如果模态框不存在，尝试调用登录函数
                            if (typeof window.showLoginModal === 'function') {
                                window.showLoginModal();
                            } else {
                                alert('请点击页面右上角的登录按钮');
                            }
                        }
                    });
                }
                
                if (registerBtn) {
                    registerBtn.addEventListener('click', function() {
                        const registerModal = document.getElementById('register-modal');
                        if (registerModal) {
                            registerModal.style.display = 'block';
                        } else {
                            // 如果模态框不存在，尝试调用注册函数
                            if (typeof window.showRegisterModal === 'function') {
                                window.showRegisterModal();
                            } else {
                                alert('请点击页面右上角的注册按钮');
                            }
                        }
                    });
                }
            }, 100);
        }
        
        // 也可以显示一个通知
        showNotification('请先登录以使用搜索功能');
    }
    
    /**
     * 显示通知
     */
    function showNotification(message) {
        // 移除旧的通知
        const oldNotification = document.getElementById('search-auth-notification');
        if (oldNotification) {
            oldNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.id = 'search-auth-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            font-size: 14px;
        `;
        
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 3秒后自动消失
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
        
        // 添加动画样式
        if (!document.getElementById('search-auth-styles')) {
            const style = document.createElement('style');
            style.id = 'search-auth-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // ====== 修复页面加载时的搜索框状态 ======
    
    /**
     * 修复搜索UI状态
     */
    function fixSearchUI() {
        // 检查当前用户状态并更新搜索框提示
        function updateSearchPlaceholder() {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                if (!window.currentUser) {
                    searchInput.placeholder = '请登录后搜索...';
                    searchInput.style.backgroundColor = '#f8f9fa';
                    searchInput.style.cursor = 'not-allowed';
                    searchInput.readOnly = true;
                    
                    // 点击搜索框时提示登录
                    searchInput.addEventListener('click', function(e) {
                        if (!window.currentUser) {
                            e.preventDefault();
                            showLoginRequiredForSearch();
                        }
                    }, true);
                } else {
                    searchInput.placeholder = '搜索帖子、用户...';
                    searchInput.style.backgroundColor = '';
                    searchInput.style.cursor = '';
                    searchInput.readOnly = false;
                }
            }
        }
        
        // 初始更新
        updateSearchPlaceholder();
        
        // 监听用户状态变化
        let lastUserState = window.currentUser;
        setInterval(() => {
            if (window.currentUser !== lastUserState) {
                lastUserState = window.currentUser;
                updateSearchPlaceholder();
            }
        }, 1000);
    }
    
    // ====== 兼容性修复 ======
    
    /**
     * 确保与现有代码兼容
     */
    function ensureCompatibility() {
        // 保护原始的搜索函数引用（如果有其他代码依赖它）
        if (window.performSearch && !window._originalPerformSearch) {
            window._originalPerformSearch = window.performSearch;
        }
        
        // 监听页面变化，重新应用修复
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // 如果有新的搜索相关元素添加，重新应用修复
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            if (node.id === 'search-btn' || 
                                node.id === 'search-input' || 
                                node.querySelector && node.querySelector('#search-btn, #search-input')) {
                                setTimeout(fixSearchAuth, 100);
                                setTimeout(fixSearchUI, 100);
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // ====== 初始化 ======
    
    function init() {
        console.log('初始化搜索权限修复...');
        
        // 等待页面加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(() => {
                    fixSearchAuth();
                    fixSearchUI();
                    ensureCompatibility();
                }, 500);
            });
        } else {
            setTimeout(() => {
                fixSearchAuth();
                fixSearchUI();
                ensureCompatibility();
            }, 500);
        }
        
        // 延迟加载，确保其他脚本先执行
        setTimeout(() => {
            // 重新检查并应用修复
            fixSearchAuth();
            fixSearchUI();
        }, 1500);
        
        // 定期检查（处理动态加载的内容）
        setInterval(() => {
            const searchBtn = document.getElementById('search-btn');
            const searchInput = document.getElementById('search-input');
            
            if (searchBtn && !searchBtn.getAttribute('data-auth-fixed')) {
                fixSearchAuth();
            }
            
            if (searchInput && !searchInput.getAttribute('data-ui-fixed')) {
                fixSearchUI();
            }
        }, 2000);
    }
    
    // ====== 启动 ======
    
    // 延迟启动，确保不与其他脚本冲突
    setTimeout(init, 800);
    
    // 导出函数供调试
    window.searchAuthFix = {
        version: '1.0',
        init: init,
        checkAuth: function() {
            return !!window.currentUser;
        },
        showLoginPrompt: showLoginRequiredForSearch,
        testSearch: function(query) {
            if (!window.currentUser) {
                showLoginRequiredForSearch();
                return false;
            }
            
            if (typeof window.performSearch === 'function') {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.value = query;
                    window.performSearch();
                    return true;
                }
            }
            return false;
        }
    };
    
    console.log('搜索权限修复模块已加载完成');

})();