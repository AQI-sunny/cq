// 搜索系统核心引擎
class SearchEngine {
    constructor() {
        this.keywordsData = null;
        this.decodedKeywordsCache = new Map();
        this.init();
    }

    // 初始化
    async init() {
        // 使用正确编码的Base64关键词
        // 这里是正确的Base64编码，使用UTF-8编码
        this.keywordsData = {
            "version": "1.0",
            "lastUpdated": "2024-01-01",
            "searchRules": [
                {
                    "id": "medical_record",
                    "keywords": ["5ZC05bCP5Lir"], // "吴小丫"的正确base64
                    "targetUrl": "https://sylvie-seven-cq.top/jhjm/丫丫病历.html",
                    "description": "医疗档案页面"
                },
                {
                    "id": "company_file",
                    "keywords": ["6ZSm5Y2O57q657uH5Y6C"], // "锦华纺织厂"
                    "targetUrl": "https://sylvie-seven-cq.top/jhjm/企业档案.html",
                    "description": "企业信息页面"
                },
                {
                    "id": "recruitment",
                    "keywords": ["5rGC5Lqk"], // "锦华招聘"
                    "targetUrl": "https://sylvie-seven-cq.top/jhjm/招工.html",
                    "description": "招聘页面"
                },
                {
                    "id": "population_flow",
                    "keywords": [
                        "5Li05rig", // "临渠"
                        "6JCN5bGx"  // "萍山"
                    ],
                    "targetUrl": "https://sylvie-seven-cq.top/jhjm/流动人口.html",
                    "description": "人口管理页面"
                },
                {
                    "id": "slot_machine",
                    "keywords": [
                        "57qi5pif5aix5LmQ5Z+O", // "红星娱乐城"
                        "57qi5pif5aix5LmQ" // "红星娱乐"
                    ],
                    "targetUrl": "https://sylvie-seven-cq.top/jhjm/老虎机.html",
                    "description": "娱乐设施页面"
                },
                {
                    "id": "asset_assessment",
                    "keywords": ["5Zub5Y+35LuT5bqT"], // "四号仓库"
                    "targetUrl": "https://sylvie-seven-cq.top/jhjm/资产评估.html",
                    "description": "资产评估页面"
                }
            ],
            "recentPages": []
        };

        await this.loadKeywords();
    }

    // 加载关键词数据库
    async loadKeywords() {
        try {
            
            
            // 预解码所有加密关键词
            this.preDecodeKeywords();
            
            // 调试：显示所有解码后的关键词
            
            this.keywordsData.searchRules.forEach(rule => {
                if (rule.decodedKeywords) {
                    rule.decodedKeywords.forEach(kw => {
                        
                    });
                }
            });
        } catch (error) {
            console.error('加载关键词数据库失败:', error);
        }
    }

    // Base64解码（支持UTF-8中文）
    base64Decode(str) {
        // 方法1：使用atob
        try {
            return decodeURIComponent(escape(atob(str)));
        } catch (e) {
            // 方法2：使用TextDecoder
            try {
                const binaryString = atob(str);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return new TextDecoder('utf-8').decode(bytes);
            } catch (e2) {
                console.error('Base64解码失败:', str, e2);
                return str;
            }
        }
    }

    // Base64编码（支持UTF-8中文）
    base64Encode(str) {
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch (error) {
            console.error('Base64编码失败:', str, error);
            return str;
        }
    }

    // 预解码所有加密关键词
    preDecodeKeywords() {
        if (!this.keywordsData || !this.keywordsData.searchRules) return;
        
        this.keywordsData.searchRules.forEach((rule) => {
            rule.decodedKeywords = [];
            
            rule.keywords.forEach(keyword => {
                const decoded = this.base64Decode(keyword);
                
                
                rule.decodedKeywords.push({
                    original: keyword,
                    decoded: decoded
                });
            });
        });
    }

    // 简体转繁体映射（简单的映射表）
    simplifiedToTraditionalMap = {
        '吴': '吳',
        '小': '小',
        '丫': '丫',
        '企': '企',
        '业': '業',
        '档': '檔',
        '案': '案',
        '招': '招',
        '工': '工',
        '流': '流',
        '动': '動',
        '人': '人',
        '口': '口',
        '管': '管',
        '理': '理',
        '老': '老',
        '虎': '虎',
        '机': '機',
        '娱': '娛',
        '乐': '樂',
        '设': '設',
        '施': '施',
        '资': '資',
        '产': '產',
        '评': '評',
        '估': '估'
    };

