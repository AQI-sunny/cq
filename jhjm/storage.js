// 存储管理模块
const STORAGE_KEYS = {
    SEARCH_HISTORY: 'search_system_history',
    BREADCRUMB_PATH: 'search_system_breadcrumb',
    RECENT_PAGES: 'search_system_recent_pages',
    CURRENT_PAGE: 'search_system_current_page'
};

// 保存搜索历史
function saveSearchHistory(keyword, targetUrl) {
    try {
        const history = getSearchHistory();
        
        // 添加新记录
        const newRecord = {
            keyword: keyword,
            url: targetUrl,
            timestamp: new Date().toISOString(),
            title: searchEngine.getPageTitle(targetUrl)
        };
        
        // 移除重复记录（相同的URL）
        const filteredHistory = history.filter(record => record.url !== targetUrl);
        filteredHistory.unshift(newRecord); // 添加到开头
        
        // 最多保留50条记录
        const limitedHistory = filteredHistory.slice(0, 50);
        
        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(limitedHistory));
        
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
        const historyJson = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (error) {
        console.error('获取搜索历史失败:', error);
        return [];
    }
}

// 保存面包屑路径
function saveToBreadcrumb(targetUrl, keyword) {
    try {
        const breadcrumb = getBreadcrumb();
        const pageTitle = searchEngine.getPageTitle(targetUrl);
        
        const newEntry = {
            url: targetUrl,
            title: pageTitle,
            keyword: keyword,
            timestamp: new Date().toISOString()
        };
        
        // 检查是否已存在相同URL的记录
        const existingIndex = breadcrumb.findIndex(item => item.url === targetUrl);
        
        if (existingIndex !== -1) {
            // 如果存在，移到数组末尾（表示最近访问）
            breadcrumb.splice(existingIndex, 1);
        }
        
        breadcrumb.push(newEntry);
        
        // 最多保留10个面包屑记录
        const limitedBreadcrumb = breadcrumb.slice(-10);
        
        localStorage.setItem(STORAGE_KEYS.BREADCRUMB_PATH, JSON.stringify(limitedBreadcrumb));
        
    } catch (error) {
        console.error('保存面包屑失败:', error);
    }
}

// 获取面包屑路径
function getBreadcrumb() {
    try {
        const breadcrumbJson = localStorage.getItem(STORAGE_KEYS.BREADCRUMB_PATH);
        return breadcrumbJson ? JSON.parse(breadcrumbJson) : [];
    } catch (error) {
        console.error('获取面包屑失败:', error);
        return [];
    }
}

// 保存当前页面信息
function saveCurrentPageInfo(url, keyword) {
    try {
        const info = {
            url: url,
            keyword: keyword,
            timestamp: new Date().toISOString(),
            title: searchEngine.getPageTitle(url)
        };
        
        localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE, JSON.stringify(info));
    } catch (error) {
        console.error('保存当前页面信息失败:', error);
    }
}

// 获取当前页面信息
function getCurrentPageInfo() {
    try {
        const infoJson = localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE);
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
        return null; // 没有父页面
    }
    
    // 找到当前页面的索引
    const currentIndex = breadcrumb.findIndex(item => item.url === currentUrl);
    
    if (currentIndex > 0) {
        return breadcrumb[currentIndex - 1]; // 返回前一个页面
    }
    
    return null;
}

// 清除历史记录
function clearSearchHistory() {
    try {
        localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.BREADCRUMB_PATH);
        return true;
    } catch (error) {
        console.error('清除历史记录失败:', error);
        return false;
    }
}

// 获取最近访问的页面（用于显示在首页）
function getRecentPages(limit = 6) {
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
        // 尝试从keywords.json中获取图标
        const pageInfo = searchEngine.keywordsData?.recentPages?.find(p => p.url === page.url);
        const icon = pageInfo?.icon || 'https://sylvie-seven-cq.top/gallery/search.png';
        
        html += `
            <a href="${page.url}" class="recent-page" onclick="event.preventDefault(); goToPage('${page.url}')">
                <img src="${icon}" alt="${page.title}">
                <span>${page.title.substring(0, 8)}${page.title.length > 8 ? '...' : ''}</span>
            </a>
        `;
    });
    
    recentPagesContainer.innerHTML = html;
}