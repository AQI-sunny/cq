// search-ball-complete.js - 纯JS版本（无CSS依赖）
// 居中的搜索球代码参考！
// 修改：使其初始位置靠移动端右边，垂直居中，水平靠右
// 修改：搜索到内容在新标签页打开窗口
// ============================================
// 第一部分：搜索框UI控制（移动端兼容）
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('搜索框完整JS加载...');
    initCompleteSearchSystem();
    
    // ✅ 修改：初始位置调整为右边居中
    setTimeout(() => {
        positionSearchBallRight();
    }, 100);
});

function initCompleteSearchSystem() {
    // 确保搜索球元素存在
    ensureSearchElements();
    
    // ✅ 修改：初始位置调整为右边居中
    positionSearchBallRight();
    
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

// ✅ 修改：新的右边居中函数
function positionSearchBallRight() {
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
    
    // 2. 计算右边居中位置
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 确保元素有正确的尺寸
    const ballWidth = searchBall.offsetWidth || 56;
    const ballHeight = searchBall.offsetHeight || 56;
    
    // 3. 设置右边居中位置
    // 距离右边20px，垂直居中
    const rightMargin = 20;
    const rightPosition = viewportWidth - ballWidth - rightMargin;
    const centerTop = (viewportHeight / 2) - (ballHeight / 2);
    
    // 4. 应用位置
    searchContainer.style.position = 'fixed';
    searchContainer.style.left = 'auto';  // 清除左对齐
    searchContainer.style.right = rightMargin + 'px';
    searchContainer.style.top = centerTop + 'px';
    
    console.log('✅ 搜索球已定位到右边居中:', {
        right: rightMargin + 'px',
        top: centerTop + 'px',
        viewport: `${viewportWidth}x${viewportHeight}`,
        ball: `${ballWidth}x${ballHeight}`
    });
    
    // 5. 标记初始位置已设置
    searchContainer.setAttribute('data-initial-position', 'right-center');
    
    // 6. 清除之前的居中标记
    searchContainer.removeAttribute('data-centered');
    
    // 7. 移除保存的位置（防止冲突）
    try {
        localStorage.removeItem('searchBallPosition');
    } catch (e) {
        // 忽略错误
    }
}

// ✅ 修改：重置位置函数（改为右边居中）
function resetSearchBallPosition() {
    const searchContainer = document.querySelector('.floating-search-ball-container');
    if (!searchContainer) return;
    
    // ✅ 直接调用右边居中函数
    positionSearchBallRight();
    
    try {
        localStorage.removeItem('searchBallPosition');
    } catch (e) {
        // 忽略错误
    }
}

// ✅ 新增：检查是否是移动端或TapTap环境
function isMobileOrTapTap() {
    // 移动端检测
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // TapTap小程序H5环境检测（常见特征）
    const isTapTap = /TAPTAP/i.test(navigator.userAgent) || 
                    window.__TAURI__ || // Tauri环境
                    window.tt || // TapTap小程序环境
                    document.referrer.includes('taptap');
    
    return isMobile || isTapTap;
}

// ✅ 新增：TapTap环境适配
function adaptForTapTap() {
    if (!isMobileOrTapTap()) return;
    
    // 添加TapTap环境特定样式
    const style = document.createElement('style');
    style.textContent = `
        /* TapTap环境优化 */
        .floating-search-ball-container {
            -webkit-tap-highlight-color: transparent !important;
            touch-action: manipulation !important;
        }
        
        .floating-search-ball {
            -webkit-tap-highlight-color: transparent !important;
            touch-action: manipulation !important;
        }
        
        /* 防止TapTap环境下的点击穿透 */
        @media (max-width: 768px) {
            .floating-search-expanded {
                touch-action: pan-y !important;
            }
            
            .floating-search-input {
                -webkit-user-select: text !important;
                user-select: text !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ TapTap/移动端环境适配已启用');
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
    
    // ✅ 修改：为移动端优化输入体验
    if (isMobileOrTapTap()) {
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('spellcheck', 'false');
    }
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'floating-search-close';
    closeBtn.id = 'searchClose';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', '关闭搜索');
    
    const submitBtn = document.createElement('button');
    submitBtn.className = 'floating-search-submit';
    submitBtn.id = 'searchSubmit';
    submitBtn.innerHTML = '搜';
    submitBtn.setAttribute('aria-label', '搜索');
    
    expanded.appendChild(input);
    expanded.appendChild(closeBtn);
    expanded.appendChild(submitBtn);
    container.appendChild(ball);
    container.appendChild(expanded);
    document.body.appendChild(container);
    
    // ✅ 新增：TapTap环境适配
    adaptForTapTap();
    
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
    
    // ✅ 修改：优化点击事件处理（移动端兼容）
    const handleBallClick = function(e) {
        // 阻止事件冒泡和默认行为
        e.preventDefault();
        e.stopPropagation();
        
        // 如果是拖动状态，不触发点击
        if (this.classList.contains('dragging')) {
            return;
        }
        
        const isActive = this.classList.contains('active');
        
        if (isActive) {
            this.classList.remove('active');
            if (searchExpanded) searchExpanded.classList.remove('active');
        } else {
            this.classList.add('active');
            if (searchExpanded) searchExpanded.classList.add('active');
            this.classList.add('pulse');
            setTimeout(() => this.classList.remove('pulse'), 500);
            
            // ✅ 重要：输入时保持当前位置不变
            // 不需要调整位置，保持用户拖动后的位置
            
            setTimeout(() => {
                if (searchInput) {
                    searchInput.focus();
                    // 移动端优化：触发虚拟键盘
                    if (isMobileOrTapTap()) {
                        searchInput.click();
                    }
                }
            }, 300);
        }
    };
    
    // 点击搜索球
    searchBall.addEventListener('click', handleBallClick);
    
    // ✅ 新增：Touch事件优化（防止双击缩放干扰）
    searchBall.addEventListener('touchstart', function(e) {
        // 阻止默认行为防止双击缩放
        e.preventDefault();
    }, { passive: false });
    
    // 关闭按钮
    if (searchClose) {
        searchClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            searchBall.classList.remove('active');
            searchExpanded.classList.remove('active');
            if (searchInput) searchInput.value = '';
        });
        
        // Touch事件
        searchClose.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();
            searchBall.classList.remove('active');
            searchExpanded.classList.remove('active');
            if (searchInput) searchInput.value = '';
        }, { passive: false });
    }
    
    // 搜索按钮
    if (searchSubmit) {
        const handleSubmit = function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            const query = searchInput ? searchInput.value.trim() : '';
            if (query) {
                performCompleteSearch(query);
            } else {
                showAlert('请输入搜索关键词', 2000);
            }
        };
        
        searchSubmit.addEventListener('click', handleSubmit);
        searchSubmit.addEventListener('touchstart', function(e) {
            e.preventDefault();
            handleSubmit();
        }, { passive: false });
    }
    
    // ✅ 修复：改进的Enter键搜索处理
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                const query = this.value.trim();
                if (query) {
                    performCompleteSearch(query);
                } else {
                    showAlert('请输入搜索关键词', 2000);
                }
            }
        });
        
        // ✅ 新增：移动端输入优化
        if (isMobileOrTapTap()) {
            searchInput.addEventListener('focus', function() {
                // 保持当前位置不变
                const searchContainer = document.querySelector('.floating-search-ball-container');
                if (searchContainer) {
                    // 记录当前位置，确保不会跳动
                    const rect = searchContainer.getBoundingClientRect();
                    searchContainer.style.left = rect.left + 'px';
                    searchContainer.style.right = 'auto';
                    searchContainer.style.top = rect.top + 'px';
                }
            });
            
            searchInput.addEventListener('blur', function() {
                // 修复iOS虚拟键盘收起后的位置问题
                setTimeout(() => {
                    window.scrollTo(0, 0);
                }, 100);
            });
        }
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
    
    // ✅ 新增：Touch事件处理点击外部关闭
    document.addEventListener('touchstart', function(e) {
        if (!searchBall || !searchExpanded) return;
        
        const isTouchInside = searchBall.contains(e.target) || 
                              searchExpanded.contains(e.target);
        
        if (!isTouchInside && searchExpanded.classList.contains('active')) {
            searchBall.classList.remove('active');
            searchExpanded.classList.remove('active');
        }
    }, { passive: true });
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
        
        // ✅ 修改：拖动时移除初始位置标记
        searchContainer.removeAttribute('data-initial-position');
    });
    
    // 移动端拖动（优化版）
    searchBall.addEventListener('touchstart', function(e) {
        if (searchBall.classList.contains('active')) return;
        
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        
        const rect = searchContainer.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        
        // ✅ 修改：拖动时移除初始位置标记
        searchContainer.removeAttribute('data-initial-position');
        
        // 短时间后开始拖动（防止误触）
        setTimeout(() => {
            if (!searchBall.classList.contains('active')) {
                isDragging = true;
                searchBall.classList.add('dragging');
            }
        }, 150);
    }, { passive: true });
    
    // 移动处理
    function handleMove(e) {
        if (!isDragging) return;
        
        let currentX, currentY;
        
        if (e.type === 'touchmove') {
            const touch = e.touches[0];
            currentX = touch.clientX;
            currentY = touch.clientY;
            e.preventDefault(); // 阻止滚动
        } else {
            currentX = e.clientX;
            currentY = e.clientY;
        }
        
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        
        const newLeft = initialLeft + deltaX;
        const newTop = initialTop + deltaY;
        
        // 边界检查
        const maxX = window.innerWidth - searchContainer.offsetWidth;
        const maxY = window.innerHeight - searchContainer.offsetHeight;
        
        const safeLeft = Math.max(10, Math.min(newLeft, maxX - 10));
        const safeTop = Math.max(10, Math.min(newTop, maxY - 10));
        
        // ✅ 重要：应用新位置，保持拖动后的位置
        searchContainer.style.left = safeLeft + 'px';
        searchContainer.style.top = safeTop + 'px';
        searchContainer.style.right = 'auto'; // 清除右对齐
        
        // 更新初始位置为当前位置（用于连续拖动）
        initialLeft = safeLeft;
        initialTop = safeTop;
        startX = currentX;
        startY = currentY;
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
                console.log('位置已保存:', { left, top });
            } catch (e) {
                // 忽略错误
            }
        }
    }
    
    // 事件监听
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd, { passive: true });
    document.addEventListener('touchcancel', handleEnd, { passive: true });
    
    // 设置位置重置
    setupPositionReset();
}

// 设置位置重置
function setupPositionReset() {
    const searchBall = document.getElementById('searchBall');
    const searchContainer = document.querySelector('.floating-search-ball-container');
    
    if (!searchBall || !searchContainer) return;
    
    // 双击重置
    searchBall.addEventListener('dblclick', function(e) {
        e.preventDefault();
        e.stopPropagation();
        resetSearchBallPosition();
    });
    
    // 长按重置（移动端优化）
    let longPressTimer;
    let isLongPress = false;
    
    const handleTouchStart = function() {
        if (searchBall.classList.contains('active')) return;
        
        isLongPress = false;
        longPressTimer = setTimeout(() => {
            isLongPress = true;
            resetSearchBallPosition();
            showAlert('位置已重置到右边', 1500);
        }, 800); // 800ms长按
    };
    
    const handleTouchEnd = function() {
        clearTimeout(longPressTimer);
        
        // 如果长按触发，阻止后续的点击事件
        if (isLongPress) {
            const handler = function(e) {
                e.preventDefault();
                e.stopPropagation();
                searchBall.removeEventListener('click', handler);
            };
            searchBall.addEventListener('click', handler);
            setTimeout(() => {
                searchBall.removeEventListener('click', handler);
            }, 100);
        }
    };
    
    searchBall.addEventListener('touchstart', handleTouchStart, { passive: true });
    searchBall.addEventListener('touchend', handleTouchEnd, { passive: true });
    searchBall.addEventListener('touchmove', function() {
        clearTimeout(longPressTimer);
    }, { passive: true });
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
                    "id": "medical_record",
                    "keywords": ["5aGr6KGo","5qGI5Lu25YWz6ZSu5L+h5oGv6KGo"],
                    "targetUrl": "tuiliban.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "jqtjl",
                    "keywords": ["5a6J55u+56eR5oqA5YWs5Y+4","5a6J55u+56eR5oqA"],
                    "targetUrl": "andun.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "jqtjl",
                    "keywords": ["5p2O5YGl5YW0","x6eR5oqA"],
                    "targetUrl": "shizong.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "jqtjl",
                    "keywords": ["5YW055ub5Yi26YCg","5YW055ub5Yi26YCg"],
                    "targetUrl": "baozha.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "jqtj2",
                    "keywords": ["5YW05YGl5aSn5Y6m5Z2g5qW85qGI","5Z2g5qW85qGI"],
                    "targetUrl": "zhuilou.html",
                    "description": "该页面暂无描述..."
                },
                {
                    "id": "jqtj3",
                    "keywords": ["5p6c5aSa5aSa","6bKc5p6c5bqX"],
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
                    "id": "langren",
                    "keywords": ["6J6C5Lq65rKZ", "5Luj5Y+36J6C5Lq65rKZ", "6J6C5Lq65rKZ5qGj5qGI"],
                    "targetUrl": "langr.html",
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
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 16px 24px;
        border-radius: 10px;
        z-index: 10000000;
        font-size: 16px;
        text-align: center;
        min-width: 200px;
        max-width: 80%;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        animation: customAlertFadeIn 0.3s ease-out;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.5;
        word-break: break-word;
    `;
    
    // 添加淡入动画
    const style = document.createElement('style');
    style.textContent = `
        @keyframes customAlertFadeIn {
            from { 
                opacity: 0; 
                transform: translate(-50%, -60%) scale(0.95); 
            }
            to { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1); 
            }
        }
        
        @keyframes customAlertFadeOut {
            from { 
                opacity: 1; 
                transform: translate(-50%, -50%) scale(1); 
            }
            to { 
                opacity: 0; 
                transform: translate(-50%, -40%) scale(0.95); 
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(alertDiv);
    
    // 自动移除
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.style.animation = 'customAlertFadeOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 300);
        }
    }, duration);
    
    return alertDiv;
}

// ✅ 修改：新增函数 - 在新标签页打开URL
function openInNewTab(url, name = '_blank') {
    // 检查是否为TapTap环境
    if (isMobileOrTapTap()) {
        try {
            // 尝试使用标准方式打开
            const newWindow = window.open(url, name);
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                // 如果被阻止，显示提示
                showAlert('新窗口被阻止，请手动复制链接打开：' + url, 3000);
                return null;
            }
            return newWindow;
        } catch (error) {
            console.error('打开新标签页失败:', error);
            // 显示提示让用户手动操作
            showAlert('无法自动打开，请手动复制链接：' + url, 3000);
            return null;
        }
    } else {
        // 桌面端使用标准方式
        return window.open(url, name);
    }
}

// ✅ 修改：改进的完整搜索函数 - 支持新标签页打开
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
        
        // 显示找到结果的提示
        const alertDiv = showAlert(`找到"${keyword}"相关页面`, 1000);
        
        // 添加新标签页打开的提示
        setTimeout(() => {
            const newAlert = showAlert(`正在新标签页中打开`, 2000);
        }, 1000);
        
        // 关闭搜索框
        const searchBall = document.getElementById('searchBall');
        const searchExpanded = document.getElementById('searchExpanded');
        if (searchBall) searchBall.classList.remove('active');
        if (searchExpanded) searchExpanded.classList.remove('active');
        if (searchInput) searchInput.value = '';
        
        // ✅ 修改：在新标签页中打开
        setTimeout(() => {
            if (rule.targetUrl) {
                try {
                    // 在新标签页中打开
                    const newWindow = openInNewTab(rule.targetUrl, '_blank');
                    
                    // 如果无法打开新标签页，提供备选方案
                    if (!newWindow) {
                        // 显示包含链接的自制弹窗
                        const linkAlert = showAlert('点击下面的链接在新标签页中打开', 0);
                        
                        const linkContainer = document.createElement('div');
                        linkContainer.style.cssText = `
                            margin-top: 15px;
                            padding: 12px;
                            background: rgba(255, 255, 255, 0.1);
                            border-radius: 6px;
                            word-break: break-all;
                        `;
                        
                        const link = document.createElement('a');
                        link.href = rule.targetUrl;
                        link.textContent = rule.targetUrl;
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                        link.style.cssText = `
                            color: #4fc3f7;
                            text-decoration: none;
                            font-size: 14px;
                            display: block;
                            padding: 5px;
                        `;
                        
                        const copyBtn = document.createElement('button');
                        copyBtn.textContent = '复制链接';
                        copyBtn.style.cssText = `
                            width: 100%;
                            padding: 10px;
                            margin-top: 10px;
                            background: #2196F3;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            font-size: 14px;
                            cursor: pointer;
                        `;
                        
                        copyBtn.addEventListener('click', function() {
                            navigator.clipboard.writeText(rule.targetUrl).then(() => {
                                showAlert('链接已复制到剪贴板', 1500);
                            });
                        });
                        
                        linkContainer.appendChild(link);
                        linkAlert.appendChild(linkContainer);
                        linkAlert.appendChild(copyBtn);
                    }
                } catch (error) {
                    console.error('打开页面失败:', error);
                    showAlert('打开页面失败，请检查链接', 2000);
                }
            } else {
                showAlert('目标页面地址无效', 2000);
            }
        }, 500); // 稍微延迟，让用户看到提示
    } else {
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

// 测试函数（修改为在新标签页打开）
window.testSearch = function(keyword) {
    if (!keyword) {
        // 使用自制弹窗获取输入
        const inputAlert = showAlert('输入测试关键词:', 0);
        
        const input = document.createElement('input');
        input.type = 'text';
        input.style.cssText = `
            width: 100%;
            padding: 10px;
            margin: 12px 0;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 14px;
            box-sizing: border-box;
        `;
        
        const button = document.createElement('button');
        button.textContent = '测试搜索';
        button.style.cssText = `
            width: 100%;
            padding: 10px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            cursor: pointer;
        `;
        
        inputAlert.appendChild(input);
        inputAlert.appendChild(button);
        
        input.focus();
        
        button.addEventListener('click', function() {
            const value = input.value.trim();
            if (value) {
                if (inputAlert.parentNode) inputAlert.remove();
                performCompleteSearch(value);
            }
        });
        
        // 回车键支持
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                button.click();
            }
        });
        
        return;
    }
    
    performCompleteSearch(keyword);
};

// 显示所有关键词（修改为在新标签页中打开链接）
window.showAllKeywords = function() {
    if (!globalSearchEngine) {
        showAlert('搜索引擎未初始化', 2000);
        return;
    }
    
    const keywords = globalSearchEngine.getAllKeywords();
    
    // 使用自制弹窗显示
    const alertDiv = showAlert(`共有 ${keywords.length} 个关键词`, 0);
    
    // 添加关键词列表
    const listDiv = document.createElement('div');
    listDiv.style.cssText = `
        max-height: 400px;
        overflow-y: auto;
        margin-top: 12px;
        text-align: left;
        font-size: 14px;
        line-height: 1.4;
        padding-right: 5px;
    `;
    
    // 添加滚动条样式
    const style = document.createElement('style');
    style.textContent = `
        .keywords-list::-webkit-scrollbar {
            width: 6px;
        }
        .keywords-list::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }
        .keywords-list::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 3px;
        }
    `;
    document.head.appendChild(style);
    listDiv.className = 'keywords-list';
    
    keywords.slice(0, 30).forEach(k => {
        const item = document.createElement('div');
        item.style.cssText = `
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const keywordSpan = document.createElement('span');
        keywordSpan.textContent = k.keyword;
        keywordSpan.style.cssText = `
            flex: 1;
            margin-right: 10px;
            word-break: break-all;
        `;
        
        const linkBtn = document.createElement('button');
        linkBtn.textContent = '打开';
        linkBtn.style.cssText = `
            padding: 4px 8px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 3px;
            font-size: 12px;
            cursor: pointer;
            flex-shrink: 0;
        `;
        
        linkBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openInNewTab(k.targetUrl, '_blank');
            showAlert(`正在打开: ${k.targetUrl}`, 1500);
        });
        
        item.appendChild(keywordSpan);
        item.appendChild(linkBtn);
        listDiv.appendChild(item);
    });
    
    if (keywords.length > 30) {
        const more = document.createElement('div');
        more.style.cssText = `
            padding: 10px 0;
            font-style: italic;
            text-align: center;
            color: rgba(255, 255, 255, 0.7);
        `;
        more.textContent = `... 还有 ${keywords.length - 30} 个关键词`;
        listDiv.appendChild(more);
    }
    
    alertDiv.appendChild(listDiv);
    
    // 添加关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
        width: 100%;
        padding: 10px;
        margin-top: 15px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 14px;
        cursor: pointer;
    `;
    
    closeBtn.addEventListener('click', function() {
        if (alertDiv.parentNode) alertDiv.remove();
    });
    
    alertDiv.appendChild(closeBtn);
};

// 编码工具
window.encodeKeyword = function(text) {
    if (!text) {
        // 使用自制弹窗获取输入
        const inputAlert = showAlert('请输入要编码的关键词:', 0);
        
        const input = document.createElement('input');
        input.type = 'text';
        input.style.cssText = `
            width: 100%;
            padding: 10px;
            margin: 12px 0;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 14px;
            box-sizing: border-box;
        `;
        
        const button = document.createElement('button');
        button.textContent = '编码';
        button.style.cssText = `
            width: 100%;
            padding: 10px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 14px;
            cursor: pointer;
        `;
        
        inputAlert.appendChild(input);
        inputAlert.appendChild(button);
        
        input.focus();
        
        button.addEventListener('click', function() {
            const value = input.value.trim();
            if (value) {
                const engine = globalSearchEngine || new SearchEngine();
                const encoded = engine.base64Encode(value);
                
                // 显示编码结果
                const resultAlert = showAlert('编码结果:', 0);
                
                const resultDiv = document.createElement('div');
                resultDiv.textContent = encoded;
                resultDiv.style.cssText = `
                    background: rgba(255, 255, 255, 0.1);
                    padding: 12px;
                    margin: 12px 0;
                    border-radius: 5px;
                    word-break: break-all;
                    font-family: monospace;
                    font-size: 12px;
                    max-height: 200px;
                    overflow-y: auto;
                `;
                
                const copyBtn = document.createElement('button');
                copyBtn.textContent = '复制结果';
                copyBtn.style.cssText = button.style.cssText;
                copyBtn.style.background = '#2196F3';
                copyBtn.style.marginTop = '10px';
                
                copyBtn.addEventListener('click', function() {
                    navigator.clipboard.writeText(encoded).then(() => {
                        showAlert('已复制到剪贴板', 1500);
                        setTimeout(() => {
                            if (resultAlert.parentNode) resultAlert.remove();
                        }, 1000);
                    });
                });
                
                resultAlert.appendChild(resultDiv);
                resultAlert.appendChild(copyBtn);
                
                // 移除输入弹窗
                if (inputAlert.parentNode) inputAlert.remove();
            }
        });
        
        // 回车键支持
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                button.click();
            }
        });
        
        return;
    }
    
    const engine = globalSearchEngine || new SearchEngine();
    const encoded = engine.base64Encode(text);
    
    // 显示编码结果
    const alertDiv = showAlert('编码结果:', 0);
    
    const resultDiv = document.createElement('div');
    resultDiv.textContent = encoded;
    resultDiv.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        padding: 12px;
        margin: 12px 0;
        border-radius: 5px;
        word-break: break-all;
        font-family: monospace;
        font-size: 12px;
        max-height: 200px;
        overflow-y: auto;
    `;
    
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '复制结果';
    copyBtn.style.cssText = `
        width: 100%;
        padding: 10px;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 14px;
        cursor: pointer;
    `;
    
    copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(encoded).then(() => {
            showAlert('已复制到剪贴板', 1500);
            setTimeout(() => {
                if (alertDiv.parentNode) alertDiv.remove();
            }, 1000);
        });
    });
    
    alertDiv.appendChild(resultDiv);
    alertDiv.appendChild(copyBtn);
};