    // 繁体转简体
    traditionalToSimplifiedMap = Object.entries(this.simplifiedToTraditionalMap).reduce((acc, [sim, tra]) => {
        acc[tra] = sim;
        return acc;
    }, {});

    // 简体转繁体
    toTraditional(text) {
        return text.split('').map(char => 
            this.simplifiedToTraditionalMap[char] || char
        ).join('');
    }

    // 繁体转简体
    toSimplified(text) {
        return text.split('').map(char => 
            this.traditionalToSimplifiedMap[char] || char
        ).join('');
    }

    // 获取所有文字变体
    getTextVariants(text) {
        const variants = new Set();
        
        // 原始文本
        variants.add(text);
        
        // 简体转繁体
        const traditional = this.toTraditional(text);
        if (traditional !== text) {
            variants.add(traditional);
        }
        
        // 繁体转简体
        const simplified = this.toSimplified(text);
        if (simplified !== text) {
            variants.add(simplified);
        }
        
        return Array.from(variants);
    }

    // 搜索函数
    search(keyword) {
        if (!keyword || !this.keywordsData) {
            return { success: false, keyword: keyword };
        }

        const searchText = keyword.trim();
        
        
        // 获取搜索词的简繁体变体
        const searchVariants = this.getTextVariants(searchText);
        

        // 遍历所有规则
        for (const rule of this.keywordsData.searchRules) {
            if (!rule.decodedKeywords) continue;
            
            for (const kwInfo of rule.decodedKeywords) {
                const keywordVariants = this.getTextVariants(kwInfo.decoded);
                
                // 检查所有变体组合
                for (const searchVariant of searchVariants) {
                    for (const keywordVariant of keywordVariants) {
                        if (searchVariant === keywordVariant) {
                            
                            
                            
                            return {
                                success: true,
                                rule: rule,
                                matchType: 'exact',
                                keyword: searchText,
                                matchedKeyword: kwInfo.decoded
                            };
                        }
                    }
                }
            }
        }

        
        return { success: false, keyword: searchText };
    }

    // 获取所有关键词
    getAllKeywords() {
        if (!this.keywordsData) return [];
        
        const keywords = [];
        this.keywordsData.searchRules.forEach(rule => {
            if (rule.decodedKeywords) {
                rule.decodedKeywords.forEach(kw => {
                    keywords.push({
                        keyword: kw.decoded,
                        description: rule.description,
                        targetUrl: rule.targetUrl
                    });
                });
            }
        });
        
        return keywords;
    }
}

// 创建搜索引擎实例
const searchEngine = new SearchEngine();

