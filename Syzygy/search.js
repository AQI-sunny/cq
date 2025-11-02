// 关键词加密处理函数
function encryptKeyword(keyword) {
    // 使用简单的Base64编码进行加密
    return btoa(unescape(encodeURIComponent(keyword)));
}

function decryptKeyword(encryptedKeyword) {
    try {
        return decodeURIComponent(escape(atob(encryptedKeyword)));
    } catch (e) {
        return encryptedKeyword; // 如果解密失败，返回原值
    }
}

// 存储已显示的书签
let displayedBookmarks = new Set();

// 加密后的关键词跳转映射表
const keywordRedirects = {
    [encryptKeyword("临渠2015")]: "https://sylvie-seven-cq.top/Syzygy/sc2015.html",
    [encryptKeyword("临渠2007")]: "https://sylvie-seven-cq.top/Syzygy/sc2007.html",
    [encryptKeyword("临渠县月桂树")]: "https://sylvie-seven-cq.top/Syzygy/月桂盛放.html",
    [encryptKeyword("福叁咖啡")]: "https://sylvie-seven-cq.top/Syzygy/fu3coffee.html",
    [encryptKeyword("奇闻异事馆")]: "https://sylvie-seven-cq.top/Syzygy/奇闻异事馆.html",
    [encryptKeyword("记者网")]: "https://sylvie-seven-cq.top/Syzygy/qinyanqiu-blog.html",
    [encryptKeyword("深南市桥安区")]: "https://sylvie-seven-cq.top/Syzygy/qiaoanqu.html",
    [encryptKeyword("好邻居百货超市")]: "https://sylvie-seven-cq.top/Syzygy/supermarket.html",
    [encryptKeyword("好邻居24h百货超市")]: "https://sylvie-seven-cq.top/Syzygy/supermarket.html",
    [encryptKeyword("论坛")]: "https://sylvie-seven-cq.top/Syzygy/forum.html",
    [encryptKeyword("乔静")]: "https://sylvie-seven-cq.top/Syzygy/qiaojing.html",
    [encryptKeyword("临渠县2007年")]: "https://sylvie-seven-cq.top/Syzygy/sc2007.html",
    [encryptKeyword("临渠县2015年")]: "https://sylvie-seven-cq.top/Syzygy/sc2015.html"
};

// 搜索结果数据 - 关键词也加密存储
const searchResultsData = [
    {
        title: "临渠县2015新闻搜索结果",
        description: "临渠县2015年新闻最新最全搜索结果",
        url: "https://sylvie-seven-cq.top/临渠.html",
        keywords: [encryptKeyword("临渠县2015"), encryptKeyword("临渠2015")]
    },
    {
        title: "临渠县2007新闻搜索结果",
        description: "临渠县2007年新闻最新最全搜索结果",
        url: "https://sylvie-seven-cq.top/Syzygy/sc2007.html",
        keywords: [encryptKeyword("临渠县2007"), encryptKeyword("临渠2007")]
    },
    {
        title: "福叁咖啡官方网站",
        description: "福叁咖啡提供优质的咖啡和舒适的环境。",
        url: "https://sylvie-seven-cq.top/fu3",
        keywords: [encryptKeyword("福叁咖啡"), encryptKeyword("福叁")]
    },
    {
        title: "奇闻异事馆",
        description: "记录各地的奇闻异事和未解之谜。",
        url: "https://sylvie-seven-cq.top/qwysg",
        keywords: [encryptKeyword("奇闻异事馆"), encryptKeyword("奇闻异事馆论坛")]
    },
    {
        title: "记者网",
        description: "记者网提供最新的新闻资讯和深度报道。",
        url: "https://sylvie-seven-cq.top/jz",
        keywords: [encryptKeyword("记者网"), encryptKeyword("秦砚秋记者"), encryptKeyword("秦砚秋")]
    },
    {
        title: "好邻居百货超市",
        description: "好邻居百货超市提供各类生活用品和食品。",
        url: "https://sylvie-seven-cq.top/hljcs",
        keywords: [encryptKeyword("好邻居24h百货超市"), encryptKeyword("好邻居百货超市"), encryptKeyword("百货超市好邻居")]
    },
    {
        title: "公寓论坛",
        description: "社区论坛是用户交流和分享的平台。",
        url: "C:\\Users\\Admin\\Desktop\\Aqi-ez game\\页游\\game3 jqgy\\论坛页面代码\\luntan  new.html",
        keywords: [encryptKeyword("静乔公寓论坛"), encryptKeyword("静乔公寓")]
    }
];

// Page switching logic
function showPage(id) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    const page = document.getElementById(id);
    if (page) {
        page.classList.add('active');
    }
}

// Modal control
const modal = document.getElementById("modal");
const titleEl = document.getElementById("modal-title");
const contentEl = document.getElementById("modal-content");
const metaEl = document.getElementById("modal-meta");

function showModal(post) {
    titleEl.textContent = post.title || "无标题";
    contentEl.textContent = post.content || "无内容";
    metaEl.textContent = `状态：${post.status || '未知'} • 日期：${post.date || '未知'}`;
    modal.style.display = "block";
}
function closeModal() {
    modal.style.display = "none";
}
window.onclick = function (e) {
    if (e.target === modal) {
        closeModal();
    }
}

// System Notification Modal
const systemModal = document.getElementById("system-modal");

function showSystemModal() {
    systemModal.style.display = "block";

    // Auto close after 2 seconds
    setTimeout(function () {
        systemModal.style.display = "none";
    }, 300);
}

// Modified: Always show the system notification on page load (not just first visit)
function checkFirstVisit() {
    // Show the system notification on every visit
    setTimeout(() => {
        showSystemModal();
    }, 500); // Slight delay to ensure page is loaded
}

