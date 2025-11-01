// search.js - 共享搜索逻辑（支持URL传参和调试）

// ==================== 调试功能 ====================
const SEARCH_DEBUG = localStorage.getItem('search_debug') === 'true' ||
    new URLSearchParams(window.location.search).has('debug');

// 调试日志函数
function logDebug(...args) {
    if (SEARCH_DEBUG) {
        console.log(`%c[Search Debug]`, 'color: #4CAF50; font-weight: bold;', ...args);
    }
}

// 初始化调试信息
logDebug('搜索模块已加载，调试模式:', SEARCH_DEBUG);
if (SEARCH_DEBUG) {
    console.log('%c💡 调试提示: 在控制台输入 localStorage.setItem(\"search_debug\", \"true\") 开启调试',
        'color: #FF9800; font-size: 14px;');
}

// ==================== URL参数处理 ====================
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {
        q: params.get('q') || '',
        type: params.get('type') || 'general',
        page: Math.max(1, parseInt(params.get('page')) || 1),
        debug: params.has('debug')
    };

    logDebug('URL参数解析:', result);
    return result;
}

function buildResultsUrl(query, pageType = 'general', source = 'search') {
    const url = `https://sylvie-seven-cq.top/Syzygy/search-results.html?q=${encodeURIComponent(query)}&type=${pageType}&source=${source}`;
    logDebug('构建结果页面URL:', url);
    return url;
}

// ==================== 统一的关键词映射 ====================
const keywordRedirects = {
    "临渠2015": "https://sylvie-seven-cq.top/sc2015.html",
    "临渠2007": "https://sylvie-seven-cq.top/sc2007.html",
    "临渠县月桂树": "https://sylvie-seven-cq.top/Syzygy/月桂盛放.html",
    "福叁咖啡": "https://sylvie-seven-cq.top/fu3coffee.html",
    "奇闻异事馆": "https://sylvie-seven-cq.top/奇闻异事馆.html",
    "记者网": "https://sylvie-seven-cq.top/qinyanqiu-blog.html",
    "深南市桥安区": "https://sylvie-seven-cq.top/qiaoanqu.html",
    "好邻居百货超市": "https://sylvie-seven-cq.top/supermarket.html",
    "好邻居24h百货超市": "https://sylvie-seven-cq.top/supermarket.html",
    "论坛": "https://sylvie-seven-cq.top/forum.html",
    "乔静": "https://sylvie-seven-cq.top/Syzygy/qiaojing.html",
    "临渠县2007年": "https://sylvie-seven-cq.top/sc2007.html",
    "临渠县2015年": "https://sylvie-seven-cq.top/sc2015.html"
};

// ==================== 搜索结果数据 ====================
const searchResultsData = [
    {
        title: "临渠县2015新闻搜索结果",
        description: "临渠县2015年新闻最新最全搜索结果",
        url: "https://sylvie-seven-cq.top/sc2015.html",
        keywords: ["临渠县2015", "临渠2015"]
    },
    {
        title: "福叁咖啡官方网站",
        description: "福叁咖啡提供优质的咖啡和舒适的环境。",
        url: "https://sylvie-seven-cq.top/fu3coffee.html",
        keywords: ["福叁咖啡", "福叁"]
    },
    {
        title: "奇闻异事馆",
        description: "记录各地的奇闻异事和未解之谜。",
        url: "https://sylvie-seven-cq.top/奇闻异事馆.html",
        keywords: ["奇闻异事馆", "奇闻异事馆论坛"]
    },
    {
        title: "记者网",
        description: "记者网提供最新的新闻资讯和深度报道。",
        url: "https://sylvie-seven-cq.top/qinyanqiu-blog.html",
        keywords: ["记者网", "秦砚秋记者", "秦砚秋"]
    },
    {
        title: "好邻居百货超市",
        description: "好邻居百货超市提供各类生活用品和食品。",
        url: "https://sylvie-seven-cq.top/supermarket.html",
        keywords: ["好邻居24h百货超市", "好邻居百货超市", "百货超市好邻居"]
    },
    {
        title: "公寓论坛",
        description: "社区论坛是用户交流和分享的平台。",
        url: "https://sylvie-seven-cq.top/forum.html",
        keywords: ["静乔公寓论坛", "静乔公寓", "论坛"]
    }
];

