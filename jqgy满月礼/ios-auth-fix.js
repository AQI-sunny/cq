// iOS兼容登录注册修复
(function() {
    'use strict';
    
    console.log('iOS兼容登录系统初始化...');
    
    // 存储用户数据
    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    let currentUser = localStorage.getItem('currentUser') || null;
    
    // iOS检测
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const iOSVersion = isIOS ? parseFloat(('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1]).replace('undefined', '3_2').replace('_', '.').replace('_', '')) || false : false;
    
    // 初始化函数
    function initIOSAuthFix() {
        console.log('iOS设备检测:', isIOS ? '是 (版本: ' + iOSVersion + ')' : '否');
        
        // 修复iOS输入框问题
        fixIOSInputIssues();
        
        // 修复登录注册模态框
        fixAuthModals();
        
        // 绑定事件
        bindAuthEvents();
        
        // 恢复登录状态
        restoreLoginState();
        
        console.log('iOS兼容登录系统初始化完成');
    }
    
    // 修复iOS输入框问题
    function fixIOSInputIssues() {
        if (!isIOS) return;
        
        // 防止iOS缩放
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        
        // 修复输入框焦点问题
        document.addEventListener('touchstart', function() {
            // 确保输入框获得焦点时页面不会异常滚动
        });
        
        // 修复键盘弹出时的布局问题
        window.addEventListener('resize', function() {
            setTimeout(function() {
                document.activeElement && document.activeElement.scrollIntoViewIfNeeded();
            }, 300);
        });
    }
    
    // 修复登录注册模态框
    function fixAuthModals() {
        if (!isIOS) return;
        
        const style = document.createElement('style');
        style.textContent = `
            /* iOS特定修复 */
            .login-modal, .register-modal {
                -webkit-overflow-scrolling: touch !important;
                overflow-y: auto !important;
            }
            
            .login-content, .register-content {
                position: relative !important;
                margin: 20px auto !important;
                max-height: 80vh !important;
                overflow-y: auto !important;
                -webkit-overflow-scrolling: touch !important;
            }
            
            /* 修复输入框 */
            input[type="text"], input[type="password"] {
                font-size: 16px !important; /* 防止iOS缩放 */
                -webkit-appearance: none !important;
                border-radius: 0 !important;
            }
            
            /* 修复按钮 */
            button {
                -webkit-appearance: none !important;
                border-radius: 0 !important;
            }
            
            /* 修复滚动 */
            body.modal-open {
                position: fixed !important;
                width: 100% !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 绑定事件
    function bindAuthEvents() {
        // 登录按钮
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', showLoginModal, { passive: true });
        }
        
        // 注册按钮
        const registerBtn = document.getElementById('register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', showRegisterModal, { passive: true });
        }
        
        // 关闭按钮
        const closeLogin = document.getElementById('close-login');
        const closeRegister = document.getElementById('close-register');
        if (closeLogin) closeLogin.addEventListener('click', hideLoginModal);
        if (closeRegister) closeRegister.addEventListener('click', hideRegisterModal);
        
        // 登录提交
        const loginSubmit = document.getElementById('login-submit');
        if (loginSubmit) {
            loginSubmit.addEventListener('click', handleLogin, { passive: true });
        }
        
        // 注册提交
        const registerSubmit = document.getElementById('register-submit');
        if (registerSubmit) {
            registerSubmit.addEventListener('click', handleRegister, { passive: true });
        }
        
        // 切换表单
        const showRegisterFromLogin = document.getElementById('show-register-from-login');
        const showLoginFromRegister = document.getElementById('show-login-from-register');
        if (showRegisterFromLogin) showRegisterFromLogin.addEventListener('click', switchToRegister);
        if (showLoginFromRegister) showLoginFromRegister.addEventListener('click', switchToLogin);
        
        // 密码显示切换
        const togglePassword = document.getElementById('toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', togglePasswordVisibility, { passive: true });
        }
        
        // 点击模态框外部关闭
        document.addEventListener('click', function(e) {
            const loginModal = document.getElementById('login-modal');
            const registerModal = document.getElementById('register-modal');
            
            if (e.target === loginModal) hideLoginModal();
            if (e.target === registerModal) hideRegisterModal();
        });
        
        // 键盘事件
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                hideLoginModal();
                hideRegisterModal();
            }
        });
    }
    
    // 显示登录模态框
    function showLoginModal() {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.style.display = 'block';
            document.body.classList.add('modal-open');
            
            // iOS焦点延迟处理
            if (isIOS) {
                setTimeout(() => {
                    const usernameInput = document.getElementById('login-username');
                    if (usernameInput) usernameInput.focus();
                }, 300);
            }
        }
    }
    
    // 隐藏登录模态框
    function hideLoginModal() {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }
    
    // 显示注册模态框
    function showRegisterModal() {
        const registerModal = document.getElementById('register-modal');
        if (registerModal) {
            registerModal.style.display = 'block';
            document.body.classList.add('modal-open');
            
            // iOS焦点延迟处理
            if (isIOS) {
                setTimeout(() => {
                    const usernameInput = document.getElementById('register-username');
                    if (usernameInput) usernameInput.focus();
                }, 300);
            }
        }
    }
    
    // 隐藏注册模态框
    function hideRegisterModal() {
        const registerModal = document.getElementById('register-modal');
        if (registerModal) {
            registerModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }
    
    // 切换到注册
    function switchToRegister() {
        hideLoginModal();
        setTimeout(showRegisterModal, 200);
    }
    
    // 切换到登录
    function switchToLogin() {
        hideRegisterModal();
        setTimeout(showLoginModal, 200);
    }
    
    // 切换密码可见性
    function togglePasswordVisibility() {
        const toggleElement = document.getElementById('toggle-password');
        const displayInput = document.getElementById('register-password-display');
        const hiddenInput = document.getElementById('register-password-hidden');
        
        if (displayInput && hiddenInput && toggleElement) {
            if (displayInput.type === 'password') {
                displayInput.type = 'text';
                toggleElement.textContent = '隐藏';
            } else {
                displayInput.type = 'password';
                toggleElement.textContent = '显示';
            }
        }
    }
    
    // 处理登录
    function handleLogin() {
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        
        if (!usernameInput || !passwordInput) return;
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        // 验证输入
        if (!username) {
            showIOSAlert('请输入用户名');
            return;
        }
        
        if (!password) {
            showIOSAlert('请输入密码');
            return;
        }
        
        // 检查用户
        const user = registeredUsers.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && 
            u.password === password
        );
        
        if (user) {
            // 登录成功
            currentUser = username;
            localStorage.setItem('currentUser', username);
            
            // 初始化用户数据（如果不存在）
            initUserProfile(username);
            
            // 更新UI
            updateAuthUI();
            
            // 关闭模态框
            hideLoginModal();
            
            // 清空输入
            usernameInput.value = '';
            passwordInput.value = '';
            
            showIOSAlert('登录成功！');
            
            // 触发自定义事件
            document.dispatchEvent(new CustomEvent('authLoginSuccess', {
                detail: { username: username }
            }));
            
        } else {
            showIOSAlert('用户名或密码错误');
        }
    }
    
    // 处理注册
    function handleRegister() {
        const usernameInput = document.getElementById('register-username');
        const hiddenPasswordInput = document.getElementById('register-password-hidden');
        
        if (!usernameInput || !hiddenPasswordInput) return;
        
        const username = usernameInput.value.trim();
        const password = hiddenPasswordInput.value;
        
        // 验证输入
        if (!username) {
            showIOSAlert('请输入用户名');
            return;
        }
        
        if (username.length < 2) {
            showIOSAlert('用户名至少2个字符');
            return;
        }
        
        // 检查用户名是否已存在
        if (registeredUsers.some(user => user.username.toLowerCase() === username.toLowerCase())) {
            showIOSAlert('用户名已存在，请选择其他用户名');
            return;
        }
        
        // 检查特殊用户名
        if (username.toLowerCase() === 'resonance' || username.toLowerCase() === '林中的猫') {
            showIOSAlert('用户名已存在，请选择其他用户名');
            return;
        }
        
        // 注册新用户
        registeredUsers.push({ username, password });
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        // 初始化用户数据
        initUserProfile(username);
        
        showIOSAlert(`注册成功！您的用户名是：${username}`);
        
        // 关闭模态框
        hideRegisterModal();
        
        // 清空输入
        usernameInput.value = '';
        
        // 触发自定义事件
        document.dispatchEvent(new CustomEvent('authRegisterSuccess', {
            detail: { username: username }
        }));
    }
    
    // 初始化用户个人数据
    function initUserProfile(username) {
        const userProfileKey = `userProfile_${username}`;
        if (!localStorage.getItem(userProfileKey)) {
            const userProfile = {
                username: username,
                joinDate: new Date().toISOString(),
                readPosts: [],
                settings: {}
            };
            localStorage.setItem(userProfileKey, JSON.stringify(userProfile));
        }
    }
    
    // 更新认证UI
    function updateAuthUI() {
        const authButtons = document.getElementById('auth-buttons-container');
        const userInfo = document.getElementById('user-info');
        const usernameDisplay = document.getElementById('username-display');
        
        if (currentUser) {
            // 用户已登录
            if (authButtons) authButtons.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            if (usernameDisplay) usernameDisplay.textContent = currentUser;
        } else {
            // 用户未登录
            if (authButtons) authButtons.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'none';
        }
    }
    
    // 恢复登录状态
    function restoreLoginState() {
        if (currentUser) {
            updateAuthUI();
        }
    }
    
    // iOS友好的提示
    function showIOSAlert(message) {
        if (isIOS) {
            // iOS使用更简单的alert
            alert(message);
        } else {
            alert(message);
        }
    }
    
    // 公开API
    window.IOSAuth = {
        login: showLoginModal,
        register: showRegisterModal,
        logout: function() {
            currentUser = null;
            localStorage.removeItem('currentUser');
            updateAuthUI();
            showIOSAlert('已退出登录');
        },
        getCurrentUser: function() {
            return currentUser;
        },
        isLoggedIn: function() {
            return currentUser !== null;
        }
    };
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initIOSAuthFix);
    } else {
        initIOSAuthFix();
    }
    
})();