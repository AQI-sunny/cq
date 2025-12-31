/**
 * 蓝白简约风格访问记录管理器
 * 双击展开/收起，按住拖动
 */
(function () {
    'use strict';

    // 配置常量
    const CONFIG = {
        STORAGE_KEY: 'visited_pages_tracker',
        MAX_RECORDS: 50,
        COLLAPSED_WIDTH_PC: '120px', // PC端收缩宽度
        COLLAPSED_WIDTH_MOBILE: '100px' // 移动端收缩宽度
    };

    // 工具函数
    const Utils = {
        getCurrentPagePath() {
            return window.location.pathname.split('/').pop() || 'index.html';
        },

        formatTime(date) {
            return new Date(date).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        saveRecords(records) {
            try {
                const data = {
                    records: records,
                    timestamp: Date.now()
                };
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
            } catch (e) {
                console.warn('存储访问记录失败:', e);
            }
        },

        getRecords() {
            try {
                const data = localStorage.getItem(CONFIG.STORAGE_KEY);
                if (!data) return [];

                const parsed = JSON.parse(data);
                if (Date.now() - parsed.timestamp > 30 * 24 * 60 * 60 * 1000) {
                    localStorage.removeItem(CONFIG.STORAGE_KEY);
                    return [];
                }

                return parsed.records || [];
            } catch (e) {
                console.warn('读取访问记录失败:', e);
                return [];
            }
        },

        addRecord(pageName) {
            const records = this.getRecords();
            const existingIndex = records.findIndex(r => r.page === pageName);

            if (existingIndex !== -1) {
                records.splice(existingIndex, 1);
            }

            records.unshift({
                page: pageName,
                title: document.title || pageName,
                timestamp: Date.now(),
                formattedTime: this.formatTime(Date.now())
            });

            if (records.length > CONFIG.MAX_RECORDS) {
                records.splice(CONFIG.MAX_RECORDS);
            }

            this.saveRecords(records);
            return records;
        },

        // 判断是否为移动端
        isMobile() {
            return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
        },

        // 获取收缩宽度
        getCollapsedWidth() {
            return this.isMobile() ? CONFIG.COLLAPSED_WIDTH_MOBILE : CONFIG.COLLAPSED_WIDTH_PC;
        }
    };

    class UIManager {
        constructor() {
            this.isExpanded = false;
            this.isDragging = false;
            this.container = null;
            this.dragStartX = 0;
            this.dragStartY = 0;
            this.containerStartX = 0;
            this.containerStartY = 0;
            this.lastClickTime = 0;
            this.doubleClickDelay = 300; // 双击延迟（毫秒）
            this.holdTimer = null;
            this.holdDelay = 500; // 长按延迟（毫秒）
            this.init();
        }

        init() {
            this.createUI();
            this.bindEvents();
            this.loadRecords();
            this.collapse(); // 默认收起
        }

        createUI() {
            this.container = document.createElement('div');
            this.container.id = 'visit-tracker-container';
            this.container.innerHTML = `
                <div id="visit-tracker-header">
                    <div id="visit-tracker-title">访问记录</div>
                    <button id="visit-tracker-toggle">▶</button>
                </div>
                <div id="visit-tracker-content">
                    <div id="visit-tracker-list"></div>
                    <div id="visit-tracker-controls">
                        <button id="visit-tracker-clear">清空</button>
                        <button id="visit-tracker-refresh">刷新</button>
                    </div>
                </div>
            `;

            this.addStyles();
            document.body.appendChild(this.container);
            this.setInitialPosition();
        }

        addStyles() {
            const style = document.createElement('style');
            style.textContent = `
                #visit-tracker-container {
                    position: fixed;
                    z-index: 9999;
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                    background: #ffffff;
                    border: 1px solid #d0e7ff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 82, 204, 0.15);
                    max-width: 280px;
                    min-width: 100px;
                    overflow: hidden;
                    transition: width 0.3s ease-in-out, max-height 0.3s ease-in-out;
                    user-select: none;
                    cursor: default;
                }

                #visit-tracker-container.collapsed {
                    width: ${CONFIG.COLLAPSED_WIDTH_PC};
                    min-width: 100px;
                }

                #visit-tracker-container.expanded {
                    width: 280px !important;
                }

                #visit-tracker-container.dragging {
                    opacity: 0.9;
                    box-shadow: 0 4px 20px rgba(0, 82, 204, 0.3);
                    cursor: move;
                }

                #visit-tracker-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 12px;
                    background: #f0f8ff;
                    cursor: pointer;
                    user-select: none;
                    overflow: hidden;
                }

                #visit-tracker-header:hover {
                    background: #e6f0ff;
                }

                #visit-tracker-title {
                    font-size: 13px;
                    font-weight: bold;
                    color: #0052cc;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    flex: 1;
                }

                #visit-tracker-toggle {
                    background: none;
                    border: none;
                    font-size: 14px;
                    color: #0052cc;
                    cursor: pointer;
                    padding: 2px;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.3s ease;
                    flex-shrink: 0;
                }

                #visit-tracker-toggle:hover {
                    background-color: rgba(0, 82, 204, 0.1);
                    border-radius: 4px;
                }

                #visit-tracker-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-in-out;
                }

                #visit-tracker-container.visit-tracker-expanded #visit-tracker-content {
                    max-height: 300px;
                }

                #visit-tracker-list {
                    padding: 8px 0;
                    max-height: 220px;
                    overflow-y: auto;
                    overflow-x: hidden;
                }

                .visit-record {
                    padding: 6px 12px;
                    border-bottom: 1px solid #e6f0ff;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    overflow: hidden;
                }

                .visit-record:last-child {
                    border-bottom: none;
                }

                .visit-record:hover {
                    background-color: #f0f8ff;
                }

                .visit-record-title {
                    font-size: 12px;
                    color: #003366;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 100%;
                }

                .visit-record-time {
                    font-size: 10px;
                    color: #6699cc;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 100%;
                }

                #visit-tracker-controls {
                    display: flex;
                    gap: 6px;
                    padding: 8px 12px 10px;
                    border-top: 1px solid #e6f0ff;
                }

                #visit-tracker-controls button {
                    flex: 1;
                    padding: 5px 8px;
                    font-size: 11px;
                    border: 1px solid #b3d1ff;
                    border-radius: 4px;
                    background: #e6f0ff;
                    color: #0052cc;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                #visit-tracker-controls button:hover {
                    background: #cce6ff;
                }

                /* 移动端适配 */
                @media (max-width: 768px) {
                    #visit-tracker-container {
                        max-width: 280px;
                        min-width: 100px;
                    }
                    
                    #visit-tracker-container.collapsed {
                        width: ${CONFIG.COLLAPSED_WIDTH_MOBILE} !important;
                        min-width: 100px;
                    }
                    
                    #visit-tracker-container.expanded {
                        width: 90vw !important;
                        max-width: 280px;
                    }
                    
                    #visit-tracker-container.visit-tracker-expanded.expanded {
                        left: 5vw !important;
                        right: auto !important;
                    }
                    
                    #visit-tracker-title {
                        font-size: 12px;
                    }
                    
                    .visit-record {
                        padding: 8px 10px;
                    }
                    
                    .visit-record-title {
                        font-size: 11px;
                    }
                    
                    .visit-record-time {
                        font-size: 9px;
                    }
                    
                    #visit-tracker-controls button {
                        font-size: 10px;
                        padding: 4px 6px;
                    }
                    
                    #visit-tracker-container.visit-tracker-expanded #visit-tracker-content {
                        max-height: 400px;
                    }
                    
                    #visit-tracker-header {
                        -webkit-tap-highlight-color: transparent;
                    }
                }

                /* 空状态提示 */
                .visit-tracker-empty {
                    text-align: center;
                    color: #999;
                    padding: 16px;
                    font-size: 11px;
                    white-space: nowrap;
                }
            `;
            document.head.appendChild(style);
        }

        bindEvents() {
            const toggleBtn = document.getElementById('visit-tracker-toggle');
            const clearBtn = document.getElementById('visit-tracker-clear');
            const refreshBtn = document.getElementById('visit-tracker-refresh');
            const header = document.getElementById('visit-tracker-header');

            // 绑定折叠/展开事件
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.toggle();
            });

            // 双击事件
            header.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.toggle();
            });

            // 单次点击事件（用于移动端双击检测）
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.handleSingleClick();
            });

            // 绑定按钮事件
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearRecords();
            });

            refreshBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadRecords();
            });

            // 绑定拖动事件
            this.bindDragEvents();

            // 防止内容区域点击影响
            const content = document.getElementById('visit-tracker-content');
            if (content) {
                content.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }

            // 窗口大小改变时调整位置
            window.addEventListener('resize', () => {
                this.adjustPosition();
            });
        }

        bindDragEvents() {
            const header = document.getElementById('visit-tracker-header');
            
            // 鼠标按下 - 开始长按计时
            header.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.startHoldTimer(e);
            });

            // 鼠标移动 - 拖动（使用箭头函数绑定正确的this）
            document.addEventListener('mousemove', (e) => {
                this.handleMouseDrag(e);
            });

            // 鼠标释放 - 停止拖动
            document.addEventListener('mouseup', (e) => {
                this.stopDrag();
            });

            // 触摸开始 - 移动端长按
            header.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.startHoldTimer(e.touches[0], true);
                }
            }, { passive: false });

            // 触摸移动 - 移动端拖动
            document.addEventListener('touchmove', (e) => {
                if (e.touches.length === 1) {
                    this.handleTouchDrag(e);
                }
            }, { passive: false });

            // 触摸结束 - 停止拖动
            document.addEventListener('touchend', (e) => {
                this.stopDrag();
            });
        }

        handleSingleClick() {
            const currentTime = Date.now();
            const timeDiff = currentTime - this.lastClickTime;
            
            // 如果是双击
            if (timeDiff < this.doubleClickDelay) {
                this.toggle();
                this.lastClickTime = 0;
            } else {
                // 记录第一次点击时间
                this.lastClickTime = currentTime;
            }
        }

        startHoldTimer(e, isTouch = false) {
            // 清除之前的计时器
            if (this.holdTimer) {
                clearTimeout(this.holdTimer);
            }
            
            // 记录开始位置
            const clientX = isTouch ? e.clientX : e.clientX;
            const clientY = isTouch ? e.clientY : e.clientY;
            
            this.dragStartX = clientX;
            this.dragStartY = clientY;
            
            const rect = this.container.getBoundingClientRect();
            this.containerStartX = rect.left;
            this.containerStartY = rect.top;
            
            // 设置长按计时器
            this.holdTimer = setTimeout(() => {
                this.startDragging();
            }, this.holdDelay);
        }

        startDragging() {
            this.isDragging = true;
            this.container.classList.add('dragging');
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'move';
        }

        handleMouseDrag(e) {
            if (!this.isDragging) return;
            
            if (e && e.preventDefault) {
                e.preventDefault();
            }
            
            this.updatePosition(e.clientX - this.dragStartX, e.clientY - this.dragStartY);
        }

        handleTouchDrag(e) {
            if (!this.isDragging || !e.touches || e.touches.length !== 1) return;
            
            if (e && e.preventDefault) {
                e.preventDefault();
            }
            
            const touch = e.touches[0];
            this.updatePosition(touch.clientX - this.dragStartX, touch.clientY - this.dragStartY);
        }

        updatePosition(deltaX, deltaY) {
            const newX = this.containerStartX + deltaX;
            const newY = this.containerStartY + deltaY;
            
            const safeArea = 10;
            const containerRect = this.container.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // 限制在视口范围内
            const boundedX = Math.max(safeArea, Math.min(newX, viewportWidth - containerRect.width - safeArea));
            const boundedY = Math.max(safeArea, Math.min(newY, viewportHeight - containerRect.height - safeArea));
            
            this.container.style.left = `${boundedX}px`;
            this.container.style.top = `${boundedY}px`;
            this.container.style.right = 'auto';
            this.container.style.bottom = 'auto';
        }

        stopDrag() {
            // 清除长按计时器
            if (this.holdTimer) {
                clearTimeout(this.holdTimer);
                this.holdTimer = null;
            }
            
            // 停止拖动
            if (this.isDragging) {
                this.isDragging = false;
                this.container.classList.remove('dragging');
                document.body.style.userSelect = '';
                document.body.style.cursor = '';
                
                // 保存位置
                this.savePosition();
            }
            
            // 重置拖动相关状态
            this.dragStartX = 0;
            this.dragStartY = 0;
            this.containerStartX = 0;
            this.containerStartY = 0;
        }

        setInitialPosition() {
            const savedPosition = this.getSavedPosition();
            
            if (savedPosition && savedPosition.x && savedPosition.y) {
                this.container.style.left = `${savedPosition.x}px`;
                this.container.style.top = `${savedPosition.y}px`;
                this.container.style.right = 'auto';
                this.container.style.bottom = 'auto';
                
                // 恢复展开状态
                if (savedPosition.isExpanded) {
                    this.expand();
                }
            } else {
                // 默认位置：右下角
                this.container.style.right = '16px';
                this.container.style.bottom = '16px';
                this.collapse();
            }
        }

        adjustPosition() {
            if (this.container.style.left && this.container.style.left !== 'auto') {
                const rect = this.container.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                // 检查是否在视口外
                if (rect.right > viewportWidth || rect.bottom > viewportHeight) {
                    // 重置到安全位置
                    this.container.style.right = '16px';
                    this.container.style.bottom = '16px';
                    this.container.style.left = 'auto';
                    this.container.style.top = 'auto';
                    this.savePosition();
                }
            }
        }

        savePosition() {
            const rect = this.container.getBoundingClientRect();
            const position = {
                x: rect.left,
                y: rect.top,
                isExpanded: this.isExpanded,
                timestamp: Date.now()
            };
            
            try {
                localStorage.setItem(`${CONFIG.STORAGE_KEY}_position`, JSON.stringify(position));
            } catch (e) {
                console.warn('保存位置失败:', e);
            }
        }

        getSavedPosition() {
            try {
                const data = localStorage.getItem(`${CONFIG.STORAGE_KEY}_position`);
                if (!data) return null;
                
                const parsed = JSON.parse(data);
                return parsed;
            } catch (e) {
                return null;
            }
        }

        toggle() {
            this.isExpanded = !this.isExpanded;
            if (this.isExpanded) {
                this.expand();
            } else {
                this.collapse();
            }
        }

        expand() {
            this.isExpanded = true;
            
            // 确保移除所有相关类
            this.container.classList.remove('collapsed');
            this.container.classList.add('expanded', 'visit-tracker-expanded');
            
            // 更新按钮状态
            const toggleBtn = document.getElementById('visit-tracker-toggle');
            if (toggleBtn) {
                toggleBtn.textContent = '▼';
            }
            
            // 移动端展开时居中显示
            if (Utils.isMobile()) {
                const viewportWidth = window.innerWidth;
                const containerWidth = Math.min(280, viewportWidth * 0.9);
                const left = (viewportWidth - containerWidth) / 2;
                this.container.style.left = `${left}px`;
                this.container.style.right = 'auto';
                this.container.style.width = `${containerWidth}px`;
            }
            
            this.savePosition();
            this.loadRecords(); // 确保内容加载
        }

        collapse() {
            this.isExpanded = false;
            
            // 确保移除所有相关类
            this.container.classList.remove('expanded', 'visit-tracker-expanded');
            this.container.classList.add('collapsed');
            
            // 更新按钮状态
            const toggleBtn = document.getElementById('visit-tracker-toggle');
            if (toggleBtn) {
                toggleBtn.textContent = '▶';
            }
            
            // 恢复收缩宽度
            const collapsedWidth = Utils.getCollapsedWidth();
            this.container.style.width = collapsedWidth;
            
            this.savePosition();
        }

        loadRecords() {
            const records = Utils.getRecords();
            const listElement = document.getElementById('visit-tracker-list');

            if (!listElement) {
                console.warn('listElement not found');
                return;
            }

            if (records.length === 0) {
                listElement.innerHTML = '<div class="visit-tracker-empty">暂无访问记录</div>';
                return;
            }

            listElement.innerHTML = records.map(record => `
                <div class="visit-record" data-page="${record.page}">
                    <div class="visit-record-title" title="${record.title}">${record.title}</div>
                    <div class="visit-record-time">${record.formattedTime}</div>
                </div>
            `).join('');

            document.querySelectorAll('.visit-record').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const page = item.getAttribute('data-page');
                    this.navigateToPage(page);
                });
                
                // 添加触摸事件支持
                item.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                });
            });
        }

        navigateToPage(pageName) {
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            const targetUrl = basePath + pageName;

            // 使用更可靠的方法检查页面
            if (pageName === Utils.getCurrentPagePath()) {
                return; // 已经是当前页面
            }

            // 尝试访问页面
            const link = document.createElement('a');
            link.href = targetUrl;
            link.style.display = 'none';
            document.body.appendChild(link);
            
            try {
                // 使用传统方法跳转
                window.location.href = targetUrl;
            } catch (e) {
                alert('无法访问页面: ' + pageName);
            }
        }

        clearRecords() {
            if (confirm('确定要清空所有访问记录吗？')) {
                Utils.saveRecords([]);
                this.loadRecords();
            }
        }
    }

    function init() {
        console.log('VisitTracker initializing...');
        
        // 检查容器是否已存在
        if (document.getElementById('visit-tracker-container')) {
            console.log('VisitTracker already initialized');
            return;
        }
        
        const currentPage = Utils.getCurrentPagePath();
        Utils.addRecord(currentPage);
        
        try {
            new UIManager();
            console.log('VisitTracker initialized successfully');
        } catch (error) {
            console.error('VisitTracker initialization failed:', error);
        }

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => {
                    Utils.addRecord(Utils.getCurrentPagePath());
                }, 1000);
            }
        });

        if ('onpageshow' in window) {
            window.addEventListener('pageshow', () => {
                Utils.addRecord(Utils.getCurrentPagePath());
            });
        }
    }

    function isTaptapMiniProgram() {
        return /TTPWebView/.test(navigator.userAgent) ||
               (typeof tt !== 'undefined' && tt.miniProgram);
    }

    function checkCompatibility() {
        return typeof Storage !== 'undefined' &&
               typeof localStorage !== 'undefined' &&
               typeof JSON !== 'undefined';
    }

    // 等待DOM完全加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded fired');
            if (checkCompatibility()) {
                setTimeout(init, 100); // 稍微延迟确保所有元素加载完成
            }
        });
    } else {
        console.log('DOM already loaded');
        if (checkCompatibility()) {
            setTimeout(init, 100);
        }
    }

    window.VisitTracker = {
        addRecord: Utils.addRecord,
        getRecords: Utils.getRecords,
        clearRecords: () => Utils.saveRecords([]),
        isTaptapMiniProgram: isTaptapMiniProgram,
        getContainer: () => document.getElementById('visit-tracker-container'),
        togglePanel: function() {
            const container = document.getElementById('visit-tracker-container');
            if (container) {
                if (container.classList.contains('expanded')) {
                    container.classList.remove('expanded', 'visit-tracker-expanded');
                    container.classList.add('collapsed');
                    document.getElementById('visit-tracker-toggle').textContent = '▶';
                } else {
                    container.classList.remove('collapsed');
                    container.classList.add('expanded', 'visit-tracker-expanded');
                    document.getElementById('visit-tracker-toggle').textContent = '▼';
                }
            }
        }
    };
})();