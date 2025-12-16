// search-notification.js
// 搜索页面内置弹窗功能 - 独立组件
(function() {
    'use strict';
    
    // 配置项
    const config = {
        // 样式配置
        backgroundColor: '#f8d7da',
        textColor: '#721c24',
        borderColor: '#f5c6cb',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        borderRadius: '12px',
        fontSize: '16px',
        // 弹窗配置
        duration: 3000, // 显示时间（毫秒）
        maxWidth: '90%', // 移动端适配
        minWidth: '280px', // 移动端最小宽度
        zIndex: 99999, // 确保在最上层
        // 动画配置
        animationDuration: '0.3s',
        // 响应式断点
        mobileBreakpoint: 768,
        // 图标
        icon: '🔍',
        iconSize: '24px'
    };
    
    // 创建弹窗容器
    let notificationContainer = null;
    let isInitialized = false;
    
    // 初始化函数
    function init() {
        if (isInitialized) return;
        
        // 创建容器
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'search-notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            left: 0;
            right: 0;
            margin: 0 auto;
            width: fit-content;
            max-width: ${config.maxWidth};
            min-width: ${config.minWidth};
            z-index: ${config.zIndex};
            pointer-events: none;
            transition: all ${config.animationDuration} cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateY(-100px);
            opacity: 0;
        `;
        
        document.body.appendChild(notificationContainer);
        isInitialized = true;
        
        // 添加响应式样式
        addResponsiveStyles();
        
        console.log('Search Notification initialized');
    }
    
    // 添加响应式样式
    function addResponsiveStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #search-notification-container .notification {
                background-color: ${config.backgroundColor};
                color: ${config.textColor};
                border: 1px solid ${config.borderColor};
                border-radius: ${config.borderRadius};
                padding: 16px 20px;
                box-shadow: ${config.boxShadow};
                font-size: ${config.fontSize};
                line-height: 1.5;
                display: flex;
                align-items: center;
                gap: 12px;
                pointer-events: auto;
                box-sizing: border-box;
                word-break: break-word;
                overflow-wrap: break-word;
            }
            
            #search-notification-container .notification-icon {
                font-size: ${config.iconSize};
                flex-shrink: 0;
            }
            
            #search-notification-container .notification-content {
                flex: 1;
            }
            
            #search-notification-container .notification-close {
                background: none;
                border: none;
                color: ${config.textColor};
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.7;
                transition: opacity 0.2s;
                flex-shrink: 0;
            }
            
            #search-notification-container .notification-close:hover {
                opacity: 1;
            }
            
            /* 移动端适配 */
            @media (max-width: ${config.mobileBreakpoint}px) {
                #search-notification-container {
                    top: 10px;
                    padding: 0 15px;
                }
                
                #search-notification-container .notification {
                    padding: 14px 16px;
                    font-size: 15px;
                }
                
                #search-notification-container .notification-icon {
                    font-size: 20px;
                }
            }
            
            /* 小屏幕手机 */
            @media (max-width: 480px) {
                #search-notification-container .notification {
                    padding: 12px 14px;
                    font-size: 14px;
                    gap: 8px;
                }
                
                #search-notification-container .notification-close {
                    width: 20px;
                    height: 20px;
                    font-size: 18px;
                }
            }
            
            /* 平板横屏 */
            @media (min-width: ${config.mobileBreakpoint + 1}px) and (max-width: 1024px) {
                #search-notification-container {
                    top: 15px;
                }
            }
            
            /* 暗色模式支持 */
            @media (prefers-color-scheme: dark) {
                #search-notification-container .notification {
                    background-color: #2d1b1b;
                    color: #ffb3b3;
                    border-color: #5c3a3a;
                }
                
                #search-notification-container .notification-close {
                    color: #ffb3b3;
                }
            }
            
            /* 动画 */
            .notification-slide-in {
                animation: slideIn ${config.animationDuration} forwards;
            }
            
            .notification-slide-out {
                animation: slideOut ${config.animationDuration} forwards;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateY(-100px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(-100px);
                    opacity: 0;
                }
            }
            
            /* 触摸设备优化 */
            @media (hover: none) and (pointer: coarse) {
                #search-notification-container .notification-close {
                    min-width: 44px;
                    min-height: 44px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // 显示弹窗
    function showNotification(message = '未找到匹配的内容。请尝试其他关键词。', title = '搜索提示') {
        // 确保初始化
        if (!isInitialized) init();
        
        // 清除现有弹窗
        clearTimeout(notificationContainer.timeoutId);
        notificationContainer.innerHTML = '';
        
        // 创建弹窗元素
        const notification = document.createElement('div');
        notification.className = 'notification notification-slide-in';
        
        notification.innerHTML = `
            <div class="notification-icon">${config.icon}</div>
            <div class="notification-content">
                <strong>${title}</strong><br>
                ${message}
            </div>
            <button class="notification-close" aria-label="关闭提示">×</button>
        `;
        
        notificationContainer.appendChild(notification);
        
        // 显示弹窗
        setTimeout(() => {
            notificationContainer.style.transform = 'translateY(0)';
            notificationContainer.style.opacity = '1';
        }, 10);
        
        // 设置关闭按钮事件
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            hideNotification();
        });
        
        // 触摸设备：点击弹窗其他区域也可关闭
        if ('ontouchstart' in window) {
            notification.addEventListener('click', (e) => {
                if (e.target === notification || e.target.classList.contains('notification-content')) {
                    hideNotification();
                }
            });
        }
        
        // 自动关闭
        if (config.duration > 0) {
            notificationContainer.timeoutId = setTimeout(() => {
                hideNotification();
            }, config.duration);
        }
    }
    
    // 隐藏弹窗
    function hideNotification() {
        if (!notificationContainer || !isInitialized) return;
        
        const notification = notificationContainer.querySelector('.notification');
        if (notification) {
            // 添加滑出动画
            notification.classList.remove('notification-slide-in');
            notification.classList.add('notification-slide-out');
            
            // 动画结束后移除元素
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
                notificationContainer.style.transform = 'translateY(-100px)';
                notificationContainer.style.opacity = '0';
            }, parseFloat(config.animationDuration) * 1000);
        }
    }
    
    // 销毁组件（如果需要）
    function destroy() {
        if (notificationContainer && notificationContainer.parentNode) {
            notificationContainer.parentNode.removeChild(notificationContainer);
        }
        notificationContainer = null;
        isInitialized = false;
    }
    
    // 公开API
    window.SearchNotification = {
        show: showNotification,
        hide: hideNotification,
        destroy: destroy,
        config: config
    };
    
    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
})();