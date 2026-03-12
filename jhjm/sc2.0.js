// 搜索功能实现
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');
    const resultsList = document.getElementById('results-list');
    const closeResults = document.getElementById('close-results');
    
    // 加载JSON数据
    let siteData = [];
    
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            siteData = data.pages;
        })
        .catch(error => {
            console.error('加载数据失败:', error);
        });
    
    // 搜索功能
    function performSearch(query) {
        if (!query.trim()) return;
        
        // 清空之前的结果
        resultsList.innerHTML = '';
        
        // 过滤匹配的页面
        const matchedPages = siteData.filter(page => {
            const searchText = (page.title + ' ' + page.content).toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
        
        // 显示结果
        if (matchedPages.length > 0) {
            matchedPages.forEach(page => {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';
                
                // 高亮匹配的关键词
                const highlightedTitle = highlightText(page.title, query);
                const highlightedContent = highlightText(
                    page.content.substring(0, 150) + '...', 
                    query
                );
                
                resultItem.innerHTML = `
                    <h3><a href="${page.url}">${highlightedTitle}</a></h3>
                    <p>${highlightedContent}</p>
                    <span class="result-url">${page.url}</span>
                `;
                
                resultsList.appendChild(resultItem);
            });
        } else {
            resultsList.innerHTML = '<p class="no-results">没有找到相关结果。请尝试其他关键词。</p>';
        }
        
        // 显示结果区域
        searchResults.classList.remove('hidden');
    }
    
    // 高亮文本函数
    function highlightText(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    // 事件监听
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            performSearch(query);
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                performSearch(query);
            }
        });
    }
    
    if (closeResults) {
        closeResults.addEventListener('click', function() {
            searchResults.classList.add('hidden');
        });
    }
    
    // 检查URL参数，如果有搜索词则执行搜索
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    
    if (searchQuery && searchInput) {
        searchInput.value = searchQuery;
        performSearch(searchQuery);
    }
});