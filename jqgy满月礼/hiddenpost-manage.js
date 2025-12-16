/**
 * 坛子 - 隐藏帖子助手
 * 版本: 2.2.0
 * 功能：搜索"坛子"时出现，智能记录隐藏帖子关键词，显示搜索统计
 */

(function() {
    'use strict';
    
    // 配置
    const config = {
        triggerKeyword: '坛子',
        storageKey: 'tanzi_keywords_v2',
        searchHistoryKey: 'tanzi_search_history',
        searchInputId: 'search-input',
        searchBtnId: 'search-btn',
        containerId: 'tanzi-container',
        orbId: 'tanzi-orb',
        panelId: 'tanzi-panel'
    };
    
    // 存储原始函数引用
    let originalPerformSearch = null;
    let searchCount = 0;
    
    // 初始化
    function init() {
        
        
        // 加载搜索次数
        try {
            const history = localStorage.getItem(config.searchHistoryKey);
            searchCount = history ? JSON.parse(history).totalSearches || 0 : 0;
        } catch (e) {
            searchCount = 0;
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupFunctionality);
        } else {
            setupFunctionality();
        }
    }
    
    function setupFunctionality() {
        // 创建坛子UI
        createTanziUI();
        
        // 拦截搜索函数
        interceptSearchFunction();
        
        // 绑定事件
        bindEvents();
        
        // 更新显示状态
        updateDisplay();
        
        
    }
    
    // 创建坛子UI
    function createTanziUI() {
        if (!document.getElementById(config.containerId)) {
            const tanziHTML = `
                <div class="tanzi-container" id="${config.containerId}">
                    <div class="tanzi-orb" id="${config.orbId}">
                        <div class="tanzi-eyes">
                            <div class="tanzi-eye left-eye"></div>
                            <div class="tanzi-eye right-eye"></div>
                        </div>
                        <div class="tanzi-mouth"></div>
                        <div class="tanzi-badge">0</div>
                    </div>
                    <div class="tanzi-panel" id="${config.panelId}">
                        <div class="panel-header">
                            <div class="panel-title">坛子 - 你的过期帖子助手</div>
                            <button class="panel-close" id="tanzi-close">×</button>
                        </div>
                        <div class="search-stats-section">
                            <div class="stat-item">
                                <span class="stat-label">已搜索:</span>
                                <span class="stat-value" id="search-count">0</span>
                                <span class="stat-label">次</span>
                            </div>
                        </div>
                        <div class="keywords-section">
                            <div class="section-title">
                                <span>📝 关键词分类</span>
                                <span class="section-hint">(绿色=有效, 红色=无效)</span>
                            </div>
                            <div class="keywords-list" id="keywords-list">
                                <div class="empty-keywords">暂无关键词记录</div>
                            </div>
                        </div>
                        <div class="stats-section">
                            <div class="stat-item">
                                <span class="stat-label">发现隐藏帖子:</span>
                                <span class="stat-value" id="found-count">0</span>
                                <span class="stat-label">/</span>
                                <span class="stat-value" id="total-count">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">未发现帖子:</span>
                                <span class="stat-value highlight" id="remaining-count">0</span>
                            </div>
                        </div>
                        <div class="panel-actions">
                            <button class="panel-btn primary" id="clear-keywords">清空记录</button>
                            <button class="panel-btn secondary" id="copy-all-keywords">复制有效词</button>
                            <button class="panel-btn secondary" id="clear-badge">清除角标</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', tanziHTML);
            
            // 添加必要的样式
            addEssentialStyles();
        }
    }
    
    // 添加必要的样式
    function addEssentialStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 移动端适配 */
            @media (max-width: 768px) {
                .tanzi-container {
                    bottom: 10px !important;
                    right: 10px !important;
                }
                
                .tanzi-orb {
                    width: 50px !important;
                    height: 50px !important;
                }
                
                .tanzi-panel {
                    width: 90vw !important;
                    max-width: 400px !important;
                    right: 5vw !important;
                    left: 5vw !important;
                    bottom: 65px !important;
                }
                
                .panel-title {
                    font-size: 16px !important;
                }
                
                .keyword-item {
                    font-size: 14px !important;
                    padding: 8px 12px !important;
                }
                
                .stat-item {
                    font-size: 14px !important;
                }
                
                .panel-btn {
                    font-size: 14px !important;
                    padding: 10px !important;
                }
            }
            
            /* 通用字体优化 */
            .tanzi-panel {
                font-size: 14px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;
            }
            
            .panel-title {
                font-size: 16px;
                font-weight: 600;
            }
            
            .keyword-item {
                font-size: 14px;
            }
            
            .stat-item {
                font-size: 14px;
            }
            
            /* 关键词样式 */
            .keyword-item.valid {
                background: #e8f5e8 !important;
                color: #2e7d32 !important;
                border-left: 3px solid #4caf50 !important;
            }
            
            .keyword-item.invalid {
                background: #ffebee !important;
                color: #c62828 !important;
                border-left: 3px solid #f44336 !important;
            }
            
            .keyword-count {
                font-size: 11px;
                background: rgba(0,0,0,0.1);
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 20px;
                text-align: center;
                display: inline-block;
            }
            
            /* 角标样式 */
            .tanzi-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff4757;
                color: white;
                border-radius: 10px;
                padding: 2px 6px;
                font-size: 12px;
                font-weight: bold;
                min-width: 18px;
                text-align: center;
                z-index: 10003;
            }
            
            /* 按钮自适应 */
            .panel-btn {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                min-width: 0;
                flex: 1;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 拦截搜索函数
    function interceptSearchFunction() {
        // 拦截搜索函数
        if (typeof window.performSearch === 'function') {
            originalPerformSearch = window.performSearch;
            window.performSearch = function() {
                const query = document.getElementById(config.searchInputId).value.trim();
                
                // 检查是否触发坛子
                if (query === config.triggerKeyword) {
                    showTanzi();
                    return; // 不执行实际搜索
                }
                
                // 记录搜索次数
                recordSearch();
                
                // 执行原始搜索并检查隐藏帖子
                const result = originalPerformSearch.apply(this, arguments);
                
                // 检查搜索结果中是否有隐藏帖子
                setTimeout(() => {
                    checkForHiddenPosts(query);
                }, 300);
                
                return result;
            };
        } else {
            // 如果没有原始搜索函数，创建我们的搜索函数
            window.performSearch = function() {
                const query = document.getElementById(config.searchInputId).value.trim();
                
                // 检查是否触发坛子
                if (query === config.triggerKeyword) {
                    showTanzi();
                    return;
                }
                
                // 记录搜索次数
                recordSearch();
                
                // 模拟搜索逻辑
                
                
                // 检查搜索结果中是否有隐藏帖子
                setTimeout(() => {
                    checkForHiddenPosts(query);
                }, 300);
            };
            
            // 绑定搜索按钮事件
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
    
    // 记录搜索次数
    function recordSearch() {
        searchCount++;
        try {
            const history = {
                totalSearches: searchCount,
                lastSearch: new Date().toISOString()
            };
            localStorage.setItem(config.searchHistoryKey, JSON.stringify(history));
            updateSearchStats();
        } catch (e) {
            console.error('记录搜索次数失败:', e);
        }
    }
    
    // 绑定事件
    function bindEvents() {
        const orb = document.getElementById(config.orbId);
        const panel = document.getElementById(config.panelId);
        const panelClose = document.getElementById('tanzi-close');
        const clearBtn = document.getElementById('clear-keywords');
        const copyAllBtn = document.getElementById('copy-all-keywords');
        const clearBadgeBtn = document.getElementById('clear-badge');
        
        // 坛子球点击事件
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
        
        // 关闭按钮事件
        if (panelClose) {
            panelClose.addEventListener('click', function(e) {
                e.stopPropagation();
                panel.style.display = 'none';
                orb.classList.remove('active');
            });
        }
        
        // 清空关键词事件
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
        
        // 复制所有有效关键词事件
        if (copyAllBtn) {
            copyAllBtn.addEventListener('click', function() {
                const keywordsData = getStoredKeywords();
                const validKeywords = Object.keys(keywordsData).filter(k => keywordsData[k].valid);
                
                if (validKeywords.length > 0) {
                    const text = validKeywords.join(', ');
                    navigator.clipboard.writeText(text).then(() => {
                        showMessage(`已复制 ${validKeywords.length} 个有效关键词`, 'success');
                    }).catch(() => {
                        // 降级方案
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
        
        // 清除角标事件
        if (clearBadgeBtn) {
            clearBadgeBtn.addEventListener('click', function() {
                updateBadge(0);
                showMessage('角标已清除', 'success');
            });
        }
        
        // 点击面板外部关闭面板
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

        // 移动端触摸事件支持
        if ('ontouchstart' in window) {
            // 防止移动端双击缩放
            let lastTouchEnd = 0;
            document.addEventListener('touchend', function (event) {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                }
                lastTouchEnd = now;
            }, false);

            // 改善移动端触摸体验
            if (orb) {
                orb.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                }, { passive: false });
            }
        }
    }
    
    // 显示坛子
    function showTanzi() {
        const container = document.getElementById(config.containerId);
        if (container) {
            container.style.display = 'block';
            showMessage('坛子出现啦！我会帮你智能记录过期帖子的关键词~', 'success');
            
            // 自动展开面板
            const panel = document.getElementById(config.panelId);
            const orb = document.getElementById(config.orbId);
            panel.style.display = 'block';
            orb.classList.add('active');
            
            updateKeywordsDisplay();
            updateStats();
            updateSearchStats();
        }
    }
    
    // 检查搜索结果中的隐藏帖子
    function checkForHiddenPosts(query) {
        if (!query || query === config.triggerKeyword) return;
        
        // 检查页面中是否有隐藏帖子
        const foundHiddenPosts = findHiddenPostsInResults(query);
        const hasFoundPosts = foundHiddenPosts.length > 0;
        
        // 记录关键词（无论是否找到都记录，但标记有效性）
        recordKeyword(query, hasFoundPosts, foundHiddenPosts.length);
        
        // 更新显示
        updateKeywordsDisplay();
        updateStats();
        updateSearchStats();
        
        // 显示发现提示
        if (hasFoundPosts) {
            showMessage(`🎉 发现 ${foundHiddenPosts.length} 个隐藏帖子！关键词 "${query}" 已记录`, 'success');
        } else {
            showMessage(`未发现隐藏帖子`, 'info');
        }
    }
    
    // 在搜索结果中查找隐藏帖子
    function findHiddenPostsInResults(query) {
        const foundPosts = [];
        
        if (!window.hiddenPosts || !Array.isArray(window.hiddenPosts)) {
            console.warn('hiddenPosts 数据未找到或格式不正确');
            return foundPosts;
        }
        
        const lowerQuery = query.toLowerCase();
        
        // 检查隐藏帖子数据
        window.hiddenPosts.forEach(post => {
            if (post.searchKeyword) {
                const keywords = post.searchKeyword.split(',').map(k => k.trim().toLowerCase());
                // 只有当搜索词完全匹配关键词时才认为找到
                if (keywords.some(keyword => keyword === lowerQuery)) {
                    foundPosts.push({
                        title: post.title,
                        author: post.author,
                        date: post.date,
                        keyword: query
                    });
                }
            }
        });
        
        return foundPosts;
    }
    
    // 记录关键词（带有效性标记）
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
            // 如果之前是无效但现在有效，更新状态
            if (!keywordsData[keyword].valid && isValid) {
                keywordsData[keyword].valid = true;
            }
        }
        
        localStorage.setItem(config.storageKey, JSON.stringify(keywordsData));
        
        // 更新徽章（只显示有效关键词数量）
        const validCount = Object.values(keywordsData).filter(k => k.valid).length;
        updateBadge(validCount);
    }
    
    // 获取存储的关键词
    function getStoredKeywords() {
        try {
            const stored = localStorage.getItem(config.storageKey);
            if (!stored) return {};
            
            const parsed = JSON.parse(stored);
            // 兼容旧版本的数据格式
            if (Array.isArray(parsed)) {
                const newData = {};
                parsed.forEach(keyword => {
                    newData[keyword] = {
                        valid: true, // 旧数据默认设为有效
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
    
    // 更新关键词显示
    function updateKeywordsDisplay() {
        const keywordsList = document.getElementById('keywords-list');
        const keywordsData = getStoredKeywords();
        const keywords = Object.entries(keywordsData);
        
        if (keywordsList) {
            if (keywords.length > 0) {
                // 按最后发现时间排序
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
    
    // 更新统计信息
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
    
    // 更新搜索统计
    function updateSearchStats() {
        const searchCountElement = document.getElementById('search-count');
        if (searchCountElement) {
            searchCountElement.textContent = searchCount;
        }
    }
    
    // 计算总隐藏帖子数量
    function calculateTotalHiddenPosts() {
        if (window.hiddenPosts && Array.isArray(window.hiddenPosts)) {
            return window.hiddenPosts.length;
        }
        return 35; // 默认值，根据你的数据调整
    }
    
    // 更新徽章
    function updateBadge(count) {
        const orb = document.getElementById(config.orbId);
        let badge = orb.querySelector('.tanzi-badge');
        
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'tanzi-badge';
            orb.appendChild(badge);
        }
        
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count.toString();
            badge.style.display = 'block';
            
            // 确保角标数字完全显示
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
    
    // 显示消息
    function showMessage(message, type = 'info') {
        // 移除现有消息
        const existingMsg = document.getElementById('tanzi-message');
        if (existingMsg) existingMsg.remove();
        
        const backgroundColor = type === 'success' ? '#4caf50' : type === 'warning' ? '#ff9800' : '#2196f3';
        
        const msgDiv = document.createElement('div');
        msgDiv.id = 'tanzi-message';
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease;
            max-width: 80vw;
            word-break: break-word;
        `;
        
        // 移动端适配
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
    
    // 更新显示状态
    function updateDisplay() {
        const keywordsData = getStoredKeywords();
        const validCount = Object.values(keywordsData).filter(k => k.valid).length;
        updateBadge(validCount);
        updateSearchStats();
    }
    
    // 初始化
    init();
    
    // 暴露到全局，方便调试和使用
    window.tanzi = {
        show: showTanzi,
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
        getStats: function() {
            const keywordsData = getStoredKeywords();
            return {
                totalSearches: searchCount,
                validKeywords: Object.values(keywordsData).filter(k => k.valid).length,
                invalidKeywords: Object.values(keywordsData).filter(k => !k.valid).length,
                totalHiddenPosts: calculateTotalHiddenPosts()
            };
        },
        version: '2.2.0'
    };
    
})();