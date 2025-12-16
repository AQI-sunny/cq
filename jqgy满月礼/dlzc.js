// m 登录注册模态框控制脚本

document.addEventListener('DOMContentLoaded', function() {
    // 获取文字链接元素
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    
    // 获取模态框元素
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeLoginBtn = document.getElementById('close-login');
    const closeRegisterBtn = document.getElementById('close-register');
    
    // 切换链接
    const showRegisterFromLogin = document.getElementById('show-register-from-login');
    const showLoginFromRegister = document.getElementById('show-login-from-register');
    
    // 文字链接点击事件 - 登录
    if (loginLink) {
        loginLink.addEventListener('click', function() {
            openLoginModal();
        });
        
        // 添加鼠标指针样式
        loginLink.style.cursor = 'pointer';
        loginLink.style.color = '#007bff';
        loginLink.style.textDecoration = 'underline';
    }
    
    // 文字链接点击事件 - 注册
    if (registerLink) {
        registerLink.addEventListener('click', function() {
            openRegisterModal();
        });
        
        // 添加鼠标指针样式
        registerLink.style.cursor = 'pointer';
        registerLink.style.color = '#007bff';
        registerLink.style.textDecoration = 'underline';
    }
    
    // 关闭按钮点击事件
    if (closeLoginBtn) {
        closeLoginBtn.addEventListener('click', function() {
            closeLoginModal();
        });
    }
    
    if (closeRegisterBtn) {
        closeRegisterBtn.addEventListener('click', function() {
            closeRegisterModal();
        });
    }
    
    // 切换登录/注册模态框
    if (showRegisterFromLogin) {
        showRegisterFromLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeLoginModal();
            openRegisterModal();
        });
    }
    
    if (showLoginFromRegister) {
        showLoginFromRegister.addEventListener('click', function(e) {
            e.preventDefault();
            closeRegisterModal();
            openLoginModal();
        });
    }
    
    // 密码显示/隐藏切换
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordDisplay = document.getElementById('register-password-display');
    
    if (togglePasswordBtn && passwordDisplay) {
        togglePasswordBtn.addEventListener('click', function() {
            if (passwordDisplay.type === 'password') {
                passwordDisplay.type = 'text';
                togglePasswordBtn.textContent = '隐藏';
            } else {
                passwordDisplay.type = 'password';
                togglePasswordBtn.textContent = '显示';
            }
        });
    }
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            closeLoginModal();
        }
        if (event.target === registerModal) {
            closeRegisterModal();
        }
    });
    
    // 表单提交处理
    const loginSubmitBtn = document.getElementById('login-submit');
    if (loginSubmitBtn) {
        loginSubmitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    const registerSubmitBtn = document.getElementById('register-submit');
    if (registerSubmitBtn) {
        registerSubmitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleRegister();
        });
    }
    
    // 按ESC键关闭模态框
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeLoginModal();
            closeRegisterModal();
        }
    });
    
    // 初始化模态框为隐藏状态
    if (loginModal) loginModal.style.display = 'none';
    if (registerModal) registerModal.style.display = 'none';
});

// 打开登录模态框
function openLoginModal() {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // 自动聚焦到用户名输入框
        setTimeout(() => {
            const usernameInput = document.getElementById('login-username');
            if (usernameInput) usernameInput.focus();
        }, 100);
    }
}



// 打开注册模态框
function openRegisterModal() {
    const registerModal = document.getElementById('register-modal');
    if (registerModal) {
        registerModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // 自动聚焦到用户名输入框
        setTimeout(() => {
            const usernameInput = document.getElementById('register-username');
            if (usernameInput) usernameInput.focus();
        }, 100);
    }
}



