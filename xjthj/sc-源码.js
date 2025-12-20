// search-ball-complete.js - 完整搜索框控制 + 搜索引擎

// ============================================
// 第一部分：搜索框UI控制（移动端兼容）
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('搜索框完整JS加载...');
    initCompleteSearchSystem();
});

function initCompleteSearchSystem() {
    // 确保搜索球元素存在
    ensureSearchElements();
    
    // 初始化UI交互
    setupSearchUI();
    
    // 初始化搜索引擎
    initSearchEngine();
    
    // 设置拖动功能
    setupDragFunction();
    
    console.log('搜索系统初始化完成');
}

// 确保搜索元素存在
function ensureSearchElements() {
    const searchBall = document.getElementById('searchBall');
    const searchContainer = document.querySelector('.floating-search-ball-container');
    
    if (!searchBall || !searchContainer) {
        console.warn('搜索框元素未找到，正在创建...');
        createSearchElements();
        return;
    }
    
    // 强制显示（修复移动端闪退问题）
    searchContainer.style.display = 'block';
    searchContainer.style.visibility = 'visible';
    searchContainer.style.opacity = '1';
    searchContainer.style.zIndex = '999999';
    
    // 加载保存的位置
    loadSavedPosition();
}

// 创建搜索元素（如果不存在）
function createSearchElements() {
    const container = document.createElement('div');
    container.className = 'floating-search-ball-container';
    container.id = 'searchContainer';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999999;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
    `;
    
    const ball = document.createElement('div');
    ball.className = 'floating-search-ball';
    ball.id = 'searchBall';
    ball.innerHTML = '🔍';
    ball.style.cssText = `
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: #b0d5fb;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
        border: 2px solid white;
        background-size: 50px 50px;
    `;
    
    const expanded = document.createElement('div');
    expanded.className = 'floating-search-expanded';
    expanded.id = 'searchExpanded';
    expanded.style.cssText = `
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        align-items: center;
        background: white;
        border-radius: 28px;
        box-shadow: 0 6px 20px rgba(0, 122, 255, 0.25);
        border: 2px solid #007aff;
        overflow: hidden;
        opacity: 0;
        transform: translateX(20px);
        transition: all 0.3s ease;
        pointer-events: none;
    `;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'floating-search-input';
    input.id = 'searchInput';
    input.placeholder = '输入关键词搜索...';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'floating-search-close';
    closeBtn.id = 'searchClose';
    closeBtn.innerHTML = '×';
    
    const submitBtn = document.createElement('button');
    submitBtn.className = 'floating-search-submit';
    submitBtn.id = 'searchSubmit';
    submitBtn.innerHTML = '搜';
    submitBtn.style.cssText = `
        width: 44px;
        height: 44px;
        border: none;
        background: #007aff;
        color: white;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        border-radius: 22px;
        margin-right: 6px;
        flex-shrink: 0;
    `;
    
    expanded.appendChild(input);
    expanded.appendChild(closeBtn);
    expanded.appendChild(submitBtn);
    container.appendChild(ball);
    container.appendChild(expanded);
    document.body.appendChild(container);
    
    console.log('搜索框元素创建完成');
}

// 设置搜索UI交互
function setupSearchUI() {
    const searchBall = document.getElementById('searchBall');
    const searchExpanded = document.getElementById('searchExpanded');
    const searchInput = document.getElementById('searchInput');
    const searchClose = document.getElementById('searchClose');
    const searchSubmit = document.getElementById('searchSubmit');
    
    if (!searchBall) return;
    
    // 点击搜索球
    searchBall.addEventListener('click', function(e) {
        e.stopPropagation();
        const isActive = this.classList.contains('active');
        
        if (isActive) {
            this.classList.remove('active');
            if (searchExpanded) searchExpanded.classList.remove('active');
        } else {
            this.classList.add('active');
            if (searchExpanded) searchExpanded.classList.add('active');
            this.classList.add('pulse');
            setTimeout(() => this.classList.remove('pulse'), 500);
            setTimeout(() => {
                if (searchInput) searchInput.focus();
            }, 300);
        }
    });
    
    // 关闭按钮
    if (searchClose) {
        searchClose.addEventListener('click', function(e) {
            e.stopPropagation();
            searchBall.classList.remove('active');
            searchExpanded.classList.remove('active');
            if (searchInput) searchInput.value = '';
        });
    }
    
    // 搜索按钮
    if (searchSubmit) {
        searchSubmit.addEventListener('click', function(e) {
            e.stopPropagation();
            const query = searchInput ? searchInput.value.trim() : '';
            if (query) {
                performCompleteSearch(query);
            }
        });
    }
    
    // Enter键搜索
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    performCompleteSearch(query);
                }
            }
        });
    }
    
    // 点击其他地方关闭
    document.addEventListener('click', function(e) {
        if (!searchBall || !searchExpanded) return;
        
        const isClickInside = searchBall.contains(e.target) || 
                              searchExpanded.contains(e.target);
        
        if (!isClickInside && searchExpanded.classList.contains('active')) {
            searchBall.classList.remove('active');
            searchExpanded.classList.remove('active');
        }
    });
}

// 设置拖动功能
function setupDragFunction() {
    const searchBall = document.getElementById('searchBall');
    const searchContainer = document.querySelector('.floating-search-ball-container');
    
    if (!searchBall || !searchContainer) return;
    
    let isDragging = false;
    let startX, startY;
    let initialLeft, initialTop;
    
    // 添加拖动类
    searchBall.classList.add('draggable');
    
    // 桌面端拖动
    searchBall.addEventListener('mousedown', function(e) {
        if (searchBall.classList.contains('active')) return;
        
        e.preventDefault();
        isDragging = true;
        searchBall.classList.add('dragging');
        
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = searchContainer.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
    });
    
    // 移动端拖动（简化版）
    searchBall.addEventListener('touchstart', function(e) {
        if (searchBall.classList.contains('active')) return;
        
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        
        const rect = searchContainer.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        
        setTimeout(() => {
            isDragging = true;
            searchBall.classList.add('dragging');
        }, 100);
    }, { passive: true });
    
    // 移动处理
    function handleMove(e) {
        if (!isDragging) return;
        
        let currentX, currentY;
        
        if (e.type === 'touchmove') {
            const touch = e.touches[0];
            currentX = touch.clientX;
            currentY = touch.clientY;
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }
        
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        
        const newLeft = initialLeft + deltaX;
        const newTop = initialTop + deltaY;
        
        const maxX = window.innerWidth - searchContainer.offsetWidth;
        const maxY = window.innerHeight - searchContainer.offsetHeight;
        
        const safeLeft = Math.max(10, Math.min(newLeft, maxX - 10));
        const safeTop = Math.max(10, Math.min(newTop, maxY - 10));
        
        searchContainer.style.left = safeLeft + 'px';
        searchContainer.style.top = safeTop + 'px';
        searchContainer.style.right = 'auto';
    }
    
    // 结束拖动
    function handleEnd() {
        if (!isDragging) return;
        
        isDragging = false;
        searchBall.classList.remove('dragging');
        
        // 保存位置
        const left = parseFloat(searchContainer.style.left);
        const top = parseFloat(searchContainer.style.top);
        
        if (!isNaN(left) && !isNaN(top)) {
            try {
                localStorage.setItem('searchBallPosition', JSON.stringify({ left, top }));
            } catch (e) {
                // 忽略错误
            }
        }
    }
    
    // 事件监听
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: true });
    document.addEventListener('touchend', handleEnd, { passive: true });
    
    // 重置位置功能
    setupPositionReset();
}

// 加载保存的位置
function loadSavedPosition() {
    try {
        const saved = localStorage.getItem('searchBallPosition');
        if (saved) {
            const position = JSON.parse(saved);
            const searchContainer = document.querySelector('.floating-search-ball-container');
            
            if (searchContainer && position.left && position.top) {
                const maxX = window.innerWidth - searchContainer.offsetWidth;
                const maxY = window.innerHeight - searchContainer.offsetHeight;
                
                if (position.left >= 0 && position.left <= maxX &&
                    position.top >= 0 && position.top <= maxY) {
                    searchContainer.style.left = position.left + 'px';
                    searchContainer.style.top = position.top + 'px';
                    searchContainer.style.right = 'auto';
                }
            }
        }
    } catch (e) {
        // 忽略错误
    }
}

// 设置位置重置
function setupPositionReset() {
    const searchBall = document.getElementById('searchBall');
    const searchContainer = document.querySelector('.floating-search-ball-container');
    
    if (!searchBall || !searchContainer) return;
    
    // 双击重置
    searchBall.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        resetSearchBallPosition();
    });
    
    // 长按重置（移动端）
    let longPressTimer;
    searchBall.addEventListener('touchstart', function() {
        longPressTimer = setTimeout(() => {
            resetSearchBallPosition();
        }, 1000);
    });
    
    searchBall.addEventListener('touchend', function() {
        clearTimeout(longPressTimer);
    });
    
    searchBall.addEventListener('touchmove', function() {
        clearTimeout(longPressTimer);
    });
}

// 重置位置
function resetSearchBallPosition() {
    const searchContainer = document.querySelector('.floating-search-ball-container');
    if (!searchContainer) return;
    
    const isMobile = window.innerWidth <= 768;
    searchContainer.style.left = '';
    searchContainer.style.top = '';
    searchContainer.style.right = isMobile ? '15px' : '20px';
    searchContainer.style.top = isMobile ? '15px' : '20px';
    
    try {
        localStorage.removeItem('searchBallPosition');
    } catch (e) {
        // 忽略错误
    }
}

// ============================================
// 第二部分：搜索引擎（整合您的代码）
// ============================================

class SearchEngine {
    constructor() {
        this.keywordsData = null;
        this.decodedKeywordsCache = new Map();
        this.init();
    }

    async init() {
        this.keywordsData = {
            "version": "1.0",
            "lastUpdated": "2024-01-01",
            "searchRules": [
                {
                    "id": "medical_record",
                    "keywords": ["5p2O5pif6IqS"],
                    "targetUrl": "mi-lxm.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "population_flow",
                    "keywords": ["5aKf5aKD6LCD5ZKM5bGA", "6aaW6aG1"],
                    "targetUrl": "SY.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "slot_machine",
                    "keywords": ["5YmN5Y+w", "N+agizQwMQ=="],
                    "targetUrl": "qiantai.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "gkzl",
                    "keywords": ["6K645p6X5rKF", "6K645Y2a5aOr"],
                    "targetUrl": "xly.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "langren",
                    "keywords": ["6J6C5Lq65rKZ", "5Luj5Y+36J6C5Lq65rKZ", "6J6C5Lq65rKZ5qGj5qGI"],
                    "targetUrl": "langr.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "shehjg",
                    "keywords": ["56S+5Lya57uT5p6ECg==", "57uT5p6E56S+5LyaCg==", "6J6C5Lq65rKZ5qGj5qGI"],
                    "targetUrl": "yjyjyjj.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "langrentu",
                    "keywords": ["ZXZpZGVuY2VfcGhvdG8xLmh0bWw=", "ZXZpZGVuY2VfcGhvdG8x"],
                    "targetUrl": "langren.png",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "asset_assessment",
                    "keywords": ["5qmE5YyW5YmC", "6ZiI55WM5qmE5YyW5YmC"],
                    "targetUrl": "chanpin.html",
                    "description": "该页面暂无描述..."
                }
            ],
            "recentPages": []
        };

        await this.loadKeywords();
    }

    async loadKeywords() {
        try {
            this.preDecodeKeywords();
        } catch (error) {
            console.error('加载关键词数据库失败:', error);
        }
    }

    base64Decode(str) {
        try {
            return decodeURIComponent(escape(atob(str)));
        } catch (e) {
            try {
                const binaryString = atob(str);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                return new TextDecoder('utf-8').decode(bytes);
            } catch (e2) {
                console.error('解码失败:', str, e2);
                return str;
            }
        }
    }

    base64Encode(str) {
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch (error) {
            console.error('编码失败:', str, error);
            return str;
        }
    }

    preDecodeKeywords() {
        if (!this.keywordsData || !this.keywordsData.searchRules) return;
        
        this.keywordsData.searchRules.forEach((rule) => {
            rule.decodedKeywords = [];
            rule.keywords.forEach(keyword => {
                if (keyword) {
                    const decoded = this.base64Decode(keyword);
                    rule.decodedKeywords.push({
                        original: keyword,
                        decoded: decoded
                    });
                }
            });
        });
    }

    /* simplifiedToTraditionalMap = {
        
    }; */
simplifiedToTraditionalMap = {
    '界': '界',
    '7': '7',
    '台': '臺',
    '剂': '劑',
    '林': '林',
    '社': '社',
    '调': '調',
    '结': '結',
    '化': '化',
    '芒': '芒',
    '栋': '棟',
    '人': '人',
    '许': '許',
    '构': '構',
    '星': '星',
    '阈': '閾',
    '沅': '沅',
    '局': '局',
    '和': '和',
    '首': '首',
    '境': '境',
    '李': '李',
    '沙': '沙',
    '橄': '橄',
    '墟': '墟',
    '前': '前',
    '会': '會',
    '页': '頁',
    '螂': '螂',
    '401': '401',
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
    '估': '估',
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
    '口': '口',
    '管': '管',
    '理': '理'
};
    get traditionalToSimplifiedMap() {
        return Object.entries(this.simplifiedToTraditionalMap).reduce((acc, [sim, tra]) => {
            acc[tra] = sim;
            return acc;
        }, {});
    }

    toTraditional(text) {
        return text.split('').map(char => 
            this.simplifiedToTraditionalMap[char] || char
        ).join('');
    }

    toSimplified(text) {
        return text.split('').map(char => 
            this.traditionalToSimplifiedMap[char] || char
        ).join('');
    }

    getTextVariants(text) {
        const variants = new Set();
        variants.add(text);
        
        const traditional = this.toTraditional(text);
        if (traditional !== text) variants.add(traditional);
        
        const simplified = this.toSimplified(text);
        if (simplified !== text) variants.add(simplified);
        
        return Array.from(variants);
    }

    search(keyword) {
        if (!keyword || !this.keywordsData) {
            return { success: false, keyword: keyword };
        }

        const searchText = keyword.trim();
        const searchVariants = this.getTextVariants(searchText);

        for (const rule of this.keywordsData.searchRules) {
            if (!rule.decodedKeywords) continue;
            
            for (const kwInfo of rule.decodedKeywords) {
                const keywordVariants = this.getTextVariants(kwInfo.decoded);
                
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

// 创建全局搜索引擎实例
let globalSearchEngine = null;

function initSearchEngine() {
    globalSearchEngine = new SearchEngine();
    
    // 测试关键词
    setTimeout(() => {
        const testKeywords = ['吴小丫', '老虎机', '招工', '企业档案', '流动人口'];
        testKeywords.forEach(keyword => {
            const result = globalSearchEngine.search(keyword);
        });
    }, 1000);
}

// 显示提醒
function showAlert(message, duration = 2000) {
    const oldAlert = document.getElementById('customAlert');
    if (oldAlert) oldAlert.remove();
    
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
        z-index: 999999;
        font-size: 16px;
        font-weight: 600;
        box-shadow: 0 8px 30px rgba(33, 150, 243, 0.2);
        animation: alertFadeIn 0.3s ease;
        min-width: 240px;
        text-align: center;
        border-left: 5px solid #2196F3;
        backdrop-filter: blur(10px);
    `;
    
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
    
    setTimeout(() => {
        alertDiv.style.animation = 'alertFadeOut 0.3s ease';
        setTimeout(() => {
            if (alertDiv.parentNode) alertDiv.remove();
        }, 300);
    }, duration);
}

