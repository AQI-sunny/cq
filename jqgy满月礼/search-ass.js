// 搜索助手类 - 基于页面发现的悬浮球版本（蓝白简约版）
class SearchAssistant {
    constructor() {
        this.foundPages = new Set(); // 存储已发现的页面URL
        this.allPages = new Map();   // 存储所有可发现的页面 {url: {keywords, title}}
        this.isExpanded = false;
        
        // 从外部关键词文件加载所有页面
        this.loadAllPages();
        this.init();
    }

    // 从外部关键词文件加载所有可发现的页面
    loadAllPages() {
        // 从 keywordRedirects 提取页面
        if (typeof keywordRedirects !== 'undefined') {
            Object.entries(keywordRedirects).forEach(([keyword, url]) => {
                if (url && typeof url === 'string') {
                    const normalizedUrl = this.normalizeUrl(url);
                    if (!this.allPages.has(normalizedUrl)) {
                        this.allPages.set(normalizedUrl, {
                            keywords: new Set([keyword]),
                            title: this.getTitleFromUrl(url)
                        });
                    } else {
                        this.allPages.get(normalizedUrl).keywords.add(keyword);
                    }
                }
            });
        }

        // 从 searchResultsData 提取页面
        if (typeof searchResultsData !== 'undefined') {
            searchResultsData.forEach(result => {
                if (result.url && typeof result.url === 'string') {
                    const normalizedUrl = this.normalizeUrl(result.url);
                    if (!this.allPages.has(normalizedUrl)) {
                        this.allPages.set(normalizedUrl, {
                            keywords: new Set(),
                            title: result.title || this.getTitleFromUrl(result.url)
                        });
                    }
                    
                    const pageInfo = this.allPages.get(normalizedUrl);
                    if (result.keywords && Array.isArray(result.keywords)) {
                        result.keywords.forEach(keyword => {
                            pageInfo.keywords.add(keyword);
                        });
                    }
                }
            });
        }

        console.log(`加载了 ${this.allPages.size} 个可发现页面`);
        console.log('可发现页面:', Array.from(this.allPages.entries()));
    }

    // 标准化URL，去除协议和www差异
    normalizeUrl(url) {
        return url.replace(/^https?:\/\/(www\.)?/, '').split('?')[0].split('#')[0];
    }

