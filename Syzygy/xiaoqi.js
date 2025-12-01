/**
 * 小奇 - 隐藏帖子助手
 * 版本: 2.6.0 (修复版)
 * 修复：逻辑完全同步论坛源码，精准捕捉关键词
 */

(function() {
    'use strict';
    
    // 配置
    const config = {
        triggerKeyword: '小奇',
        storageKey: 'xiaoqi_keywords_v2',
        searchHistoryKey: 'xiaoqi_search-history',
        searchInputId: 'searchInput',
        searchBtnId: 'searchButton',
        containerId: 'xiaoqi-container',
        orbId: 'xiaoqi-orb',
        panelId: 'xiaoqi-panel'
    };
    
    // 存储原始函数引用
    let originalPerformSearch = null;
    let searchCount = 0;
    let uniqueSearchTerms = new Set();
    
    // 初始化
    function init() {
        // 加载搜索次数
        try {
            const history = localStorage.getItem(config.searchHistoryKey);
            if (history) {
                const data = JSON.parse(history);
                searchCount = data.totalSearches || 0;
                uniqueSearchTerms = new Set(data.uniqueSearchTerms || []);
            }
        } catch (e) {
            searchCount = 0;
            uniqueSearchTerms = new Set();
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupFunctionality);
        } else {
            setupFunctionality();
        }
    }
    
    function setupFunctionality() {
        createXiaoqiUI();
        // 稍微延迟以确保 window.posts 和原始函数已加载
        setTimeout(() => {
            interceptSearchFunction();
            bindEvents();
            updateDisplay();
            showXiaoqi();
        }, 500);
    }
    
    // 创建小奇UI
    function createXiaoqiUI() {
        if (!document.getElementById(config.containerId)) {
            const xiaoqiHTML = `
                <div class="xiaoqi-container" id="${config.containerId}">
                    <div class="xiaoqi-orb" id="${config.orbId}">
                        <div class="xiaoqi-eyes">
                            <div class="xiaoqi-eye left-eye"></div>
                            <div class="xiaoqi-eye right-eye"></div>
                        </div>
                        <div class="xiaoqi-mouth"></div>
                        <div class="xiaoqi-badge">0</div>
                    </div>
                    <div class="xiaoqi-panel" id="${config.panelId}">
                        <div class="panel-header">
                            <div class="panel-title">我是小奇，我绝对不会提示你的！</div>
                            <button class="panel-close" id="xiaoqi-close">×</button>
                        </div>
                        <div class="panel-content">
                            <div class="hint-section" id="hint-section" style="display: none;">
                                <div class="hint-content" id="hint-content"></div>
                            </div>
                            <div class="search-stats-section">
                                <div class="stat-item">
                                    <span class="stat-label">已搜索:</span>
                                    <span class="stat-value" id="search-count">0</span>
                                    <span class="stat-label">次</span>
                                    <span class="stat-label">(不重复:</span>
                                    <span class="stat-value" id="unique-search-count">0</span>
                                    <span class="stat-label">)</span> 
                                </div>
                            </div>
                            <div class="keywords-section">
                                <div class="section-title">
                                    <span>关键词分类</span>
                                    <span class="section-hint">(绿色=有效, 红色=无效)</span>
                                </div>
                                <div class="keywords-list" id="keywords-list">
                                    <div class="empty-keywords">暂无关键词记录</div>
                                </div>
                            </div>
                            <div class="stats-section">
                                <div class="stat-item">
                                    <span class="stat-label">发现隐藏帖子:</span>
                                    <span class="stat-value highlight" id="found-count">0</span>
                                    <span class="stat-label">/</span>
                                    <span class="stat-value highlight" id="total-count">0</span>
                                </div>
                            </div>
                            <div class="panel-actions">
                                <button class="panel-btn primary" id="clear-keywords">清空记录</button>
                                <button class="panel-btn secondary" id="copy-all-keywords">复制有效关键词</button>
                                <button class="panel-btn secondary" id="clear-badge">清除角标</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', xiaoqiHTML);
            addStyles();
        }
    }
    
    // 添加样式
    function addStyles() {
        if (document.getElementById('xiaoqi-styles')) return;
        
        const styles = `
            .xiaoqi-container { position: fixed; bottom: 20px; right: 20px; z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            .xiaoqi-orb { width: 60px; height: 60px; background: linear-gradient(135deg, #ff4757 0%, #dc143c 100%); border-radius: 50%; cursor: pointer; position: relative; box-shadow: 0 4px 20px rgba(255, 71, 87, 0.4); transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; animation: float 3s ease-in-out infinite; border: 2px solid #8b0000; }
            .xiaoqi-orb:hover { transform: scale(1.1); box-shadow: 0 6px 25px rgba(255, 71, 87, 0.6); }
            .xiaoqi-eyes { display: flex; gap: 8px; margin-bottom: 4px; }
            .xiaoqi-eye { width: 12px; height: 12px; background: #2f3542; border-radius: 50%; position: relative; overflow: hidden; border: 1px solid #000; }
            .xiaoqi-eye::after { content: ''; position: absolute; width: 6px; height: 6px; background: #ffffff; border-radius: 50%; top: 2px; left: 2px; transition: all 0.2s ease; }
            .xiaoqi-orb:hover .xiaoqi-eye::after { transform: translate(1px, -1px); }
            .xiaoqi-mouth { width: 16px; height: 6px; background: #2f3542; border-radius: 0 0 8px 8px; margin-top: 2px; transition: all 0.3s ease; border: 1px solid #000; }
            .xiaoqi-orb:hover .xiaoqi-mouth { height: 4px; border-radius: 2px; }
            .xiaoqi-badge { position: absolute; top: -5px; right: -5px; background: #2f3542; color: #ff4757; border-radius: 12px; min-width: 18px; height: 18px; font-size: 11px; font-weight: bold; display: flex; align-items: center; justify-content: center; padding: 2px 6px; box-shadow: 0 2px 8px rgba(47, 53, 66, 0.8); border: 1px solid #000; display: none; }
            .xiaoqi-panel { position: absolute; bottom: 70px; right: 0; width: 320px; background: #2f3542; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); display: none; animation: slideUp 0.3s ease; border: 2px solid #ff4757; overflow: hidden; }
            .panel-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: linear-gradient(135deg, #ff4757 0%, #dc143c 100%); border-radius: 10px 10px 0 0; color: #ffffff; border-bottom: 2px solid #8b0000; }
            .panel-title { font-weight: 600; font-size: 14px; }
            .panel-close { background: rgba(255,255,255,0.2); border: none; color: white; font-size: 18px; cursor: pointer; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 4px; }
            .panel-content { max-height: 400px; overflow-y: auto; padding: 0; }
            .hint-section { padding: 16px 20px; background: rgba(255, 193, 7, 0.1); border-bottom: 1px solid #ffc107; }
            .hint-content { color: #ffc107; font-size: 13px; line-height: 1.4; text-align: center; }
            .search-stats-section, .keywords-section, .stats-section { padding: 16px 20px; border-bottom: 1px solid #3d4454; }
            .section-title { font-weight: 600; margin-bottom: 12px; font-size: 14px; color: #ffffff; display: flex; justify-content: space-between; align-items: center; }
            .section-hint { font-size: 11px; color: #a4b0be; font-weight: normal; }
            .stat-item { display: flex; align-items: center; gap: 6px; font-size: 13px; margin-bottom: 8px; flex-wrap: wrap; }
            .stat-label { color: #a4b0be; }
            .stat-value { font-weight: 600; color: #ffffff; }
            .stat-value.highlight { color: #ff4757; }
            .keywords-list { max-height: 120px; overflow-y: auto; margin: 0 -20px; padding: 0 20px; }
            .keywords-list::-webkit-scrollbar { width: 6px; }
            .keywords-list::-webkit-scrollbar-track { background: #3d4454; }
            .keywords-list::-webkit-scrollbar-thumb { background: #ff4757; border-radius: 3px; }
            .keyword-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; margin-bottom: 6px; border-radius: 6px; font-size: 13px; transition: all 0.2s ease; border: 1px solid transparent; }
            .keyword-item.valid { background: rgba(46, 125, 50, 0.2); color: #4caf50; border-color: #4caf50; }
            .keyword-item.invalid { background: rgba(198, 40, 40, 0.2); color: #ff5252; border-color: #ff5252; }
            .keyword-count { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 10px; font-size: 11px; font-weight: 600; color: #ffffff; }
            .empty-keywords { text-align: center; color: #a4b0be; font-style: italic; padding: 20px; font-size: 13px; }
            .panel-actions { padding: 16px 20px; display: flex; gap: 8px; flex-wrap: wrap; background: #3d4454; }
            .panel-btn { flex: 1; padding: 8px 12px; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s ease; font-weight: 600; color: white; }
            .panel-btn.primary { background: #ff4757; border: 1px solid #dc143c; }
            .panel-btn.secondary { background: #3d4454; border: 1px solid #ff4757; }
            .xiaoqi-hint { margin: 10px 20px; padding: 10px; background: rgba(52, 152, 219, 0.1); border: 1px solid #3498db; border-radius: 6px; }
            .hint-title { font-size: 12px; color: #3498db; margin-bottom: 5px; font-weight: bold; }
            .hint-keywords { display: flex; flex-wrap: wrap; gap: 5px; }
            .hint-keyword { font-size: 11px; background: rgba(52, 152, 219, 0.2); color: #87ceeb; padding: 2px 6px; border-radius: 4px; cursor: pointer; }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
            @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slideInRight { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'xiaoqi-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    // 核心修复：拦截搜索并立即使用数据校验
    function interceptSearchFunction() {
        // 尝试捕获原始函数
        if (typeof window.performSearch === 'function') {
            originalPerformSearch = window.performSearch;
            
            // 重写全局搜索函数
            window.performSearch = function() {
                const searchInput = document.getElementById(config.searchInputId);
                const query = searchInput ? searchInput.value.trim() : '';
                
                // 1. 小奇唤醒彩蛋
                if (query === config.triggerKeyword) {
                    showXiaoqi();
                    return;
                }
                
                // 2. 记录搜索次数
                recordSearch(query);
                
                // 3. 执行原始论坛搜索逻辑（处理UI显示等）
                const result = originalPerformSearch.apply(this, arguments);
                
                // 4. 【核心修复】立即基于数据校验是否命中了隐藏帖子
                // 不依赖 DOM 类名，直接模拟 forum-script.js 的判断逻辑
                if (window.posts && Array.isArray(window.posts)) {
                    const foundHiddenPosts = window.posts.filter(post => {
                        // 逻辑必须与 forum-script.js 完全一致：
                        // 1. 是隐藏贴
                        // 2. 有关键词
                        // 3. 搜索词转小写后 === 关键词转小写 (精确匹配)
                        return post.hidden && 
                               post.searchKeyword && 
                               query.toLowerCase() === post.searchKeyword.toLowerCase();
                    }).map((post, index) => ({
                        title: post.title,
                        keyword: post.searchKeyword,
                        index: index
                    }));

                    // 5. 记录并反馈结果
                    handleSearchResult(query, foundHiddenPosts);
                }
                
                return result;
            };
            
            // 重新绑定事件以确保使用的是新函数
            const searchBtn = document.getElementById(config.searchBtnId);
            const searchInput = document.getElementById(config.searchInputId);
            
            // 移除旧的监听器（比较困难，直接覆盖）
            // 由于 forum-script.js 使用 addEventListener，我们无法直接移除匿名函数
            // 但因为我们重写了 window.performSearch，如果它内部也是调用这个全局函数，那就生效了
            // 如果 forum-script.js 绑定的是匿名函数，我们需要模拟点击
            
            if (searchBtn) {
                // 克隆节点以移除旧事件监听，然后绑定新的
                const newBtn = searchBtn.cloneNode(true);
                searchBtn.parentNode.replaceChild(newBtn, searchBtn);
                newBtn.addEventListener('click', window.performSearch);
            }
            
            if (searchInput) {
                const newInput = searchInput.cloneNode(true);
                searchInput.parentNode.replaceChild(newInput, searchInput);
                newInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        window.performSearch();
                    }
                });
            }
            
            console.log('小奇助手：搜索拦截已激活 (精确匹配模式)');
        } else {
            console.error('小奇助手：未找到 window.performSearch，请确保 forum-script.js 已加载');
        }
    }
    
    // 处理搜索结果
    function handleSearchResult(query, foundHiddenPosts) {
        if (!query) return;
        
        const hasFound = foundHiddenPosts.length > 0;
        
        // 记录关键词 (有效或无效)
        recordKeyword(query, hasFound, foundHiddenPosts.length);
        
        updateKeywordsDisplay();
        updateStats();
        
        if (hasFound) {
            showMessage(`🎉 成功发现 ${foundHiddenPosts.length} 个隐藏帖子！`, 'success');
        } else {
            // 只有未找到且不是空搜时才提示
            // 检查是否有近似关键词可以提示用户
            checkAndProvideHints(query);
        }
    }
    
    // 检查并提供模糊提示 (仅作提示，不记录为有效)
    function checkAndProvideHints(query) {
        if (!window.posts) return;
        
        const hiddenPosts = window.posts.filter(p => p.hidden && p.searchKeyword);
        const hints = [];
        
        hiddenPosts.forEach(post => {
            const kw = post.searchKeyword.toLowerCase();
            const q = query.toLowerCase();
            
            // 如果包含了关键词，或者是关键词的一部分，提示用户
            if (kw.includes(q) || q.includes(kw) || calculateSimilarity(q, kw) > 0.6) {
                hints.push(post.searchKeyword);
            }
        });
        
        const uniqueHints = [...new Set(hints)];
        if (uniqueHints.length > 0) {
            showMessage(`未找到结果。你是想搜 "${uniqueHints.join('" 或 "')}" 吗？需要完全匹配哦。`, 'warning');
        } else {
             showMessage(`未找到相关帖子 (无效关键词: ${query})`, 'info');
        }
    }

    // 记录搜索次数
    function recordSearch(query) {
        searchCount++;
        if (query && query !== config.triggerKeyword) {
            uniqueSearchTerms.add(query.toLowerCase());
        }
        
        try {
            const history = {
                totalSearches: searchCount,
                uniqueSearchTerms: Array.from(uniqueSearchTerms)
            };
            localStorage.setItem(config.searchHistoryKey, JSON.stringify(history));
            updateSearchStats();
            
            // 彩蛋提示
            if (uniqueSearchTerms.size > 0 && uniqueSearchTerms.size % 7 === 0) {
                showPeriodicHint();
            }
        } catch (e) { console.error(e); }
    }
    
    // 彩蛋提示
    function showPeriodicHint() {
        const uniqueCount = uniqueSearchTerms.size;
        const hints = [
            "姨姨的姓氏你搜了吗！不要只搜姓！姓氏姓氏！姓+氏！",
            "有个鸟类你搜了吗？两个字的!听起来像是晚上会出现的那种鸟",
            "你不是费半天劲得了五个字母吗？你搜一下哇",
            "那个红蛋组织的拼音首字母简写，大写！",
            "lssmr不是有五个字吗，两个三个的拆开！",
            "你不觉得那个啥子符很重要吗？不要在这搜！",
            /* "血月那天发生了什么？", */
        ];
        const hintIndex = Math.floor((uniqueCount / 7) - 1) % hints.length;
        const hintMessage = hints[hintIndex];
        showPanelHint(hintMessage);
    }
    
    function showPanelHint(message) {
        const hintSection = document.getElementById('hint-section');
        const hintContent = document.getElementById('hint-content');
        if (hintSection && hintContent) {
            hintContent.textContent = message;
            hintSection.style.display = 'block';
            document.getElementById(config.panelId).style.display = 'block';
            document.getElementById(config.orbId).classList.add('active');
        }
    }
    
    // 记录关键词状态
    function recordKeyword(keyword, isValid, foundCount) {
        const keywordsData = getStoredKeywords();
        
        // 即使已存在，也更新其状态（比如以前无效，现在有效了）
        if (!keywordsData[keyword] || isValid) {
             keywordsData[keyword] = {
                valid: isValid,
                count: (keywordsData[keyword]?.count || 0) + 1,
                lastFound: new Date().toISOString(),
                foundPosts: foundCount
            };
        } else {
            // 如果已存在且当前无效，只增加计数
            keywordsData[keyword].count++;
            keywordsData[keyword].lastFound = new Date().toISOString();
        }
        
        localStorage.setItem(config.storageKey, JSON.stringify(keywordsData));
        
        const validCount = Object.values(keywordsData).filter(k => k.valid).length;
        updateBadge(validCount);
    }
    
    function getStoredKeywords() {
        try {
            return JSON.parse(localStorage.getItem(config.storageKey) || '{}');
        } catch (e) { return {}; }
    }
    
    // UI更新函数群
    function updateKeywordsDisplay() {
        const keywordsList = document.getElementById('keywords-list');
        const keywordsData = getStoredKeywords();
        const keywords = Object.entries(keywordsData);
        
        if (keywordsList) {
            if (keywords.length > 0) {
                // 按最后搜索时间排序
                keywords.sort((a, b) => new Date(b[1].lastFound) - new Date(a[1].lastFound));
                
                keywordsList.innerHTML = keywords.map(([keyword, data]) => {
                    const validClass = data.valid ? 'valid' : 'invalid';
                    const countText = data.count > 1 ? `<span class="keyword-count">${data.count}</span>` : '';
                    const foundText = data.valid ? ` (${data.foundPosts}帖)` : '';
                    return `
                        <div class="keyword-item ${validClass}">
                            <span class="keyword-text">${escapeHtml(keyword)}${foundText}</span>
                            ${countText}
                        </div>
                    `;
                }).join('');
            } else {
                keywordsList.innerHTML = '<div class="empty-keywords">暂无关键词记录</div>';
            }
        }
    }
    
    function updateStats() {
        const keywordsData = getStoredKeywords();
        const validKeywords = Object.values(keywordsData).filter(k => k.valid).length;
        const totalHidden = window.posts ? window.posts.filter(p => p.hidden).length : 7;
        
        document.getElementById('found-count').textContent = validKeywords;
        document.getElementById('total-count').textContent = totalHidden;
        updateBadge(validKeywords);
    }
    
    function updateSearchStats() {
        document.getElementById('search-count').textContent = searchCount;
        document.getElementById('unique-search-count').textContent = uniqueSearchTerms.size;
    }
    
    function updateBadge(count) {
        const badge = document.querySelector('.xiaoqi-badge');
        if (badge) {
            badge.style.display = count > 0 ? 'flex' : 'none';
            badge.textContent = count > 99 ? '99+' : count;
        }
    }
    
    function showMessage(message, type) {
        const msgDiv = document.createElement('div');
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            background: ${type === 'success' ? '#2ecc71' : type === 'warning' ? '#f39c12' : '#34495e'}; 
            color: white; padding: 12px 18px; border-radius: 8px; z-index: 10002; 
            font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); animation: slideInRight 0.3s ease;
        `;
        document.body.appendChild(msgDiv);
        setTimeout(() => msgDiv.remove(), 3000);
    }
    
    // 工具函数
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        if (longer.length === 0) return 1.0;
        if (longer.includes(shorter)) return 0.8;
        return 0; // 简化版
    }
    
    function showXiaoqi() {
        document.getElementById(config.containerId).style.display = 'block';
    }
    
    // 事件绑定
    function bindEvents() {
        const orb = document.getElementById(config.orbId);
        const panel = document.getElementById(config.panelId);
        
        orb.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = panel.style.display === 'block';
            panel.style.display = isVisible ? 'none' : 'block';
            orb.classList.toggle('active', !isVisible);
            updateKeywordsDisplay();
            updateStats();
        });
        
        document.getElementById('xiaoqi-close').addEventListener('click', (e) => {
            e.stopPropagation();
            panel.style.display = 'none';
            orb.classList.remove('active');
        });
        
        document.getElementById('clear-keywords').addEventListener('click', () => {
            if(confirm('清空记录？')) {
                localStorage.setItem(config.storageKey, '{}');
                updateKeywordsDisplay();
                updateStats();
                showMessage('已清空', 'success');
            }
        });

        document.getElementById('copy-all-keywords').addEventListener('click', () => {
             const data = getStoredKeywords();
             const valid = Object.keys(data).filter(k => data[k].valid).join(', ');
             if(valid) {
                 navigator.clipboard.writeText(valid);
                 showMessage('已复制有效关键词', 'success');
             } else {
                 showMessage('没有有效关键词', 'warning');
             }
        });
        
        document.getElementById('clear-badge').addEventListener('click', () => {
            updateBadge(0);
        });
    }

    // 初始化
    init();
    
    // 暴露全局对象
    window.xiaoqi = { show: showXiaoqi, version: '2.6.0' };
    
})();
