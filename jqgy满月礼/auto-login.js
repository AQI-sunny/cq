// auto-login-universal.js
// 支持PC网页、移动端H5和小程序的通用自动登录方案

(function() {
    'use strict';
    
    // ====== 环境检测 ======
    const Environment = {
        // 检测是否为微信小程序
        isWechatMiniProgram: () => {
            return typeof wx !== 'undefined' && 
                   typeof wx.getSystemInfoSync === 'function';
        },
        
        // 检测是否为支付宝小程序
        isAlipayMiniProgram: () => {
            return typeof my !== 'undefined' && 
                   typeof my.getSystemInfoSync === 'function';
        },
        
        // 检测是否为普通浏览器环境
        isBrowser: () => {
            return typeof window !== 'undefined' && 
                   typeof document !== 'undefined';
        },
        
        // 检测是否为移动端H5
        isMobileH5: () => {
            return Environment.isBrowser() && 
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        }
    };
    
    // ====== 存储适配器（跨平台兼容） ======
    const StorageAdapter = {
        // 设置存储项
        setItem: (key, value) => {
            try {
                // 微信小程序
                if (Environment.isWechatMiniProgram()) {
                    wx.setStorageSync(key, value);
                    return true;
                }
                // 支付宝小程序
                else if (Environment.isAlipayMiniProgram()) {
                    my.setStorageSync({ key, data: value });
                    return true;
                }
                // 普通浏览器
                else if (Environment.isBrowser()) {
                    localStorage.setItem(key, value);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('[AutoLogin] 存储失败:', error);
                return false;
            }
        },
        
        // 获取存储项
        getItem: (key) => {
            try {
                // 微信小程序
                if (Environment.isWechatMiniProgram()) {
                    return wx.getStorageSync(key);
                }
                // 支付宝小程序
                else if (Environment.isAlipayMiniProgram()) {
                    const result = my.getStorageSync({ key });
                    return result.data;
                }
                // 普通浏览器
                else if (Environment.isBrowser()) {
                    return localStorage.getItem(key);
                }
                return null;
            } catch (error) {
                console.error('[AutoLogin] 读取存储失败:', error);
                return null;
            }
        },
        
        // 删除存储项
        removeItem: (key) => {
            try {
                // 微信小程序
                if (Environment.isWechatMiniProgram()) {
                    wx.removeStorageSync(key);
                    return true;
                }
                // 支付宝小程序
                else if (Environment.isAlipayMiniProgram()) {
                    my.removeStorageSync({ key });
                    return true;
                }
                // 普通浏览器
                else if (Environment.isBrowser()) {
                    localStorage.removeItem(key);
                    return true;
                }
                return false;
            } catch (error) {
                console.error('[AutoLogin] 删除存储失败:', error);
                return false;
            }
        }
    };
    
    // ====== DOM操作适配器（小程序环境下为空实现） ======
    const DOMManager = {
        // 添加事件监听
        addEventListener: (event, handler) => {
            if (Environment.isBrowser()) {
                document.addEventListener(event, handler);
            }
            // 小程序环境：使用小程序的页面生命周期
            else if (Environment.isWechatMiniProgram()) {
                // 小程序中可以通过页面onShow事件模拟
                console.log('[AutoLogin] 小程序环境，跳过DOM事件监听');
            }
        },
        
        // 创建元素
        createElement: (tag) => {
            if (Environment.isBrowser()) {
                return document.createElement(tag);
            }
            return null;
        },
        
        // 添加到页面
        appendToBody: (element) => {
            if (Environment.isBrowser() && element && document.body) {
                document.body.appendChild(element);
                return true;
            }
            return false;
        },
        
        // 从页面移除
        removeFromBody: (element) => {
            if (Environment.isBrowser() && element && element.parentNode) {
                element.parentNode.removeChild(element);
                return true;
            }
            return false;
        },
        
        // 查询元素
        querySelector: (selector) => {
            if (Environment.isBrowser()) {
                return document.querySelector(selector);
            }
            return null;
        }
    };
    
    // ====== 核心自动登录逻辑 ======
    const AutoLoginCore = {
        // 存储键名
        STORAGE_KEYS: {
            USERNAME: 'forum_recent_login_v2',
            TIMESTAMP: 'forum_login_timestamp_v2'
        },
        
        // 会话超时时间（24小时）
        SESSION_TIMEOUT: 24 * 60 * 60 * 1000,
        
        // 保存登录信息
        saveLoginInfo: function(username) {
            if (!username || username.trim() === '') {
                console.warn('[AutoLogin] 用户名无效，跳过保存');
                return false;
            }
            
            const success = StorageAdapter.setItem(
                this.STORAGE_KEYS.USERNAME, 
                username
            );
            
            if (success) {
                StorageAdapter.setItem(
                    this.STORAGE_KEYS.TIMESTAMP, 
                    Date.now().toString()
                );
                console.log(`[AutoLogin] 已保存登录信息: ${username}`);
                return true;
            }
            
            return false;
        },
        
        // 获取登录信息
        getLoginInfo: function() {
            try {
                const username = StorageAdapter.getItem(this.STORAGE_KEYS.USERNAME);
                const timestamp = StorageAdapter.getItem(this.STORAGE_KEYS.TIMESTAMP);
                
                // 检查数据是否存在
                if (!username || !timestamp) {
                    return null;
                }
                
                // 检查会话是否过期
                const loginTime = parseInt(timestamp, 10);
                const currentTime = Date.now();
                
                if (currentTime - loginTime <= this.SESSION_TIMEOUT) {
                    console.log(`[AutoLogin] 找到有效登录信息: ${username}`);
                    return {
                        username: username,
                        timestamp: loginTime,
                        isValid: true
                    };
                } else {
                    console.log('[AutoLogin] 登录信息已过期');
                    this.clearLoginInfo();
                    return null;
                }
            } catch (error) {
                console.error('[AutoLogin] 获取登录信息失败:', error);
                return null;
            }
        },
        
        // 清除登录信息
        clearLoginInfo: function() {
            StorageAdapter.removeItem(this.STORAGE_KEYS.USERNAME);
            StorageAdapter.removeItem(this.STORAGE_KEYS.TIMESTAMP);
            console.log('[AutoLogin] 已清除登录信息');
        },
        
        // 尝试自动登录
        tryAutoLogin: function() {
            // 只在浏览器环境尝试（小程序有独立的登录机制）
            if (!Environment.isBrowser()) {
                console.log('[AutoLogin] 非浏览器环境，跳过自动登录');
                return;
            }
            
            const loginInfo = this.getLoginInfo();
            if (!loginInfo) {
                return;
            }
            
            console.log(`[AutoLogin] 尝试自动登录: ${loginInfo.username}`);
            
            // 延迟执行，等待页面完全加载
            setTimeout(() => {
                this._performAutoLogin(loginInfo.username);
            }, 1500);
        },
        
        // 执行自动登录
        _performAutoLogin: function(username) {
            try {
                // 检查论坛的用户系统
                if (typeof window.currentUser !== 'undefined') {
                    // 如果已经登录，跳过
                    if (window.currentUser) {
                        console.log(`[AutoLogin] 用户已登录: ${window.currentUser}`);
                        return;
                    }
                    
                    // 尝试设置当前用户
                    window.currentUser = username;
                    console.log(`[AutoLogin] 已设置当前用户: ${username}`);
                    
                    // 如果有更新UI的函数，调用它
                    if (typeof window.updateAuthUI === 'function') {
                        window.updateAuthUI();
                        this._showNotification(`欢迎回来 ${username}！`, 'success');
                    }
                } else {
                    console.warn('[AutoLogin] 未找到论坛用户系统');
                }
            } catch (error) {
                console.error('[AutoLogin] 自动登录失败:', error);
            }
        },
        
        // 显示通知（仅浏览器环境）
        _showNotification: function(message, type = 'info') {
            if (!Environment.isBrowser()) {
                return;
            }
            
            const colors = {
                success: '#4CAF50',
                info: '#2196F3',
                warning: '#FF9800',
                error: '#F44336'
            };
            
            // 创建通知元素
            const notification = DOMManager.createElement('div');
            if (!notification) return;
            
            notification.className = 'auto-login-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${colors[type] || colors.info};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 99999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                max-width: 300px;
                font-size: 14px;
                line-height: 1.4;
                animation: autoLoginSlideIn 0.3s ease-out;
                pointer-events: none;
            `;
            
            // 移动端适配
            if (Environment.isMobileH5()) {
                notification.style.top = '10px';
                notification.style.right = '10px';
                notification.style.left = '10px';
                notification.style.maxWidth = 'calc(100% - 20px)';
                notification.style.fontSize = '13px';
                notification.style.padding = '10px 15px';
            }
            
            notification.textContent = message;
            
            // 添加到页面
            DOMManager.appendToBody(notification);
            
            // 添加动画样式（如果还没有）
            if (Environment.isBrowser() && !document.querySelector('#auto-login-styles')) {
                const style = DOMManager.createElement('style');
                style.id = 'auto-login-styles';
                style.textContent = `
                    @keyframes autoLoginSlideIn {
                        from { 
                            transform: ${Environment.isMobileH5() ? 'translateY(-100%)' : 'translateX(100%)'}; 
                            opacity: 0; 
                        }
                        to { 
                            transform: ${Environment.isMobileH5() ? 'translateY(0)' : 'translateX(0)'}; 
                            opacity: 1; 
                        }
                    }
                    @keyframes autoLoginSlideOut {
                        from { 
                            transform: ${Environment.isMobileH5() ? 'translateY(0)' : 'translateX(0)'}; 
                            opacity: 1; 
                        }
                        to { 
                            transform: ${Environment.isMobileH5() ? 'translateY(-100%)' : 'translateX(100%)'}; 
                            opacity: 0; 
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // 3秒后自动移除
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'autoLoginSlideOut 0.3s ease-out';
                    setTimeout(() => {
                        DOMManager.removeFromBody(notification);
                    }, 300);
                }
            }, 3000);
        },
        
        // 设置登录事件监听
        setupEventListeners: function() {
            // 监听登录按钮点击
            DOMManager.addEventListener('click', (event) => {
                const target = event.target;
                
                // 登录按钮
                if (target.id === 'login-submit' || 
                    target.closest('#login-submit')) {
                    setTimeout(() => {
                        const usernameInput = DOMManager.querySelector('#login-username');
                        if (usernameInput && usernameInput.value) {
                            this.saveLoginInfo(usernameInput.value.trim());
                        }
                    }, 100);
                }
                
                // 退出按钮
                else if (target.id === 'logout-btn' || 
                        target.closest('#logout-btn')) {
                    this.clearLoginInfo();
                }
                
                // 返回按钮
                else if (target.closest('.back-btn')) {
                    if (typeof window.currentUser !== 'undefined' && 
                        window.currentUser) {
                        this.saveLoginInfo(window.currentUser);
                    }
                }
            });
            
            // 监听登录表单提交
            const loginForm = DOMManager.querySelector('#login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', () => {
                    const usernameInput = loginForm.querySelector('#login-username');
                    if (usernameInput && usernameInput.value) {
                        this.saveLoginInfo(usernameInput.value.trim());
                    }
                });
            }
        },
        
        // 初始化
        init: function() {
            console.log('[AutoLogin] 初始化跨平台自动登录系统...');
            console.log('[AutoLogin] 当前环境:', 
                Environment.isWechatMiniProgram() ? '微信小程序' :
                Environment.isAlipayMiniProgram() ? '支付宝小程序' :
                Environment.isMobileH5() ? '移动端H5' :
                Environment.isBrowser() ? 'PC浏览器' : '未知环境'
            );
            
            // 只对浏览器环境初始化
            if (Environment.isBrowser()) {
                this.setupEventListeners();
                this.tryAutoLogin();
            }
        }
    };
    
    // ====== 小程序专用适配 ======
    const MiniProgramAdapter = {
        // 微信小程序适配
        wechat: {
            // 小程序登录成功回调
            onLoginSuccess: function(username) {
                if (Environment.isWechatMiniProgram()) {
                    // 保存到小程序存储
                    wx.setStorageSync('forum_recent_login', username);
                    wx.setStorageSync('forum_login_timestamp', Date.now().toString());
                    
                    // 小程序通常需要跳转到首页
                    console.log(`[AutoLogin-微信小程序] 登录成功: ${username}`);
                    
                    // 显示小程序Toast
                    wx.showToast({
                        title: `欢迎回来 ${username}`,
                        icon: 'success',
                        duration: 2000
                    });
                }
            },
            
            // 小程序页面显示时检查登录状态
            onPageShow: function() {
                if (Environment.isWechatMiniProgram()) {
                    try {
                        const username = wx.getStorageSync('forum_recent_login');
                        const timestamp = wx.getStorageSync('forum_login_timestamp');
                        
                        if (username && timestamp) {
                            const loginTime = parseInt(timestamp, 10);
                            const currentTime = Date.now();
                            
                            if (currentTime - loginTime <= AutoLoginCore.SESSION_TIMEOUT) {
                                // 可以在这里执行小程序的自动登录逻辑
                                console.log(`[AutoLogin-微信小程序] 找到有效登录: ${username}`);
                                return username;
                            }
                        }
                    } catch (error) {
                        console.error('[AutoLogin-微信小程序] 检查登录状态失败:', error);
                    }
                }
                return null;
            }
        },
        
        // alipay小程序适配
        alipay: {
            onLoginSuccess: function(username) {
                if (Environment.isAlipayMiniProgram()) {
                    my.setStorageSync({
                        key: 'forum_recent_login',
                        data: username
                    });
                    my.setStorageSync({
                        key: 'forum_login_timestamp',
                        data: Date.now().toString()
                    });
                    
                    
                    my.showToast({
                        content: `欢迎回来 ${username}`,
                        type: 'success',
                        duration: 2000
                    });
                }
            }
        }
    };
    
    // ====== 初始化入口 ======
    function initialize() {
        // 防止重复初始化
        if (window.__autoLoginUniversalInitialized) {
            console.warn('[AutoLogin] 已经初始化过，跳过');
            return;
        }
        window.__autoLoginUniversalInitialized = true;
        
        // 根据环境选择初始化方式
        if (Environment.isBrowser()) {
            // 浏览器环境：延迟初始化
            if (document.readyState === 'loading') {
                DOMManager.addEventListener('DOMContentLoaded', () => {
                    AutoLoginCore.init();
                });
            } else {
                setTimeout(() => {
                    AutoLoginCore.init();
                }, 500);
            }
        }
        // 小程序环境：等待小程序就绪
        else if (Environment.isWechatMiniProgram()) {
            // 微信小程序有App和Page生命周期
            console.log('[AutoLogin] 微信小程序环境，请在小程序onShow中调用AutoLogin.onPageShow()');
        }
        else if (Environment.isAlipayMiniProgram()) {
            console.log('[AutoLogin] 支付宝小程序环境');
        }
    }
    
    // ====== 全局导出 ======
    // 安全的全局导出，避免覆盖已有对象
    if (!window.AutoLoginUniversal) {
        window.AutoLoginUniversal = {
            // 核心功能
            saveLogin: AutoLoginCore.saveLoginInfo.bind(AutoLoginCore),
            getLogin: AutoLoginCore.getLoginInfo.bind(AutoLoginCore),
            clearLogin: AutoLoginCore.clearLoginInfo.bind(AutoLoginCore),
            tryAutoLogin: AutoLoginCore.tryAutoLogin.bind(AutoLoginCore),
            
            // 环境检测
            env: Environment,
            
            // 小程序适配
            mp: MiniProgramAdapter,
            
            // 初始化
            init: initialize,
            
            // 版本
            version: '2.0.0-universal'
        };
    }
    
    // 自动初始化（浏览器环境）
    if (Environment.isBrowser()) {
        initialize();
    }
    
})();

