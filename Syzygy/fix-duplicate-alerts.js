// fix-duplicate-alerts.js
// 解决重复提示框问题 - 不修改原有代码

(function() {
    'use strict';
    
    // 防止重复初始化
    if (window.duplicateAlertFixApplied) {
        return;
    }
    window.duplicateAlertFixApplied = true;
    
    console.log('重复提示修复系统启动...');
    
    // 全局锁机制 - 防止重复弹窗
    let alertLock = false;
    let confirmLock = false;
    let lastAlertMessage = '';
    let lastAlertTime = 0;
    const ALERT_COOLDOWN = 500; // 500ms冷却时间
    
    // 存储原始方法
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;
    
    // 重写 alert 方法
    window.alert = function(message) {
        const currentTime = Date.now();
        const isSameMessage = message === lastAlertMessage;
        const isInCooldown = currentTime - lastAlertTime < ALERT_COOLDOWN;
        
        // 如果正在锁定、相同消息且在冷却期内，则阻止重复弹窗
        if (alertLock && isSameMessage && isInCooldown) {
            console.log('阻止重复alert:', message);
            return;
        }
        
        // 设置锁
        alertLock = true;
        lastAlertMessage = message;
        lastAlertTime = currentTime;
        
        // 调用原始alert
        originalAlert.call(window, message);
        
        // 释放锁
        setTimeout(() => {
            alertLock = false;
        }, ALERT_COOLDOWN);
    };
    
    // 重写 confirm 方法
    window.confirm = function(message) {
        if (confirmLock) {
            console.log('阻止重复confirm:', message);
            return false;
        }
        
        confirmLock = true;
        const result = originalConfirm.call(window, message);
        
        setTimeout(() => {
            confirmLock = false;
        }, ALERT_COOLDOWN);
        
        return result;
    };
    
    // 事件监听器去重系统
    const eventListenerTracker = new Map();
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        const key = `${this.nodeName}-${this.id}-${this.className}-${type}-${listener.toString().substring(0, 50)}`;
        
        if (!eventListenerTracker.has(key)) {
            eventListenerTracker.set(key, true);
            return originalAddEventListener.call(this, type, listener, options);
        } else {
            console.log('阻止重复事件绑定:', key);
            return undefined;
        }
    };
    
    // 特定按钮防重复点击
    function setupButtonDebouncing() {
        const sensitiveButtons = ['login-submit', 'register-submit', 'logout-btn', 'login-btn', 'register-btn'];
        
        sensitiveButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                let clickLock = false;
                
                const originalClick = button.onclick;
                button.onclick = function(e) {
                    if (clickLock) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('阻止重复点击:', buttonId);
                        return false;
                    }
                    
                    clickLock = true;
                    
                    if (originalClick) {
                        originalClick.call(this, e);
                    }
                    
                    setTimeout(() => {
                        clickLock = false;
                    }, 1000);
                };
            }
        });
    }
    
    // 表单提交防重复
    function setupFormProtection() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            let submitLock = false;
            
            form.addEventListener('submit', function(e) {
                if (submitLock) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('阻止重复表单提交');
                    return false;
                }
                
                submitLock = true;
                
                // 自动解锁
                setTimeout(() => {
                    submitLock = false;
                }, 2000);
            });
        });
    }
    
    // 密码管理器特定修复
    function fixPasswordManagerDuplicates() {
        if (typeof PasswordManager !== 'undefined') {
            const originalShowMessage = PasswordManager.showMessage;
            
            PasswordManager.showMessage = function(message, type) {
                const currentTime = Date.now();
                if (currentTime - lastAlertTime < ALERT_COOLDOWN && message === lastAlertMessage) {
                    console.log('阻止PasswordManager重复消息:', message);
                    return;
                }
                
                lastAlertTime = currentTime;
                lastAlertMessage = message;
                return originalShowMessage.call(this, message, type);
            };
        }
    }
    
    // 认证系统特定修复
    function fixAuthSystemDuplicates() {
        // 防止认证系统的重复提示
        if (typeof window !== 'undefined') {
            const originalAuthAlert = window.showAlert;
            if (originalAuthAlert) {
                window.showAlert = function(message) {
                    const currentTime = Date.now();
                    if (currentTime - lastAlertTime < ALERT_COOLDOWN && message === lastAlertMessage) {
                        console.log('阻止Auth系统重复提示:', message);
                        return;
                    }
                    
                    lastAlertTime = currentTime;
                    lastAlertMessage = message;
                    return originalAuthAlert.call(this, message);
                };
            }
        }
    }
    
    // 初始化修复
    function initFixes() {
        setTimeout(() => {
            setupButtonDebouncing();
            setupFormProtection();
            fixPasswordManagerDuplicates();
            fixAuthSystemDuplicates();
            console.log('重复提示修复系统初始化完成');
        }, 1000);
    }
    
    // DOM加载后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFixes);
    } else {
        initFixes();
    }
    
    // 页面可见性变化时重置锁状态（防止Safari后台/前台切换问题）
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            // 页面变为可见时重置锁
            setTimeout(() => {
                alertLock = false;
                confirmLock = false;
            }, 100);
        }
    });
    
})();