// 完整搜索函数
async function performCompleteSearch(keyword) {
    const searchInput = document.getElementById('searchInput');
    
    if (!keyword && searchInput) {
        keyword = searchInput.value.trim();
    }
    
    if (!keyword) {
        showAlert('请输入搜索关键词', 2000);
        return;
    }

    if (!globalSearchEngine) {
        globalSearchEngine = new SearchEngine();
        await globalSearchEngine.init();
    }

    const result = globalSearchEngine.search(keyword);
    
    if (result.success) {
        const rule = result.rule;
        showAlert(`找到"${keyword}"相关页面，即将跳转...`, 1500);
        
        // 关闭搜索框
        const searchBall = document.getElementById('searchBall');
        const searchExpanded = document.getElementById('searchExpanded');
        if (searchBall) searchBall.classList.remove('active');
        if (searchExpanded) searchExpanded.classList.remove('active');
        if (searchInput) searchInput.value = '';
        
        // 延迟跳转
        setTimeout(() => {
            window.location.href = rule.targetUrl;
        }, 1500);
    } else {
        showAlert(`未找到与"${keyword}"相关的页面`, 2000);
    }
}

// ============================================
// 第三部分：全局函数导出
// ============================================

// 搜索函数（供外部调用）
window.performSearch = performCompleteSearch;

