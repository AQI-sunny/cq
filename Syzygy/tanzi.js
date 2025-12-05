/**
 * 坛子 - 隐藏帖子助手
 * 
 * 版本: 2.4.0
 * 更新日志:
 * 1. 修复桌面端面板高度溢出问题，添加最大高度限制
 * 2. 新增桌面/平板端拖拽移动功能，并自动保存位置
 * 3. 保持移动端原有布局和逻辑不变
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
    panelId: 'tanzi-panel',
    uniqueSearchesKey: 'tanzi_unique_searches',
    positionKey: 'tanzi_position' // 新增：存储位置的键
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
        searchCount = history ? JSON.parse(history).totalSearches || 0 : 0;
    } catch (e) {
        searchCount = 0;
    }
    
    // 加载不重复搜索词
    loadUniqueSearches();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupFunctionality);
    } else {
        setupFunctionality();
    }
}

function loadUniqueSearches() {
    try {
        const stored = localStorage.getItem(config.uniqueSearchesKey);
        if (stored) {
            const data = JSON.parse(stored);
            if (Array.isArray(data)) {
                uniqueSearchTerms = new Set(data);
            }
        }
    } catch (e) {
        console.error('加载不重复搜索词失败:', e);
        uniqueSearchTerms = new Set();
    }
}

function saveUniqueSearches() {
    try {
        localStorage.setItem(config.uniqueSearchesKey, JSON.stringify([...uniqueSearchTerms]));
    } catch (e) {
        console.error('保存不重复搜索词失败:', e);
    }
}

function checkPeriodicHint(query) {
    if (query !== config.triggerKeyword) {
        if (!uniqueSearchTerms.has(query)) {
            uniqueSearchTerms.add(query);
            saveUniqueSearches();
            if (uniqueSearchTerms.size % 7 === 0) {
                showPeriodicHint();
            }
        }
    }
}

function showPeriodicHint() {
    const hints = [
        "耳机遗失帖里有一个人的性格特征很明显哦~尝试搜索相关名词或形容词？",
        "手套丢失帖里的关键词为四个字的名词哦~是一件物品~",
        "嘿 你不会还没发现返回键吧？尝试搜索logo里的英文？",
        "关于老赵两口子的旧新闻需要先找出更早的某则新闻，通过报刊名联想~",
        "点击返回键有惊喜~别忘了搜一搜公寓所在地~六个字的关键词",
        "不要忘了搜一搜记者名字~",
        "某条路上有一个咖啡店~帅哥帖子里暗示了咖啡店名~转换大写繁体哦",
        "两个公园都搜过了吗~不要只在论坛里搜索哦~",
        "某个植物不要单独搜索哦~要和地名联合起来搜索~",
        "市区报道里面有张图片很重要哦~",
        "咖啡店首页出现的咖啡也搜一搜？",
        "宝子有没有解锁某个工具呀？试试在论坛也搜索一下呢？",
        "王大妈要去放什么灯呢？某个节日发生了什么呢？在哪一年呢？",
        "超市和咖啡店后台用户名都是全名拼音哦~",
        "404的真名你可知晓啦？他发布的帖子里有提到一个...网站，去search一下？",
        "鸡蛋帖子有透露老板姓氏哦~还有评论区曾提到xx姐的糖糕",
        "xx县某个帖子存在？年前、快？年的字眼，可以穷举出一个新闻哦~记得要联系地名~",
        "浩子母亲的出院日期需要穷举哦~联系许愿帖子和第一篇文章末尾可得知大概范围~",
        "旧论坛名字是清单第二列字竖着下来哦~",
        "邀请码是薄荷英文和评论区提到的电影上映日期哦",
        "超市后台密码和女儿小名、生日有关哦~可通过某工具进行推理",
        "有早报就有。。？知道新闻内容后联想一下~父母一般会发布什么启事呢？",
        "有一个已注销的用户发布的文章。。。这个文章好像是藏头哦。。",
        "密钥似乎是通过凯撒＋维吉尼亚破解的呢",
        "阿哲的电脑也连接一下？关于生日。。一般会买什么呢？去超市搜索一下相关订单？",
        "歌词注意看第二类~它们的歌名是什么呢？揪出尾巴可得知一个4字地点哦~",
        "快递柜在末尾有暗示哦，几个人逃出来了呢？取件码和提到的日期有关哦~是几几年呢？",
        "A门的密码就在躲弓箭的背景上哦",
        "后面每个门的密码都在前一个门的档案里哦",
        "B门的密码是一种花的英文哦~反复提到的~M开头的哦",
        "C门的密码是两个字的拼音＋梅森数哦",
        "D门的密码是蒹葭苍苍下一句的前两个字拼音哦",
        "E门密码是某类鸟的外号英文＋书籍的影视化年份哦",
        "实验室深处密码要通过档案号推理哦~猜猜是谁被关在里面呢？",
        "旧论坛有提到《xxx则》，解字谜可得五字书籍哦",
        "小符咒游戏可以得到一个提取码哦~",
        "提取到的某卷书~可解出一个四字家族名哦~Y开头X结尾~注意观察xx后裔~",
        "连出天秤座星象得到一串密文，用base64解开素？",
        "解出的4个字是8字书的前半部分哦，后半部分在守秘录里倒着揪尾巴~",
        "8字书名缩写是YLCJMSZS，你猜对了吗？",
        "神秘用户的用户名要使用栅栏密码哦~嫌麻烦也可以刷新大搜索页面截屏红色字体~",
        "神秘用户的密码是一句话哦~支线末尾的英文单词合起来~顺序可以看看歌词~数字只有一个，在第二位哦~"
    ];
    
    const round = uniqueSearchTerms.size / 7;
    let index = round - 1;
    index = index % hints.length;
    showHintInPanel(hints[index]);
}

function showHintInPanel(hintMessage) {
    const panel = document.getElementById(config.panelId);
    if (!panel) return;
    
    let hintSection = panel.querySelector('#hint-section');
    if (!hintSection) {
        hintSection = document.createElement('div');
        hintSection.id = 'hint-section';
        // 样式已在 CSS 中定义
        const header = panel.querySelector('.panel-header');
        if (header) {
            header.after(hintSection);
        } else {
            panel.insertBefore(hintSection, panel.firstChild);
        }
    }
    
    let hintContent = hintSection.querySelector('#hint-content');
    if (!hintContent) {
        hintContent = document.createElement('div');
        hintContent.id = 'hint-content';
        hintSection.appendChild(hintContent);
    }
    
    hintContent.textContent = hintMessage;
    hintSection.style.display = 'block';
}

function setupFunctionality() {
    createTanziUI();
    interceptSearchFunction();
    bindEvents();
    updateDisplay();
    
    // 初始化拖拽功能 (新增)
    makeDraggable();

    // 修复移动端面板位置
    function fixMobilePanelPosition() {
        if (window.innerWidth <= 768) {
            const panel = document.getElementById(config.panelId);
            const container = document.getElementById(config.containerId);
            
            if (panel && container) {
                // 移动端重置容器位置，确保在右下角
                container.style.top = '';
                container.style.left = '';
                container.style.bottom = '30px';
                container.style.right = '30px';
                
                // 强制使用 fixed 定位
                panel.style.position = 'fixed';
                panel.style.zIndex = '10001';
                panel.style.left = '50%';
                panel.style.right = 'auto';
                panel.style.transform = 'translateX(-50%)';
                panel.style.width = '90vw';
                panel.style.bottom = '100px';
                
                // 移动端高度逻辑
                panel.style.maxHeight = 'none';
                panel.style.height = 'auto';
                panel.style.minHeight = '200px';
                panel.style.overflowY = 'auto';
                panel.style.backgroundColor = 'white';
            }
        } else {
            // 桌面端恢复
            const panel = document.getElementById(config.panelId);
            if (panel) {
                // 桌面端恢复为 absolute，跟随容器
                panel.style.position = 'absolute';
                panel.style.zIndex = '';
                panel.style.left = '';
                panel.style.top = '';
                panel.style.transform = '';
                panel.style.width = '320px';
                panel.style.bottom = '70px'; // 位于球体上方
                panel.style.right = '0';
                
                // 桌面端高度逻辑 (修复溢出)
                panel.style.maxHeight = '80vh'; // 限制最大高度
                panel.style.height = 'auto';
                panel.style.minHeight = '';
                panel.style.overflowY = 'auto'; // 允许滚动
            }
        }
    }

    fixMobilePanelPosition();
    window.addEventListener('resize', fixMobilePanelPosition);
}

// 新增：实现拖拽功能
function makeDraggable() {
    const container = document.getElementById(config.containerId);
    const orb = document.getElementById(config.orbId);
    
    if (!container || !orb) return;

    // 恢复保存的位置
    const savedPos = localStorage.getItem(config.positionKey);
    if (savedPos && window.innerWidth > 768) {
        try {
            const pos = JSON.parse(savedPos);
            // 简单的边界检查，防止元素完全跑出屏幕
            const maxX = window.innerWidth - 50;
            const maxY = window.innerHeight - 50;
            
            const safeLeft = Math.min(Math.max(0, pos.left), maxX);
            const safeTop = Math.min(Math.max(0, pos.top), maxY);

            container.style.left = safeLeft + 'px';
            container.style.top = safeTop + 'px';
            container.style.bottom = 'auto';
            container.style.right = 'auto';
        } catch (e) {
            console.error('恢复位置失败', e);
        }
    }

    let isDragging = false;
    let startX, startY, initialLeft, initialTop;
    let hasMoved = false;

    // 鼠标按下事件
    orb.addEventListener('mousedown', function(e) {
        if (window.innerWidth <= 768) return; // 移动端禁用拖拽逻辑，保持原样
        
        isDragging = true;
        hasMoved = false;
        
        // 获取鼠标初始位置
        startX = e.clientX;
        startY = e.clientY;
        
        // 获取容器当前位置
        const rect = container.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        
        // 设置 cursor
        orb.style.cursor = 'grabbing';
        
        e.preventDefault(); // 防止选中文本
    });

    // 鼠标移动事件 (绑定到 window 以防拖出元素)
    window.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        // 只有移动超过一定距离才算是拖拽，避免点击误判
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            hasMoved = true;
        }
        
        // 计算新位置
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;
        
        // 边界检查
        const maxX = window.innerWidth - container.offsetWidth;
        const maxY = window.innerHeight - container.offsetHeight;
        
        newLeft = Math.min(Math.max(0, newLeft), maxX);
        newTop = Math.min(Math.max(0, newTop), maxY);
        
        container.style.left = newLeft + 'px';
        container.style.top = newTop + 'px';
        container.style.bottom = 'auto';
        container.style.right = 'auto';
    });

    // 鼠标松开事件
    window.addEventListener('mouseup', function(e) {
        if (!isDragging) return;
        
        isDragging = false;
        orb.style.cursor = 'grab'; // 恢复鼠标样式
        
        if (hasMoved) {
            // 保存位置
            const pos = {
                left: parseInt(container.style.left),
                top: parseInt(container.style.top)
            };
            localStorage.setItem(config.positionKey, JSON.stringify(pos));
            
            // 标记这次操作是拖拽，给 click 事件用
            orb.setAttribute('data-was-dragged', 'true');
            // 短暂延迟后清除标记
            setTimeout(() => {
                orb.removeAttribute('data-was-dragged');
            }, 50);
        }
    });
}

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
                    <div class="keywords-section">
                        <div class="section-title">
                            <span>📝 关键词分类</span>
                            <span class="section-hint">(绿色=有效, 红色=无效)</span>
                        </div>
                        <div class="keywords-list" id="keywords-list">
                            <div class="empty-keywords">暂无关键词记录</div>
                        </div>
                    </div>
                    <div class="panel-actions">
                        <div class="buttons-row">
                            <button class="panel-btn primary short-btn" id="clear-keywords">清空所有</button>
                            <button class="panel-btn secondary short-btn" id="copy-all-keywords">复制关键词</button>
                            <button class="panel-btn secondary short-btn" id="clear-badge">清除角标</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', tanziHTML);
        addEssentialStyles();
    }
}

function addEssentialStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* 坛子容器定位 - 修改为支持拖拽 */
        .tanzi-container {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 10000;
            display: none;
            flex-direction: column;
            align-items: flex-end; /* 让子元素右对齐 */
        }

        /* 坛子球体样式优化 */
        .tanzi-orb {
            cursor: pointer; /* 默认手型 */
            transition: transform 0.2s, box-shadow 0.2s;
            /* 确保球体位于面板之上或旁边 */
            position: relative;
            z-index: 10002;
        }

        /* 大屏下添加抓取手势 */
        @media (min-width: 769px) {
            .tanzi-orb {
                cursor: grab;
            }
            .tanzi-orb:active {
                cursor: grabbing;
            }
        }

        /* 基础面板样式 - 关键修复 */
        .tanzi-panel {
            /* 桌面端改为绝对定位，相对于容器 */
            position: absolute;
            bottom: 200px; /* 位于球体上方 */
            right: 0;
            width: 350px;
            
            /* 修复1: 桌面端最大高度和滚动 */
            max-height: 100vh; 
            overflow-y: auto;
            
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 10001;
            display: none; /* 默认隐藏 */
            flex-direction: column;
            padding: 0;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;
            border: 1px solid rgba(0,0,0,0.05);
            
            /* 滚动条美化 */
            scrollbar-width: thin;
        }

        .panel-header {
            padding: 15px;
            background: #f5f7fa;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        
        .panel-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #999;
            padding: 0 5px;
        }

        .search-stats-section, .stats-section, .panel-actions {
            padding: 10px 15px;
            flex-shrink: 0;
        }

        .stats-section {
            background: #f8f9fa;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            padding: 12px 15px;
        }
        
        .stats-section .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .stats-section .stat-label {
            font-size: 12px;
            color: #666;
        }
        
        .stats-section .stat-value {
            font-size: 14px;
            font-weight: 600;
            color: #333;
        }
        
        .stats-section .highlight {
            color: #ff4757;
        }

        .keywords-section {
            padding: 10px 15px;
            background: #fafafa;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
            display: flex;
            flex-direction: column;
            min-height: 60px;
            /* 移除固定的 max-height，由 panel 的 flex 和 max-height 控制 */
            flex: 1; 
        }
        
        .keywords-header {
            flex-shrink: 0;
        }

        .panel-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        
        .keywords-list {
            display: flex;
            flex-direction: column;
            gap: 5px;
            /* 关键：让内容撑开，不设死高度，依赖父容器滚动 */
            min-height: 20px; 
            margin-top: 8px;
            padding-right: 2px;
        }
        
        .keyword-item {
            padding: 6px 10px;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
            min-height: 32px;
        }

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
            flex-shrink: 0;
        }
        
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
        
        .panel-actions {
            display: flex;
            border-top: 1px solid #eee;
            padding: 12px 15px;
        }
        
        .buttons-row {
            display: flex;
            width: 100%;
            gap: 8px;
            justify-content: space-between;
        }

        .short-btn {
            flex: 1;
            min-width: 0;
            padding: 8px 6px !important;
            font-size: 13px !important;
            height: 36px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .short-btn:hover {
            opacity: 0.85;
            transform: translateY(-1px);
        }
        
        .short-btn:active {
            transform: translateY(0);
        }
        
        .short-btn.primary {
            background: linear-gradient(135deg, #ff4757, #ff6b81);
            color: white;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(255, 71, 87, 0.2);
        }
        
        .short-btn.secondary {
            background: linear-gradient(135deg, #e0e0e0, #f0f0f0);
            color: #333;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        #hint-section {
            background: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 8px;
            padding: 12px;
            margin: 10px;
            font-size: 14px;
            color: #1976d2;
            animation: fadeIn 0.3s ease;
            flex-shrink: 0;
        }
        
        .section-title {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
        }
        
        .empty-keywords {
            text-align: center;
            color: #999;
            padding: 20px 0;
            font-size: 13px;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* 移动端适配 - 严格保持原样 */
        @media (max-width: 768px) {
            .tanzi-container {
                bottom: 15px !important;
                right: 15px !important;
                left: auto !important;
                top: auto !important;
                position: fixed !important;
            }
            
            .tanzi-orb {
                width: 50px !important;
                height: 50px !important;
                cursor: default !important; /* 移动端不显示抓手 */
            }
            
            .tanzi-panel {
                position: fixed !important;
                width: 90vw !important;
                max-width: 400px !important;
                left: 50% !important;
                right: auto !important;
                transform: translateX(-50%) !important;
                bottom: 100px !important;
                top: auto !important;
                
                height: 70vh !important;
                max-height: 70vh !important;
                min-height: 300px !important;
                overflow-y: auto !important;
                border: 1px solid #ddd;
                box-shadow: 0 0 100px rgba(0,0,0,0.2);
                background: white !important;
                border-radius: 12px !important;
            }
            
            .search-stats-section, .stats-section {
                padding: 8px 12px !important;
                min-height: auto !important;
                flex-shrink: 0 !important;
            }
            
            .stats-section {
                display: flex !important;
                flex-direction: column !important;
                gap: 6px !important;
            }
            
            .stats-section .stat-item {
                justify-content: flex-start !important;
            }
            
            .keywords-section {
                max-height: none !important;
                height: auto !important;
                min-height: 150px !important;
                overflow-y: visible !important;
                padding: 12px 15px !important;
                flex: 1 !important;
                display: flex !important;
                flex-direction: column !important;
            }
            
            .keywords-list {
                max-height: 30vh !important;
                min-height: 80px !important;
                overflow-y: auto !important;
                margin-top: 8px !important;
                flex: 1 !important;
                border: 1px solid #eee !important;
                border-radius: 6px !important;
                padding: 8px !important;
                background: white !important;
            }
            
            .keyword-item {
                font-size: 13px !important;
                padding: 10px 12px !important;
                min-height: 32px !important;
                word-break: break-word !important;
                white-space: normal !important;
                line-height: 1.4 !important;
                margin-bottom: 5px !important;
            }
            
            .keyword-text {
                flex: 1 !important;
                min-width: 0 !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                max-height: 44px !important;
                display: -webkit-box !important;
                -webkit-line-clamp: 2 !important;
                -webkit-box-orient: vertical !important;
            }
            
            .keyword-count {
                flex-shrink: 0 !important;
                margin-left: 8px !important;
                font-size: 10px !important;
                padding: 2px 6px !important;
                align-self: flex-start !important;
                margin-top: 3px !important;
            }
            
            .panel-title {
                font-size: 15px !important;
            }
            
            .panel-actions {
                padding: 10px 12px !important;
                flex-shrink: 0 !important;
            }
            
            .buttons-row {
                gap: 6px !important;
            }
            
            .short-btn {
                padding: 10px 4px !important;
                font-size: 12px !important;
                height: 38px !important;
                min-width: 60px !important;
                font-weight: 600 !important;
                border-radius: 8px !important;
            }
            
            #hint-section {
                margin: 8px !important;
                padding: 10px !important;
                font-size: 13px !important;
                line-height: 1.5 !important;
                flex-shrink: 0 !important;
            }
            
            #tanzi-confirm-dialog {
                width: 85vw !important;
                margin: 20px !important;
            }
            
            #tanzi-confirm-dialog > div {
                padding: 20px 16px !important;
            }
            
            #tanzi-confirm-cancel, #tanzi-confirm-ok {
                padding: 12px 16px !important;
                font-size: 15px !important;
                min-height: 44px !important;
            }
        }
        
        /* 桌面端滚动条美化 */
        .tanzi-panel::-webkit-scrollbar {
            width: 8px;
        }
        .tanzi-panel::-webkit-scrollbar-track {
            background: #f5f5f5;
            border-radius: 4px;
        }
        .tanzi-panel::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 4px;
        }
        .tanzi-panel::-webkit-scrollbar-thumb:hover {
            background: #aaa;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}

function interceptSearchFunction() {
    if (typeof window.performSearch === 'function') {
        originalPerformSearch = window.performSearch;
        window.performSearch = function() {
            const query = document.getElementById(config.searchInputId).value.trim();
            
            if (query === config.triggerKeyword) {
                showTanzi();
                return;
            }
            
            recordSearch();
            checkPeriodicHint(query);
            
            const result = originalPerformSearch.apply(this, arguments);
            
            setTimeout(() => {
                checkForHiddenPosts(query);
            }, 300);
            
            return result;
        };
    } else {
        window.performSearch = function() {
            const query = document.getElementById(config.searchInputId).value.trim();
            
            if (query === config.triggerKeyword) {
                showTanzi();
                return;
            }
            
            recordSearch();
            checkPeriodicHint(query);
            
            setTimeout(() => {
                checkForHiddenPosts(query);
            }, 300);
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

function bindEvents() {
    const orb = document.getElementById(config.orbId);
    const panel = document.getElementById(config.panelId);
    const panelClose = document.getElementById('tanzi-close');
    const clearBtn = document.getElementById('clear-keywords');
    const copyAllBtn = document.getElementById('copy-all-keywords');
    const clearBadgeBtn = document.getElementById('clear-badge');
    
    if (orb) {
        orb.addEventListener('click', function(e) {
            // 如果刚刚发生了拖拽，则不执行点击事件 (新增逻辑)
            if (orb.getAttribute('data-was-dragged') === 'true') {
                return;
            }

            e.stopPropagation();
            if (panel.style.display === 'block' || panel.style.display === 'flex') {
                panel.style.display = 'none';
                orb.classList.remove('active');
            } else {
                panel.style.display = 'flex';
                orb.classList.add('active');
                updateKeywordsDisplay();
                updateStats();
                updateSearchStats();
            }
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
            showConfirmDialog(
                '确定要清空所有已记录的关键词吗？',
                function() {
                    localStorage.setItem(config.storageKey, JSON.stringify({}));
                    localStorage.removeItem(config.uniqueSearchesKey);
                    uniqueSearchTerms.clear();
                    updateKeywordsDisplay();
                    updateStats();
                    updateBadge(0);
                    showMessage('关键词已清空', 'success');
                },
                function() {}
            );
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
    
    document.addEventListener('click', function(event) {
        const panel = document.getElementById(config.panelId);
        const orb = document.getElementById(config.orbId);
        const container = document.getElementById(config.containerId);
        
        if (panel && (panel.style.display === 'block' || panel.style.display === 'flex') && 
            !container.contains(event.target)) {
            panel.style.display = 'none';
            orb.classList.remove('active');
        }
    });

    if ('ontouchstart' in window) {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        if (orb) {
            orb.addEventListener('touchstart', function(e) {
            }, { passive: false });
        }
    }
}

function showConfirmDialog(message, onConfirm, onCancel) {
    const existingDialog = document.getElementById('tanzi-confirm-dialog');
    if (existingDialog) existingDialog.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'tanzi-confirm-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 20000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    
    const dialog = document.createElement('div');
    dialog.id = 'tanzi-confirm-dialog';
    dialog.style.cssText = `
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        width: 300px;
        max-width: 90vw;
        overflow: hidden;
        animation: slideUp 0.3s ease;
    `;
    
    dialog.innerHTML = `
        <div style="padding: 24px; text-align: center;">
            <div style="font-size: 16px; color: #333; margin-bottom: 20px; line-height: 1.5;">
                ${message}
            </div>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="tanzi-confirm-cancel" style="
                    padding: 10px 24px;
                    background: #f0f0f0;
                    border: none;
                    border-radius: 6px;
                    color: #666;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex: 1;
                ">取消</button>
                <button id="tanzi-confirm-ok" style="
                    padding: 10px 24px;
                    background: linear-gradient(135deg, #ff4757, #ff6b81);
                    border: none;
                    border-radius: 6px;
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex: 1;
                ">确定</button>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        #tanzi-confirm-cancel:hover {
            background: #e0e0e0 !important;
            transform: translateY(-1px);
        }
        #tanzi-confirm-ok:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        #tanzi-confirm-cancel:active, #tanzi-confirm-ok:active {
            transform: translateY(0);
        }
    `;
    
    dialog.appendChild(style);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    const cancelBtn = document.getElementById('tanzi-confirm-cancel');
    const okBtn = document.getElementById('tanzi-confirm-ok');
    
    function closeDialog() {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }
    
    cancelBtn.addEventListener('click', function() {
        closeDialog();
        if (typeof onCancel === 'function') onCancel();
    });
    
    okBtn.addEventListener('click', function() {
        closeDialog();
        if (typeof onConfirm === 'function') onConfirm();
    });
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeDialog();
            if (typeof onCancel === 'function') onCancel();
        }
    });
}

function showTanzi() {
    const container = document.getElementById(config.containerId);
    if (container) {
        container.style.display = 'block';
        showMessage('坛子出现啦！我会帮你智能记录过期帖子的关键词~', 'success');
        
        const panel = document.getElementById(config.panelId);
        const orb = document.getElementById(config.orbId);
        panel.style.display = 'flex';
        orb.classList.add('active');
        
        updateKeywordsDisplay();
        updateStats();
        updateSearchStats();
    }
}

function checkForHiddenPosts(query) {
    if (!query || query === config.triggerKeyword) return;
    
    const foundHiddenPosts = findHiddenPostsInResults(query);
    const hasFoundPosts = foundHiddenPosts.length > 0;
    
    recordKeyword(query, hasFoundPosts, foundHiddenPosts.length);
    
    updateKeywordsDisplay();
    updateStats();
    updateSearchStats();
    
    if (hasFoundPosts) {
        showMessage(`🎉 发现 ${foundHiddenPosts.length} 个隐藏帖子！关键词 "${query}" 已记录`, 'success');
    } else {
        showMessage(`未发现隐藏帖子`, 'info');
    }
}

function findHiddenPostsInResults(query) {
    const foundPosts = [];
    
    if (!window.hiddenPosts || !Array.isArray(window.hiddenPosts)) {
        return foundPosts;
    }
    
    const lowerQuery = query.toLowerCase();
    
    window.hiddenPosts.forEach(post => {
        if (post.searchKeyword) {
            const keywords = post.searchKeyword.split(',').map(k => k.trim().toLowerCase());
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

function updateSearchStats() {
    const searchCountElement = document.getElementById('search-count');
    if (searchCountElement) {
        searchCountElement.textContent = searchCount;
    }
}

function calculateTotalHiddenPosts() {
    if (window.hiddenPosts && Array.isArray(window.hiddenPosts)) {
        return window.hiddenPosts.length;
    }
    return 35;
}

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

function showMessage(message, type = 'info') {
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

function updateDisplay() {
    const keywordsData = getStoredKeywords();
    const validCount = Object.values(keywordsData).filter(k => k.valid).length;
    updateBadge(validCount);
    updateSearchStats();
}

init();

window.tanzi = {
    show: showTanzi,
    getKeywords: getStoredKeywords,
    clearKeywords: function() {
        localStorage.setItem(config.storageKey, JSON.stringify({}));
        localStorage.removeItem(config.uniqueSearchesKey);
        uniqueSearchTerms.clear();
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
            uniqueSearches: uniqueSearchTerms.size,
            validKeywords: Object.values(keywordsData).filter(k => k.valid).length,
            invalidKeywords: Object.values(keywordsData).filter(k => !k.valid).length,
            totalHiddenPosts: calculateTotalHiddenPosts()
        };
    },
    version: '2.4.0'
};

})();