/**
 * 整合版：页面导航与历史记录系统
 * 包含：搜索历史、面包屑、近期访问、页码显示
 */

const PageSystem = (function() {
    // ==================== 配置区域 ====================
    const CONFIG = {
        // 存储键名
        STORAGE_KEYS: {
            SEARCH_HISTORY: 'search_system_history',
            BREADCRUMB_PATH: 'search_system_breadcrumb',
            RECENT_PAGES: 'search_system_recent_pages',
            CURRENT_PAGE: 'search_system_current_page'
        },
        
        // 页码系统配置
        PAGE_LIST: [
            '企业档案.html',
            '李zh.html',
            '风采.html',
            'qdb2.html',
            'zyym.html',
            '小雨宿舍.html',
            'lzklzk.html',
            'qdb01.html',
            'xgxg.html',
            '流动人口.html',
            'zhoujiacun.html',
            'zwm履历.html',
            '资产评估.html',
            '招工.html',
            '招工horror.html',
            'swzl.html',
            '东南西北.html',
            '供销科.html',
            '厂报.html',
            '保卫科.html',
            '小雪奖.html',
            'hqxx.html',
            '简报.html',
            '工牌2.html',
            '工牌柯.html',
            '平面图.html',
            'bbji.html',
            'shouyin.html',
            '病退申请.html',
            '磁带.html',
            '票根.html',
            '影剧院.html',
            '工具箱.html',
            '悔过书.html',
            '幼儿园.html',
            '魏笔记.html',
            '黄毛.html',
            '癞皮狗.html',
            '丫丫病历.html',
            '老虎机.html',
            /*  '记事本.html', */
            /*  '账本.html', */
            '排班表.html',
            /*  '辞职.html', */
            'xy日记.html',
            'sujinriji1.html',
            '素锦日记-小雨.html',
            'sujinriji-chicu.html',
            '素锦日记4-小学后门.html',
            'sujinriji5-lige.html',
            '素锦日记6-lfg.html',
            '素锦日记7-xghg演讲.html'
            // 在这里继续添加您的页面文件
        ],
        
        // 限制数量
        MAX_HISTORY: 70,
        MAX_BREADCRUMB: 10,
        MAX_RECENT_DISPLAY: 6,
        
        // 样式配置
        STYLES: {
            PAGE_COUNTER: `
                #page-system-counter {
                    position: fixed;
                    bottom: 12px;
                    right: 12px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border-radius: 3px;
                    padding: 5px 8px;
                    font-size: 12px;
                    font-family: monospace;
                    font-weight: bold;
                    z-index: 9999;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                    cursor: default;
                    user-select: none;
                }
                #page-system-counter:hover {
                    opacity: 0.9;
                }
                #page-system-counter.miss {
                    background: rgba(139, 0, 0, 0.8);
                    color: #ffcccc;
                }
                @media (max-width: 768px) {
                    #page-system-counter {
                        font-size: 11px;
                        padding: 4px 6px;
                        bottom: 8px;
                        right: 8px;
                    }
                }
            `
        }
    };
    
    // ==================== 内部变量 ====================
    let keywordsData = null;
    
    // ==================== 初始化 ====================
    function init() {
        // 加载关键词数据
        loadKeywordsData();
        
        // 注入页码计数器样式
        injectStyles();
        
        // 初始化页码显示
        initPageCounter();
        
        // 如果有近期访问容器，加载近期访问
        if (document.getElementById('recentPages')) {
            loadRecentPages();
        }
        
        console.log('页面系统初始化完成');
    }
    
    // 加载关键词数据
    function loadKeywordsData() {
        // 尝试从全局变量获取
        if (window.searchEngine && window.searchEngine.keywordsData) {
            keywordsData = window.searchEngine.keywordsData;
        } else {
            // 如果没有，创建一个简单的映射
            keywordsData = {
                recentPages: []
            };
        }
    }
    
    // 注入样式
    function injectStyles() {
        if (!document.getElementById('page-system-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'page-system-styles';
            styleEl.textContent = CONFIG.STYLES.PAGE_COUNTER;
            document.head.appendChild(styleEl);
        }
    }
    
    // ==================== 搜索历史模块 ====================
    
    // 保存搜索历史
    function saveSearchHistory(keyword, targetUrl) {
        try {
            const history = getSearchHistory();
            
            // 添加新记录
            const newRecord = {
                keyword: keyword,
                url: targetUrl,
                timestamp: new Date().toISOString(),
                title: getPageTitle(targetUrl)
            };
            
            // 移除重复记录（相同的URL）
            const filteredHistory = history.filter(record => record.url !== targetUrl);
            filteredHistory.unshift(newRecord);
            
            // 最多保留指定数量的记录
            const limitedHistory = filteredHistory.slice(0, CONFIG.MAX_HISTORY);
            
            localStorage.setItem(CONFIG.STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(limitedHistory));
            
            // 保存到面包屑路径
            saveToBreadcrumb(targetUrl, keyword);
            
            // 保存当前页面信息
            saveCurrentPageInfo(targetUrl, keyword);
            
        } catch (error) {
            console.error('保存搜索历史失败:', error);
        }
    }
    
    // 获取搜索历史
    function getSearchHistory() {
        try {
            const historyJson = localStorage.getItem(CONFIG.STORAGE_KEYS.SEARCH_HISTORY);
            return historyJson ? JSON.parse(historyJson) : [];
        } catch (error) {
            console.error('获取搜索历史失败:', error);
            return [];
        }
    }
    
    // ==================== 面包屑模块 ====================
    
    // 保存面包屑路径
    function saveToBreadcrumb(targetUrl, keyword) {
        try {
            const breadcrumb = getBreadcrumb();
            const pageTitle = getPageTitle(targetUrl);
            
            const newEntry = {
                url: targetUrl,
                title: pageTitle,
                keyword: keyword,
                timestamp: new Date().toISOString()
            };
            
            // 检查是否已存在相同URL的记录
            const existingIndex = breadcrumb.findIndex(item => item.url === targetUrl);
            
            if (existingIndex !== -1) {
                // 如果存在，移到数组末尾
                breadcrumb.splice(existingIndex, 1);
            }
            
            breadcrumb.push(newEntry);
            
            // 最多保留指定数量的面包屑记录
            const limitedBreadcrumb = breadcrumb.slice(-CONFIG.MAX_BREADCRUMB);
            
            localStorage.setItem(CONFIG.STORAGE_KEYS.BREADCRUMB_PATH, JSON.stringify(limitedBreadcrumb));
            
        } catch (error) {
            console.error('保存面包屑失败:', error);
        }
    }
    
    // 获取面包屑路径
    function getBreadcrumb() {
        try {
            const breadcrumbJson = localStorage.getItem(CONFIG.STORAGE_KEYS.BREADCRUMB_PATH);
            return breadcrumbJson ? JSON.parse(breadcrumbJson) : [];
        } catch (error) {
            console.error('获取面包屑失败:', error);
            return [];
        }
    }
    
    // ==================== 当前页面模块 ====================
    
    // 保存当前页面信息
    function saveCurrentPageInfo(url, keyword) {
        try {
            const info = {
                url: url,
                keyword: keyword,
                timestamp: new Date().toISOString(),
                title: getPageTitle(url)
            };
            
            localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_PAGE, JSON.stringify(info));
        } catch (error) {
            console.error('保存当前页面信息失败:', error);
        }
    }
    
    // 获取当前页面信息
    function getCurrentPageInfo() {
        try {
            const infoJson = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_PAGE);
            return infoJson ? JSON.parse(infoJson) : null;
        } catch (error) {
            console.error('获取当前页面信息失败:', error);
            return null;
        }
    }
    
    // 获取父页面信息
    function getParentPageInfo(currentUrl) {
        const breadcrumb = getBreadcrumb();
        
        if (breadcrumb.length < 2) {
            return null;
        }
        
        const currentIndex = breadcrumb.findIndex(item => item.url === currentUrl);
        
        if (currentIndex > 0) {
            return breadcrumb[currentIndex - 1];
        }
        
        return null;
    }
    
    // ==================== 近期访问模块 ====================
    
    // 获取最近访问的页面
    function getRecentPages(limit = CONFIG.MAX_RECENT_DISPLAY) {
        const history = getSearchHistory();
        
        // 去重，按时间倒序
        const uniquePages = [];
        const seenUrls = new Set();
        
        for (const record of history) {
            if (!seenUrls.has(record.url)) {
                seenUrls.add(record.url);
                uniquePages.push(record);
            }
        }
        
        return uniquePages.slice(0, limit);
    }
    
    // 加载近期访问页面到DOM
    function loadRecentPages() {
        const recentPagesContainer = document.getElementById('recentPages');
        if (!recentPagesContainer) return;
        
        const recentPages = getRecentPages();
        
        if (recentPages.length === 0) {
            recentPagesContainer.innerHTML = '<div style="color: #666; padding: 10px;">暂无访问记录</div>';
            return;
        }
        
        let html = '';
        recentPages.forEach(page => {
            // 尝试从keywordsData中获取图标
            const pageInfo = keywordsData?.recentPages?.find(p => p.url === page.url);
            const icon = pageInfo?.icon || 'https://sylvie-seven-cq.top/gallery/search.png';
            
            html += `
                <a href="${page.url}" class="recent-page" onclick="event.preventDefault(); PageSystem.goToPage('${page.url}')">
                    <img src="${icon}" alt="${page.title}">
                    <span>${page.title.substring(0, 8)}${page.title.length > 8 ? '...' : ''}</span>
                </a>
            `;
        });
        
        recentPagesContainer.innerHTML = html;
    }
    
    // ==================== 页码显示模块 ====================
    
    // 初始化页码计数器
    function initPageCounter() {
        // 获取当前页码
        const pageNumber = getPageNumber();
        
        // 显示页码
        if (pageNumber) {
            showPageCounter(pageNumber);
        }
    }
    
    // 获取当前页码
    function getPageNumber() {
        const currentFile = getCurrentFileName();
        
        // 在页面列表中查找当前文件
        const pageIndex = CONFIG.PAGE_LIST.indexOf(currentFile);
        
        if (pageIndex !== -1) {
            return {
                current: pageIndex + 1,
                total: CONFIG.PAGE_LIST.length,
                isInList: true
            };
        }
        
        // 备选方案：从URL参数获取
        const urlInfo = getPageFromURL();
        if (urlInfo) return urlInfo;
        
        // 备选方案：从data属性获取
        const dataInfo = getPageFromData();
        if (dataInfo) return dataInfo;
        
        // 备选方案：从文件名猜测
        const guessInfo = guessPageFromFilename(currentFile);
        if (guessInfo) return guessInfo;
        
        // 如果都不在列表中，返回miss信息
        return {
            current: 'miss',
            total: CONFIG.PAGE_LIST.length,
            isInList: false,
            filename: currentFile
        };
    }
    
    // 从URL参数获取页码
    function getPageFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParams = ['page', 'p', 'pg', 'pagenum'];
        
        for (const param of pageParams) {
            if (urlParams.has(param)) {
                const pageNum = parseInt(urlParams.get(param)) || 1;
                return {
                    current: pageNum,
                    total: CONFIG.PAGE_LIST.length || pageNum + 5,
                    isInList: false
                };
            }
        }
        
        return null;
    }
    
    // 从data属性获取
    function getPageFromData() {
        const pageElements = document.querySelectorAll('[data-page], [data-page-num], [data-current-page]');
        
        for (const el of pageElements) {
            let current = 1;
            
            if (el.dataset.page) {
                current = parseInt(el.dataset.page);
            } else if (el.dataset.pageNum) {
                current = parseInt(el.dataset.pageNum);
            } else if (el.dataset.currentPage) {
                current = parseInt(el.dataset.currentPage);
            }
            
            if (current > 0) {
                return {
                    current: current,
                    total: CONFIG.PAGE_LIST.length || current + 3,
                    isInList: false
                };
            }
        }
        
        return null;
    }
    
    // 从文件名猜测
    function guessPageFromFilename(filename) {
        const matches = filename.match(/\d+/g);
        
        if (matches && matches.length > 0) {
            const pageNum = parseInt(matches[0]);
            if (pageNum > 0) {
                return {
                    current: pageNum,
                    total: CONFIG.PAGE_LIST.length || pageNum + 3,
                    isInList: false
                };
            }
        }
        
        return null;
    }
    
    // 获取当前文件名
    function getCurrentFileName() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }
    
    // 显示页码计数器
    function showPageCounter(pageInfo) {
        const existing = document.getElementById('page-system-counter');
        if (existing) existing.remove();
        
        const counter = document.createElement('div');
        counter.id = 'page-system-counter';
        
        // 根据是否在列表中设置不同的显示内容和样式
        if (pageInfo.current === 'miss' || !pageInfo.isInList) {
            counter.textContent = `miss/${pageInfo.total}`;
            counter.title = `当前页面不在列表中，共 ${pageInfo.total} 页`;
            counter.classList.add('miss');
        } else {
            counter.textContent = `${pageInfo.current}/${pageInfo.total}`;
            counter.title = `当前第 ${pageInfo.current} 页，共 ${pageInfo.total} 页`;
        }
        
        document.body.appendChild(counter);
    }
    
    // ==================== 通用工具函数 ====================
    
    // 获取页面标题
    function getPageTitle(url) {
        // 如果有关键词数据，从中查找
        if (keywordsData?.recentPages) {
            const pageInfo = keywordsData.recentPages.find(p => p.url === url);
            if (pageInfo?.title) return pageInfo.title;
        }
        
        // 从文件名生成标题
        const fileName = url.split('/').pop() || '';
        return fileName.replace('.html', '').replace(/[-_]/g, ' ') || '未知页面';
    }
    
    // 跳转到页面
    function goToPage(url, keyword = '') {
        if (keyword) {
            saveSearchHistory(keyword, url);
        }
        window.location.href = url;
    }
    
    // 清除历史记录
    function clearHistory() {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEYS.SEARCH_HISTORY);
            localStorage.removeItem(CONFIG.STORAGE_KEYS.BREADCRUMB_PATH);
            return true;
        } catch (error) {
            console.error('清除历史记录失败:', error);
            return false;
        }
    }
    
    // ==================== 更新配置 ====================
    
    // 更新页面列表
    function updatePageList(newList) {
        CONFIG.PAGE_LIST = newList;
    }
    
    // 检查当前页面是否在列表中
    function isCurrentPageInList() {
        const currentFile = getCurrentFileName();
        return CONFIG.PAGE_LIST.includes(currentFile);
    }
    
    // ==================== 返回公共API ====================
    
    return {
        // 初始化
        init: init,
        
        // 历史记录
        saveSearchHistory: saveSearchHistory,
        getSearchHistory: getSearchHistory,
        
        // 面包屑
        getBreadcrumb: getBreadcrumb,
        getParentPageInfo: getParentPageInfo,
        
        // 当前页面
        getCurrentPageInfo: getCurrentPageInfo,
        
        // 近期访问
        getRecentPages: getRecentPages,
        loadRecentPages: loadRecentPages,
        
        // 页码
        updatePageList: updatePageList,
        refreshPageCounter: initPageCounter,
        isCurrentPageInList: isCurrentPageInList,
        getPageNumber: getPageNumber,
        
        // 导航
        goToPage: goToPage,
        
        // 清理
        clearHistory: clearHistory
    };
})();

// ==================== 自动初始化 ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PageSystem.init());
} else {
    setTimeout(() => PageSystem.init(), 100);
}

// 暴露为全局对象
window.PageSystem = PageSystem;

// 为了向后兼容，保留旧的函数名（可选）
window.saveSearchHistory = PageSystem.saveSearchHistory;
window.getSearchHistory = PageSystem.getSearchHistory;
window.loadRecentPages = PageSystem.loadRecentPages;
window.goToPage = PageSystem.goToPage;
