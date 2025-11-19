(function() {
    'use strict';
    
    // ====== 配置常量 ======
    const BLOCK_KEYWORDS = ['3307'];
    // 唯一允许显示的帖子配置
    const ALLOWED_POST = {
        title: "[招领] 3307住户，你的黑色笔记本落下了",
        author: "林中的猫", 
        status: "未认领",
        content: "在33楼楼梯间消防箱旁发现了这个黑色笔记本。里面夹着一张外卖订单，显示是我们公寓的3307住户，我是你的邻居，本想直接敲门归还的。但想了想觉得有些冒昧，故而在线确认一番，请问是3307住户的笔记本吗？\n![黑色笔记本](https://sylvie-seven-cq.top/gallery/bjb.jpg)",
        date: "2025-9-7",
        section: "失物招领"
    };
    
    // ====== 核心拦截函数 ======
    
    /**
     * 完全拦截3307搜索 - 主函数
     * 修改逻辑：在搜索执行的各个阶段拦截3307关键词，不显示搜索结果
     */
    function completelyBlock3307Search() {
        // 方法1：拦截搜索输入事件（第一层防护）
        interceptSearchInputEvents();
        
        // 方法2：拦截搜索按钮点击（第二层防护）
        interceptSearchButtonClicks();
        
        // 方法3：重写全局搜索函数（第三层防护）
        overrideGlobalSearchFunction();
        
        // 方法4：DOM结果监控（最终防护）
        monitorSearchResults();
        
        // 方法5：定时检查确保拦截生效
        setupPeriodicCheck();
    }
    
    /**
     * 拦截搜索输入事件 - 修改键盘输入处理
     * 修改位置：搜索输入框的keydown, keypress, input事件
     */
    function interceptSearchInputEvents() {
        function setupInputInterception() {
            const searchInput = document.getElementById('search-input');
            if (!searchInput) {
                setTimeout(setupInputInterception, 300);
                return;
            }
            
            // 保存原始事件处理程序
            const originalKeydown = searchInput.onkeydown;
            const originalKeypress = searchInput.onkeypress;
            const originalInput = searchInput.oninput;
            
            // 拦截键盘按下事件（包括回车）
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    const query = this.value.trim();
                    if (shouldBlockSearch(query)) {
                        e.preventDefault();
                        e.stopPropagation();
                        clearSearchResults();
                        return false;
                    }
                }
                
                // 其他按键正常处理
                if (originalKeydown) {
                    return originalKeydown.call(this, e);
                }
            }, true);
            
            // 拦截键盘按压事件
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const query = this.value.trim();
                    if (shouldBlockSearch(query)) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }
                }
                
                if (originalKeypress) {
                    return originalKeypress.call(this, e);
                }
            }, true);
        }
        
        setupInputInterception();
    }
    
    /**
     * 拦截搜索按钮点击 - 修改点击事件处理
     * 修改位置：搜索按钮的click事件
     */
    function interceptSearchButtonClicks() {
        function setupButtonInterception() {
            const searchBtn = document.getElementById('search-btn');
            if (!searchBtn) {
                setTimeout(setupButtonInterception, 300);
                return;
            }
            
            // 保存原始点击处理程序
            const originalClick = searchBtn.onclick;
            
            // 重写点击事件
            searchBtn.addEventListener('click', function(e) {
                const searchInput = document.getElementById('search-input');
                const query = searchInput ? searchInput.value.trim() : '';
                
                if (shouldBlockSearch(query)) {
                    e.preventDefault();
                    e.stopPropagation();
                    clearSearchResults();
                    return false;
                }
                
                // 其他搜索正常进行
                if (originalClick) {
                    return originalClick.call(this, e);
                }
            }, true);
        }
        
        setupButtonInterception();
    }
    
    /**
     * 重写全局搜索函数 - 修改performSearch函数调用
     * 修改位置：重写window.performSearch函数
     */
    function overrideGlobalSearchFunction() {
        // 保存原始搜索函数
        const originalPerformSearch = window.performSearch;
        
        if (typeof originalPerformSearch === 'function') {
            // 重写全局搜索函数
            window.performSearch = function() {
                const searchInput = document.getElementById('search-input');
                const query = searchInput ? searchInput.value.trim() : '';
                
                if (shouldBlockSearch(query)) {
                    clearSearchResults();
                    return;
                }
                
                // 调用原始搜索函数
                return originalPerformSearch.apply(this, arguments);
            };
            
            // 保持函数属性
            Object.keys(originalPerformSearch).forEach(key => {
                window.performSearch[key] = originalPerformSearch[key];
            });
        }
    }
    
    /**
     * 监控搜索结果 - 修改DOM显示内容
     * 修改位置：监控main-posts区域的内容变化
     */
    function monitorSearchResults() {
        let observer;
        
        function setupDOMObserver() {
            const mainPosts = document.getElementById('main-posts');
            if (!mainPosts) {
                setTimeout(setupDOMObserver, 500);
                return;
            }
            
            // 创建MutationObserver监控DOM变化
            observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        checkAndClear3307Results();
                    }
                });
            });
            
            // 开始观察
            observer.observe(mainPosts, {
                childList: true,
                subtree: true
            });
        }
        
        function checkAndClear3307Results() {
            const searchInput = document.getElementById('search-input');
            const currentQuery = searchInput ? searchInput.value.trim() : '';
            
            // 如果当前搜索包含3307，清空结果
            if (shouldBlockSearch(currentQuery)) {
                const mainPosts = document.getElementById('main-posts');
                if (mainPosts) {
                    const resultTitles = mainPosts.querySelectorAll('h2');
                    let has3307Results = false;
                    
                    resultTitles.forEach(title => {
                        if (title.textContent.includes('3307') || title.textContent.includes('搜索')) {
                            has3307Results = true;
                        }
                    });
                    
                    if (has3307Results) {
                        clearSearchResults();
                    }
                }
            }
        }
        
        setupDOMObserver();
    }
    
    /**
     * 清空搜索结果 - 修改结果显示
     * 修改位置：直接操作main-posts区域清空内容
     */
    function clearSearchResults() {
        const main = document.getElementById('main-posts');
        if (!main) {
            return;
        }
        
        // 清空现有内容
        while (main.firstChild) {
            main.removeChild(main.firstChild);
        }
        
        // 可选：显示无结果的提示
        const noResults = document.createElement('div');
        noResults.style.textAlign = 'center';
        noResults.style.padding = '40px';
        noResults.style.color = '#666';
        noResults.textContent = '未找到相关结果';
        main.appendChild(noResults);
    }
    
    /**
     * 设置定期检查 - 修改持续监控机制
     */
    function setupPeriodicCheck() {
        // 每2秒检查一次确保拦截生效
        setInterval(() => {
            const searchInput = document.getElementById('search-input');
            if (searchInput && shouldBlockSearch(searchInput.value.trim())) {
                const main = document.getElementById('main-posts');
                if (main) {
                    const hasContent = main.children.length > 0;
                    if (hasContent) {
                        clearSearchResults();
                    }
                }
            }
        }, 2000);
    }
    
    /**
     * 检查是否应该阻止搜索 - 修改关键词检测逻辑
     */
    function shouldBlockSearch(query) {
        return BLOCK_KEYWORDS.some(keyword => 
            query === keyword || query.includes(keyword)
        );
    }
    
    // ====== 兼容性修复 ======
    
    /**
     * 修复跨浏览器兼容性 - 修改事件处理兼容性
     */
    function fixCrossBrowserCompatibility() {
        // 确保MutationObserver在所有浏览器中可用
        if (!window.MutationObserver) {
            window.MutationObserver = window.WebKitMutationObserver || window.MozMutationObserver;
        }
        
        // 添加触摸事件支持（移动设备）
        document.addEventListener('touchstart', function() {}, { passive: true });
        
        // 修复iOS Safari的兼容性
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            // iOS特定修复
            const style = document.createElement('style');
            style.textContent = `
                .post-card {
                    -webkit-tap-highlight-color: transparent;
                    -webkit-touch-callout: none;
                }
            `;
            document.head.appendChild(style);
        }
        
        // 修复Android设备兼容性
        if (/Android/.test(navigator.userAgent)) {
            document.addEventListener('touchstart', function() {}, false);
        }
    }
    
    /**
     * 错误处理 - 修改错误处理机制
     */
    function addRobustErrorHandling() {
        window.addEventListener('error', function(e) {
            if (e.message && e.message.includes('3307')) {
                return true; // 阻止错误冒泡
            }
        });
        
        // Promise错误处理
        window.addEventListener('unhandledrejection', function(e) {
            if (e.reason && e.reason.toString().includes('3307')) {
                e.preventDefault();
            }
        });
    }
    
    // ====== 初始化函数 ======
    
    /**
     * 初始化精确拦截系统
     */
    function initPreciseBlockSystem() {
        try {
            // 修复兼容性
            fixCrossBrowserCompatibility();
            
            // 设置错误处理
            addRobustErrorHandling();
            
            // 延迟启动以确保页面加载完成
            setTimeout(() => {
                completelyBlock3307Search();
            }, 1000);
            
        } catch (error) {
            // 降级方案：直接清空结果
            setTimeout(clearSearchResults, 2000);
        }
    }
    
    // ====== 执行初始化 ======
    
    // 页面加载后立即执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPreciseBlockSystem);
    } else {
        initPreciseBlockSystem();
    }
    
    // 确保在window.load时也执行
    window.addEventListener('load', initPreciseBlockSystem);
    
})();
