// search-ball-complete.js - 纯JS版本（无CSS依赖）
//居中的搜索球代码参考！
// ============================================
// 第一部分：搜索框UI控制（移动端兼容）
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('搜索框完整JS加载...');
    initCompleteSearchSystem();
    
    // ✅ 新增：强制居中初始化
    setTimeout(() => {
        centerSearchBall();
    }, 100);
});

function initCompleteSearchSystem() {
    // 确保搜索球元素存在
    ensureSearchElements();
    
    // ✅ 新增：立即居中
    centerSearchBall();
    
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
}

// ✅ 核心居中函数
/* function centerSearchBall() {
    const searchContainer = document.querySelector('.floating-search-ball-container');
    const searchBall = document.getElementById('searchBall');
    
    if (!searchContainer || !searchBall) {
        console.warn('居中失败：元素未找到');
        return;
    }
    
    // 1. 强制显示
    searchContainer.style.display = 'block';
    searchContainer.style.visibility = 'visible';
    searchContainer.style.opacity = '1';
    searchContainer.style.zIndex = '999999';
    
    // 2. 计算居中位置
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 确保元素有正确的尺寸
    const ballWidth = searchBall.offsetWidth || 56;
    const ballHeight = searchBall.offsetHeight || 56;
    
    // 3. 设置居中位置
    const centerLeft = (viewportWidth / 2) - (ballWidth / 2);
    const centerTop = (viewportHeight / 2) - (ballHeight / 2);
    
    // 4. 应用位置
    searchContainer.style.position = 'fixed';
    searchContainer.style.left = centerLeft + 'px';
    searchContainer.style.top = centerTop + 'px';
    searchContainer.style.right = 'auto';  // 清除右对齐
    
    console.log('✅ 搜索球已居中:', {
        left: centerLeft + 'px',
        top: centerTop + 'px',
        viewport: `${viewportWidth}x${viewportHeight}`,
        ball: `${ballWidth}x${ballHeight}`
    });
    
    // 5. 标记已居中
    searchContainer.setAttribute('data-centered', 'true');
    
    // 6. 移除保存的位置（防止冲突）
    try {
        localStorage.removeItem('searchBallPosition');
    } catch (e) {
        // 忽略错误
    }
} */

    // ✅ 核心居中函数（修改为靠右居中）
function centerSearchBall() {
    const searchContainer = document.querySelector('.floating-search-ball-container');
    const searchBall = document.getElementById('searchBall');
    
    if (!searchContainer || !searchBall) {
        console.warn('定位失败：元素未找到');
        return;
    }
    
    // 1. 强制显示
    searchContainer.style.display = 'block';
    searchContainer.style.visibility = 'visible';
    searchContainer.style.opacity = '1';
    searchContainer.style.zIndex = '999999';
    
    // 2. 计算靠右居中位置
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 确保元素有正确的尺寸
    const ballWidth = searchBall.offsetWidth || 56;
    const ballHeight = searchBall.offsetHeight || 56;
    
    // 3. 设置靠右居中位置
    const rightMargin = 20; // 距离右侧边距
    const rightPosition = viewportWidth - ballWidth - rightMargin; // 靠右位置
    const verticalCenter = (viewportHeight / 2) - (ballHeight / 2); // 垂直居中
    
    // 4. 应用位置
    searchContainer.style.position = 'fixed';
    searchContainer.style.left = rightPosition + 'px';
    searchContainer.style.top = verticalCenter + 'px';
    searchContainer.style.right = 'auto';  // 清除右对齐
    
    console.log('✅ 搜索球已靠右居中:', {
        left: rightPosition + 'px',
        top: verticalCenter + 'px',
        rightMargin: rightMargin + 'px',
        viewport: `${viewportWidth}x${viewportHeight}`,
        ball: `${ballWidth}x${ballHeight}`
    });
    
    // 5. 标记已定位
    searchContainer.setAttribute('data-positioned', 'right-center');
    
    // 6. 移除保存的位置（防止冲突）
    try {
        localStorage.removeItem('searchBallPosition');
    } catch (e) {
        // 忽略错误
    }
}
// ✅ 修改重置位置函数
function resetSearchBallPosition() {
    const searchContainer = document.querySelector('.floating-search-ball-container');
    if (!searchContainer) return;
    
    // ✅ 直接调用居中函数
    centerSearchBall();
    
    try {
        localStorage.removeItem('searchBallPosition');
    } catch (e) {
        // 忽略错误
    }
}

