// logo-redirect.js
// 功能：点击Logo返回到search1.0.html页面 - 圆形点击效果版（保持原始形状）

(function() {
    // 等待DOM完全加载
    document.addEventListener('DOMContentLoaded', function() {
        // 创建圆形点击效果样式（不改变Logo原始形状）
        function createRippleStyles() {
            const style = document.createElement('style');
            style.textContent = `
                .logo-ripple-overlay {
                    position: relative;
                    display: inline-block;
                    cursor: pointer;
                }
                
                .logo-ripple-overlay:hover {
                    transform: scale(1.05);
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                .logo-ripple-circle {
                    position: absolute;
                    border-radius: 50%;
                    background: radial-gradient(circle, 
                        rgba(74, 144, 226, 0.7) 0%, 
                        rgba(52, 152, 219, 0.4) 50%, 
                        rgba(41, 128, 185, 0.2) 70%, 
                        transparent 90%);
                    transform: scale(0);
                    animation: ripple-animation 0.8s cubic-bezier(0.18, 0.89, 0.32, 1.28);
                    pointer-events: none;
                    z-index: 10;
                }
                
                @keyframes ripple-animation {
                    0% {
                        transform: scale(0);
                        opacity: 0.8;
                    }
                    50% {
                        opacity: 0.6;
                    }
                    100% {
                        transform: scale(2.5);
                        opacity: 0;
                    }
                }
                
                .logo-pulse-overlay {
                    position: relative;
                }
                
                .logo-pulse-overlay::before {
                    content: '';
                    position: absolute;
                    top: -5px;
                    left: -5px;
                    right: -5px;
                    bottom: -5px;
                    border-radius: 50%;
                    background: transparent;
                    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.7);
                    animation: pulse-overlay-animation 2.5s infinite;
                    pointer-events: none;
                    z-index: 1;
                }
                
                @keyframes pulse-overlay-animation {
                    0% {
                        box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 12px rgba(52, 152, 219, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(52, 152, 219, 0);
                    }
                }
                
                .logo-click-feedback-overlay {
                    animation: click-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }
                
                @keyframes click-bounce {
                    0%, 100% {
                        transform: scale(1);
                    }
                    30% {
                        transform: scale(0.92);
                    }
                    60% {
                        transform: scale(1.03);
                    }
                    80% {
                        transform: scale(0.98);
                    }
                }
                
                .logo-glow-effect {
                    filter: drop-shadow(0 0 8px rgba(52, 152, 219, 0.6));
                    transition: filter 0.3s ease;
                }
            `;
            document.head.appendChild(style);
        }
        
        // 创建圆形涟漪效果（覆盖在Logo上）
        function createRippleEffect(event, element, logoElement) {
            const rect = logoElement.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.5;
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            const ripple = document.createElement('span');
            ripple.classList.add('logo-ripple-circle');
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            element.appendChild(ripple);
            
            // 动画结束后移除涟漪元素
            setTimeout(() => {
                if (ripple.parentElement) {
                    ripple.remove();
                }
            }, 800);
        }
        
        // 找到Logo元素的函数
        function findLogoElement() {
            // 可能的Logo选择器（按优先级排序）
            const logoSelectors = [
                'header img[src*="logo"]',
                '.logo',
                '#logo',
                'header h1 a',
                'header a img',
                'nav img',
                'a img[alt*="logo"]',
                'img[alt*="Logo"]',
                '.header-logo',
                'a.logo-link',
                'header svg',
                '.logo-svg'
            ];
            
            // 遍历选择器查找Logo
            for (let selector of logoSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    return element;
                }
            }
            
            // 如果没有找到，尝试查找第一个图片或网站标题
            return document.querySelector('header img') || 
                   document.querySelector('header h1') || 
                   document.querySelector('header a') ||
                   document.querySelector('header svg');
        }
        
        // 包装Logo元素，添加点击效果覆盖层（不改变Logo形状）
        function wrapLogoWithOverlay(logoElement) {
            // 检查是否已经被包装过
            if (logoElement.classList.contains('logo-ripple-overlay') || 
                logoElement.parentElement.classList.contains('logo-ripple-overlay')) {
                return logoElement.classList.contains('logo-ripple-overlay') ? 
                       logoElement : logoElement.parentElement;
            }
            
            // 创建包装容器
            const wrapper = document.createElement('div');
            wrapper.classList.add('logo-ripple-overlay');
            
            // 保持Logo原始大小和位置
            const logoRect = logoElement.getBoundingClientRect();
            wrapper.style.width = logoRect.width + 'px';
            wrapper.style.height = logoRect.height + 'px';
            wrapper.style.display = 'inline-block';
            wrapper.style.verticalAlign = 'middle';
            
            // 保持Logo原始样式
            const logoStyles = window.getComputedStyle(logoElement);
            if (logoElement.tagName === 'IMG' || logoElement.tagName === 'SVG') {
                logoElement.style.borderRadius = logoStyles.borderRadius;
            }
            
            // 包装元素
            logoElement.parentNode.insertBefore(wrapper, logoElement);
            wrapper.appendChild(logoElement);
            
            return { wrapper, logoElement: logoElement };
        }
        
        // 添加呼吸灯效果（不改变Logo形状）
        function addPulseEffect(wrapper) {
            setTimeout(() => {
                wrapper.classList.add('logo-pulse-overlay');
            }, 1200);
            
            // 鼠标移入时添加发光效果
            wrapper.addEventListener('mouseenter', function() {
                const logo = this.querySelector('img, svg, h1, a');
                if (logo) {
                    logo.classList.add('logo-glow-effect');
                }
                this.classList.remove('logo-pulse-overlay');
            });
            
            // 鼠标移出时恢复呼吸效果
            wrapper.addEventListener('mouseleave', function() {
                const logo = this.querySelector('img, svg, h1, a');
                if (logo) {
                    setTimeout(() => {
                        logo.classList.remove('logo-glow-effect');
                    }, 300);
                }
                setTimeout(() => {
                    this.classList.add('logo-pulse-overlay');
                }, 1500);
            });
        }
        
        // 初始化
        createRippleStyles();
        
        // 获取Logo元素
        const logoElement = findLogoElement();
        
        // 如果找到了Logo元素
        if (logoElement) {
            // 包装Logo，添加效果覆盖层
            const { wrapper, logoElement: originalLogo } = wrapLogoWithOverlay(logoElement);
            
            // 添加呼吸灯效果
            /* addPulseEffect(wrapper);
             */
            // 添加点击事件监听器
            wrapper.addEventListener('click', function(event) {
                // 阻止默认行为（如果有的话）
                event.preventDefault();
                event.stopPropagation();
                
                // 创建圆形涟漪效果
                createRippleEffect(event, this, originalLogo);
                
                // 添加点击弹跳反馈
                this.classList.add('logo-click-feedback-overlay');
                
                // 添加提示文本（临时显示）
                const originalTitle = originalLogo.getAttribute('title') || 
                                    originalLogo.getAttribute('alt') || 
                                    originalLogo.textContent || 
                                    '返回搜索';
                originalLogo.setAttribute('data-original-title', originalTitle);
                originalLogo.setAttribute('title', '返回搜索页面...');
                
                // 延迟跳转以显示动画效果
                setTimeout(() => {
                    // 跳转到search1.0.html页面
                    window.location.href = 'search1.0.html';
                }, 500);
                
                // 恢复原始状态（如果用户停留在当前页面）
                setTimeout(() => {
                    this.classList.remove('logo-click-feedback-overlay');
                    originalLogo.setAttribute('title', originalTitle);
                }, 1500);
            });
            
            // 添加一个微妙的指示器，表示Logo可点击
            const originalTitle = originalLogo.getAttribute('title') || 
                                originalLogo.getAttribute('alt') || 
                                originalLogo.textContent || '';
            if (originalTitle && !originalTitle.includes('返回搜索')) {
                originalLogo.setAttribute('title', `点击跳转搜索首页`);
            }
            
            console.log('Logo圆形点击效果已启用：点击Logo可返回到search1.0.html');
        } else {
            // 如果没有找到Logo，在控制台给出提示
            console.warn('未找到Logo元素，请检查页面结构或手动指定Logo选择器');
        }
        
        // 可选：提供一个全局函数，允许手动设置Logo重定向
        window.setLogoRedirect = function(elementSelector, options = {}) {
            const element = document.querySelector(elementSelector);
            if (element) {
                const { wrapper, logoElement: originalLogo } = wrapLogoWithOverlay(element);
                addPulseEffect(wrapper);
                
                wrapper.addEventListener('click', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    createRippleEffect(event, this, originalLogo);
                    this.classList.add('logo-click-feedback-overlay');
                    
                    setTimeout(() => {
                        window.location.href = 'search1.0.html';
                    }, 500);
                });
                
                console.log(`Logo圆形点击效果已手动设置到: ${elementSelector}`);
                return true;
            } else {
                console.error(`未找到元素: ${elementSelector}`);
                return false;
            }
        };
    });
})();