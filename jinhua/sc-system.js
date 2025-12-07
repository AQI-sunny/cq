// search-system.js - 加密搜索系统
// 放在 https://sylvie-seven-cq.top/jhjm/search-system.js

const SearchSystem = {
    config: null,
    configUrl: 'https://sylvie-seven-cq.top/jhjm/search-config.json',
    cacheKey: 'search_config_cache',
    cacheTime: 3600000, // 1小时缓存
    isInitialized: false,
    
    // 初始化搜索系统
    async init() {
        if (this.isInitialized) return;
        
        try {
            await this.loadConfig();
            this.isInitialized = true;
            console.log('搜索系统初始化完成');
        } catch (error) {
            console.error('搜索系统初始化失败:', error);
        }
    },
    
    // 加载配置文件
    async loadConfig() {
        // 检查缓存
        const cached = this.getCachedConfig();
        if (cached) {
            this.config = cached;
            return;
        }
        
        try {
            const response = await fetch(this.configUrl + '?t=' + Date.now());
            if (!response.ok) throw new Error('配置文件加载失败');
            
            this.config = await response.json();
            this.cacheConfig();
        } catch (error) {
            console.error('加载搜索配置失败:', error);
            this.config = {
                searchRules: [],
                generalSearch: {
                    defaultEngine: "https://www.google.com/search?q=",
                    fallbackUrl: "https://sylvie-seven-cq.top/jhjm/search"
                }
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
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('本地存储不可用:', e);
        }
    },
    
    // 获取缓存配置
    getCachedConfig() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            if (Date.now() - cacheData.timestamp > this.cacheTime) {
                localStorage.removeItem(this.cacheKey);
                return null;
            }
            return cacheData.config;
        } catch {
            return null;
        }
    },
    
    // MD5 + Base64 加密
    async encryptKeyword(keyword) {
        try {
            // 转换为UTF-8字节数组
            const encoder = new TextEncoder();
            const data = encoder.encode(keyword);
            
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
    
    // 执行搜索
    async performSearch(keyword, options = {}) {
        await this.init();
        
        const searchTerm = keyword.trim();
        if (!searchTerm) return false;
        
        // 加密关键词
        const encryptedKeyword = await this.encryptKeyword(searchTerm);
        if (!encryptedKeyword) {
            this.redirectToGeneralSearch(searchTerm);
            return false;
        }
        
        // 查找匹配规则
        for (const rule of this.config.searchRules) {
            if (rule.keywords && rule.keywords.includes(encryptedKeyword)) {
                console.log(`找到匹配: ${rule.description}`);
                
                // 检查是否在新窗口打开
                if (options.newWindow) {
                    window.open(rule.targetUrl, '_blank');
                } else {
                    window.location.href = rule.targetUrl;
                }
                return true;
            }
        }
        
        // 没有匹配，使用通用搜索
        this.redirectToGeneralSearch(searchTerm, options);
        return false;
    },
    
    // 通用搜索
    redirectToGeneralSearch(keyword, options = {}) {
        const searchUrl = `${this.config.generalSearch.defaultEngine}${encodeURIComponent(keyword)}`;
        
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
        for (const rule of this.config.searchRules) {
            if (rule.keywords && rule.keywords.includes(encryptedKeyword)) {
                suggestions.push({
                    title: `直达: ${rule.description}`,
                    url: rule.targetUrl,
                    type: 'direct'
                });
            }
        }
        
        // 添加通用建议
        if (suggestions.length === 0) {
            suggestions.push(
                { title: `${keyword} 相关信息`, type: 'general' },
                { title: `${keyword} 官方资料`, type: 'general' },
                { title: `${keyword} 最新动态`, type: 'general' }
            );
        }
        
        return suggestions.slice(0, 5); // 最多5个建议
    },
    
    // 快速搜索函数（用于子页面）
    quickSearch(inputElementId, options = {}) {
        const inputElement = document.getElementById(inputElementId);
        if (!inputElement) return;
        
        const keyword = inputElement.value.trim();
        if (keyword) {
            this.performSearch(keyword, options);
        }
    }
};

// 自动初始化
SearchSystem.init();

// 暴露到全局
window.SearchSystem = SearchSystem;