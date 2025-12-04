/**

坛子 - 隐藏帖子助手

版本: 2.3.2 (修复移动端面板显示问题)

功能：搜索"坛子"时出现，智能记录隐藏帖子关键词，显示搜索统计，每7次不重复搜索出现一条提示
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
    uniqueSearchesKey: 'tanzi_unique_searches' // 新增：存储不重复搜索记录的键
};

// 存储原始函数引用
let originalPerformSearch = null;
let searchCount = 0;
let uniqueSearchTerms = new Set(); // 新增：记录不重复搜索词

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

// 新增：加载不重复搜索词
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

// 新增：保存不重复搜索词
function saveUniqueSearches() {
    try {
        localStorage.setItem(config.uniqueSearchesKey, JSON.stringify([...uniqueSearchTerms]));
    } catch (e) {
        console.error('保存不重复搜索词失败:', e);
    }
}

// 新增：检查是否需要显示周期性提示
function checkPeriodicHint(query) {
    // 只对非坛子关键词的搜索进行计数
    if (query !== config.triggerKeyword) {
        // 如果是新的不重复搜索词
        if (!uniqueSearchTerms.has(query)) {
            uniqueSearchTerms.add(query);
            saveUniqueSearches();
            
            // 检查是否达到7的倍数
            if (uniqueSearchTerms.size % 7 === 0) {
                showPeriodicHint();
            }
        }
    }
}

// 新增：显示周期性提示
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
        "嘿!如果你发现隐藏关键词但是没有显示帖子,可能素更高级用户才能查看的帖子哦~",
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
        "嘿!如果你发现隐藏关键词但是没有显示帖子,可能素更高级用户才能查看的帖子哦~",
        "旧论坛有提到《xxx则》，解字谜可得五字书籍哦",
        "小符咒游戏可以得到一个提取码哦~",
        "提取到的某卷书~可解出一个四字家族名哦~Y开头X结尾~注意观察xx后裔~",
        "连出天秤座星象得到一串密文，用base64解开素？",
        "解出的4个字是8字书的前半部分哦，后半部分在守秘录里倒着揪尾巴~",
        "8字书名缩写是YLCJMSZS，你猜对了吗？",
        "神秘用户的用户名要使用栅栏密码哦~嫌麻烦也可以刷新大搜索页面截屏红色字体~",
        "神秘用户的密码是一句话哦~支线末尾的英文单词合起来~顺序可以看看歌词~数字只有一个，在第二位哦~"
    ];
    
    // 计算当前是第几轮触发 (例如: 7/7=1, 14/7=2, 21/7=3)
    const round = uniqueSearchTerms.size / 7;
    
    // 计算对应的数组索引 (数组从0开始，所以要减1)
    // 例如: 第1轮->索引0, 第2轮->索引1
    let index = round - 1;
    
    // 取余数，防止溢出 (如果轮数超过了提示语总数，就回到开头循环)
    index = index % hints.length;
    
    const msg = hints[index];
    
    // 将提示信息显示在面板上
    showHintInPanel(msg);
}

// 新增：在面板上显示提示信息（持久化，直到下一次提示）
function showHintInPanel(hintMessage) {
    const panel = document.getElementById(config.panelId);
    if (!panel) return;
    
    // 检查是否已存在提示区域
    let hintSection = panel.querySelector('#hint-section');
    if (!hintSection) {
        // 创建提示区域（注意：不再设置 display:none）
        hintSection = document.createElement('div');
        hintSection.id = 'hint-section';
        hintSection.style.cssText = `
            background: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 8px;
            padding: 12px;
            margin: 10px;
            font-size: 14px;
            color: #1976d2;
            /* display 默认为 block，不隐藏 */
        `;
        
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
    hintSection.style.display = 'block'; // 确保显示（即使之前被意外隐藏）
}

// 修改 setupFunctionality，在移动端动态修复面板位置
function setupFunctionality() {
    createTanziUI();
    interceptSearchFunction();
    bindEvents();
    updateDisplay();

    // 👇 修复移动端面板溢出问题（动态调整）
    function fixMobilePanelPosition() {
        if (window.innerWidth <= 768) {
            const panel = document.getElementById(config.panelId);
            if (panel) {
                // 强制使用 fixed 定位
                panel.style.position = 'fixed';
                panel.style.zIndex = '10001';
                // 居中显示
                panel.style.left = '50%';
                panel.style.right = 'auto';
                panel.style.transform = 'translateX(-50%)';
                panel.style.width = '90vw';
                
                // 调整底部距离，避免遮挡
                panel.style.bottom = '80px';
                
                // 限制最大高度，允许内部滚动
                panel.style.maxHeight = '70vh';
                panel.style.overflowY = 'auto';
                
                // 确保背景不透明
                panel.style.backgroundColor = 'white';
            }
        } else {
            // 桌面端恢复
            const panel = document.getElementById(config.panelId);
            if (panel) {
                panel.style.left = '';
                panel.style.transform = '';
            }
        }
    }

    // 初始化时修复
    fixMobilePanelPosition();
    // 监听窗口 resize（例如横竖屏切换）
    window.addEventListener('resize', fixMobilePanelPosition);
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
    // 注意：这里修复了.tanzi-panel的基础样式，使其在任何情况下都有背景和定位
    style.textContent = `
        /* 坛子容器定位 */
        .tanzi-container {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 10000;
        }

        /* 基础面板样式 - 关键修复 */
        .tanzi-panel {
            position: fixed;
            bottom: 90px;
            right: 30px;
            width: 320px;
            background: #ffffff; /* 必须有背景色 */
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 10001;
            display: none; /* 默认隐藏 */
            flex-direction: column;
            padding: 0;
            overflow: hidden;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;
            border: 1px solid rgba(0,0,0,0.05);
        }

        .panel-header {
            padding: 15px;
            background: #f5f7fa;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
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
        }

        .keywords-section {
            padding: 10px 15px;
            max-height: 200px;
            overflow-y: auto;
            background: #fafafa;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
        }

        /* 移动端适配 */
        @media (max-width: 768px) {
            .tanzi-container {
                bottom: 15px !important;
                right: 15px !important;
            }
            
            .tanzi-orb {
                width: 50px !important;
                height: 50px !important;
            }
            
            /* 移动端面板强制样式 */
            .tanzi-panel {
                position: fixed !important;
                width: 90vw !important;
                max-width: none !important;
                
                /* 水平居中 */
                left: 50% !important;
                right: auto !important;
                transform: translateX(-50%) !important;
                
                /* 位于球体上方 */
                bottom: 80px !important;
                
                max-height: 60vh !important;
                overflow-y: auto !important;
                border: 1px solid #ddd;
                box-shadow: 0 0 100px rgba(0,0,0,0.2); /* 更加明显的阴影 */
            }
            
            .panel-title {
                font-size: 15px !important;
            }
            
            .keyword-item {
                font-size: 13px !important;
                padding: 8px 10px !important;
            }
            
            .panel-btn {
                font-size: 13px !important;
                padding: 8px !important;
            }
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
        }
        
        .keyword-item {
            padding: 6px 10px;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
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
        
        .panel-actions {
            display: flex;
            gap: 10px;
            border-top: 1px solid #eee;
        }

        /* 按钮自适应 */
        .panel-btn {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 0;
            flex: 1;
            padding: 8px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: opacity 0.2s;
        }
        
        .panel-btn:hover {
            opacity: 0.8;
        }
        
        .panel-btn.primary {
            background: #ff4757;
            color: white;
        }
        
        .panel-btn.secondary {
            background: #e0e0e0;
            color: #333;
        }
        
        /* 提示信息样式 */
        #hint-section {
            background: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 8px;
            padding: 12px;
            margin: 10px;
            font-size: 14px;
            color: #1976d2;
            animation: fadeIn 0.3s ease;
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
        }
        
        .highlight {
            color: #ff4757;
            font-weight: bold;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
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
            
            // 检查是否需要显示周期性提示
            checkPeriodicHint(query);
            
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
            
            // 检查是否需要显示周期性提示
            checkPeriodicHint(query);
            
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
            // 切换显示状态
            if (panel.style.display === 'block' || panel.style.display === 'flex') {
                panel.style.display = 'none';
                orb.classList.remove('active');
            } else {
                panel.style.display = 'flex'; // 使用 flex 布局
                orb.classList.add('active');
                updateKeywordsDisplay();
                updateStats();
                updateSearchStats();
            }
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
                // 同时清空不重复搜索记录
                localStorage.removeItem(config.uniqueSearchesKey);
                uniqueSearchTerms.clear();
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
        
        if (panel && (panel.style.display === 'block' || panel.style.display === 'flex') && 
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
                // e.preventDefault(); // 可能会阻止点击，视情况而定
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
        panel.style.display = 'flex'; // 使用 flex
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
        localStorage.removeItem(config.uniqueSearchesKey); // 同时清空不重复搜索记录
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
    version: '2.3.2'
};


})();