// 小程序页面逻辑
Page({
    data: {
        username: '',
        autoLoginInfo: null
    },
    
    onLoad() {
        // 检查自动登录状态
        this.checkAutoLogin();
    },
    
    onShow() {
        // 页面显示时检查
        if (typeof AutoLoginUniversal !== 'undefined') {
            const loginInfo = AutoLoginUniversal.mp.wechat.onPageShow();
            if (loginInfo) {
                this.setData({ autoLoginInfo: loginInfo });
                // 可以在这里执行自动登录
                this.autoLogin(loginInfo);
            }
        }
    },
    
    checkAutoLogin() {
        try {
            const username = wx.getStorageSync('forum_recent_login');
            const timestamp = wx.getStorageSync('forum_login_timestamp');
            
            if (username && timestamp) {
                const loginTime = parseInt(timestamp);
                const currentTime = Date.now();
                
                // 24小时内有效
                if (currentTime - loginTime <= 24 * 60 * 60 * 1000) {
                    this.setData({ username });
                    return true;
                }
            }
        } catch (error) {
            console.error('检查自动登录失败:', error);
        }
        return false;
    },
    
    // 手动登录成功后的处理
    onLoginSuccess(username) {
        // 保存登录信息
        wx.setStorageSync('forum_recent_login', username);
        wx.setStorageSync('forum_login_timestamp', Date.now().toString());
        
        // 调用通用库
        if (typeof AutoLoginUniversal !== 'undefined') {
            AutoLoginUniversal.mp.wechat.onLoginSuccess(username);
        }
    }
});