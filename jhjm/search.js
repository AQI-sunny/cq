// script.js
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');
    const resultsList = document.getElementById('results-list');
    const closeResults = document.getElementById('close-results');
    
    // 定义关键词和对应页面的映射
    const keywordMappings = {
        '产品': 'products.html',
        '产品介绍': 'products.html',
        '商品': 'products.html',
        '关于': 'about.html',
        '关于我们': 'about.html',
        '公司': 'about.html',
        '联系': 'contact.html',
        '联系我们': 'contact.html',
        '联系方式': 'contact.html',
        '帮助': 'help.html',
        '帮助中心': 'help.html',
        '首页': 'index.html',
        '主页': 'index.html'
    };
    
    // 搜索结果数据
    const searchData = {
        '产品': [
            { title: '产品介绍', description: '了解我们的产品线和服务', url: 'products.html' },
            { title: '产品A', description: '产品A的详细介绍', url: 'products.html#product-a' },
            { title: '产品B', description: '产品B的详细介绍', url: 'products.html#product-b' }
        ],
        '关于': [
            { title: '关于我们', description: '了解我们的公司和文化', url: 'about.html' },
            { title: '团队介绍', description: '认识我们的团队成员', url: 'about.html#team' },
            { title: '发展历程', description: '了解公司的发展历程', url: 'about.html#history' }
        ],
        '联系': [
            { title: '联系我们', description: '获取我们的联系方式', url: 'contact.html' },
            { title: '客户支持', description: '获取客户支持服务', url: 'contact.html#support' },
            { title: '反馈建议', description: '给我们提供反馈和建议', url: 'contact.html#feedback' }
        ],
        '帮助': [
            { title: '帮助中心', description: '常见问题和使用指南', url: 'help.html' },
            { title: '使用教程', description: '产品使用教程和指南', url: 'help.html#tutorials' },
            { title: '常见问题', description: '常见问题解答', url: 'help.html#faq' }
        ]
    };
    
    // 搜索功能
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (query === '') {
            alert('请输入搜索关键词');
            return;
        }
        
        // 检查是否有精确匹配的关键词
        for (const keyword in keywordMappings) {
            if (query === keyword.toLowerCase()) {
                // 直接跳转到对应页面
                window.location.href = keywordMappings[keyword];
                return;
            }
        }
        
        // 显示搜索结果
        displaySearchResults(query);
    }
    
    // 显示搜索结果
    function displaySearchResults(query) {
        // 清空之前的结果
        resultsList.innerHTML = '';
        
        // 查找匹配的结果
        let foundResults = false;
        
        for (const keyword in searchData) {
            if (keyword.toLowerCase().includes(query) || query.includes(keyword.toLowerCase())) {
                searchData[keyword].forEach(item => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'result-item';
                    resultItem.innerHTML = `
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    `;
                    resultItem.addEventListener('click', function() {
                        window.location.href = item.url;
                    });
                    resultsList.appendChild(resultItem);
                });
                foundResults = true;
            }
        }
        
        // 如果没有找到结果
        if (!foundResults) {
            resultsList.innerHTML = '<p>没有找到相关结果，请尝试其他关键词。</p>';
        }
        
        // 显示搜索结果区域
        searchResults.classList.remove('hidden');
    }
    
    // 事件监听
    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    closeResults.addEventListener('click', function() {
        searchResults.classList.add('hidden');
    });
    
    // 点击搜索结果区域外部关闭
    searchResults.addEventListener('click', function(e) {
        if (e.target === searchResults) {
            searchResults.classList.add('hidden');
        }
    });
});