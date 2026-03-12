// sc-system.js - 万事知加密搜索系统
// 参考你的代码逻辑实现

const SearchSystem = {
    // 配置信息
    config: null,
    configUrl: 'https://sylvie-seven-cq.top/jhjm/sc-data.json',
    
    // 存储键名
    STORAGE_KEYS: {
        CONFIG_CACHE: 'search_config_cache',
        RECENT_SEARCHES: 'recent_searches',
        VISITED_PAGES: 'visited_pages'
    },
    
    // 初始化状态
    isInitialized: false,
    
    // 初始化系统
    async init() {
        if (this.isInitialized) return;
        
        try {
            await this.loadConfig();
            this.isInitialized = true;
            console.log('万事知搜索系统初始化完成');
        } catch (error) {
            console.error('搜索系统初始化失败:', error);
        }
    },
    
    // 加载配置文件（带缓存）
    async loadConfig() {
        // 检查本地缓存
        const cached = this.getCachedConfig();
        if (cached) {
            this.config = cached;
            return;
        }
        
        try {
            // 从服务器加载配置
            const response = await fetch(this.configUrl + '?t=' + Date.now());
            if (!response.ok) {
                throw new Error(`配置文件加载失败: ${response.status}`);
            }
            
            this.config = await response.json();
            this.cacheConfig();
        } catch (error) {
            console.error('加载搜索配置失败:', error);
            // 使用默认配置
            this.config = {
                searchRules: [],
                generalSearch: {
                    defaultEngine: "https://sylvie-seven-cq.top/jhjm/search?q=",
                    fallbackUrl: "https://sylvie-seven-cq.top/jhjm/search"
                },
                recentPages: []
            };
        }
    },
    
    // 缓存配置
    cacheConfig() {
        const cacheData = {
            config: this.config,
            timestamp: Date.now()
        };
        try {
            localStorage.setItem(this.STORAGE_KEYS.CONFIG_CACHE, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('本地存储不可用:', e);
        }
    },
    
    // 获取缓存配置
    getCachedConfig() {
        try {
            const cached = localStorage.getItem(this.STORAGE_KEYS.CONFIG_CACHE);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            // 检查缓存是否过期（1小时）
            if (Date.now() - cacheData.timestamp > 3600000) {
                localStorage.removeItem(this.STORAGE_KEYS.CONFIG_CACHE);
                return null;
            }
            return cacheData.config;
        } catch {
            return null;
        }
    },
    
    // MD5 + Base64 加密函数
    async encryptKeyword(keyword) {
        try {
            // 转换为UTF-8字节数组
            const encoder = new TextEncoder();
            const data = encoder.encode(keyword.trim());
            
            // 计算MD5哈希
            const hashBuffer = await crypto.subtle.digest('MD5', data);
            
            // 转换为Base64
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashBase64 = btoa(String.fromCharCode(...hashArray));
            
            return hashBase64;
        } catch (error) {
            console.error('加密失败:', error);
            return null;
        }
    },
    
    // 记录搜索历史
    recordSearch(keyword) {
        try {
            let searches = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.RECENT_SEARCHES) || '[]');
            
            // 移除重复项
            searches = searches.filter(item => item !== keyword);
            
            // 添加到开头
            searches.unshift(keyword);
            
            // 限制数量（最多10条）
            searches = searches.slice(0, 10);
            
            localStorage.setItem(this.STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(searches));
        } catch (e) {
            console.warn('无法保存搜索历史:', e);
        }
    },
    
    // 获取搜索历史
    getSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.RECENT_SEARCHES) || '[]');
        } catch {
            return [];
        }
    },
    
    // 记录访问页面（参考你的visitedLinks逻辑）
    recordPageVisit(url, title) {
        try {
            let visitedPages = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.VISITED_PAGES) || '[]');
            
            // 检查是否已存在
            const existingIndex = visitedPages.findIndex(page => page.url === url);
            
            if (existingIndex > -1) {
                // 如果存在，移动到最前面并更新访问时间
                visitedPages.splice(existingIndex, 1);
            }
            
            // 添加新的访问记录
            visitedPages.unshift({
                url: url,
                title: title || '无标题',
                timestamp: Date.now()
            });
            
            // 限制数量（最多20条）
            visitedPages = visitedPages.slice(0, 20);
            
            localStorage.setItem(this.STORAGE_KEYS.VISITED_PAGES, JSON.stringify(visitedPages));
        } catch (e) {
            console.warn('无法保存访问记录:', e);
        }
    },
    
    // 获取访问记录
    getVisitedPages() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.VISITED_PAGES) || '[]');
        } catch {
            return [];
        }
    },
    
    // 主搜索函数
    async performSearch(keyword, options = {}) {
        await this.init();
        
        const searchTerm = keyword.trim();
        if (!searchTerm) return false;
        
        // 记录搜索历史
        this.recordSearch(searchTerm);
        
        // 加密关键词
        const encryptedKeyword = await this.encryptKeyword(searchTerm);
        if (!encryptedKeyword) {
            this.redirectToGeneralSearch(searchTerm, options);
            return false;
        }
        
        console.log('搜索关键词:', searchTerm);
        console.log('加密后:', encryptedKeyword);
        
        // 查找匹配规则
        for (const rule of this.config.searchRules) {
            if (rule.keywords && rule.keywords.includes(encryptedKeyword)) {
                console.log(`找到精确匹配: ${rule.description}`);
                console.log('跳转到:', rule.targetUrl);
                
                // 记录页面访问
                this.recordPageVisit(rule.targetUrl, rule.description);
                
                // 检查是否在新窗口打开
                if (options.newWindow) {
                    window.open(rule.targetUrl, '_blank');
                } else {
                    window.location.href = rule.targetUrl;
                }
                return true;
            }
        }
        
        console.log('未找到精确匹配，使用通用搜索');
        // 没有匹配，使用通用搜索
        this.redirectToGeneralSearch(searchTerm, options);
        return false;
    },
    
    // 通用搜索（跳转到搜索页面）
    redirectToGeneralSearch(keyword, options = {}) {
        const searchUrl = `${this.config.generalSearch.defaultEngine}${encodeURIComponent(keyword)}`;
        
        console.log('通用搜索URL:', searchUrl);
        
        // 记录页面访问
        this.recordPageVisit(searchUrl, `搜索: ${keyword}`);
        
        if (options.newWindow) {
            window.open(searchUrl, '_blank');
        } else {
            window.location.href = searchUrl;
        }
    },
    
    // 获取搜索建议
    async getSearchSuggestions(keyword) {
        await this.init();
        const encryptedKeyword = await this.encryptKeyword(keyword);
        
        if (!encryptedKeyword) return [];
        
        const suggestions = [];
        
        // 检查精确匹配
        for (const rule of this.config.searchRules) {
            if (rule.keywords && rule.keywords.includes(encryptedKeyword)) {
                suggestions.push({
                    type: 'exact',
                    title: `🔍 ${rule.description}`,
                    description: '精确匹配',
                    url: rule.targetUrl,
                    action: 'direct'
                });
            }
        }
        
        // 添加通用建议
        if (suggestions.length === 0) {
            suggestions.push(
                {
                    type: 'suggestion',
                    title: `${keyword}`,
                    description: '搜索此关键词',
                    action: 'search'
                },
                {
                    type: 'suggestion',
                    title: `${keyword} 相关信息`,
                    description: '查找相关资料',
                    action: 'search'
                },
                {
                    type: 'suggestion',
                    title: `${keyword} 教程`,
                    description: '学习指导',
                    action: 'search'
                }
            );
        }
        
        // 添加搜索历史建议
        const history = this.getSearchHistory();
        history.forEach(historyItem => {
            if (historyItem.includes(keyword) && historyItem !== keyword) {
                suggestions.push({
                    type: 'history',
                    title: `📜 ${historyItem}`,
                    description: '搜索历史',
                    action: 'search'
                });
            }
        });
        
        return suggestions.slice(0, 8); // 最多8个建议
    },
    
    // 清除搜索历史
    clearSearchHistory() {
        try {
            localStorage.removeItem(this.STORAGE_KEYS.RECENT_SEARCHES);
            return true;
        } catch (e) {
            console.error('清除搜索历史失败:', e);
            return false;
        }
    },
    
    // 清除所有缓存
    clearAllCache() {
        try {
            localStorage.removeItem(this.STORAGE_KEYS.CONFIG_CACHE);
            localStorage.removeItem(this.STORAGE_KEYS.RECENT_SEARCHES);
            localStorage.removeItem(this.STORAGE_KEYS.VISITED_PAGES);
            return true;
        } catch (e) {
            console.error('清除缓存失败:', e);
            return false;
        }
    },
    
    // 快速搜索函数（用于子页面）
    quickSearch(inputElementId, options = {}) {
        const inputElement = document.getElementById(inputElementId);
        if (!inputElement) {
            console.error('输入框不存在:', inputElementId);
            return;
        }
        
        const keyword = inputElement.value.trim();
        if (keyword) {
            this.performSearch(keyword, options);
        } else {
            // 可以添加提示
            console.log('请输入搜索关键词');
        }
    },
    
    // 调试函数
    debug() {
        console.log('=== 搜索系统调试信息 ===');
        console.log('配置:', this.config);
        console.log('搜索历史:', this.getSearchHistory());
        console.log('访问记录:', this.getVisitedPages());
        console.log('是否已初始化:', this.isInitialized);
        console.log('=====================');
    }
};

// 自动初始化
SearchSystem.init();

// 暴露到全局
window.SearchSystem = SearchSystem;

// 页面加载时记录访问（参考你的visitedLinks逻辑）
document.addEventListener('DOMContentLoaded', function() {
    const currentUrl = window.location.href;
    const mainPageUrl = 'https://sylvie-seven-cq.top/jhjm/search';
    
    // 判断是否为搜索结果页
    const isSearchResultPage = currentUrl.includes('search?q=');
    
    // 如果不是主页面且不是搜索结果页，记录访问
    if (currentUrl !== mainPageUrl && !isSearchResultPage) {
        SearchSystem.recordPageVisit(currentUrl, document.title);
    }
});