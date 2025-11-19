/* fix auth 19日晚上修改片段已标出 */

// auth.js - 静乔公寓论坛登录注册功能
// 专门为苹果Safari优化，兼容iPhone 16 Pro和iPad
// 修复iOS平板无法登录问题 - 精简版本，不影响网页端

(function() {
    'use strict';
    
    // 防止重复初始化
    if (window.authSystemInitialized) {
        return;
    }
    window.authSystemInitialized = true;

    // 全局变量
    let authCurrentUser = null;
    let authRegisteredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    let authUserProfiles = JSON.parse(localStorage.getItem('userProfiles')) || {};
    
    // 防止重复提交标志
    let isProcessing = false;

    // 简单的DOM加载检测
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuthSystem);
    } else {
        setTimeout(initAuthSystem, 100);
    }

    // 初始化认证系统 - 精简版本
    function initAuthSystem() {
        try {
            bindAuthEvents();
            checkAutoLogin();
            updateAuthState();
            console.log('Auth system initialized successfully');
        } catch (error) {
            console.error('Auth system initialization failed:', error);
        }
    }

    // 绑定认证相关事件 - 精简版本
    function bindAuthEvents() {
        bindSpecificEvents();
        bindModalEvents();
        
        // 点击模态框外部关闭
        document.addEventListener('click', function(event) {
            const loginModal = document.getElementById('login-modal');
            const registerModal = document.getElementById('register-modal');
            
            if (event.target === loginModal) {
                loginModal.style.display = 'none';
            }
            if (event.target === registerModal) {
                registerModal.style.display = 'none';
            }
        });

        // 键盘事件支持
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeAllModals();
            }
        });
    }

    // 精确绑定事件
    function bindSpecificEvents() {
        // 登录按钮 - 仅添加iOS触摸支持
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', showLoginModal);
            // 仅为iOS设备添加触摸支持
            if (isIOSDevice()) {
                loginBtn.addEventListener('touchend', showLoginModal);
            }
        }

        // 注册按钮
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', showRegisterModal);
            if (isIOSDevice()) {
                registerBtn.addEventListener('touchend', showRegisterModal);
            }
        }

        // 退出按钮
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        // 登录提交
        const loginSubmit = document.getElementById('login-submit');
        if (loginSubmit) {
            loginSubmit.addEventListener('click', handleLogin);
        }

        // 注册提交
        const registerSubmit = document.getElementById('register-submit');
        if (registerSubmit) {
            registerSubmit.addEventListener('click', handleRegister);
        }

        // 模态框切换
        const showRegisterFromLogin = document.getElementById('show-register-from-login');
        if (showRegisterFromLogin) {
            showRegisterFromLogin.addEventListener('click', switchToRegister);
        }

        const showLoginFromRegister = document.getElementById('show-login-from-register');
        if (showLoginFromRegister) {
            showLoginFromRegister.addEventListener('click', switchToLogin);
        }

        // 输入框回车事件
        bindInputEvents();
    }

    // 检测iOS设备
    function isIOSDevice() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    // 绑定输入框事件
    function bindInputEvents() {
        const loginUsername = document.getElementById('login-username');
        const loginPassword = document.getElementById('login-password');
        const registerUsername = document.getElementById('register-username');

        if (loginUsername) {
            loginUsername.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleLogin(event);
                }
            });
        }

        if (loginPassword) {
            loginPassword.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleLogin(event);
                }
            });
        }

        if (registerUsername) {
            registerUsername.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    handleRegister(event);
                }
            });
        }
    }

    // 绑定模态框事件
    function bindModalEvents() {
        const closeLogin = document.getElementById('close-login');
        const closeRegister = document.getElementById('close-register');

        if (closeLogin) {
            closeLogin.addEventListener('click', function() {
                document.getElementById('login-modal').style.display = 'none';
            });
        }

        if (closeRegister) {
            closeRegister.addEventListener('click', function() {
                document.getElementById('register-modal').style.display = 'none';
            });
        }
    }

    // 显示登录模态框 - 仅对iOS进行特殊处理
    function showLoginModal(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        if (isProcessing) return;
        
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.style.display = 'block';
            
            // 仅为iOS设备添加延迟聚焦
            if (isIOSDevice()) {
                setTimeout(() => {
                    const usernameInput = document.getElementById('login-username');
                    if (usernameInput) {
                        usernameInput.focus();
                    }
                }, 300);
            }
        }
    }

    // 显示注册模态框
    function showRegisterModal(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        if (isProcessing) return;
        
        const registerModal = document.getElementById('register-modal');
        if (registerModal) {
            registerModal.style.display = 'block';
            
            if (isIOSDevice()) {
                setTimeout(() => {
                    const usernameInput = document.getElementById('register-username');
                    if (usernameInput) {
                        usernameInput.focus();
                    }
                }, 300);
            }
        }
    }

    // 关闭所有模态框
    function closeAllModals() {
        const modals = document.querySelectorAll('.login-modal, .register-modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // 切换到注册
    function switchToRegister() {
        if (isProcessing) return;
        
        closeAllModals();
        setTimeout(() => {
            showRegisterModal();
        }, 50);
    }

    // 切换到登录
    function switchToLogin() {
        if (isProcessing) return;
        
        closeAllModals();
        setTimeout(() => {
            showLoginModal();
        }, 50);
    }

    // 处理登录
    function handleLogin(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        if (isProcessing) return;
        
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const loginSubmit = document.getElementById('login-submit');
        
        if (!usernameInput || !passwordInput) return;
        
        const rawUsername = usernameInput.value;
        const username = rawUsername.trim();
        const password = passwordInput.value;
        
        // 清除之前的错误提示
        clearErrorMessages('login');
        
        if (rawUsername === '') {
            showErrorMessage('login', '请输入用户名');
            usernameInput.focus();
            return;
        }

        if (username === '') {
            usernameInput.value = '';
            showErrorMessage('login', '用户名不能为空');
            usernameInput.focus();
            return;
        }
        
        if (password === '') {
            showErrorMessage('login', '请输入密码');
            passwordInput.focus();
            return;
        }
        
        isProcessing = true;
        if (loginSubmit) {
            loginSubmit.disabled = true;
            loginSubmit.textContent = '登录中...';
        }
        
        setTimeout(() => {
            performLogin(username, password, loginSubmit);
        }, 100);
    }

    // 处理注册
    function handleRegister(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        if (isProcessing) return;
        
        const usernameInput = document.getElementById('register-username');
        const passwordInput = document.getElementById('register-password-hidden');
        const registerSubmit = document.getElementById('register-submit');
        
        if (!usernameInput) return;
        
        const rawUsername = usernameInput.value;
        const username = rawUsername.trim();
        const password = passwordInput ? passwordInput.value : 'jq3307';
        
        clearErrorMessages('register');
        
        if (rawUsername === '') {
            showErrorMessage('register', '请输入用户名！');
            usernameInput.focus();
            return;
        }
        
        if (username === '') {
            usernameInput.value = '';
            showErrorMessage('register', '用户名不能为空！');
            usernameInput.focus();
            return;
        }
        
        isProcessing = true;
        if (registerSubmit) {
            registerSubmit.disabled = true;
            registerSubmit.textContent = '注册中...';
        }
        
        setTimeout(() => {
            performRegister(username, password, registerSubmit);
        }, 100);
    }

    // 执行登录逻辑
    function performLogin(username, password, loginSubmit) {
        let loginSuccess = false;

        try {
            if (typeof validateUser === 'function' && validateUser(username, password)) {
                authCurrentUser = username;
                initAuthUserProfile(username);
                updateAuthState();
                closeAllModals();
                clearLoginForm();
                // ========== 修改位置 1 ==========
                // 注释原因：避免重复提醒，已有其他JS文件显示成功消息
                // 功能：原本显示"登录成功！欢迎进入系统模式。"的页面内消息
                // 现在由其他JS文件统一处理成功提醒，避免重复弹窗
                // showSuccessMessage('login', '登录成功！欢迎进入系统模式。');
                loginSuccess = true;
            }
            else if (typeof validateLinmoUser === 'function' && validateLinmoUser(username, password)) {
                authCurrentUser = username;
                initAuthUserProfile(username);
                updateAuthState();
                closeAllModals();
                clearLoginForm();
                // ========== 修改位置 2 ==========
                // 注释原因：避免重复提醒，已有其他JS文件显示成功消息
                // 功能：原本显示"登录成功！欢迎林中的猫！"的页面内消息
                // showSuccessMessage('login', '登录成功！欢迎林中的猫！');
                loginSuccess = true;
            }
            else if (authRegisteredUsers.some(user => user.username === username && user.password === password)) {
                authCurrentUser = username;
                initAuthUserProfile(username);
                updateAuthState();
                closeAllModals();
                clearLoginForm();
                // ========== 修改位置 3 ==========
                // 注释原因：避免重复提醒，已有其他JS文件显示成功消息
                // 功能：原本显示"登录成功！"的页面内消息
                // showSuccessMessage('login', '登录成功！');
                loginSuccess = true;
            }
            else {
                showErrorMessage('login', '用户名或密码错误！');
            }
        } finally {
            if (loginSubmit) {
                loginSubmit.disabled = false;
                loginSubmit.textContent = '登录';
            }
            isProcessing = false;
        }
        
        if (loginSuccess && typeof renderSection === 'function') {
            setTimeout(() => {
                renderSection('首页');
            }, 500);
        }
    }

    // 执行注册逻辑
    function performRegister(username, password, registerSubmit) {
        try {
            if (authRegisteredUsers.some(user => user.username.toLowerCase() === username.toLowerCase())) {
                showErrorMessage('register', '用户名已存在，请选择其他用户名！');
                return;
            }

            if (username.toLowerCase() === 'resonance' || username.toLowerCase() === '林中的猫') {
                showErrorMessage('register', '用户名已存在，请选择其他用户名！');
                return;
            }

            authRegisteredUsers.push({ username, password });
            localStorage.setItem('registeredUsers', JSON.stringify(authRegisteredUsers));

            initAuthUserProfile(username);

            // ========== 修改位置 4 ==========
            // 注释原因：避免重复提醒，已有其他JS文件显示成功消息
            // 功能：原本显示注册成功消息的页面内消息
            // 现在由其他JS文件统一处理成功提醒，避免重复弹窗
            // showSuccessMessage('register', `注册成功！您的用户名是：${username}。您可以使用此用户名登录。`);
            closeAllModals();
            document.getElementById('register-username').value = '';
            
            setTimeout(() => {
                showLoginModal();
                document.getElementById('login-username').value = username;
            }, 1000);
        } finally {
            if (registerSubmit) {
                registerSubmit.disabled = false;
                registerSubmit.textContent = '注册';
            }
            isProcessing = false;
        }
    }

    // 初始化用户个人数据
    function initAuthUserProfile(username) {
        if (!authUserProfiles[username]) {
            if (username === '林中的猫') {
                authUserProfiles[username] = {
                    registerTime: '2022-9-12',
                    displayName: '林中的猫',
                    privateLogs: [
                        '2022年9月12日，天气晴  又一次的搬家。',
                        '2025年9月6日，要去执行一项很危险的行动了，希望这次一切顺利。'
                    ]
                };
            } else {
                authUserProfiles[username] = {
                    registerTime: new Date().toISOString().split('T')[0],
                    displayName: username,
                    privateLogs: [
                        `${new Date().toISOString().split('T')[0]} 注册账户`,
                        `${new Date().toISOString().split('T')[0]} 首次登录`
                    ]
                };
            }
            localStorage.setItem('userProfiles', JSON.stringify(authUserProfiles));
        }
        
        if (typeof window !== 'undefined') {
            window.currentUser = username;
            localStorage.setItem('lastLoginUser', username);
        }
    }

    // 处理退出登录
    /* function handleLogout() {
        if (isProcessing) return;
        
        if (confirm('确定要退出登录吗？')) {
            authCurrentUser = null;
            if (typeof window !== 'undefined') {
                window.currentUser = null;
                localStorage.removeItem('lastLoginUser');
            }
            updateAuthState();
            // ========== 修改位置 5 ==========
            // 注释原因：避免重复提醒，已有其他JS文件显示成功消息
            // 功能：原本显示退出登录成功消息的页面内消息
            // showSuccessMessage('global', '已成功退出登录');
        }
    } 11.19日晚修改！*/
   // 处理退出登录 - 修复版本
function handleLogout() {
    if (isProcessing) return;
    
    if (confirm('确定要退出登录吗？')) {
        authCurrentUser = null;
        if (typeof window !== 'undefined') {
            window.currentUser = null;
            localStorage.removeItem('lastLoginUser');
        }
        updateAuthState();
        
        // ========== 修复位置 ==========
        // 关键修复：退出登录后强制重新渲染首页，恢复所有特殊样式
        if (typeof renderSection === 'function') {
            setTimeout(() => {
                renderSection('首页'); // 重新渲染首页，恢复所有样式
            }, 100);
        }
        
        // 确保所有模态框都关闭
        closeAllModals();
        
        // 清除所有表单数据
        clearLoginForm();
        const registerUsername = document.getElementById('register-username');
        if (registerUsername) registerUsername.value = '';
        
        console.log('用户已退出登录，页面状态已重置');
    }
}

// 更新认证状态 - 增强版本
function updateAuthState() {
    const user = authCurrentUser || (typeof window !== 'undefined' ? window.currentUser : null);
    
    if (user) {
        // 用户已登录状态
        const authButtons = document.getElementById('auth-buttons-container');
        const userInfo = document.getElementById('user-info');
        const usernameDisplay = document.getElementById('username-display');
        
        if (authButtons) authButtons.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (usernameDisplay) usernameDisplay.textContent = user;
        
        // 移除登录提示
        const mainPosts = document.getElementById('main-posts');
        if (mainPosts) {
            const loginPrompt = mainPosts.querySelector('.login-prompt');
            if (loginPrompt) {
                loginPrompt.remove();
            }
        }
    } else {
        // 用户未登录状态 - 确保完全重置
        const authButtons = document.getElementById('auth-buttons-container');
        const userInfo = document.getElementById('user-info');
        
        if (authButtons) {
            authButtons.style.display = 'flex';
            authButtons.style.visibility = 'visible';
        }
        if (userInfo) {
            userInfo.style.display = 'none';
            userInfo.style.visibility = 'hidden';
        }
        
        // 确保显示登录提示
        const mainPosts = document.getElementById('main-posts');
        if (mainPosts && !mainPosts.querySelector('.login-prompt')) {
            const promptDiv = document.createElement('div');
            promptDiv.className = 'login-prompt';
            promptDiv.innerHTML = '<p>请先 <span class="login-required">登录</span> 或 <span class="login-required">注册</span> 以浏览内容</p>';
            mainPosts.appendChild(promptDiv);
        }
        
        // ========== 重要修复 ==========
        // 强制重新应用未登录状态的特殊样式
        setTimeout(() => {
            // 触发自定义事件，通知其他组件用户状态已改变
            const event = new CustomEvent('authStateChanged', { 
                detail: { isLoggedIn: false, username: null }
            });
            document.dispatchEvent(event);
            
            // 如果存在渲染函数，确保页面样式正确
            if (typeof renderSection === 'function') {
                const currentSection = document.querySelector('.nav-item.active');
                if (currentSection && currentSection.textContent.includes('首页')) {
                    // 如果当前在首页，重新应用样式
                    renderSection('首页');
                }
            }
        }, 50);
    }
}

    // 更新认证状态
    function updateAuthState() {
        const user = authCurrentUser || (typeof window !== 'undefined' ? window.currentUser : null);
        
        if (user) {
            const authButtons = document.getElementById('auth-buttons-container');
            const userInfo = document.getElementById('user-info');
            const usernameDisplay = document.getElementById('username-display');
            
            if (authButtons) authButtons.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            if (usernameDisplay) usernameDisplay.textContent = user;
            
            const mainPosts = document.getElementById('main-posts');
            if (mainPosts) {
                const loginPrompt = mainPosts.querySelector('.login-prompt');
                if (loginPrompt) {
                    loginPrompt.remove();
                }
            }
        } else {
            const authButtons = document.getElementById('auth-buttons-container');
            const userInfo = document.getElementById('user-info');
            
            if (authButtons) authButtons.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';
            
            const mainPosts = document.getElementById('main-posts');
            if (mainPosts && !mainPosts.querySelector('.login-prompt')) {
                const promptDiv = document.createElement('div');
                promptDiv.className = 'login-prompt';
                promptDiv.innerHTML = '<p>请先 <span class="login-required">登录</span> 或 <span class="login-required">注册</span> 以浏览内容</p>';
                mainPosts.appendChild(promptDiv);
            }
        }
    }

    // 检查自动登录
    function checkAutoLogin() {
        const savedUser = localStorage.getItem('lastLoginUser');
        if (savedUser && typeof window !== 'undefined') {
            window.currentUser = savedUser;
            authCurrentUser = savedUser;
            updateAuthState();
        }
    }

    // 工具函数：显示错误信息
    function showErrorMessage(context, message) {
        let container;
        if (context === 'login') {
            container = document.getElementById('login-error-message');
            if (!container) {
                container = document.createElement('div');
                container.id = 'login-error-message';
                container.className = 'error-message';
                const loginForm = document.getElementById('login-form');
                if (loginForm) {
                    loginForm.insertBefore(container, loginForm.firstChild);
                }
            }
        } else if (context === 'register') {
            container = document.getElementById('register-error-message');
            if (!container) {
                container = document.createElement('div');
                container.id = 'register-error-message';
                container.className = 'error-message';
                const registerForm = document.getElementById('register-form');
                if (registerForm) {
                    registerForm.insertBefore(container, registerForm.firstChild);
                }
            }
        }
        
        if (container) {
            container.textContent = message;
            container.style.display = 'block';
        }
    }

    // 工具函数：显示成功信息
    function showSuccessMessage(context, message) {
        let container;
        if (context === 'login') {
            container = document.getElementById('login-success-message');
            if (!container) {
                container = document.createElement('div');
                container.id = 'login-success-message';
                container.className = 'success-message';
                const loginForm = document.getElementById('login-form');
                if (loginForm) {
                    loginForm.insertBefore(container, loginForm.firstChild);
                }
            }
        } else if (context === 'register') {
            container = document.getElementById('register-success-message');
            if (!container) {
                container = document.createElement('div');
                container.id = 'register-success-message';
                container.className = 'success-message';
                const registerForm = document.getElementById('register-form');
                if (registerForm) {
                    registerForm.insertBefore(container, registerForm.firstChild);
                }
            }
        }
        
        if (container) {
            container.textContent = message;
            container.style.display = 'block';
            
            setTimeout(() => {
                if (container && container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            }, 3000);
        }
    }

    // 工具函数：清除错误/成功信息
    function clearErrorMessages(context) {
        if (context === 'login') {
            const errorContainer = document.getElementById('login-error-message');
            const successContainer = document.getElementById('login-success-message');
            if (errorContainer) errorContainer.parentNode.removeChild(errorContainer);
            if (successContainer) successContainer.parentNode.removeChild(successContainer);
        } else if (context === 'register') {
            const errorContainer = document.getElementById('register-error-message');
            const successContainer = document.getElementById('register-success-message');
            if (errorContainer) errorContainer.parentNode.removeChild(errorContainer);
            if (successContainer) successContainer.parentNode.removeChild(successContainer);
        }
    }

    // 工具函数：清除登录表单
    function clearLoginForm() {
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
        clearErrorMessages('login');
    }

    // 暴露必要的函数到全局作用域
    if (typeof window !== 'undefined') {
        window.authUpdateState = updateAuthState;
        window.authGetCurrentUser = function() { return authCurrentUser; };
    }

    console.log('Auth system loaded successfully - iOS optimized lite version');

})();

