(function() {
    'use strict';
    
    // ====== 配置常量 ======
    const BLOCK_KEYWORDS = ['3307'];
    
    // ====== 修复后的核心拦截函数 ======
    
    /**
     * 精确拦截3307搜索 - 修复版
     * 只拦截搜索功能，不影响其他页面元素
     */
    function preciseBlock3307Search() {
        // 方法1：温和的搜索输入拦截
        interceptSearchInputGentle();
        
        // 方法2：精确的搜索按钮拦截
        interceptSearchButtonPrecise();
        
        // 方法3：安全的重写搜索函数
        overrideSearchFunctionSafely();
        
        // 方法4：有限的结果监控（不再监控整个DOM）
        monitorSearchResultsSafely();
        
        // 新增：保护系统日志链接
        protectSyslogLink();
    }
    
    /**
     * 保护系统日志链接 - 新增功能
     */
    function protectSyslogLink() {
        // 立即检查系统日志链接是否存在
        setTimeout(() => {
            if (!document.getElementById('syslog-link')) {
                restoreSyslogLink();
            }
        }, 1000);
        
        // 定期检查保护
        setInterval(() => {
            const syslogLink = document.getElementById('syslog-link');
            if (!syslogLink) {
                console.warn('系统日志链接丢失，正在恢复...');
                restoreSyslogLink();
            }
        }, 3000);
    }
    
    /**
     * 恢复系统日志链接 - 新增紧急恢复功能
     */
    function restoreSyslogLink() {
        
        
        // 查找可能的位置来重新插入系统日志链接
        const header = document.querySelector('header, nav, .header, .navbar');
        const mainNav = document.querySelector('.main-nav, .navigation, nav');
        const body = document.body;
        
        let container = null;
        
        // 按优先级选择插入位置
        if (mainNav) {
            container = mainNav;
        } else if (header) {
            container = header;
        } else {
            container = body;
        }
        
        if (container) {
            const syslogLink = document.createElement('a');
            syslogLink.href = 'xtrz.html';
            syslogLink.className = 'syslog-link';
            syslogLink.id = 'syslog-link';
            syslogLink.textContent = '系统日志';
            syslogLink.style.cssText = `
                display: inline-block;
                padding: 8px 16px;
                margin: 10px;
                background: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                font-size: 14px;
                font-family: system-ui, -apple-system, sans-serif;
            `;
            
            // 如果是body，插入到最前面
            if (container === body) {
                body.insertBefore(syslogLink, body.firstChild);
            } else {
                container.appendChild(syslogLink);
            }
            
            
            
            // 添加点击保护
            syslogLink.addEventListener('click', function(e) {
                e.stopPropagation();
            }, true);
        }
    }
    
    /**
     * 温和的搜索输入拦截 - 修复版
     */
    function interceptSearchInputGentle() {
        function setupInputInterception() {
            const searchInput = document.getElementById('search-input');
            if (!searchInput) {
                setTimeout(setupInputInterception, 500);
                return;
            }
            
            // 只拦截回车键的搜索
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    const query = this.value.trim();
                    if (shouldBlockSearch(query)) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        showBlockedMessage();
                        return false;
                    }
                }
            }, true);
        }
        
        setupInputInterception();
    }
    
    /**
     * 精确的搜索按钮拦截 - 修复版
     */
    function interceptSearchButtonPrecise() {
        function setupButtonInterception() {
            const searchBtn = document.getElementById('search-btn');
            if (!searchBtn) {
                setTimeout(setupButtonInterception, 500);
                return;
            }
            
            searchBtn.addEventListener('click', function(e) {
                const searchInput = document.getElementById('search-input');
                const query = searchInput ? searchInput.value.trim() : '';
                
                if (shouldBlockSearch(query)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    showBlockedMessage();
                    return false;
                }
            }, true);
        }
        
        setupButtonInterception();
    }
    
    /**
     * 安全的重写搜索函数 - 修复版
     */
    function overrideSearchFunctionSafely() {
        if (typeof window.performSearch === 'function') {
            const originalPerformSearch = window.performSearch;
            
            window.performSearch = function() {
                const searchInput = document.getElementById('search-input');
                const query = searchInput ? searchInput.value.trim() : '';
                
                if (shouldBlockSearch(query)) {
                    showBlockedMessage();
                    return;
                }
                
                return originalPerformSearch.apply(this, arguments);
            };
            
            // 保持函数属性
            Object.keys(originalPerformSearch).forEach(key => {
                window.performSearch[key] = originalPerformSearch[key];
            });
        }
    }
    
    /**
     * 安全的结果监控 - 修复版
     * 不再使用MutationObserver监控整个DOM，避免影响其他元素
     */
    function monitorSearchResultsSafely() {
        // 只在搜索执行后检查一次，而不是持续监控
        let lastSearchQuery = '';
        
        function checkAfterSearch() {
            const searchInput = document.getElementById('search-input');
            const currentQuery = searchInput ? searchInput.value.trim() : '';
            
            // 只有当查询变化且包含3307时才处理
            if (currentQuery !== lastSearchQuery && shouldBlockSearch(currentQuery)) {
                const mainPosts = document.getElementById('main-posts');
                if (mainPosts) {
                    // 只检查是否有搜索结果标题，不删除其他内容
                    const resultTitles = mainPosts.querySelectorAll('h2, h3, .post-title');
                    let hasSearchResults = false;
                    
                    resultTitles.forEach(title => {
                        const text = title.textContent || '';
                        if (text.includes('搜索') || 
                            text.includes('结果') ||
                            (text.includes('3307') && !text.includes('系统日志'))) {
                            hasSearchResults = true;
                        }
                    });
                    
                    if (hasSearchResults) {
                        clearOnlySearchResults();
                    }
                }
            }
            
            lastSearchQuery = currentQuery;
        }
        
        // 温和的检查，每5秒一次（原来是2秒）
        setInterval(checkAfterSearch, 5000);
    }
    
    /**
     * 只清空搜索结果，保留其他内容 - 修复版
     */
    function clearOnlySearchResults() {
        const main = document.getElementById('main-posts');
        if (!main) return;
        
        // 紧急修复：保护系统日志链接
        const syslogLink = document.getElementById('syslog-link');
        if (!syslogLink) {
            console.warn('系统日志链接不见了！正在恢复...');
            restoreSyslogLink();
        }
        
        // 只移除看起来像搜索结果的元素，保留其他内容
        const searchResults = main.querySelectorAll(
            'div.post-card, div.search-result, h2, h3, .post-item'
        );
        
        let removedCount = 0;
        searchResults.forEach(element => {
            // 紧急修复：跳过系统日志相关元素
            if (element.id === 'syslog-link' || 
                element.href && element.href.includes('xtrz.html') ||
                element.textContent && element.textContent.includes('系统日志')) {
                
                return; // 跳过这个元素
            }
            
            const text = element.textContent || '';
            if ((text.includes('3307') && !text.includes('系统日志')) || 
                (text.includes('搜索') && !text.includes('系统日志')) || 
                (text.includes('结果') && !text.includes('系统日志')) ||
                (element.querySelector('h2, h3') && !element.querySelector('#syslog-link'))) {
                element.remove();
                removedCount++;
            }
        });
        
        // 如果移除了搜索结果，显示提示
        if (removedCount > 0) {
            showBlockedMessage();
        }
        
        // 再次检查系统日志链接是否存在
        if (!document.getElementById('syslog-link')) {
            setTimeout(restoreSyslogLink, 100);
        }
    }
    
    /**
     * 显示拦截提示 - 新增功能
     */
    function showBlockedMessage() {
        // 先检查是否已经显示过提示
        const existingMessage = document.getElementById('search-blocked-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const message = document.createElement('div');
        message.id = 'search-blocked-message';
        message.style.cssText = `
            text-align: center;
            padding: 20px;
            margin: 20px 0;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            color: #856404;
            font-size: 14px;
            position: relative;
            z-index: 1000;
        `;
        message.textContent = '该搜索内容暂不显示结果';
        
        const main = document.getElementById('main-posts');
        if (main) {
            // 确保不覆盖系统日志链接
            const syslogLink = document.getElementById('syslog-link');
            if (syslogLink && syslogLink.parentNode === main) {
                main.insertBefore(message, syslogLink.nextSibling);
            } else {
                main.prepend(message);
            }
            
            // 3秒后自动移除提示
            setTimeout(() => {
                if (message.parentNode) {
                    message.remove();
                }
            }, 3000);
        }
    }
    
    /**
     * 检查是否应该阻止搜索 - 保持不变
     */
    function shouldBlockSearch(query) {
        return BLOCK_KEYWORDS.some(keyword => 
            query === keyword || query.includes(keyword)
        );
    }
    
    // ====== 修复兼容性 ======
    
    function fixCrossBrowserCompatibility() {
        if (!window.MutationObserver) {
            window.MutationObserver = window.WebKitMutationObserver || window.MozMutationObserver;
        }
    }
    
    function addRobustErrorHandling() {
        window.addEventListener('error', function(e) {
            
        });
        
        window.addEventListener('unhandledrejection', function(e) {
            e.preventDefault();
        });
    }
    
    // ====== 初始化函数 - 修复版 ======
    
    function initFixedBlockSystem() {
        try {
            // 修复兼容性
            fixCrossBrowserCompatibility();
            
            // 设置错误处理
            addRobustErrorHandling();
            
            // 延迟启动以确保页面加载完成
            setTimeout(() => {
                preciseBlock3307Search();
                
                
                // 初始化完成后立即检查系统日志链接
                setTimeout(() => {
                    if (!document.getElementById('syslog-link')) {
                        
                        restoreSyslogLink();
                    }
                }, 500);
            }, 1500);
            
        } catch (error) {
            console.warn('拦截系统初始化失败，使用降级模式');
            // 降级方案：只拦截明显的搜索
            setupFallbackInterception();
        }
    }
    
    /**
     * 降级拦截方案 - 最安全模式
     */
    function setupFallbackInterception() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput && searchBtn) {
            const handler = function(e) {
                const query = searchInput.value.trim();
                if (query.includes('3307')) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    alert('该搜索内容暂不可用');
                    return false;
                }
            };
            
            searchInput.addEventListener('keydown', handler, true);
            searchBtn.addEventListener('click', handler, true);
        }
        
        // 降级模式下也要保护系统日志
        protectSyslogLink();
    }
    
    // ====== 执行初始化 ======
    
    // 使用更温和的初始化方式
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initFixedBlockSystem, 1000);
        });
    } else {
        setTimeout(initFixedBlockSystem, 1000);
    }
    
    // 导出函数用于调试
    window._searchFix = {
        restoreSyslogLink: restoreSyslogLink,
        protectSyslogLink: protectSyslogLink,
        version: '2.0-safe'
    };
    
})();
