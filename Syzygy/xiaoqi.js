/**
 * 小奇 - 隐藏帖子助手
 * 版本: 2.5.4
 * 修复：与论坛搜索逻辑保持一致，使用精确匹配
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
            } else {
                searchCount = 0;
                uniqueSearchTerms = new Set();
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
        interceptSearchFunction();
        bindEvents();
        updateDisplay();
        showXiaoqi();
    }
    
    // 创建小奇UI - 保持不变
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
                                    <span class="stat-label">(不重复的搜索了:</span>
                                    <span class="stat-value" id="unique-search-count">0</span>
                                    <span class="stat-label">次)</span> 
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
                                <div class="stat-item">
                                    <span class="stat-label">未发现帖子:</span>
                                    <span class="stat-value highlight" id="remaining-count">0</span>
                                </div>
                            </div>
                            <div class="panel-actions">
                                <button class="panel-btn primary" id="clear-keywords">清空记录</button>
                                <button class="panel-btn secondary" id="copy-all-keywords">复制有效关键词</button>
                                <button class="panel-btn secondary" id="clear-badge">清除角标</button>
                                <button class="panel-btn secondary" id="clear-hint">清除提示</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', xiaoqiHTML);
            addStyles();
        }
    }
    
    // 添加样式 - 保持不变
    function addStyles() {
        if (document.getElementById('xiaoqi-styles')) return;
        
        const styles = `
            .xiaoqi-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .xiaoqi-orb {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #ff4757 0%, #dc143c 100%);
                border-radius: 50%;
                cursor: pointer;
                position: relative;
                box-shadow: 0 4px 20px rgba(255, 71, 87, 0.4);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: float 3s ease-in-out infinite;
                border: 2px solid #8b0000;
            }
            
            .xiaoqi-orb:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(255, 71, 87, 0.6);
            }
            
            .xiaoqi-eyes {
                display: flex;
                gap: 8px;
                margin-bottom: 4px;
            }
            
            .xiaoqi-eye {
                width: 12px;
                height: 12px;
                background: #2f3542;
                border-radius: 50%;
                position: relative;
                overflow: hidden;
                border: 1px solid #000;
            }
            
            .xiaoqi-eye::after {
                content: '';
                position: absolute;
                width: 6px;
                height: 6px;
                background: #ffffff;
                border-radius: 50%;
                top: 2px;
                left: 2px;
                transition: all 0.2s ease;
            }
            
            .xiaoqi-orb:hover .xiaoqi-eye::after {
                transform: translate(1px, -1px);
            }
            
            .xiaoqi-mouth {
                width: 16px;
                height: 6px;
                background: #2f3542;
                border-radius: 0 0 8px 8px;
                margin-top: 2px;
                transition: all 0.3s ease;
                border: 1px solid #000;
            }
            
            .xiaoqi-orb:hover .xiaoqi-mouth {
                height: 4px;
                border-radius: 2px;
            }
            
            .xiaoqi-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #2f3542;
                color: #ff4757;
                border-radius: 12px;
                min-width: 18px;
                height: 18px;
                font-size: 11px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2px 6px;
                box-shadow: 0 2px 8px rgba(47, 53, 66, 0.8);
                border: 1px solid #000;
                display: none;
            }
            
            .xiaoqi-panel {
                position: absolute;
                bottom: 70px;
                right: 0;
                width: 320px;
                background: #2f3542;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.6);
                display: none;
                animation: slideUp 0.3s ease;
                border: 2px solid #ff4757;
                overflow: hidden;
            }
            
            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                background: linear-gradient(135deg, #ff4757 0%, #dc143c 100%);
                border-radius: 10px 10px 0 0;
                color: #ffffff;
                border-bottom: 2px solid #8b0000;
            }
            
            .panel-title {
                font-weight: 600;
                font-size: 14px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            }
            
            .panel-close {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: background 0.2s ease;
                font-weight: bold;
            }
            
            .panel-close:hover {
                background: rgba(255,255,255,0.3);
            }
            
            .panel-content {
                max-height: 400px;
                overflow-y: auto;
                padding: 0;
            }
            
            .hint-section {
                padding: 16px 20px;
                background: rgba(255, 193, 7, 0.1);
                border-bottom: 1px solid #ffc107;
                margin-bottom: 0;
            }
            
            .hint-content {
                color: #ffc107;
                font-size: 13px;
                line-height: 1.4;
                text-align: center;
            }
            
            .search-stats-section,
            .keywords-section,
            .stats-section {
                padding: 16px 20px;
                border-bottom: 1px solid #3d4454;
            }
            
            .section-title {
                font-weight: 600;
                margin-bottom: 12px;
                font-size: 14px;
                color: #ffffff;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .section-hint {
                font-size: 11px;
                color: #a4b0be;
                font-weight: normal;
            }
            
            .stat-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 13px;
                margin-bottom: 8px;
                flex-wrap: wrap;
            }
            
            .stat-label {
                color: #a4b0be;
            }
            
            .stat-value {
                font-weight: 600;
                color: #ffffff;
            }
            
            .stat-value.highlight {
                color: #ff4757;
            }
            
            .keywords-list {
                max-height: 120px;
                overflow-y: auto;
                margin: 0 -20px;
                padding: 0 20px;
            }
            
            .keywords-list::-webkit-scrollbar {
                width: 6px;
            }
            
            .keywords-list::-webkit-scrollbar-track {
                background: #3d4454;
                border-radius: 3px;
            }
            
            .keywords-list::-webkit-scrollbar-thumb {
                background: #ff4757;
                border-radius: 3px;
            }
            
            .keywords-list::-webkit-scrollbar-thumb:hover {
                background: #dc143c;
            }
            
            .keyword-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                margin-bottom: 6px;
                border-radius: 6px;
                font-size: 13px;
                transition: all 0.2s ease;
                border: 1px solid transparent;
            }
            
            .keyword-item.valid {
                background: rgba(46, 125, 50, 0.2);
                color: #4caf50;
                border-color: #4caf50;
            }
            
            .keyword-item.invalid {
                background: rgba(198, 40, 40, 0.2);
                color: #ff5252;
                border-color: #ff5252;
            }
            
            .keyword-count {
                background: rgba(255,255,255,0.1);
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 600;
                color: #ffffff;
            }
            
            .empty-keywords {
                text-align: center;
                color: #a4b0be;
                font-style: italic;
                padding: 20px;
                font-size: 13px;
            }
            
            .panel-actions {
                padding: 16px 20px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
                background: #3d4454;
            }
            
            .panel-btn {
                flex: 1;
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 80px;
                font-weight: 600;
            }
            
            .panel-btn.primary {
                background: #ff4757;
                color: white;
                border: 1px solid #dc143c;
            }
            
            .panel-btn.primary:hover {
                background: #dc143c;
            }
            
            .panel-btn.secondary {
                background: #3d4454;
                color: #ffffff;
                border: 1px solid #ff4757;
            }
            
            .panel-btn.secondary:hover {
                background: #4a5263;
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @media (max-width: 768px) {
                .xiaoqi-container {
                    bottom: 10px;
                    right: 10px;
                }
                
                .xiaoqi-orb {
                    width: 50px;
                    height: 50px;
                }
                
                .xiaoqi-panel {
                    width: 280px;
                    right: -10px;
                    max-height: 70vh;
                }
                
                .panel-content {
                    max-height: 60vh;
                }
                
                .xiaoqi-eye {
                    width: 10px;
                    height: 10px;
                }
                
                .xiaoqi-eye::after {
                    width: 5px;
                    height: 5px;
                }
                
                .xiaoqi-mouth {
                    width: 14px;
                    height: 5px;
                }
                
                .keywords-list {
                    max-height: 100px;
                }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'xiaoqi-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    // 拦截搜索函数 - 关键修复：在搜索时直接检测隐藏帖子
    function interceptSearchFunction() {
        if (typeof window.performSearch === 'function') {
            originalPerformSearch = window.performSearch;
            window.performSearch = function() {
                const query = document.getElementById(config.searchInputId).value.trim();
                
                if (query === config.triggerKeyword) {
                    showXiaoqi();
                    return;
                }
                
                recordSearch(query);
                const result = originalPerformSearch.apply(this, arguments);
                
                // 关键修复：在搜索后立即检查显示的隐藏帖子
                setTimeout(() => {
                    checkForRevealedPosts(query);
                }, 100);
                
                return result;
            };
        } else {
            window.performSearch = function() {
                const query = document.getElementById(config.searchInputId).value.trim();
                
                if (query === config.triggerKeyword) {
                    showXiaoqi();
                    return;
                }
                
                recordSearch(query);
                
                // 执行原始搜索逻辑
                const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
                const postItems = document.querySelectorAll('.post-item');

                postItems.forEach(item => {
                    item.classList.remove('revealed');
                    item.classList.remove('search-highlight');
                    if (item.classList.contains('hidden-post')) {
                        item.style.display = 'none';
                    } else {
                        item.style.display = 'block';
                    }
                });

                if (!searchTerm) return;

                let foundHiddenPosts = [];
                
                postItems.forEach(item => {
                    const postIndex = parseInt(item.getAttribute('data-post'));
                    const post = window.posts[postIndex];

                    // 与论坛逻辑保持一致的精确匹配
                    if (post.hidden && post.searchKeyword && searchTerm === post.searchKeyword.toLowerCase()) {
                        item.classList.add('revealed');
                        item.style.display = 'block';
                        item.classList.add('search-highlight');
                        foundHiddenPosts.push({
                            title: post.title,
                            keyword: post.searchKeyword,
                            index: postIndex
                        });
                    }

                    if (!post.hidden &&
                        (post.title.toLowerCase().includes(searchTerm) ||
                            post.content.toLowerCase().includes(searchTerm))) {
                        item.style.display = 'block';
                        item.classList.add('search-highlight');
                    } else if (!post.hidden) {
                        item.style.display = 'none';
                    }
                });

                const visiblePosts = document.querySelectorAll('.post-item[style=""]').length +
                    document.querySelectorAll('.post-item[style="block"]').length +
                    document.querySelectorAll('.post-item.revealed').length;

                if (searchTerm && visiblePosts === 0) {
                    const existingMessage = document.querySelector('.no-results-message');
                    if (existingMessage) existingMessage.remove();

                    const message = document.createElement('div');
                    message.className = 'no-results-message';
                    message.style.cssText = 'text-align: center; padding: 20px; color: #cc6666; font-style: italic;';
                    message.textContent = '没有找到相关帖子。';
                    document.getElementById('postsList').appendChild(message);
                } else {
                    const existingMessage = document.querySelector('.no-results-message');
                    if (existingMessage) existingMessage.remove();
                }
                
                // 关键修复：立即记录找到的隐藏帖子
                checkForHiddenPosts(query, foundHiddenPosts);
            };
            
            const searchBtn = document.getElementById(config.searchBtnId);
            if (searchBtn) {
                searchBtn.addEventListener('click', window.performSearch);
            }
            
            const searchInput = document.getElementById(config.searchInputId);
            if (searchInput) {
                searchInput.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        window.performSearch();
                    }
                });
            }
        }
    }
    
    // 关键修复：检查已显示的隐藏帖子
    function checkForRevealedPosts(query) {
        const revealedPosts = document.querySelectorAll('.post-item.revealed');
        const foundPosts = [];
        
        revealedPosts.forEach(item => {
            const postIndex = parseInt(item.getAttribute('data-post'));
            const post = window.posts[postIndex];
            if (post && post.hidden) {
                foundPosts.push({
                    title: post.title,
                    keyword: post.searchKeyword,
                    index: postIndex
                });
            }
        });
        
        checkForHiddenPosts(query, foundPosts);
    }
    
    // 记录搜索次数 - 保持不变
    function recordSearch(query) {
        searchCount++;
        if (query && query !== config.triggerKeyword) {
            uniqueSearchTerms.add(query.toLowerCase());
        }
        
        try {
            const history = {
                totalSearches: searchCount,
                lastSearch: new Date().toISOString(),
                uniqueSearchTerms: Array.from(uniqueSearchTerms)
            };
            localStorage.setItem(config.searchHistoryKey, JSON.stringify(history));
            updateSearchStats();
            
            if (uniqueSearchTerms.size > 0 && uniqueSearchTerms.size % 7 === 0) {
                showPeriodicHint();
            }
        } catch (e) {
            console.error('记录搜索次数失败:', e);
        }
    }
    
    // 每7次不重复搜索显示提示 - 保持不变
    function showPeriodicHint() {
        const uniqueCount = uniqueSearchTerms.size;
        const hints = [
            "姨姨的姓氏你搜了吗！不要只搜姓！姓氏姓氏！姓+氏！",
            "喂，你不会没有搜过临渠县那个啥东西吧？咋跟你说呢！金桂那篇报道里有的啊！",
            "有个鸟类你搜了吗？两个字的!听起来像是晚上会出现的那种鸟",
            "你不是费半天劲得了五个字母吗？你搜一下哇",
            "那个红蛋组织的拼音首字母简写，大写！",
            "lssmr不是有五个字吗，两个三个的拆开！",
            "你不觉得那个啥子符很重要吗？不要在这搜！",
        ];
        
        const hintIndex = Math.floor((uniqueCount / 7) - 1) % hints.length;
        const hintMessage = hints[hintIndex] || `你已经完成了${uniqueCount}次不重复搜索！`;
        
        showPanelHint(hintMessage);
        showMessage(hintMessage, 'success');
    }
    
    // 在面板中显示提示 - 保持不变
    function showPanelHint(message) {
        const hintSection = document.getElementById('hint-section');
        const hintContent = document.getElementById('hint-content');
        
        if (hintSection && hintContent) {
            hintContent.textContent = message;
            hintSection.style.display = 'block';
            
            const panel = document.getElementById(config.panelId);
            const orb = document.getElementById(config.orbId);
            panel.style.display = 'block';
            orb.classList.add('active');
        }
    }
    
    // 清除面板提示 - 保持不变
    function clearPanelHint() {
        const hintSection = document.getElementById('hint-section');
        if (hintSection) {
            hintSection.style.display = 'none';
        }
    }
    
    // 绑定事件 - 保持不变
    function bindEvents() {
        const orb = document.getElementById(config.orbId);
        const panel = document.getElementById(config.panelId);
        const panelClose = document.getElementById('xiaoqi-close');
        const clearBtn = document.getElementById('clear-keywords');
        const copyAllBtn = document.getElementById('copy-all-keywords');
        const clearBadgeBtn = document.getElementById('clear-badge');
        const clearHintBtn = document.getElementById('clear-hint');
        
        if (orb) {
            orb.addEventListener('click', function(e) {
                e.stopPropagation();
                panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
                orb.classList.toggle('active');
                updateKeywordsDisplay();
                updateStats();
                updateSearchStats();
            });
        }
        
        if (panelClose) {
            panelClose.addEventListener('click', function(e) {
                e.stopPropagation();
                panel.style.display = 'none';
                orb.classList.remove('active');
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                if (confirm('确定要清空所有已记录的关键词吗？')) {
                    localStorage.setItem(config.storageKey, JSON.stringify({}));
                    updateKeywordsDisplay();
                    updateStats();
                    updateBadge(0);
                    showMessage('关键词已清空', 'success');
                }
            });
        }
        
        if (copyAllBtn) {
            copyAllBtn.addEventListener('click', function() {
                const keywordsData = getStoredKeywords();
                const validKeywords = Object.keys(keywordsData).filter(k => keywordsData[k].valid);
                
                if (validKeywords.length > 0) {
                    const text = validKeywords.join(', ');
                    navigator.clipboard.writeText(text).then(() => {
                        showMessage(`已复制 ${validKeywords.length} 个有效关键词`, 'success');
                    }).catch(() => {
                        const textArea = document.createElement('textarea');
                        textArea.value = text;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        showMessage(`已复制 ${validKeywords.length} 个有效关键词`, 'success');
                    });
                } else {
                    showMessage('没有有效关键词可复制', 'info');
                }
            });
        }
        
        if (clearBadgeBtn) {
            clearBadgeBtn.addEventListener('click', function() {
                updateBadge(0);
                showMessage('角标已清除', 'success');
            });
        }
        
        if (clearHintBtn) {
            clearHintBtn.addEventListener('click', function() {
                clearPanelHint();
                showMessage('提示已清除', 'success');
            });
        }
        
        document.addEventListener('click', function(event) {
            const panel = document.getElementById(config.panelId);
            const orb = document.getElementById(config.orbId);
            const container = document.getElementById(config.containerId);
            
            if (panel && panel.style.display === 'block' && 
                !container.contains(event.target)) {
                panel.style.display = 'none';
                orb.classList.remove('active');
            }
        });
    }
    
    // 显示小奇 - 保持不变
    function showXiaoqi() {
        const container = document.getElementById(config.containerId);
        if (container) {
            container.style.display = 'block';
            if (searchCount === 0) {
                showMessage('我是小奇。', 'success');
            }
        }
    }
    
    // 检查搜索结果中的隐藏帖子 - 关键修复
    function checkForHiddenPosts(query, preFoundPosts = []) {
        if (!query || query === config.triggerKeyword) return;
        
        let foundHiddenPosts = preFoundPosts;
        
        // 如果没有预先找到的帖子，检查DOM中已显示的帖子
        if (foundHiddenPosts.length === 0) {
            const revealedPosts = document.querySelectorAll('.post-item.revealed');
            revealedPosts.forEach(item => {
                const postIndex = parseInt(item.getAttribute('data-post'));
                const post = window.posts[postIndex];
                if (post && post.hidden) {
                    foundHiddenPosts.push({
                        title: post.title,
                        keyword: post.searchKeyword,
                        index: postIndex
                    });
                }
            });
        }
        
        const hasFoundPosts = foundHiddenPosts.length > 0;
        
        console.log(`搜索词: "${query}", 找到隐藏帖子: ${foundHiddenPosts.length}个`, foundHiddenPosts);
        
        // 记录关键词
        recordKeyword(query, hasFoundPosts, foundHiddenPosts.length);
        
        updateKeywordsDisplay();
        updateStats();
        updateSearchStats();
        
        if (hasFoundPosts) {
            showMessage(`发现 ${foundHiddenPosts.length} 个隐藏帖子！关键词 "${query}" 已记录`, 'success');
        } else {
            showMessage(`未发现隐藏帖子`, 'info');
            provideSearchHints(query);
        }
    }
    
    // 记录关键词 - 保持不变
    function recordKeyword(keyword, isValid, foundCount = 0) {
        const keywordsData = getStoredKeywords();
        
        if (!keywordsData[keyword]) {
            keywordsData[keyword] = {
                valid: isValid,
                count: 1,
                firstFound: new Date().toISOString(),
                lastFound: new Date().toISOString(),
                foundPosts: foundCount
            };
        } else {
            keywordsData[keyword].count++;
            keywordsData[keyword].lastFound = new Date().toISOString();
            keywordsData[keyword].foundPosts = foundCount;
            if (!keywordsData[keyword].valid && isValid) {
                keywordsData[keyword].valid = true;
            }
        }
        
        localStorage.setItem(config.storageKey, JSON.stringify(keywordsData));
        
        const validCount = Object.values(keywordsData).filter(k => k.valid).length;
        updateBadge(validCount);
    }
    
    // 获取存储的关键词 - 保持不变
    function getStoredKeywords() {
        try {
            const stored = localStorage.getItem(config.storageKey);
            if (!stored) return {};
            
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                const newData = {};
                parsed.forEach(keyword => {
                    newData[keyword] = {
                        valid: true,
                        count: 1,
                        firstFound: new Date().toISOString(),
                        lastFound: new Date().toISOString(),
                        foundPosts: 1
                    };
                });
                localStorage.setItem(config.storageKey, JSON.stringify(newData));
                return newData;
            }
            return parsed;
        } catch (e) {
            console.error('读取关键词数据失败:', e);
            return {};
        }
    }
    
    // 更新关键词显示 - 保持不变
    function updateKeywordsDisplay() {
        const keywordsList = document.getElementById('keywords-list');
        const keywordsData = getStoredKeywords();
        const keywords = Object.entries(keywordsData);
        
        if (keywordsList) {
            if (keywords.length > 0) {
                keywords.sort((a, b) => new Date(b[1].lastFound) - new Date(a[1].lastFound));
                
                keywordsList.innerHTML = keywords.map(([keyword, data]) => {
                    const validClass = data.valid ? 'valid' : 'invalid';
                    const countText = data.count > 1 ? `<span class="keyword-count">${data.count}</span>` : '';
                    const foundText = data.foundPosts > 0 ? ` (${data.foundPosts}帖)` : '';
                    return `
                        <div class="keyword-item ${validClass}">
                            <span class="keyword-text">${keyword}${foundText}</span>
                            ${countText}
                        </div>
                    `;
                }).join('');
            } else {
                keywordsList.innerHTML = '<div class="empty-keywords">暂无关键词记录<br>搜索隐藏帖子后会自动记录</div>';
            }
        }
    }
    
    // 更新统计信息 - 保持不变
    function updateStats() {
        const foundCount = document.getElementById('found-count');
        const remainingCount = document.getElementById('remaining-count');
        const totalCount = document.getElementById('total-count');
        
        const keywordsData = getStoredKeywords();
        const validKeywords = Object.values(keywordsData).filter(k => k.valid).length;
        const totalHidden = calculateTotalHiddenPosts();
        
        if (foundCount) foundCount.textContent = validKeywords;
        if (remainingCount) remainingCount.textContent = totalHidden - validKeywords;
        if (totalCount) totalCount.textContent = totalHidden;
    }
    
    // 更新搜索统计 - 保持不变
    function updateSearchStats() {
        const searchCountElement = document.getElementById('search-count');
        const uniqueSearchCountElement = document.getElementById('unique-search-count');
        
        if (searchCountElement) {
            searchCountElement.textContent = searchCount;
        }
        if (uniqueSearchCountElement) {
            uniqueSearchCountElement.textContent = uniqueSearchTerms.size;
        }
    }
    
    // 计算总隐藏帖子数量 - 保持不变
    function calculateTotalHiddenPosts() {
        if (window.posts && Array.isArray(window.posts)) {
            return window.posts.filter(post => post.hidden).length;
        }
        return 7;
    }
    
    // 更新徽章 - 保持不变
    function updateBadge(count) {
        const orb = document.getElementById(config.orbId);
        let badge = orb.querySelector('.xiaoqi-badge');
        
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'xiaoqi-badge';
            orb.appendChild(badge);
        }
        
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count.toString();
            badge.style.display = 'block';
            
            if (count > 9) {
                badge.style.minWidth = '22px';
                badge.style.padding = '2px 8px';
            } else {
                badge.style.minWidth = '18px';
                badge.style.padding = '2px 6px';
            }
        } else {
            badge.style.display = 'none';
        }
    }
    
    // 显示消息 - 保持不变
    function showMessage(message, type = 'info') {
        const existingMsg = document.getElementById('xiaoqi-message');
        if (existingMsg) {
            existingMsg.remove();
        }
        
        const backgroundColor = type === 'success' ? '#ff4757' : type === 'warning' ? '#ffa502' : '#2f3542';
        
        const msgDiv = document.createElement('div');
        msgDiv.id = 'xiaoqi-message';
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 12px 18px;
            border-radius: 8px;
            z-index: 10002;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
            max-width: 80vw;
            word-break: break-word;
            border: 1px solid #ff4757;
        `;
        
        if (window.innerWidth <= 768) {
            msgDiv.style.right = '10px';
            msgDiv.style.left = '10px';
            msgDiv.style.top = '10px';
        }
        
        document.body.appendChild(msgDiv);
        
        setTimeout(() => {
            if (msgDiv.parentNode) {
                msgDiv.parentNode.removeChild(msgDiv);
            }
        }, 3000);
    }
    
    // 提供未搜到关键词的提示 - 保持不变
    function provideSearchHints(query) {
        if (!window.posts || !Array.isArray(window.posts)) return;
        
        const hiddenPosts = window.posts.filter(post => post.hidden && post.searchKeyword);
        const possibleKeywords = [];
        
        hiddenPosts.forEach(post => {
            if (post.searchKeyword) {
                const keywords = post.searchKeyword.split(',').map(k => k.trim());
                keywords.forEach(keyword => {
                    if (calculateSimilarity(query, keyword) > 0.6) {
                        possibleKeywords.push(keyword);
                    }
                });
            }
        });
        
        const uniqueKeywords = [...new Set(possibleKeywords)];
        
        if (uniqueKeywords.length > 0) {
            const hintPanel = document.createElement('div');
            hintPanel.className = 'xiaoqi-hint';
            hintPanel.innerHTML = `
                <div class="hint-title">试试这些关键词：</div>
                <div class="hint-keywords">
                    ${uniqueKeywords.map(keyword => 
                        `<span class="hint-keyword">${keyword}</span>`
                    ).join('')}
                </div>
            `;
            
            const panel = document.getElementById(config.panelId);
            const existingHint = panel.querySelector('.xiaoqi-hint');
            if (existingHint) {
                existingHint.remove();
            }
            panel.querySelector('.panel-content').insertBefore(hintPanel, panel.querySelector('.panel-actions'));
            
            showMessage(`没找到相关帖子，试试这些关键词吧！`, 'info');
        }
    }
    
    // 计算字符串相似度 - 保持不变
    function calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        if (longer.includes(shorter)) return 0.8;
        if (shorter.includes(longer)) return 0.8;
        
        let matches = 0;
        for (let i = 0; i < shorter.length; i++) {
            if (longer.includes(shorter[i])) matches++;
        }
        
        return matches / longer.length;
    }
    
    // 更新显示状态 - 保持不变
    function updateDisplay() {
        const keywordsData = getStoredKeywords();
        const validCount = Object.values(keywordsData).filter(k => k.valid).length;
        updateBadge(validCount);
        updateSearchStats();
    }
    
    // 初始化
    init();
    
    // 暴露到全局
    window.xiaoqi = {
        show: showXiaoqi,
        getKeywords: getStoredKeywords,
        clearKeywords: function() {
            localStorage.setItem(config.storageKey, JSON.stringify({}));
            updateKeywordsDisplay();
            updateStats();
            updateBadge(0);
            updateSearchStats();
        },
        clearBadge: function() {
            updateBadge(0);
        },
        clearHints: function() {
            clearPanelHint();
        },
        getStats: function() {
            const keywordsData = getStoredKeywords();
            return {
                totalSearches: searchCount,
                uniqueSearches: uniqueSearchTerms.size,
                validKeywords: Object.values(keywordsData).filter(k => k.valid).length,
                invalidKeywords: Object.values(keywordsData).filter(k => !k.valid).length,
                totalHiddenPosts: calculateTotalHiddenPosts()
            };
        },
        setHint: function(message) {
            showPanelHint(message);
        },
        debugSearch: function(query) {
            console.log('=== 小奇调试模式 ===');
            console.log('搜索词:', query);
            const revealedPosts = document.querySelectorAll('.post-item.revealed');
            console.log('已显示的隐藏帖子:', revealedPosts.length);
            revealedPosts.forEach(item => {
                const postIndex = parseInt(item.getAttribute('data-post'));
                const post = window.posts[postIndex];
                console.log(`帖子 ${postIndex}: "${post.title}"`);
            });
            return revealedPosts.length;
        },
        version: '2.5.4'
    };
    
})();