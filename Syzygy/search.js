// search.js - 共享搜索逻辑

// 关键词跳转映射表
const keywordRedirects = {
    "临渠2015": "https://sylvie-seven-cq.top/临渠.html",
    "福叁咖啡": "https://sylvie-seven-cq.top/fu3",
    "奇闻异事馆": "https://sylvie-seven-cq.top/qwysg",
    "记者网": "https://sylvie-seven-cq.top/jz",
    "深南市桥安区": "https://sylvie-seven-cq.top/hljcs",
    "好邻居百货超市": "https://sylvie-seven-cq.top/hljcs",
    "好邻居24h百货超市": "https://sylvie-seven-cq.top/hljcs",
    "论坛": "C:\\Users\\Admin\\Desktop\\Aqi-ez game\\页游\\game3 jqgy\\论坛页面代码\\luntan  new.html",
    "月球殖民地 '阿波罗之光' 2045 计划": "https://sylvie-seven-cq.top/sc2015搜索结果.html"
};

// 搜索结果数据
const searchResultsData = [
    {
        title: "临渠县2015新闻搜索结果",
        description: "临渠县2015年新闻最新最全搜索结果",
        url: "https://sylvie-seven-cq.top/临渠.html",
        keywords: ["临渠县2015", "临渠2015"]
    },
    {
        title: "福叁咖啡官方网站",
        description: "福叁咖啡提供优质的咖啡和舒适的环境。",
        url: "https://sylvie-seven-cq.top/fu3",
        keywords: ["福叁咖啡", "福叁"]
    },
    {
        title: "奇闻异事馆",
        description: "记录各地的奇闻异事和未解之谜。",
        url: "https://sylvie-seven-cq.top/qwysg",
        keywords: ["奇闻异事馆", "奇闻异事馆论坛"]
    },
    {
        title: "记者网",
        description: "记者网提供最新的新闻资讯和深度报道。",
        url: "https://sylvie-seven-cq.top/jz",
        keywords: ["记者网", "秦砚秋记者", "秦砚秋"]
    },
    {
        title: "好邻居百货超市",
        description: "好邻居百货超市提供各类生活用品和食品。",
        url: "https://sylvie-seven-cq.top/hljcs",
        keywords: ["好邻居24h百货超市", "好邻居百货超市", "百货超市好邻居"]
    },
    {
        title: "公寓论坛",
        description: "社区论坛是用户交流和分享的平台。",
        url: "C:\\Users\\Admin\\Desktop\\Aqi-ez game\\页游\\game3 jqgy\\论坛页面代码\\luntan  new.html",
        keywords: ["静乔公寓论坛", "静乔公寓"]
    }
];

// 主搜索函数
function performSearch(query, event = null) {
    if (event) event.preventDefault();

    query = (query || '').trim();

    if (!query) {
        alert("请输入搜索关键词");
        return false;
    }

    // 特殊关键词拦截：kms赵晓棠
    if (query.toLowerCase() === "kms赵晓棠".toLowerCase()) {
        showSmsModal(
            "你有新的快递",
            "你有新的快递 请尽快来取",
            "https://sylvie-seven-cq.top/Syzygy/取快递.html"
        );
        return true;
    }

    // 检查直接跳转的关键词
    for (const keyword in keywordRedirects) {
        if (query.includes(keyword.toLowerCase())) {
            const redirectUrl = keywordRedirects[keyword];
            if (confirm(`找到关键词 "${keyword}"，是否跳转到对应页面？`)) {
                if (redirectUrl.startsWith('http')) {
                    window.open(redirectUrl, '_blank');
                } else {
                    window.open(redirectUrl, '_blank');
                }
                return true;
            }
        }
    }

    // 严格精确搜索匹配
    const matchedResults = searchResultsData.filter(result => {
        return result.keywords.some(keyword =>
            query.toLowerCase() === keyword.toLowerCase()
        ) || query.toLowerCase() === result.title.toLowerCase();
    });

    // 如果有匹配结果，显示第一个
    if (matchedResults.length > 0) {
        const firstResult = matchedResults[0];
        if (firstResult.url.startsWith('http')) {
            window.open(firstResult.url, '_blank');
        } else {
            window.open(firstResult.url, '_blank');
        }
        return true;
    }

    // 没有找到结果
    alert("未找到匹配的内容。请尝试其他关键词。");
    return false;
}

// 短信弹窗函数
function showSmsModal(title, message, url) {
    // 检查是否在第一个页面中
    const smsModal = document.getElementById("sms-modal");
    if (smsModal) {
        document.getElementById("sms-title").textContent = title;
        document.getElementById("sms-message").textContent = message;
        document.getElementById("sms-action-btn").onclick = function () {
            window.open(url, '_blank');
            smsModal.style.display = "none";
        };
        smsModal.style.display = "flex";
    } else {
        // 如果在第二个页面，直接跳转
        window.open(url, '_blank');
    }
}