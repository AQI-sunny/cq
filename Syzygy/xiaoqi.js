/**
 * 小奇 - 隐藏帖子助手
 * 版本: 2.6.1 (DOM检测修复版)
 * 修复：解决了无法读取 posts 数据导致计数永远为 0 的问题
 * 原理：改为检测 HTML 元素上的 'revealed' 类名
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
        setTimeout(() => {
            interceptSearchFunction();
            bindEvents();
            updateDisplay();
            showXiaoqi();
        }, 500);
    }
    
    // 创建UI (保持不变)
    function createXiaoqiUI() {
        if (!document.getElementById(config.containerId)) {
            const xiaoqiHTML = `
                <div class="xiaoqi-container" id="${config.containerId}">
                    <div class="xiaoqi-orb" id="${config.orbId}">
                        <div class="xiaoqi-eyes"><div class="xiaoqi-eye left-eye"></div><div class="xiaoqi-eye right-eye"></div></div>
                        <div class="xiaoqi-mouth"></div>
                        <div class="xiaoqi-badge">0</div>
                    </div>
                    <div class="xiaoqi-panel" id="${config.panelId}">
                        <div class="panel-header">
                            <div class="panel-title">小奇助手 v2.6.1</div>
                            <button class="panel-close" id="xiaoqi-close">×</button>
                        </div>
                        <div class="panel-content">
                            <div class="hint-section" id="hint-section" style="display: none;">
                                <div class="hint-content" id="hint-content"></div>
                            </div>
                            <div class="stats-section">
                                <div class="stat-item">
                                    <span class="stat-label">发现隐藏帖子:</span>
                                    <span class="stat-value highlight" id="found-count">0</span>
                                    <span class="stat-label">/</span>
                                    <span class="stat-value highlight" id="total-count">7</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">已搜索次数:</span>
                                    <span class="stat-value" id="search-count">0</span>
                                </div>
                            </div>
                            <div class="keywords-section">
                                <div class="section-title">
                                    <span>已发现的关键词</span>
                                    <span class="section-hint">(绿色=有效)</span>
                                </div>
                                <div class="keywords-list" id="keywords-list">
                                    <div class="empty-keywords">暂无有效记录</div>
                                </div>
                            </div>
                            <div class="panel-actions">
                                <button class="panel-btn primary" id="clear-keywords">清空记录</button>
                                <button class="panel-btn secondary" id="copy-all-keywords">复制关键词</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', xiaoqiHTML);
            addStyles();
        }
    }
    
    // 添加样式 (精简版)
    function addStyles() {
        if (document.getElementById('xiaoqi-styles')) return;
        const styles = `
            .xiaoqi-container { position: fixed; bottom: 20px; right: 20px; z-index: 10000; font-family: sans-serif; }
            .xiaoqi-orb { width: 60px; height: 60px; background: linear-gradient(135deg, #ff4757, #dc143c); border-radius: 50%; cursor: pointer; position: relative; box-shadow: 0 4px 15px rgba(220,20,60,0.4); display: flex; align-items: center; justify-content: center; border: 2px solid #8b0000; transition: transform 0.2s; }
            .xiaoqi-orb:hover { transform: scale(1.1); }
            .xiaoqi-eyes { display: flex; gap: 8px; margin-bottom: 4px; }
            .xiaoqi-eye { width: 12px; height: 12px; background: #2f3542; border-radius: 50%; position: relative; }
            .xiaoqi-eye::after { content: ''; position: absolute; width: 6px; height: 6px; background: #fff; border-radius: 50%; top: 2px; left: 2px; }
            .xiaoqi-mouth { width: 16px; height: 6px; background: #2f3542; border-radius: 0 0 8px 8px; margin-top: 2px; }
            .xiaoqi-badge { position: absolute; top: -5px; right: -5px; background: #2f3542; color: #ff4757; border-radius: 10px; padding: 2px 6px; font-size: 11px; font-weight: bold; display: none; border: 1px solid #fff; }
            .xiaoqi-panel { position: absolute; bottom: 70px; right: 0; width: 300px; background: #2f3542; border-radius: 12px; display: none; border: 2px solid #ff4757; overflow: hidden; color: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .panel-header { padding: 12px 16px; background: #ff4757; display: flex; justify-content: space-between; align-items: center; }
            .panel-close { background: none; border: none; color: white; font-size: 20px; cursor: pointer; }
            .panel-content { padding: 0; }
            .stats-section, .keywords-section { padding: 12px 16px; border-bottom: 1px solid #444; }
            .stat-item { margin-bottom: 5px; font-size: 13px; color: #ccc; }
            .stat-value { color: #fff; font-weight: bold; margin: 0 4px; }
            .stat-value.highlight { color: #ff4757; font-size: 14px; }
            .keywords-list { max-height: 150px; overflow-y: auto; margin-top: 10px; }
            .keyword-item { padding: 6px 10px; margin-bottom: 4px; border-radius: 4px; font-size: 12px; display: flex; justify-content: space-between; }
            .keyword-item.valid { background: rgba(46, 125, 50, 0.3); color: #4caf50; border: 1px solid #4caf50; }
            .keyword-item.invalid { background: rgba(198, 40, 40, 0.3); color: #ff5252; border: 1px solid #ff5252; }
            .panel-actions { padding: 12px 16px; display: flex; gap: 10px; }
            .panel-btn { flex: 1; padding: 6px; border-radius: 4px; border: none; cursor: pointer; font-size: 12px; color: white; }
            .panel-btn.primary { background: #ff4757; }
            .panel-btn.secondary { background: #444; border: 1px solid #666; }
            .hint-section { padding: 10px; background: rgba(255, 193, 7, 0.15); border-bottom: 1px solid #ffc107; text-align: center; color: #ffc107; font-size: 12px; }
            .empty-keywords { text-align: center; color: #888; font-style: italic; font-size: 12px; padding: 10px; }
        `;
        const styleSheet = document.createElement('style');
        styleSheet.id = 'xiaoqi-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    // 【核心修复】拦截搜索并使用 DOM 检测
    function interceptSearchFunction() {
        if (typeof window.performSearch === 'function') {
            originalPerformSearch = window.performSearch;
            
            window.performSearch = function() {
                const searchInput = document.getElementById(config.searchInputId);
                const query = searchInput ? searchInput.value.trim() : '';
                
                if (query === config.triggerKeyword) {
                    showXiaoqi();
                    return;
                }
                
                recordSearch(query);
                
                // 1. 执行原始搜索 (这会同步更新 DOM)
                const result = originalPerformSearch.apply(this, arguments);
                
                // 2. 检测结果：直接看 DOM 中有没有 .revealed 类的元素
                // forum-script.js 在找到隐藏贴时，会添加 'revealed' 类
                const revealedPosts = document.querySelectorAll('.post-item.revealed');
                const foundCount = revealedPosts.length;
                const hasFound = foundCount > 0;
                
                console.log(`[小奇] 搜索: "${query}", 发现隐藏贴数量: ${foundCount}`);
                
                // 3. 记录结果
                handleSearchResult(query, hasFound, foundCount);
                
                return result;
            };
            
            // 重新绑定按钮事件
            const searchBtn = document.getElementById(config.searchBtnId);
            const searchInput = document.getElementById(config.searchInputId);
            
            if (searchBtn) {
                const newBtn = searchBtn.cloneNode(true);
                searchBtn.parentNode.replaceChild(newBtn, searchBtn);
                newBtn.addEventListener('click', window.performSearch);
            }
            if (searchInput) {
                const newInput = searchInput.cloneNode(true);
                searchInput.parentNode.replaceChild(newInput, searchInput);
                newInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') window.performSearch();
                });
            }
            console.log('小奇助手：已激活 (DOM检测模式)');
        }
    }
    
    function handleSearchResult(query, hasFound, foundCount) {
        if (!query) return;
        
        recordKeyword(query, hasFound, foundCount);
        updateKeywordsDisplay();
        updateStats();
        
        if (hasFound) {
            showMessage(`🎉 成功发现 ${foundCount} 个隐藏帖子！`, 'success');
        }
    }
    
    function recordSearch(query) {
        searchCount++;
        if (query && query !== config.triggerKeyword) {
            uniqueSearchTerms.add(query.toLowerCase());
        }
        localStorage.setItem(config.searchHistoryKey, JSON.stringify({
            totalSearches: searchCount,
            uniqueSearchTerms: Array.from(uniqueSearchTerms)
        }));
        updateSearchStats();
        
        if (uniqueSearchTerms.size > 0 && uniqueSearchTerms.size % 7 === 0) showPeriodicHint();
    }
    
    function showPeriodicHint() {
        const hints = [
            "姨姨的姓氏你搜了吗？不要只搜姓！", "有个鸟类听起来像晚上出现的...", 
            "五个字母的组织...", "血月那天发生了什么？", "那个符咒的名字..."
        ];
        const msg = hints[Math.floor(Math.random() * hints.length)];
        const hintContent = document.getElementById('hint-content');
        if (hintContent) {
            hintContent.textContent = msg;
            document.getElementById('hint-section').style.display = 'block';
            showXiaoqi();
        }
    }
    
    // 记录关键词逻辑：只要有一次是有效的，就标记为有效
    function recordKeyword(keyword, isValid, foundCount) {
        const keywordsData = getStoredKeywords();
        const currentValid = keywordsData[keyword]?.valid || false;
        
        // 如果这次有效，或者之前已经是有效的
        const finalValid = isValid || currentValid;
        // 如果这次找到了数量，用这次的；否则保留之前的；如果没有则为0
        const finalCount = isValid ? foundCount : (keywordsData[keyword]?.foundPosts || 0);

        keywordsData[keyword] = {
            valid: finalValid,
            count: (keywordsData[keyword]?.count || 0) + 1,
            lastFound: new Date().toISOString(),
            foundPosts: finalCount
        };
        
        localStorage.setItem(config.storageKey, JSON.stringify(keywordsData));
        updateBadge();
    }
    
    function getStoredKeywords() {
        try { return JSON.parse(localStorage.getItem(config.storageKey) || '{}'); } catch (e) { return {}; }
    }
    
    function updateKeywordsDisplay() {
        const list = document.getElementById('keywords-list');
        if (!list) return;
        
        const data = getStoredKeywords();
        const keywords = Object.entries(data).sort((a, b) => new Date(b[1].lastFound) - new Date(a[1].lastFound));
        
        if (keywords.length === 0) {
            list.innerHTML = '<div class="empty-keywords">暂无搜索记录</div>';
            return;
        }
        
        list.innerHTML = keywords.map(([k, v]) => `
            <div class="keyword-item ${v.valid ? 'valid' : 'invalid'}">
                <span>${escapeHtml(k)}${v.valid ? ` (${v.foundPosts}贴)` : ''}</span>
                <span style="opacity:0.7">${v.count}次</span>
            </div>
        `).join('');
    }
    
    function updateStats() {
        const data = getStoredKeywords();
        // 统计有效关键词的数量作为发现数
        const validCount = Object.values(data).filter(k => k.valid).length;
        
        document.getElementById('found-count').textContent = validCount;
        updateBadge();
    }
    
    function updateSearchStats() {
        const el = document.getElementById('search-count');
        if (el) el.textContent = searchCount;
    }
    
    function updateBadge() {
        const data = getStoredKeywords();
        const count = Object.values(data).filter(k => k.valid).length;
        const badge = document.querySelector('.xiaoqi-badge');
        if (badge) {
            badge.style.display = count > 0 ? 'flex' : 'none';
            badge.textContent = count;
        }
    }
    
    function showMessage(msg, type) {
        const div = document.createElement('div');
        div.textContent = msg;
        div.style.cssText = `position:fixed;top:20px;right:20px;background:${type==='success'?'#2ecc71':'#34495e'};color:#fff;padding:10px 20px;border-radius:5px;z-index:10002;box-shadow:0 2px 10px rgba(0,0,0,0.3);animation:slideIn 0.3s;`;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function showXiaoqi() {
        const container = document.getElementById(config.containerId);
        if (container) container.style.display = 'block';
    }
    
    function bindEvents() {
        const orb = document.getElementById(config.orbId);
        const panel = document.getElementById(config.panelId);
        
        orb.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = panel.style.display === 'none' || panel.style.display === '';
            panel.style.display = isHidden ? 'block' : 'none';
            if (isHidden) { updateKeywordsDisplay(); updateStats(); }
        });
        
        document.getElementById('xiaoqi-close').addEventListener('click', (e) => {
            e.stopPropagation();
            panel.style.display = 'none';
        });
        
        document.getElementById('clear-keywords').addEventListener('click', () => {
            if(confirm('确定清空记录？')) {
                localStorage.setItem(config.storageKey, '{}');
                updateKeywordsDisplay(); updateStats();
            }
        });

        document.getElementById('copy-all-keywords').addEventListener('click', () => {
             const data = getStoredKeywords();
             const valid = Object.keys(data).filter(k => data[k].valid).join(', ');
             if(valid) {
                 navigator.clipboard.writeText(valid);
                 showMessage('已复制', 'success');
             } else {
                 showMessage('没有有效关键词', 'success');
             }
        });
    }

    init();
    window.xiaoqi = { show: showXiaoqi, version: '2.6.1' };
})();
