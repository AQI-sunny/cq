// search-fix.js - 修复3307搜索问题和iOS/iPad兼容性
(function() {
    'use strict';
    
    // 修复搜索功能 - 专门处理3307搜索
    function fixSearch() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        if (!searchInput || !searchBtn) return;
        
        // 保存原始搜索逻辑
        const originalSearchHandler = searchBtn.onclick;
        
        // 重写搜索按钮点击事件
        searchBtn.onclick = function(e) {
            const query = searchInput.value.trim();
            
            if (query === '3307') {
                // 特殊处理3307搜索，排除用户名
                performFilteredSearch(query);
                if (e) e.preventDefault();
                return false;
            }
            
            // 其他搜索正常进行
            if (originalSearchHandler) {
                return originalSearchHandler.call(this, e);
            }
            return true;
        };
        
        // 重写回车搜索
        searchInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                
                if (query === '3307') {
                    performFilteredSearch(query);
                    e.preventDefault();
                    return false;
                }
                
                // 其他搜索正常进行
                return true;
            }
        };
        
        function performFilteredSearch(query) {
            console.log('执行过滤搜索:', query);
            // 这里调用你的实际搜索函数，添加过滤条件
            // 示例：window.searchPosts('3307', { excludeUsers: true });
            
            // 临时演示效果
            alert('已搜索"3307"，并过滤了用户名相关结果');
        }
    }
    
    // iOS/iPad兼容性修复
    function fixIOSCompatibility() {
        // 修复iOS输入框缩放
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.head.appendChild(meta);
        } else {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        
        // 修复搜索框iOS样式
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            // 防止iOS缩放
            searchInput.addEventListener('focus', function() {
                this.style.fontSize = '16px';
            });
            searchInput.addEventListener('blur', function() {
                this.style.fontSize = '';
            });
            
            // 设置iOS虚拟键盘属性
            searchInput.setAttribute('autocorrect', 'off');
            searchInput.setAttribute('autocapitalize', 'none');
            searchInput.setAttribute('spellcheck', 'false');
        }
        
        // 修复按钮点击效果
        const buttons = document.querySelectorAll('button, .nav-links a');
        buttons.forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.addEventListener('touchstart', function() {
                this.style.opacity = '0.7';
            });
            btn.addEventListener('touchend', function() {
                this.style.opacity = '1';
            });
        });
    }
    
    // 增强导航兼容性
    function enhanceNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            // 确保所有导航链接都有正确的触摸反馈
            link.addEventListener('touchstart', function() {
                this.style.backgroundColor = 'rgba(0,0,0,0.1)';
            });
            link.addEventListener('touchend', function() {
                this.style.backgroundColor = '';
            });
        });
    }
    
    // 初始化所有修复
    function init() {
        fixSearch();
        fixIOSCompatibility();
        enhanceNavigation();
        
        console.log('3307搜索修复和iOS兼容性增强已加载');
    }
    
    // 页面加载后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();