(function() {
    'use strict';
    
    // ====== 辅助函数 ======
    
    function waitForGlobalVariable(variableName, callback, maxRetries = 10) {
        let retries = 0;
        
        function check() {
            if (window[variableName] !== undefined) {
                callback();
            } else if (retries < maxRetries) {
                retries++;
                setTimeout(check, 500);
            }
        }
        
        check();
    }
    
    function getHiddenPosts() {
        if (window.hiddenPosts && Array.isArray(window.hiddenPosts)) {
            return window.hiddenPosts;
        }
        
        const globalVars = Object.keys(window);
        for (let key of globalVars) {
            if (key.toLowerCase().includes('hidden') && Array.isArray(window[key])) {
                return window[key];
            }
        }
        
        return [];
    }
    
    function buildKeywordMap(hiddenPostsArray) {
        const keywordMap = {};
        
        if (!Array.isArray(hiddenPostsArray)) {
            return keywordMap;
        }
        
        hiddenPostsArray.forEach(post => {
            if (!post || !post.searchKeyword) return;
            
            const keywords = post.searchKeyword.split(',').map(k => k.trim().toLowerCase());
            
            keywords.forEach(keyword => {
                if (keyword) {
                    if (!keywordMap[keyword]) {
                        keywordMap[keyword] = [];
                    }
                    if (!keywordMap[keyword].some(p => p.title === post.title)) {
                        keywordMap[keyword].push(post);
                    }
                }
            });
            
            if (post.title) {
                const titleKeywords = post.title.match(/【(.*?)】|"(.*?)"|'(.*?)'/g) || [];
                titleKeywords.forEach(match => {
                    const cleanKeyword = match.replace(/【|】|"|'/g, '').toLowerCase();
                    if (cleanKeyword) {
                        if (!keywordMap[cleanKeyword]) {
                            keywordMap[cleanKeyword] = [];
                        }
                        if (!keywordMap[cleanKeyword].some(p => p.title === post.title)) {
                            keywordMap[cleanKeyword].push(post);
                        }
                    }
                });
            }
        });
        
        return keywordMap;
    }
    
    // ====== 核心修复：重写搜索函数 ======
    
    let keywordMap = {};
    let isSearchFixed = false;
    
    function fixSearchFunction() {
        if (isSearchFixed) return;
        
        if (typeof window.performSearch !== 'function') {
            return;
        }
        
        const originalSearch = window.performSearch;
        
        window.performSearch = function() {
            const searchInput = document.getElementById('search-input');
            if (!searchInput) return originalSearch.apply(this, arguments);
            
            const query = searchInput.value.trim().toLowerCase();
            
            const originalResult = originalSearch.apply(this, arguments);
            
            if (query && window.currentUser) {
                if (keywordMap[query] && keywordMap[query].length > 0) {
                    setTimeout(() => {
                        const postsArray = keywordMap[query];
                        if (postsArray && postsArray.length > 0) {
                            addHiddenPostToResults(query);
                        }
                    }, 150);
                }
            }
            
            return originalResult;
        };
        
        isSearchFixed = true;
    }
    
    function addHiddenPostToResults(keyword) {
        const postsArray = keywordMap[keyword];
        
        if (!postsArray || postsArray.length === 0) {
            return;
        }
        
        const main = document.getElementById('main-posts');
        if (!main) {
            return;
        }
        
        postsArray.forEach(postData => {
            if (postData.allowedUsers && !postData.allowedUsers.includes(window.currentUser)) {
                return;
            }
            
            const existingPosts = main.querySelectorAll('.post-card');
            let alreadyDisplayed = false;
            
            existingPosts.forEach(card => {
                const titleElement = card.querySelector('a');
                if (titleElement && titleElement.textContent.includes(postData.title)) {
                    alreadyDisplayed = true;
                }
            });
            
            if (alreadyDisplayed) {
                return;
            }
            
            const postCard = createPostCard(postData);
            
            const resultTitle = main.querySelector('h2');
            
            if (resultTitle) {
                resultTitle.parentNode.insertBefore(postCard, resultTitle.nextSibling);
            } else {
                main.insertBefore(postCard, main.firstChild);
            }
        });
    }
    
    function createPostCard(postData) {
        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        
        let metaInfo = '发布者：' + (postData.author || '匿名用户');
        
        if (postData.popularity !== undefined) {
            metaInfo += ' • 热度：<span class="status-热度">' + postData.popularity + '</span>';
        }
        
        if (postData.status && postData.status !== '无') {
            metaInfo += ' • 状态：<span class="status-' + postData.status + '">' + postData.status + '</span>';
        }
        
        metaInfo += ' • 日期：' + postData.date;
        
        postCard.innerHTML = `
            <a href="#" class="hidden-post-link">
                ${postData.title}
            </a>
            <div class="post-meta">${metaInfo}</div>
        `;
        
        const link = postCard.querySelector('.hidden-post-link');
        link.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (typeof window.showModal === 'function') {
                window.showModal(postData, postData.section || '邻里交流');
            } else {
                alert('无法显示帖子详情');
            }
            
            return false;
        };
        
        return postCard;
    }
    
    // ====== 修复用户主页权限 ======
    
    function fixUserProfilePermissions() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        fixUserLinksInElement(node);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(fixAllUserLinks, 500);
    }
    
    function fixAllUserLinks() {
        // 1. 优先处理明确带有 showUserProfile 的链接
        const explicitLinks = document.querySelectorAll('a[onclick*="showUserProfile"], a[href*="showUserProfile"]');
        explicitLinks.forEach(fixSingleUserLink);
        
        // 2. 谨慎处理可能是用户名的纯文本链接
        // 只有当链接在 .post-meta 或 .author-info 内部时，才尝试处理
        // 这样可以避免误伤帖子标题
        const potentialUserLinks = document.querySelectorAll('.post-meta a, .author-info a, .user-profile a');
        potentialUserLinks.forEach(link => {
            if (!link.getAttribute('data-fixed-user-link')) {
                checkAndFixUserLink(link);
            }
        });
    }
    
    function fixUserLinksInElement(element) {
        const userLinks = element.querySelectorAll ? element.querySelectorAll('a[onclick*="showUserProfile"]') : [];
        userLinks.forEach(fixSingleUserLink);
        
        if (element.tagName === 'A' && element.getAttribute('onclick') && 
            element.getAttribute('onclick').includes('showUserProfile')) {
            fixSingleUserLink(element);
        }
    }
    
    function checkAndFixUserLink(link) {
        // [关键修复]：如果这是帖子标题链接，直接跳过
        if (link.classList.contains('hidden-post-link')) return;
        
        // [关键修复]：如果包含 showModal (通常是打开帖子的)，直接跳过
        const onclickAttr = link.getAttribute('onclick') || '';
        if (onclickAttr.includes('showModal')) return;
        
        // 检查是否是用户链接
        const href = link.getAttribute('href');
        const text = link.textContent || '';
        
        // 尝试从各种属性中提取用户名
        let username = null;
        
        if (onclickAttr) {
            const match = onclickAttr.match(/showUserProfile\('([^']+)'\)/);
            if (match) username = match[1];
        }
        
        if (!username && href) {
            const match = href.match(/showUserProfile\('([^']+)'\)/);
            if (match) username = match[1];
        }
        
        // [关键修复]：只有在明确的上下文（如 meta 信息区）才将文本视为用户名
        // 避免把独立的帖子标题误认为是用户名
        if (!username && text.trim()) {
            if (link.closest('.post-meta') || link.closest('.author-info')) {
                username = text.trim();
            }
        }
        
        if (username) {
            fixUserLinkWithUsername(link, username);
        }
    }
    
    function fixSingleUserLink(link) {
        // [关键修复] 安全检查
        if (link.classList.contains('hidden-post-link')) return;
        
        const onclickAttr = link.getAttribute('onclick');
        if (!onclickAttr) {
            checkAndFixUserLink(link);
            return;
        }
        
        const match = onclickAttr.match(/showUserProfile\('([^']+)'\)/);
        if (!match) {
            checkAndFixUserLink(link);
            return;
        }
        
        const username = match[1];
        fixUserLinkWithUsername(link, username);
    }
    
    function fixUserLinkWithUsername(link, username) {
        // 防止重复绑定
        if (link.getAttribute('data-fixed-user-link') === 'true') return;
        
        // 保存原始点击事件（如果有）
        const originalOnclick = link.getAttribute('onclick');
        
        // 完全替换点击事件
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            handleUserProfileClick(username);
            return false;
        }, true); // 使用捕获阶段以确保我们的处理器先执行
        
        // 移除所有其他事件监听器
        link.setAttribute('onclick', '');
        link.setAttribute('href', 'javascript:void(0)');
        
        // 添加标记，避免重复处理
        link.setAttribute('data-fixed-user-link', 'true');
    }
    
    function handleUserProfileClick(username) {
        if (!window.currentUser) {
            alert('请先登录以查看用户信息');
            return;
        }
        
        let specialUsers = [];
        try {
            if (window.npcUsers && Array.isArray(window.npcUsers)) {
                specialUsers = window.npcUsers.map(user => user.username);
            }
            
            specialUsers = specialUsers.concat([
                '林中的猫', 'Resonance', '向阳花开', '404', '顾姨', '保安',
                '系统管理员', 'Q', '林墨'
            ]);
            
            specialUsers = [...new Set(specialUsers)];
        } catch (e) {
            specialUsers = [
                '林中的猫', 'Resonance', '向阳花开', '404', '顾姨', '保安',
                '系统管理员', 'Q', '林墨'
            ];
        }
        
        if (specialUsers.includes(username) || username === window.currentUser) {
            if (typeof window.showUserProfile === 'function') {
                window.showUserProfile(username);
            } else if (typeof window.performSearch === 'function') {
                // 如果原始函数不存在，尝试执行搜索
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.value = username;
                    window.performSearch();
                }
            }
        } else {
            showPermissionDeniedPage(username);
        }
    }
    
    function showPermissionDeniedPage(username) {
        const main = document.getElementById('main-posts');
        if (!main) return;
        
        while (main.firstChild) {
            main.removeChild(main.firstChild);
        }
        
        const profileCard = document.createElement('div');
        profileCard.className = 'post-card';
        profileCard.style.cssText = `
            max-width: 600px;
            margin: 40px auto;
            padding: 30px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        
        profileCard.innerHTML = `
            <h2>${username}</h2>
            <div class="profile-info">
                <div class="info-item">
                    <strong>用户名：</strong> ${username}
                </div>
                <div class="info-item">
                    <strong>用户状态：</strong> 离线
                </div>
                <div class="info-item">
                    <strong>最后活跃：</strong> 未知
                </div>
            </div>
            
            <div class="permission-notice">
                <strong>⚠️ 权限提示</strong>
                <p>您无权查看他人的完整个人主页。这是用户的基本信息预览。</p>
                <p>当前登录用户：${window.currentUser}</p>
            </div>
            
            <div style="margin-top: 20px;">
                <button onclick="window.performSearch()" class="back-button">
                    返回搜索结果
                </button>
            </div>
        `;
        
        if (!document.getElementById('search-fix-styles')) {
            const style = document.createElement('style');
            style.id = 'search-fix-styles';
            style.textContent = `
                .profile-info {
                    margin-bottom: 25px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #dee2e6;
                }
                .info-item {
                    margin-bottom: 10px;
                }
                .info-item strong {
                    color: #495057;
                    display: inline-block;
                    width: 120px;
                }
                .permission-notice {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 5px;
                    padding: 15px;
                    margin-bottom: 25px;
                }
                .permission-notice strong {
                    color: #856404;
                    display: block;
                    margin-bottom: 10px;
                }
                .permission-notice p {
                    color: #856404;
                    margin-bottom: 8px;
                    font-size: 14px;
                }
                .back-button {
                    padding: 10px 24px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background-color 0.2s;
                }
                .back-button:hover {
                    background-color: #0056b3;
                }
            `;
            document.head.appendChild(style);
        }
        
        main.appendChild(profileCard);
    }
    
    // ====== 初始化函数 ======
    
    function init() {
        try {
            waitForGlobalVariable('currentUser', function() {
                const hiddenPosts = getHiddenPosts();
                keywordMap = buildKeywordMap(hiddenPosts);
                fixSearchFunction();
                fixUserProfilePermissions();
                
                const searchInput = document.getElementById('search-input');
                if (searchInput && searchInput.value.trim() && window.currentUser) {
                    setTimeout(() => {
                        if (typeof window.performSearch === 'function') {
                            window.performSearch();
                        }
                    }, 500);
                }
            });
            
        } catch (error) {}
    }
    
    // ====== 启动 ======
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(init, 1500);
        });
    } else {
        setTimeout(init, 1500);
    }
    
    function recheckUserLinks() {
        setTimeout(fixAllUserLinks, 1000);
    }
    
    // 降低频率以减少性能开销，但保持活跃
    setInterval(recheckUserLinks, 3000);
    
    window.searchFix = {
        init: init,
        testSearch: function(query) {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = query;
                if (typeof window.performSearch === 'function') {
                    window.performSearch();
                }
            }
        },
        showPermissionPage: showPermissionDeniedPage,
        getKeywordMap: function() { return keywordMap; },
        recheckLinks: recheckUserLinks
    };
    
})();