// ============================================
// 第四部分：事件监听和优化
// ============================================

// 页面加载完成后的额外检查
window.addEventListener('load', function() {
    console.log('页面完全加载，执行保障定位');
    
    // 延迟定位，确保所有资源加载完成
    setTimeout(() => {
        positionSearchBallRight();
        
        // 加载保存的位置（如果用户拖动过）
        try {
            const savedPos = localStorage.getItem('searchBallPosition');
            if (savedPos) {
                const { left, top } = JSON.parse(savedPos);
                const searchContainer = document.querySelector('.floating-search-ball-container');
                if (searchContainer && !isNaN(left) && !isNaN(top)) {
                    // 应用保存的位置
                    searchContainer.style.left = left + 'px';
                    searchContainer.style.top = top + 'px';
                    searchContainer.style.right = 'auto';
                    searchContainer.removeAttribute('data-initial-position');
                    console.log('已加载保存的位置:', { left, top });
                }
            }
        } catch (e) {
            // 忽略错误
        }
    }, 500);
});

// ✅ 窗口大小变化时重新定位
window.addEventListener('resize', function() {
    const container = document.querySelector('.floating-search-ball-container');
    
    // 只有在初始位置（未拖动）时才重新定位
    if (container && container.hasAttribute('data-initial-position')) {
        setTimeout(positionSearchBallRight, 100);
    } else {
        // 如果用户拖动过，确保不会超出边界
        setTimeout(() => {
            if (container) {
                const rect = container.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                // 边界检查
                if (rect.left < 10) {
                    container.style.left = '10px';
                }
                if (rect.top < 10) {
                    container.style.top = '10px';
                }
                if (rect.right > viewportWidth - 10) {
                    container.style.left = (viewportWidth - rect.width - 10) + 'px';
                }
                if (rect.bottom > viewportHeight - 10) {
                    container.style.top = (viewportHeight - rect.height - 10) + 'px';
                }
            }
        }, 100);
    }
});

