// 导航管理模块

// 页面跳转函数（核心）
function navigateToPage(url, keyword = '', title = '') {
    if (!url) return;
    
    // 保存当前页面的滚动位置（如果需要）
    saveScrollPosition();
    
    // 如果是站内页面，添加来源参数
    let targetUrl = url;
    if (keyword) {
        const separator = targetUrl.includes('?') ? '&' : '?';
        targetUrl += `${separator}from_search=${encodeURIComponent(keyword)}`;
    }
    
    // 跳转到目标页面
    window.location.href = targetUrl;
}

// 返回上级页面
function goBack() {
    const currentUrl = window.location.href;
    const parentInfo = getParentPageInfo(currentUrl);
    
    if (parentInfo) {
        navigateToPage(parentInfo.url, '', '返回上级');
    } else {
        // 如果没有上级页面，返回首页
        goToPage('index.html');
    }
}

// 返回首页
function goToPage(url) {
    if (url === window.location.href) return;
    
    // 保存当前页面信息
    if (window.location.pathname !== '/index.html') {
        saveCurrentPageInfo(window.location.href, '');
    }
    
    // 跳转
    window.location.href = url;
}

// 生成面包屑导航
function generateBreadcrumb() {
    const breadcrumbContainer = document.getElementById('breadcrumb');
    if (!breadcrumbContainer) return;
    
    const breadcrumb = getBreadcrumb();
    const currentPage = window.location.pathname.split('/').pop();
    
    let html = '<a href="index.html" onclick="goToPage(\'index.html\')">首页</a>';
    
    // 如果不是首页，添加面包屑路径
    if (currentPage !== 'index.html') {
        // 获取当前页面信息
        const currentInfo = getCurrentPageInfo();
        const parentInfo = getParentPageInfo(window.location.href);
        
        if (parentInfo) {
            html += ` <span>></span> <a href="${parentInfo.url}" onclick="goToPage('${parentInfo.url}')">${parentInfo.title}</a>`;
        }
        
        if (currentInfo) {
            html += ` <span>></span> <span style="color: #666;">${currentInfo.title}</span>`;
        }
    }
    
    breadcrumbContainer.innerHTML = html;
}

// 保存滚动位置（用于返回时恢复）
function saveScrollPosition() {
    const scrollPos = {
        x: window.scrollX,
        y: window.scrollY,
        page: window.location.href,
        timestamp: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('scroll_positions', JSON.stringify(scrollPos));
    } catch (error) {
        console.error('保存滚动位置失败:', error);
    }
}

// 恢复滚动位置
function restoreScrollPosition() {
    try {
        const scrollPosJson = localStorage.getItem('scroll_positions');
        if (scrollPosJson) {
            const scrollPos = JSON.parse(scrollPosJson);
            if (scrollPos.page === window.location.href) {
                window.scrollTo(scrollPos.x, scrollPos.y);
            }
        }
    } catch (error) {
        console.error('恢复滚动位置失败:', error);
    }
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
    // 恢复滚动位置
    setTimeout(restoreScrollPosition, 100);
    
    // 如果是搜索结果页，显示搜索关键词
    const urlParams = new URLSearchParams(window.location.search);
    const fromSearch = urlParams.get('from_search');
    
    if (fromSearch) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = decodeURIComponent(fromSearch);
        }
    }
});