    // 从URL提取标题
    getTitleFromUrl(url) {
        const normalized = this.normalizeUrl(url);
        const domainMatch = normalized.match(/\/([^\/]+)\.html?$/);
        if (domainMatch) {
            return domainMatch[1].replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        return normalized.split('/').pop() || '未知页面';
    }

    init() {
        this.createBubble();
        this.bindEvents();
        this.loadProgress();
        this.updateBubbleDisplay();
        
        // 监听主搜索功能
        this.setupSearchListener();
    }

    createBubble() {
        const bubbleHTML = `
            <div class="search-assistant-bubble" id="searchAssistantBubble">
                <div class="bubble-icon">🔍</div>
                <div class="search-assistant-panel">
                    <div class="assistant-header">
                        <h3>search助手</h3>
                        <div class="subtitle">你好，我是小C~不要惊讶我的出现~帮助你是主人吩咐给我的任务~！</div>
                    </div>
                    <div class="progress-section">
                        <div class="progress-info">
                            <span>发现进度</span>
                            <span id="progressText">0/0</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" id="progressFill"></div>
                        </div>
                        <div class="progress-stats" id="progressStats">
                            开始寻找隐藏页面吧！
                        </div>
                    </div>
                    <div class="found-pages">
                        <h4>已发现的页面</h4>
                        <div class="page-list" id="pageList">
                            <div class="empty-pages">暂无发现的页面<br><small>通过搜索关键词来发现隐藏页面</small></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', bubbleHTML);
    }

    bindEvents() {
        const bubble = document.getElementById('searchAssistantBubble');
        
        bubble.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleExpand();
        });

        // 点击页面其他区域收起
        document.addEventListener('click', (e) => {
            if (this.isExpanded && !bubble.contains(e.target)) {
                this.collapse();
            }
        });
    }

    toggleExpand() {
        this.isExpanded = !this.isExpanded;
        const bubble = document.getElementById('searchAssistantBubble');
        
        if (this.isExpanded) {
            bubble.classList.add('expanded');
            this.updatePanelDisplay();
        } else {
            bubble.classList.remove('expanded');
        }
    }

    collapse() {
        this.isExpanded = false;
        const bubble = document.getElementById('searchAssistantBubble');
        bubble.classList.remove('expanded');
    }

    setupSearchListener() {
        // 监听主搜索功能的关键词发现
        const originalPerformSearch = window.performSearch;
        
        window.performSearch = (event) => {
            if (event) event.preventDefault();
            
            const searchInput = document.getElementById('search-input');
            const query = (searchInput.value || '').trim();
            
            // 检查搜索是否触发了页面跳转
            this.checkForPageDiscovery(query);
            
            // 调用原始搜索函数
            if (originalPerformSearch) {
                return originalPerformSearch(event);
            }
        };

        // 监听页面跳转（通过关键词匹配）
        this.setupPageRedirectListener();
    }

    setupPageRedirectListener() {
        // 监听确认跳转对话框
        const originalConfirm = window.confirm;
        window.confirm = (message) => {
            if (message && message.includes('是否跳转到对应页面')) {
                // 从消息中提取关键词
                const keywordMatch = message.match(/找到关键词\s*"([^"]+)"/);
                if (keywordMatch) {
                    const keyword = keywordMatch[1];
                    this.markPageAsFoundByKeyword(keyword);
                }
            }
            return originalConfirm(message);
        };
    }

    // 通过关键词标记页面为已发现
    markPageAsFoundByKeyword(keyword) {
        let foundNewPage = false;
        
        for (const [url, pageInfo] of this.allPages) {
            if (Array.from(pageInfo.keywords).some(k => 
                k.toLowerCase() === keyword.toLowerCase() || 
                keyword.toLowerCase().includes(k.toLowerCase())
            )) {
                if (!this.foundPages.has(url)) {
                    this.markPageFound(url);
                    foundNewPage = true;
                }
            }
        }
        return foundNewPage;
    }

    // 检查搜索是否发现了新页面
    checkForPageDiscovery(query) {
        // 直接通过关键词匹配
        this.markPageAsFoundByKeyword(query);
    }

    markPageFound(pageUrl) {
        if (this.allPages.has(pageUrl) && !this.foundPages.has(pageUrl)) {
            this.foundPages.add(pageUrl);
            this.saveProgress();
            this.updateBubbleDisplay();
            this.showFoundAnimation(pageUrl);
            
            // 如果面板是展开的，也更新面板显示
            if (this.isExpanded) {
                this.updatePanelDisplay();
            }
            
            console.log(`发现新页面: ${pageUrl}`);
            return true;
        }
        return false;
    }

    showFoundAnimation(pageUrl) {
        const pageInfo = this.allPages.get(pageUrl);
        const keywords = Array.from(pageInfo.keywords).slice(0, 2).join('、');
        
        // 创建浮动提示
        const notification = document.createElement('div');
        notification.textContent = `🎉 发现隐藏页面！`;
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            background: #1976D2;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10001;
            box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
            animation: floatUp 2s ease-in-out;
            border-left: 4px solid #42A5F5;
        `;
        
        document.body.appendChild(notification);
        
        // 3秒后移除
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    updateBubbleDisplay() {
        const bubble = document.getElementById('searchAssistantBubble');
        const foundCount = this.foundPages.size;
        const totalCount = this.allPages.size;
        
        // 更新气泡中的数字
        if (totalCount > 0) {
            bubble.querySelector('.bubble-icon').textContent = foundCount;
        }
    }

    updatePanelDisplay() {
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        const progressStats = document.getElementById('progressStats');
        const pageList = document.getElementById('pageList');
        
        const foundCount = this.foundPages.size;
        const totalCount = this.allPages.size;
        const progress = totalCount > 0 ? (foundCount / totalCount) * 100 : 0;
        const remaining = totalCount - foundCount;
        
        // 更新进度文本和进度条
        progressText.textContent = `${foundCount}/${totalCount}`;
        progressFill.style.width = `${progress}%`;
        
        // 更新统计信息
        if (totalCount === 0) {
            progressStats.textContent = '未检测到可发现页面';
        } else if (remaining > 0) {
            progressStats.textContent = `还有 ${remaining} 个隐藏页面待发现`;
        } else {
            progressStats.textContent = '🎊 恭喜！所有隐藏页面都已发现！';
        }
        
        // 更新已发现的页面列表 - 显示关键词而不是标题
        if (foundCount > 0) {
            pageList.innerHTML = '';
            Array.from(this.foundPages).forEach(pageUrl => {
                const pageInfo = this.allPages.get(pageUrl);
                const keywords = Array.from(pageInfo.keywords);
                
                const pageItem = document.createElement('div');
                pageItem.className = 'page-item';
                
                // 显示相关关键词
                const keywordsHTML = keywords.map(keyword => 
                    `<div class="keyword-tag">${keyword}</div>`
                ).join('');
                
                pageItem.innerHTML = `
                    <div class="page-keywords">
                        ${keywordsHTML}
                    </div>
                    <div class="page-url">${pageUrl}</div>
                `;
                pageList.appendChild(pageItem);
            });
        } else {
            pageList.innerHTML = '<div class="empty-pages">暂无发现的页面<br><small>通过搜索关键词来发现隐藏页面</small></div>';
        }
    }

    saveProgress() {
        const progress = {
            foundPages: Array.from(this.foundPages),
            timestamp: new Date().getTime()
        };
        localStorage.setItem('searchAssistantPageProgress', JSON.stringify(progress));
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('searchAssistantPageProgress');
            if (saved) {
                const progress = JSON.parse(saved);
                if (progress.foundPages && Array.isArray(progress.foundPages)) {
                    progress.foundPages.forEach(pageUrl => {
                        if (this.allPages.has(pageUrl)) {
                            this.foundPages.add(pageUrl);
                        }
                    });
                    console.log(`加载了 ${this.foundPages.size} 个已发现的页面`);
                }
            }
        } catch (e) {
            console.log('无法加载页面发现进度');
        }
    }

    // 外部调用方法：手动标记页面为已发现
    markPageAsFound(pageUrl) {
        const normalizedUrl = this.normalizeUrl(pageUrl);
        return this.markPageFound(normalizedUrl);
    }

    // 获取当前进度信息
    getProgressInfo() {
        return {
            found: this.foundPages.size,
            total: this.allPages.size,
            progress: this.allPages.size > 0 ? (this.foundPages.size / this.allPages.size) * 100 : 0
        };
    }
}

// 添加浮动动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            opacity: 0;
            transform: translateY(20px);
        }
        20% {
            opacity: 1;
            transform: translateY(0);
        }
        80% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// 初始化搜索助手
let searchAssistant;

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        searchAssistant = new SearchAssistant();
    });
} else {
    searchAssistant = new SearchAssistant();
}