// ✅ 导出函数供外部调用
window.positionSearchBallRight = positionSearchBallRight;
window.centerSearchBall = positionSearchBallRight; // 保持向后兼容
window.openInNewTab = openInNewTab; // 导出新标签页打开函数

// ✅ 定时检查保障
setInterval(() => {
    const container = document.querySelector('.floating-search-ball-container');
    const ball = document.getElementById('searchBall');
    
    if (container && ball) {
        const rect = container.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        const hasInitialPosition = container.hasAttribute('data-initial-position');
        
        // 如果不可见但有初始位置标记，重新定位
        if (!isVisible && hasInitialPosition) {
            console.log('定时检查：重新定位搜索球');
            positionSearchBallRight();
        }
        
        // 检查是否在可视区域内
        if (isVisible) {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // 如果完全不可见，重置到右边
            if (rect.right < 0 || rect.left > viewportWidth || 
                rect.bottom < 0 || rect.top > viewportHeight) {
                console.log('搜索球超出视窗，重置位置');
                positionSearchBallRight();
            }
        }
    }
}, 5000); // 5秒检查一次

// ✅ 新增：移动端键盘事件处理
if (isMobileOrTapTap()) {
    window.addEventListener('resize', function() {
        // 处理虚拟键盘弹出/收起
        const activeElement = document.activeElement;
        const isSearchInput = activeElement && activeElement.id === 'searchInput';
        
        if (isSearchInput) {
            // 保持当前位置，不需要调整
            console.log('搜索输入激活，保持当前位置');
        }
    });
}

// 导出控制函数
window.searchControl = {
    init: initCompleteSearchSystem,
    search: performCompleteSearch,
    resetPosition: resetSearchBallPosition,
    positionRight: positionSearchBallRight,
    openInNewTab: openInNewTab,
    showAllKeywords: function() {
        if (globalSearchEngine) {
            const keywords = globalSearchEngine.getAllKeywords();
            console.log('所有关键词:', keywords);
        }
    }
};

console.log('搜索球完整JS代码已优化加载（右边居中版 + 新标签页打开）');