// ==================== 主搜索函数 ====================
function performSearch(query, event = null, pageType = null) {
    if (event) event.preventDefault();

    query = (query || '').trim();
    logDebug('执行搜索，查询词:', query, '页面类型:', pageType);

    if (!query) {
        logDebug('搜索词为空');
        alert("请输入搜索关键词");
        return false;
    }

    // 特殊关键词拦截：kms赵晓棠
    if (query.toLowerCase() === "kms赵晓棠".toLowerCase()) {
        logDebug('触发特殊关键词: kms赵晓棠');
        showSmsModal(
            "来自手机短信通知：",
            "你有新的快递 请尽快来取",
            "https://sylvie-seven-cq.top/Syzygy/取快递.html"
        );
        return true;
    }

    // 检查直接跳转的关键词
    for (const keyword in keywordRedirects) {
        if (query.toLowerCase().includes(keyword.toLowerCase())) {
            const redirectUrl = keywordRedirects[keyword];
            logDebug('找到匹配的关键词:', keyword, '跳转URL:', redirectUrl);

            if (confirm(`找到关键词 "${keyword}"，是否跳转到对应页面？`)) {
                window.open(redirectUrl, '_blank');
                return true;
            }
        }
    }

    // 根据关键词决定页面类型
    let targetPageType = pageType || 'general';
    if (query.includes('密码') || query.includes('后台')) targetPageType = 'password';
    if (query.includes('咖啡')) targetPageType = 'coffee';
    if (query.includes('临渠')) targetPageType = 'linqu';
    if (query.includes('实验室')) targetPageType = 'lab';

    logDebug('确定页面类型:', targetPageType);

    // 严格精确搜索匹配
    const matchedResults = searchResultsData.filter(result => {
        const isMatch = result.keywords.some(keyword =>
            query.toLowerCase() === keyword.toLowerCase()
        ) || query.toLowerCase() === result.title.toLowerCase();

        if (isMatch) {
            logDebug('匹配到结果:', result.title);
        }
        return isMatch;
    });

    logDebug('匹配结果数量:', matchedResults.length);

    // 如果有匹配结果，跳转到结果页面或直接打开
    if (matchedResults.length > 0) {
        if (matchedResults.length === 1) {
            // 只有一个结果，直接打开
            const result = matchedResults[0];
            logDebug('直接打开唯一结果:', result.title);
            window.open(result.url, '_blank');
        } else {
            // 多个结果，跳转到结果页面
            logDebug('跳转到结果页面，结果数量:', matchedResults.length);
            const resultsUrl = buildResultsUrl(query, targetPageType);
            window.open(resultsUrl, '_blank');
        }
        return true;
    }

    // 没有精确匹配，跳转到通用结果页面
    logDebug('无精确匹配，跳转到通用结果页面');
    const resultsUrl = buildResultsUrl(query, targetPageType);
    window.open(resultsUrl, '_blank');

    return true;
}

// ==================== 结果页面初始化 ====================
function initSearchPage() {
    const params = getUrlParams();
    const searchQuery = params.q;
    const pageType = params.type;

    logDebug('初始化搜索页面:', { searchQuery, pageType });

    // 设置搜索框值
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchQuery) {
        searchInput.value = searchQuery;
        logDebug('设置搜索框值:', searchQuery);
    }

    // 根据页面类型设置标题
    const titleMap = {
        'general': '搜索结果',
        'password': '密码提示 - 搜索结果',
        'coffee': '咖啡店相关搜索结果',
        'linqu': '临渠县相关信息',
        'lab': '实验室相关信息'
    };

    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        const title = titleMap[pageType] || '搜索结果';
        pageTitle.textContent = title;
        logDebug('设置页面标题:', title);
    }

    // 显示对应的搜索结果
    displaySearchResults(searchQuery, pageType);

    // 设置搜索事件
    if (searchInput) {
        searchInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                logDebug('回车键搜索');
                performSearch(this.value.trim(), event);
            }
        });
    }
}

// ==================== 结果显示函数 ====================
function displaySearchResults(searchQuery, pageType, containerId = 'search-results') {
    const container = document.getElementById(containerId);
    if (!container) {
        logDebug('结果容器不存在:', containerId);
        return;
    }

    logDebug('显示搜索结果:', { searchQuery, pageType });

    // 根据页面类型和搜索词筛选结果
    let filteredResults = searchResultsData.filter(result => {
        if (pageType === 'password') {
            return result.keywords.some(kw => kw.includes('密码') || kw.includes('后台'));
        } else if (pageType === 'coffee') {
            return result.keywords.some(kw => kw.includes('咖啡'));
        } else if (pageType === 'linqu') {
            return result.keywords.some(kw => kw.includes('临渠'));
        }
        return true;
    });

    // 进一步根据搜索词筛选
    if (searchQuery) {
        filteredResults = filteredResults.filter(result =>
            result.keywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase())) ||
            result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            result.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    logDebug('筛选后结果数量:', filteredResults.length);

    if (filteredResults.length === 0) {
        container.innerHTML = `
            <div class="news-item">
                <div class="title">暂无搜索结果</div>
                <div class="source">请尝试其他关键词: "${searchQuery}"</div>
                <div class="date">${new Date().toLocaleDateString()}</div>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredResults.map(result => `
        <div class="news-item">
            <div class="title">
                <a href="${result.url}" target="_blank" onclick="trackResultClick('${result.title}')">${result.title}</a>
            </div>
            <div class="source">${result.description}</div>
            <div class="date">相关搜索 • ${new Date().toLocaleDateString()}</div>
        </div>
    `).join('');
}

// ==================== 短信弹窗函数 ====================
function showSmsModal(title, message, url) {
    logDebug('显示短信弹窗:', { title, message, url });

    const smsModal = document.getElementById("sms-modal");
    if (smsModal) {
        document.getElementById("sms-title").textContent = title;
        document.getElementById("sms-message").textContent = message;
        document.getElementById("sms-action-btn").onclick = function () {
            logDebug('短信弹窗确认点击，跳转URL:', url);
            window.open(url, '_blank');
            smsModal.style.display = "none";
        };
        smsModal.style.display = "flex";
    } else {
        logDebug('短信弹窗容器不存在，直接跳转:', url);
        window.open(url, '_blank');
    }
}

// ==================== 工具函数 ====================
function trackResultClick(resultTitle) {
    logDebug('用户点击搜索结果:', resultTitle);
    // 这里可以添加统计代码
}

// 导出函数供全局使用
window.performSearch = performSearch;
window.showSmsModal = showSmsModal;
window.initSearchPage = initSearchPage;
window.getUrlParams = getUrlParams;
window.logDebug = logDebug;

logDebug('搜索模块初始化完成');