// Dummy data for search — can be extended
const sections = [
    /* 搜索页直接弹窗 */
    /* {
       title: "首页",
       posts: [
         {
           title: "欢迎来到模拟搜索引擎",
           content: "这是首页的示例内容。",
           status: "发布",
           date: "2025-10-15"
         }
       ]
     },
     {
       title: "临渠县",
       posts: [
         {
           title: "临渠县介绍",
           content: "临渠县是一个风景优美的地方，有着丰富的历史文化。",
           status: "发布",
           date: "2025-10-16"
         }
       ]
     } */
];

/* // 清除所有书签
function clearAllBookmarks() {
  document.querySelectorAll('.bookmark').forEach(bookmark => {
    if (bookmark.id !== 'forum-bookmark') {
      bookmark.classList.add('hidden');
    }
  });
  displayedBookmarks.clear();
} */

// 显示搜索结果
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }

    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.onclick = function () {
            // 直接跳转到对应的URL
            if (result.url.startsWith('http')) {
                window.open(result.url, '_blank');
            } else {
                // 对于本地文件，使用新窗口打开
                window.open(result.url, '_blank');
            }
        };

        resultItem.innerHTML = `
            <div class="search-result-title">${result.title}</div>
            <div>${result.description}</div>
            <div class="search-result-url">${result.url}</div>
          `;

        resultsContainer.appendChild(resultItem);
    });

    resultsContainer.style.display = 'block';
}

// 显示短信风格的弹窗
function showSmsModal(title, message, url) {
    document.getElementById("sms-title").textContent = title;
    document.getElementById("sms-message").textContent = message;
    document.getElementById("sms-action-btn").onclick = function () {
        window.open(url, '_blank'); // 新标签页打开
        document.getElementById("sms-modal").style.display = "none";
    };
    document.getElementById("sms-modal").style.display = "flex"; // 使用 flex 居中
}

// Search logic
function performSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById("search-input");
    const query = (searchInput.value || '').trim();

    if (!query) {
        alert("请输入搜索关键词");
        return;
    }

    // === 特殊关键词拦截：kms赵晓棠 ===
    if (query.toLowerCase() === "kms赵晓棠".toLowerCase()) {
        showSmsModal(
            "来自手机短信通知：",
            "你有新的快递 请尽快来取",
            "https://sylvie-seven-cq.top/Syzygy/取快递.html"
        );
        return; // 阻止后续搜索逻辑执行
    }
    // ===================================

    // 检查是否有直接跳转的关键词（先加密查询词）
    const encryptedQuery = encryptKeyword(query);
    for (const encryptedKeyword in keywordRedirects) {
        if (encryptedQuery.includes(encryptedKeyword) || query.toLowerCase().includes(decryptKeyword(encryptedKeyword).toLowerCase())) {
            const redirectUrl = keywordRedirects[encryptedKeyword];
            if (confirm(`找到关键词 "${decryptKeyword(encryptedKeyword)}"，是否跳转到对应页面？`)) {
                if (redirectUrl.startsWith('http')) {
                    window.open(redirectUrl, '_blank');
                } else {
                    // 对于本地文件，使用新窗口打开
                    window.open(redirectUrl, '_blank');
                }
                return;
            }
        }
    }

    // 根据搜索关键词显示相关书签（新增而不是覆盖）
    let foundResults = false;

    // 检查并显示相关书签
    const bookmarks = [
        { id: "coffee-bookmark", keywords: ["福叁咖啡"], displayText: "福叁咖啡" },
        { id: "wonder-bookmark", keywords: ["奇闻异事馆"], displayText: "奇闻异事馆" },
        { id: "journalist-bookmark", keywords: ["记者网", "秦砚秋"], displayText: "记者网" },
        { id: "neighbor-bookmark", keywords: ["好邻居24h百货超市", "好邻居百货超市"], displayText: "好邻居百货超市" }
    ];

    bookmarks.forEach(bookmark => {
        if (bookmark.keywords.some(keyword => query.toLowerCase().includes(keyword.toLowerCase()))) {
            const bookmarkEl = document.getElementById(bookmark.id);
            bookmarkEl.classList.remove("hidden");
            displayedBookmarks.add(bookmark.id);
            foundResults = true;
        }
    });

    // 确保论坛书签始终显示
    const forumBookmark = document.getElementById("forum-bookmark");
    forumBookmark.classList.remove("hidden");

    // 严格精确搜索匹配的结果（使用解密后的关键词进行匹配）
    const matchedResults = searchResultsData.filter(result => {
        return result.keywords.some(encryptedKeyword => {
            const decryptedKeyword = decryptKeyword(encryptedKeyword);
            return query.toLowerCase() === decryptedKeyword.toLowerCase();
        }) || query.toLowerCase() === result.title.toLowerCase();
    });

    // 显示搜索结果
    displaySearchResults(matchedResults);

    // Flatten all posts
    let pool = [];
    sections.forEach(s => {
        pool = pool.concat(s.posts.map(p => ({ ...p, _section: s.title })));
    });

    const results = pool.filter(p =>
        (p.title + ' ' + p.content).toLowerCase().includes(query.toLowerCase())
    );

    if (results.length === 0 && !foundResults && matchedResults.length === 0) {
        alert("未找到匹配的内容。请尝试其他关键词。");
    } else if (results.length > 0) {
        // Show first result in modal for demo purposes
        showModal(results[0]);
    }
}

// 初始化页面
window.onload = function () {
    checkFirstVisit();

    // 确保论坛书签初始可见
    const forumBookmark = document.getElementById("forum-bookmark");
    forumBookmark.classList.remove("hidden");
};