// 创建搜索元素（如果不存在）
function createSearchElements() {
    const container = document.createElement('div');
    container.className = 'floating-search-ball-container';
    container.id = 'searchContainer';
    
    const ball = document.createElement('div');
    ball.className = 'floating-search-ball';
    ball.id = 'searchBall';
    
    const expanded = document.createElement('div');
    expanded.className = 'floating-search-expanded';
    expanded.id = 'searchExpanded';
    
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
            } else {
                // ✅ 修复：输入为空时显示提醒
                showAlert('请输入搜索关键词', 2000);
            }
        });
    }
    
    // ✅ 修复：改进的Enter键搜索处理
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // 防止表单提交
                e.stopPropagation();
                const query = this.value.trim();
                if (query) {
                    performCompleteSearch(query);
                } else {
                    // ✅ 修复：输入为空时显示提醒
                    showAlert('请输入搜索关键词', 2000);
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

// ============================================
// 第二部分：搜索引擎（保持不变）
// ============================================

class SearchEngine {
    constructor() {
        this.keywordsData = null;
        this.decodedKeywordsCache = new Map();
        this.init();
    }

    async init() {
         this.keywordsData = {
            "version": "3.0",
            "lastUpdated": "2026-01-01",
            "searchRules": [
                {
                    "id": "medical_record",
                    "keywords": ["5YW05YGl56eR5oqA6ZuG5Zui","5YW05YGl56eR5oqA6ZuG5Zui"],
                    "targetUrl": "xjjt.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "jqtjl",
                    "keywords": ["5a6J55u+56eR5oqA5YWs5Y+4","5a6J55u+56eR5oqA"],
                    "targetUrl": "andun.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "jqtj4",
                    "keywords": ["5p2O5YGl5YW0","x6eR5oqA"],
                    "targetUrl": "shizong.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "jqtj3",
                    "keywords": ["5YW055ub5Yi26YCg","5YW055ub5Yi26YCg5bel5Y6C"],
                    "targetUrl": "baozha.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "jqtj22",
                    "keywords": ["5YW05YGl5aSn5Y6m5Z2g5qW85qGI","5Z2g5qW85qGICg==","5Z2g5qW85qGI"],
                    "targetUrl": "zhuilou.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "jqtj3",
                    "keywords": ["5p6c5aSa5aSa","6bKc5p6c5bqX","5p6c5aSa5aSa5rC05p6c5bqX"],
                    "targetUrl": "shuigd.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "jqtj4",
                    "keywords": ["54mp5Lia566h55CG5aSE", "5YW05YGl5aSn5Y6m54mp5Lia566h55CG5aSE"],
                    "targetUrl": "wyglc.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "population_flow",
                    "keywords": ["5L2V5a6J", "5byg5aiB", "5paH5b+D56u5"],
                    "targetUrl": "snxyjz.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "population_flow",
                    "keywords": ["5paH5b+D56u5 ", "5a6J5b+D6I2v5bqX", "5a6J5b+D6I2v5oi/"],
                    "targetUrl": "anxin.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "slot_machine",
                    "keywords": ["5Ym N5Y+w", "N+agi zQwMQ=="],
                    "targetUrl": "qiantai.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "wd",
                    "keywords": ["5pe66L6+5ZWG5ZyI", "5pe66L6+"],
                    "targetUrl": "wangd.html",
                    "description": "该页面暂无描述..."
                },
                
                {
                    "id": "shehjg",
                    "keywords": ["56S+5Lya57uT5p6E", "57uT5p6E56S+5Lya"],
                    "targetUrl": "yjyjyjj.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "langrentu",
                    "keywords": ["5Y+25YWw", "ZXZpZGVuY2VfcGhvdG8x"],
                    "targetUrl": "mishushouze.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "chajianli",
                    "keywords": ["5qGj5qGI566h55CG5a6k5peg6aKE57qm6YCa6YGT", "5qGj5qGI566h55CG5a6k5peg6aKE57qm"],
                    "targetUrl": "chajlquanxianm.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "chajianli5",
                    "keywords": ["5oiQ5Y2O5aSn6YGT", "5oiQ5Y2O5aSn6YGT6YeN5aSn5Lqk6YCa5LqL5pWF", "6L2m56W4", "5LqL5pWF", "5oiQ5Y2O5aSn6YGT5LqL5pWF"],
                    "targetUrl": "chehuo.html",
                    "description": "该页面暂无描述..."
                }, 
                {
                    "id": "chajianli3",
                    "keywords": ["Q1RIQw==", "Y3RoYw=="],
                    "targetUrl": "todsk.html",
                    "description": "该页面暂无描述..."
                }, 
                {
                    "id": "chajianli6",
                    "keywords": ["5raI6Ziy57O757uf6K6w5b2V", "5raI6Ziy57O757uf"],
                    "targetUrl": "xiaofang.html",
                    "description": "该页面暂无描述..."
                }, 
                 {
                    "id": "chajianli6",
                    "keywords": ["5bqU5oCl55S15rqQ", "5bqU5oCl55S15rqQ5pel5b+X", "55uR5o6n5pel5b+X"],
                    "targetUrl": "yingjidy.html",
                    "description": "该页面暂无描述..."
                }, 

                {
                    "id": "chajianl2i",
                    "keywords": ["6a2P6K2m5a6Y", "6a2P"],
                    "targetUrl": "wei.html",
                    "description": "该页面暂无描述..."
                }, 
                
                {
                    "id": "chajianli2",
                    "keywords": ["cmVpbg==", "UmVpbg=="],
                    "targetUrl": "rein.html",
                    "description": "该页面暂无描述..."
                }, 
                {
                    "id": "asset_assessment",
                    "keywords": ["5byA5aeL", "6ZiI55WM5qmE5YyW5YmC"],
                    "targetUrl": "begin.html",
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

// ✅ 修复：改进的显示提醒函数
function showAlert(message, duration = 2000) {
    // 移除旧的提醒
    const oldAlert = document.getElementById('customAlert');
    if (oldAlert) {
        oldAlert.remove();
    }
    
    // 创建提醒元素
    const alertDiv = document.createElement('div');
    alertDiv.id = 'customAlert';
    alertDiv.textContent = message;
    
    // 添加基本样式确保可见
    alertDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 9999999;
        font-size: 16px;
        text-align: center;
        min-width: 200px;
        max-width: 80%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: fadeIn 0.3s ease-in-out;
    `;
    
    // 添加淡入动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -60%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(alertDiv);
    
    // 自动移除
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.style.opacity = '0';
            alertDiv.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 300);
        }
    }, duration);
}

// ✅ 修复：改进的完整搜索函数
async function performCompleteSearch(keyword) {
    const searchInput = document.getElementById('searchInput');
    
    // 获取搜索关键词
    if (!keyword && searchInput) {
        keyword = searchInput.value.trim();
    }
    
    // 检查是否为空
    if (!keyword || keyword === '') {
        showAlert('请输入搜索关键词', 2000);
        return;
    }

    // 确保搜索引擎已初始化
    if (!globalSearchEngine) {
        globalSearchEngine = new SearchEngine();
        await globalSearchEngine.init();
    }

    // 执行搜索
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
            if (rule.targetUrl) {
                window.location.href = rule.targetUrl;
            } else {
                showAlert('目标页面地址无效', 2000);
            }
        }, 1500);
    } else {
        // ✅ 修复：搜索不到时显示提醒
        showAlert(`未找到与"${keyword}"相关的页面`, 2000);
        
        // 保持搜索框打开，让用户继续输入
        const searchBall = document.getElementById('searchBall');
        const searchExpanded = document.getElementById('searchExpanded');
        if (searchBall && searchExpanded) {
            searchBall.classList.add('active');
            searchExpanded.classList.add('active');
            setTimeout(() => {
                if (searchInput) {
                    searchInput.focus();
                    // 选中文本方便用户重新输入
                    searchInput.select();
                }
            }, 100);
        }
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
    console.log('页面完全加载，执行保障居中');
    
    // 延迟居中，确保所有资源加载完成
    setTimeout(() => {
        centerSearchBall();
    }, 500);
});

// ✅ 窗口大小变化时重新居中
window.addEventListener('resize', function() {
    const container = document.querySelector('.floating-search-ball-container');
    if (container && container.hasAttribute('data-centered')) {
        setTimeout(centerSearchBall, 100);
    }
});

// ✅ 导出居中函数供外部调用
window.centerSearchBall = centerSearchBall;

// ✅ 定时检查保障
/* setInterval(() => {
    const container = document.querySelector('.floating-search-ball-container');
    const ball = document.getElementById('searchBall');
    
    if (container && ball) {
        const rect = container.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const isCentered = container.hasAttribute('data-centered');
        
        if (isVisible && !isCentered) {
            console.log('定时检查：重新居中');
            centerSearchBall();
        }
    }
}, 3000);
 */
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

console.log('搜索球完整JS代码已优化加载');