// 测试函数
window.testSearch = function(keyword) {
    if (!keyword) keyword = prompt('输入测试关键词:');
    if (keyword) {
        const result = globalSearchEngine ? globalSearchEngine.search(keyword) : { success: false };
        if (result.success) {
            showAlert(`测试成功！匹配到: ${result.rule.description}`, 3000);
        } else {
            showAlert(`测试失败！未找到匹配`, 3000);
        }
    }
};

// 显示所有关键词
window.showAllKeywords = function() {
    if (!globalSearchEngine) {
        showAlert('搜索引擎未初始化', 2000);
        return;
    }
    
    const keywords = globalSearchEngine.getAllKeywords();
    alert(`共有 ${keywords.length} 个关键词:\n\n` + 
          keywords.map(k => `${k.keyword} -> ${k.targetUrl}`).join('\n'));
};

// 编码工具
window.encodeKeyword = function(text) {
    if (!text) text = prompt('输入要编码的关键词:');
    if (text) {
        const engine = globalSearchEngine || new SearchEngine();
        const encoded = engine.base64Encode(text);
        prompt('编码结果（复制使用）:', encoded);
        return encoded;
    }
};

// ============================================
// 第四部分：事件监听
// ============================================

// 页面加载完成后的额外检查
window.addEventListener('load', function() {
    console.log('页面完全加载，确保搜索框显示');
    
    // 多次检查确保显示
    setTimeout(() => {
        const container = document.querySelector('.floating-search-ball-container');
        if (container) {
            container.style.display = 'block';
            container.style.visibility = 'visible';
            container.style.opacity = '1';
        }
    }, 100);
    
    setTimeout(() => {
        const ball = document.getElementById('searchBall');
        if (ball) {
            ball.style.display = 'flex';
            ball.style.visibility = 'visible';
        }
    }, 300);
});

// 监听窗口大小变化
window.addEventListener('resize', function() {
    const container = document.querySelector('.floating-search-ball-container');
    if (container) {
        container.style.display = 'block';
    }
});

// 导出控制函数
window.searchControl = {
    init: initCompleteSearchSystem,
    search: performCompleteSearch,
    resetPosition: resetSearchBallPosition,
    showAllKeywords: function() {
        if (globalSearchEngine) {
            const keywords = globalSearchEngine.getAllKeywords();
            console.log('所有关键词:', keywords);
        }
    }
};

