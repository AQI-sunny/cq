// auth.js - 静乔公寓论坛登录注册功能
// 专门为苹果Safari优化，兼容iPhone 16 Pro
// 新增文件，不修改现有代码

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
    let authPrivateMessages = JSON.parse(localStorage.getItem('privateMessages')) || {};
    
    // 防止重复提交标志
    let isProcessing = false;

    // DOM加载完成后初始化
    document.addEventListener('DOMContentLoaded', function() {
        // 延迟初始化以确保DOM完全加载
        setTimeout(initAuthSystem, 100);
    });

    // 初始化认证系统
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

    // 绑定认证相关事件 - Safari兼容版本
    function bindAuthEvents() {
        // 使用更精确的事件绑定，避免事件委托的频繁触发
        bindSpecificEvents();
        
        // 模态框关闭按钮
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

        // 键盘事件支持 - Safari兼容
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeAllModals();
            }
        });
    }

    // 精确绑定事件，避免频繁触发
    function bindSpecificEvents() {
        // 登录按钮
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                showLoginModal();
            });
        }

        // 注册按钮
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                showRegisterModal();
            });
        }

        // 退出按钮
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                handleLogout();
            });
        }

        // 登录提交
        const loginSubmit = document.getElementById('login-submit');
        if (loginSubmit) {
            loginSubmit.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                handleLogin(event);
            });
        }

        // 注册提交
        const registerSubmit = document.getElementById('register-submit');
        if (registerSubmit) {
            registerSubmit.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                handleRegister(event);
            });
        }

        // 密码显示切换
        const togglePassword = document.getElementById('toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                togglePasswordVisibility();
            });
        }

        // 模态框切换
        const showRegisterFromLogin = document.getElementById('show-register-from-login');
        if (showRegisterFromLogin) {
            showRegisterFromLogin.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                switchToRegister();
            });
        }

        const showLoginFromRegister = document.getElementById('show-login-from-register');
        if (showLoginFromRegister) {
            showLoginFromRegister.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                switchToLogin();
            });
        }

        // 输入框回车事件
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
            closeLogin.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                document.getElementById('login-modal').style.display = 'none';
            });
        }

        if (closeRegister) {
            closeRegister.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                document.getElementById('register-modal').style.display = 'none';
            });
        }
    }

    // 显示登录模态框 - Safari优化版本
    function showLoginModal() {
        if (isProcessing) return;
        
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.style.display = 'block';
            // Safari兼容的自动聚焦
            setTimeout(() => {
                const usernameInput = document.getElementById('login-username');
                if (usernameInput) {
                    usernameInput.focus();
                }
            }, 300);
        }
    }

    // 显示注册模态框
    function showRegisterModal() {
        if (isProcessing) return;
        
        const registerModal = document.getElementById('register-modal');
        if (registerModal) {
            registerModal.style.display = 'block';
            setTimeout(() => {
                const usernameInput = document.getElementById('register-username');
                if (usernameInput) {
                    usernameInput.focus();
                }
            }, 300);
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
            document.getElementById('register-modal').style.display = 'block';
        }, 50);
    }

    // 切换到登录
    function switchToLogin() {
        if (isProcessing) return;
        
        closeAllModals();
        setTimeout(() => {
            document.getElementById('login-modal').style.display = 'block';
        }, 50);
    }

    // 切换密码可见性
    function togglePasswordVisibility() {
        if (isProcessing) return;
        
        const passwordDisplay = document.getElementById('register-password-display');
        const toggleBtn = document.getElementById('toggle-password');
        
        if (passwordDisplay && toggleBtn) {
            if (passwordDisplay.type === 'password') {
                passwordDisplay.type = 'text';
                toggleBtn.textContent = '隐藏';
            } else {
                passwordDisplay.type = 'password';
                toggleBtn.textContent = '显示';
            }
        }
    }

    // 处理登录 - Safari兼容版本
    function handleLogin(event) {
        if (isProcessing) return;
        
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const loginSubmit = document.getElementById('login-submit');
        
        if (!usernameInput || !passwordInput || !loginSubmit) {
            return;
        }
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        // 输入验证
        if (!username) {
            // 只在确实没有输入时才提示
            if (usernameInput.value === '') {
                showAlert('请输入用户名');
            }
            return;
        }
        
        if (!password) {
            showAlert('请输入密码');
            return;
        }
        
        // 设置处理中标志
        isProcessing = true;
        
        // 禁用按钮防止重复提交
        loginSubmit.disabled = true;
        const originalText = loginSubmit.textContent;
        loginSubmit.textContent = '登录中...';
        
        // Safari兼容的异步处理
        setTimeout(() => {
            try {
                performLogin(username, password, loginSubmit, originalText);
            } catch (error) {
                console.error('Login error:', error);
                showAlert('登录过程中发生错误');
                resetButton(loginSubmit, originalText);
                isProcessing = false;
            }
        }, 100);
    }

    // 执行登录逻辑
    function performLogin(username, password, loginSubmit, originalText) {
        let loginSuccess = false;

        try {
            // 检查特殊用户Resonance
            if (typeof validateUser === 'function' && validateUser(username, password)) {
                authCurrentUser = username;
                initAuthUserProfile(username);
                updateAuthState();
                closeAllModals();
                clearLoginForm();
                showAlert('登录成功！欢迎进入系统模式。');
                loginSuccess = true;
            }
            // 检查linmo用户
            else if (typeof validateLinmoUser === 'function' && validateLinmoUser(username, password)) {
                authCurrentUser = username;
                initAuthUserProfile(username);
                updateAuthState();
                closeAllModals();
                clearLoginForm();
                showAlert('登录成功！欢迎林中的猫！');
                loginSuccess = true;
            }
            // 检查注册用户
            else if (authRegisteredUsers.some(user => user.username === username && user.password === password)) {
                authCurrentUser = username;
                initAuthUserProfile(username);
                updateAuthState();
                closeAllModals();
                clearLoginForm();
                showAlert('登录成功！');
                loginSuccess = true;
            }
            else {
                showAlert('用户名或密码错误！');
            }
        } finally {
            resetButton(loginSubmit, originalText);
            isProcessing = false;
        }
        
        if (loginSuccess && typeof renderSection === 'function') {
            setTimeout(() => {
                renderSection('首页');
            }, 500);
        }
    }

    // 处理注册 - Safari兼容版本
    function handleRegister(event) {
        if (isProcessing) return;
        
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        const usernameInput = document.getElementById('register-username');
        const registerSubmit = document.getElementById('register-submit');
        
        if (!usernameInput || !registerSubmit) {
            return;
        }
        
        const username = usernameInput.value.trim();
        const passwordInput = document.getElementById('register-password-hidden');
        const password = passwordInput ? passwordInput.value : 'jq3307'; // 默认密码
        
        if (!username) {
            // 只在确实没有输入时才提示
            if (usernameInput.value === '') {
                showAlert('请输入用户名！');
            }
            return;
        }
        
        // 设置处理中标志
        isProcessing = true;
        
        // 禁用按钮防止重复提交
        registerSubmit.disabled = true;
        const originalText = registerSubmit.textContent;
        registerSubmit.textContent = '注册中...';
        
        // Safari兼容的异步处理
        setTimeout(() => {
            try {
                performRegister(username, password, registerSubmit, originalText);
            } catch (error) {
                console.error('Register error:', error);
                showAlert('注册过程中发生错误');
                resetButton(registerSubmit, originalText);
                isProcessing = false;
            }
        }, 100);
    }

    // 执行注册逻辑
    function performRegister(username, password, registerSubmit, originalText) {
        try {
            // 检查用户名是否已存在
            if (authRegisteredUsers.some(user => user.username.toLowerCase() === username.toLowerCase())) {
                showAlert('用户名已存在，请选择其他用户名！');
                return;
            }

            // 检查是否为特殊用户（大小写不敏感）
            if (username.toLowerCase() === 'resonance' || username.toLowerCase() === '林中的猫') {
                showAlert('用户名已存在，请选择其他用户名！');
                return;
            }

            // 添加新用户到数组
            authRegisteredUsers.push({ username, password });
            // 保存到本地存储
            localStorage.setItem('registeredUsers', JSON.stringify(authRegisteredUsers));

            // 初始化用户个人数据
            initAuthUserProfile(username);

            showAlert(`注册成功！您的用户名是：${username}。您可以使用此用户名登录。`);
            closeAllModals();
            document.getElementById('register-username').value = '';
            
            // 自动切换到登录界面
            setTimeout(() => {
                document.getElementById('login-modal').style.display = 'block';
                document.getElementById('login-username').value = username;
            }, 1000);
        } finally {
            resetButton(registerSubmit, originalText);
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
        
        // 更新全局currentUser以保持与现有代码兼容
        if (typeof window !== 'undefined') {
            window.currentUser = username;
        }
    }

    // 处理退出登录
    function handleLogout() {
        if (isProcessing) return;
        
        if (confirm('确定要退出登录吗？')) {
            authCurrentUser = null;
            if (typeof window !== 'undefined') {
                window.currentUser = null;
            }
            updateAuthState();
            showAlert('已成功退出登录');
        }
    }

    // 更新认证状态
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
            // 用户未登录状态
            const authButtons = document.getElementById('auth-buttons-container');
            const userInfo = document.getElementById('user-info');
            
            if (authButtons) authButtons.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';
            
            // 显示登录提示
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
        // 可以从localStorage检查是否有保存的登录状态
        const savedUser = localStorage.getItem('lastLoginUser');
        if (savedUser && typeof window !== 'undefined') {
            window.currentUser = savedUser;
            authCurrentUser = savedUser;
            updateAuthState();
        }
    }

    // 工具函数
    function showAlert(message) {
        // 避免频繁弹窗
        if (!isProcessing) {
            alert(message);
        }
    }

    function clearLoginForm() {
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
    }

    function resetButton(button, originalText) {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    // 暴露必要的函数到全局作用域以便现有代码调用
    if (typeof window !== 'undefined') {
        window.authUpdateState = updateAuthState;
        window.authGetCurrentUser = function() { return authCurrentUser; };
    }

    console.log('Auth system loaded successfully');
})();