function showAlert(message, duration = 2000) {
    // 移除旧提醒
    const oldAlert = document.getElementById('customAlert');
    if (oldAlert) oldAlert.remove();
    
    // 创建新提醒
    const alertDiv = document.createElement('div');
    alertDiv.id = 'customAlert';
    alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #E3F2FD 0%, #FFFFFF 100%);
        color: #1565C0;
        padding: 24px 48px;
        border-radius: 12px;
        z-index: 9999;
        font-size: 16px;
        font-weight: 600;
        box-shadow: 0 8px 30px rgba(33, 150, 243, 0.2);
        animation: alertFadeIn 0.3s ease;
        min-width: 240px;
        text-align: center;
        border-left: 5px solid #2196F3;
        backdrop-filter: blur(10px);
    `;
    
    // 添加样式
    if (!document.querySelector('#alertStyles')) {
        const style = document.createElement('style');
        style.id = 'alertStyles';
        style.textContent = `
            @keyframes alertFadeIn {
                from { opacity: 0; transform: translate(-50%, -60%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
            @keyframes alertFadeOut {
                from { opacity: 1; transform: translate(-50%, -50%); }
                to { opacity: 0; transform: translate(-50%, -60%); }
            }
        `;
        document.head.appendChild(style);
    }
    
    alertDiv.textContent = message;
    document.body.appendChild(alertDiv);
    
    // 自动移除
    setTimeout(() => {
        alertDiv.style.animation = 'alertFadeOut 0.3s ease';
        setTimeout(() => {
            if (alertDiv.parentNode) alertDiv.remove();
        }, 300);
    }, duration);
}
    
// 搜索函数
async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput.value.trim();
    
    if (!keyword) {
        showAlert('请输入搜索关键词', 2000);
        return;
    }

    // 确保搜索引擎初始化
    if (!searchEngine.keywordsData) {
        await searchEngine.init();
    }

    const result = searchEngine.search(keyword);
    
    if (result.success) {
        const rule = result.rule;
        
        
        // 显示提醒
        showAlert(`找到"${keyword}"相关页面，即将跳转...`, 1500);
        
        // 延迟跳转
        setTimeout(() => {
            window.location.href = rule.targetUrl;
        }, 1500);
    } else {
        showAlert(`未找到与"${keyword}"相关的页面`, 2000);
        // 这里删除了错误的 .map(k => k.keyword) 调用
    }
}

// 在现有代码的基础上，可以添加以下改进：

// 1. 添加按键状态反馈
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (searchInput && searchButton) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                // 添加一个视觉反馈
                searchButton.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    searchButton.style.transform = 'scale(1)';
                }, 150);
            }
        });
    }
});

// 2. 防止表单默认提交行为（如果输入框在form内）
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // 防止页面刷新
                performSearch();
            }
        });
    }
});

// 3. 添加搜索历史（可选）
let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

function addToSearchHistory(keyword) {
    if (!keyword) return;
    
    // 去重
    searchHistory = searchHistory.filter(item => item !== keyword);
    
    // 添加到开头
    searchHistory.unshift(keyword);
    
    // 限制历史记录数量
    if (searchHistory.length > 10) {
        searchHistory = searchHistory.slice(0, 10);
    }
    
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

// 在performSearch函数中添加历史记录
async function performSearchWithHistory() {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput.value.trim();
    
    if (!keyword) {
        showAlert('请输入搜索关键词', 2000);
        return;
    }

    // 添加到历史记录
    addToSearchHistory(keyword);
    
    // 调用原有的搜索逻辑
    if (!searchEngine.keywordsData) {
        await searchEngine.init();
    }

    const result = searchEngine.search(keyword);
    
    if (result.success) {
        const rule = result.rule;
        showAlert(`找到"${keyword}"相关页面，即将跳转...`, 1500);
        setTimeout(() => {
            window.location.href = rule.targetUrl;
        }, 1500);
    } else {
        showAlert(`未找到与"${keyword}"相关的页面`, 2000);
    }
}

// 4. 回车键的辅助提示（可选）
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    // 添加提示文本
    if (searchInput && !searchInput.placeholder) {
        searchInput.placeholder = "输入关键词，按回车搜索...";
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    
    
    // 初始化搜索引擎
    searchEngine.init();
    
    // 设置搜索事件
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (searchInput) {
        // Enter键搜索
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    
    // 测试搜索
    setTimeout(() => {
        
        const testKeywords = ['吴小丫', '老虎机', '招工', '企业档案', '流动人口'];
        
        testKeywords.forEach(keyword => {
            const result = searchEngine.search(keyword);
            
        });
    }, 1000);
});

// 快速测试函数
window.testSearch = function(keyword) {
    if (!keyword) keyword = prompt('输入测试关键词:');
    if (keyword) {
        const result = searchEngine.search(keyword);
        
        
        if (result.success) {
            showAlert(`测试成功！匹配到: ${result.rule.description}`, 3000);
        } else {
            showAlert(`测试失败！未找到匹配`, 3000);
        }
    }
};

// 显示所有关键词
window.showAllKeywords = function() {
    const keywords = searchEngine.getAllKeywords();
    
    alert(`共有 ${keywords.length} 个关键词:\n\n` + 
          keywords.map(k => `${k.keyword} -> ${k.description}`).join('\n'));
};

// 编码测试工具
window.encodeKeyword = function(text) {
    if (!text) text = prompt('输入要编码的关键词:');
    if (text) {
        const encoded = searchEngine.base64Encode(text);
        
        alert(`编码结果:\n\n${encoded}`);
        return encoded;
    }
};