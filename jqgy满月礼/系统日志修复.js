/**
 * 系统日志权限管理模块
 * 确保只有re用户登录后才能显示系统日志链接
 * 独立模块，不影响其他功能
 */

// 系统日志权限管理对象
const SystemLogAuth = {
    // 授权用户列表
    authorizedUsers: ['Resonance', 're', 'admin', 'root'],
    
    // 初始化
    init: function() {
        this.bindEvents();
        this.checkAndUpdateLogVisibility();
        
    },
    
    // 绑定事件
    bindEvents: function() {
        // 监听用户登录状态变化
        this.observeUserChanges();
        
        // 监听DOM变化，确保系统日志链接始终受控
        this.observeDOMChanges();
    },
    
    // 检查并更新日志可见性
    checkAndUpdateLogVisibility: function() {
        const syslogLink = document.getElementById('syslog-link');
        if (!syslogLink) {
            console.warn('⚠️ 未找到系统日志链接元素');
            return;
        }
        
        const currentUser = this.getCurrentUser();
        const isAuthorized = this.isUserAuthorized(currentUser);
        
        if (isAuthorized) {
            this.showSystemLogLink(syslogLink);
        } else {
            this.hideSystemLogLink(syslogLink);
        }
        
        
    },
    
    // 获取当前用户
    getCurrentUser: function() {
        // 尝试从多个可能的位置获取用户信息
        return window.currentUser || 
               localStorage.getItem('currentUser') ||
               sessionStorage.getItem('currentUser') ||
               null;
    },
    
    // 检查用户是否有权限
    isUserAuthorized: function(username) {
        if (!username) return false;
        
        return this.authorizedUsers.some(authorizedUser => 
            username.toLowerCase().includes(authorizedUser.toLowerCase()) ||
            authorizedUser.toLowerCase().includes(username.toLowerCase())
        );
    },
    
    // 显示系统日志链接
    showSystemLogLink: function(syslogLink) {
        syslogLink.style.display = 'inline-block';
        syslogLink.style.visibility = 'visible';
        syslogLink.style.opacity = '1';
        syslogLink.removeAttribute('disabled');
    },
    
    // 隐藏系统日志链接
    hideSystemLogLink: function(syslogLink) {
        syslogLink.style.display = 'none';
        syslogLink.style.visibility = 'hidden';
        syslogLink.style.opacity = '0';
    },
    
    // 监听用户变化
    observeUserChanges: function() {
        // 重写可能修改用户状态的函数
        this.overrideLoginFunctions();
        
        // 监听storage变化（多标签页同步）
        window.addEventListener('storage', (e) => {
            if (e.key === 'currentUser') {
                this.checkAndUpdateLogVisibility();
            }
        });
        
        // 定期检查用户状态（备用方案）
        setInterval(() => {
            this.checkAndUpdateLogVisibility();
        }, 2000);
    },
    
    // 重写登录相关函数
    overrideLoginFunctions: function() {
        // 保存原始函数引用
        const originalSetUser = window.setCurrentUser;
        
        // 重写设置用户函数
        window.setCurrentUser = function(username) {
            // 调用原始函数
            if (originalSetUser) {
                originalSetUser.call(this, username);
            }
            
            // 更新系统日志权限
            SystemLogAuth.checkAndUpdateLogVisibility();
        };
        
        // 监听可能的登出事件
        const originalLogout = window.logoutUser;
        window.logoutUser = function() {
            // 调用原始函数
            if (originalLogout) {
                originalLogout.call(this);
            }
            
            // 更新系统日志权限
            SystemLogAuth.checkAndUpdateLogVisibility();
        };
    },
    
    // 监听DOM变化
    observeDOMChanges: function() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // 检查是否有新的系统日志链接被添加
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            const syslogLinks = node.querySelectorAll ? 
                                node.querySelectorAll('#syslog-link, .syslog-link, [href*="xtrz"]') : [];
                            
                            syslogLinks.forEach(link => {
                                this.checkAndUpdateLogVisibility();
                            });
                            
                            // 如果添加的元素本身就是系统日志链接
                            if (node.id === 'syslog-link' || 
                                node.classList.contains('syslog-link') || 
                                (node.getAttribute && node.getAttribute('href') === 'xtrz.html')) {
                                this.checkAndUpdateLogVisibility();
                            }
                        }
                    });
                }
            });
        });
        
        // 开始观察
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },
    
    // 手动检查权限（供外部调用）
    checkPermissions: function() {
        return this.checkAndUpdateLogVisibility();
    },
    
    // 添加授权用户
    addAuthorizedUser: function(username) {
        if (!this.authorizedUsers.includes(username)) {
            this.authorizedUsers.push(username);
            this.checkAndUpdateLogVisibility();
        }
    },
    
    // 移除授权用户
    removeAuthorizedUser: function(username) {
        const index = this.authorizedUsers.indexOf(username);
        if (index > -1) {
            this.authorizedUsers.splice(index, 1);
            this.checkAndUpdateLogVisibility();
        }
    },
    
    // 获取授权用户列表
    getAuthorizedUsers: function() {
        return [...this.authorizedUsers];
    }
};

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        SystemLogAuth.init();
    });
} else {
    SystemLogAuth.init();
}

// 导出到全局作用域
window.SystemLogAuth = SystemLogAuth;

