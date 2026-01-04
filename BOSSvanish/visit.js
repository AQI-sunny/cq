/**
 * 蓝白简约风格访问记录管理器
 * 简化版：点击展开/收起，长按拖动
 * 使用Shadow DOM实现样式隔离
 * 移动端初始位置固定在底部正中间
 */
(function () {
    'use strict';

    const CONFIG = {
        STORAGE_KEY: 'visited_pages_tracker',
        MAX_RECORDS: 50,
        COLLAPSED_WIDTH: '100px',
        MOBILE_BOTTOM: 20,
        DESKTOP_BOTTOM: 20,
        DESKTOP_LEFT: 20
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

        isMobile() {
            return window.innerWidth <= 768;
        }
    };

    class VisitTracker {
        constructor() {
            this.isExpanded = false;
            this.isDragging = false;
            this.shadowRoot = null;
            this.dragStartX = 0;
            this.dragStartY = 0;
            this.containerStartX = 0;
            this.containerStartY = 0;
            this.pressTimer = null;
            this.init();
        }

        init() {
            this.createShadowDOM();
            this.createUI();
            this.loadRecords();
            this.collapse();
            this.setInitialPosition();
            this.setupResizeListener();
        }

        createShadowDOM() {
            // 创建宿主容器
            this.container = document.createElement('div');
            this.container.id = 'visit-tracker-container';
            document.body.appendChild(this.container);
            
            // 创建Shadow DOM
            this.shadowRoot = this.container.attachShadow({ mode: 'open' });
        }

        createUI() {
            // 创建样式（在Shadow DOM内部，不会受外部影响）
            const style = document.createElement('style');
            style.textContent = `
                :host {
                    all: initial !important;
                    display: block !important;
                    position: fixed !important;
                    z-index: 9999 !important;
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important;
                    box-sizing: border-box !important;
                }
                
                .tracker-container {
                    all: initial !important;
                    display: block !important;
                    background: white !important;
                    border: 1px solid #d0e7ff !important;
                    border-radius: 8px !important;
                    box-shadow: 0 2px 10px rgba(0, 82, 204, 0.15) !important;
                    overflow: hidden !important;
                    transition: all 0.3s ease !important;
                    cursor: default !important;
                    user-select: none !important;
                    box-sizing: border-box !important;
                    width: 100px !important;
                }
                
                .tracker-container.expanded {
                    width: 280px !important;
                }
                
                .tracker-container.dragging {
                    cursor: move !important;
                    opacity: 0.9 !important;
                    box-shadow: 0 4px 20px rgba(0, 82, 204, 0.3) !important;
                }
                
                .tracker-header {
                    all: initial !important;
                    display: flex !important;
                    padding: 10px 12px !important;
                    background: #f0f8ff !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    cursor: pointer !important;
                    box-sizing: border-box !important;
                    border-bottom: none !important;
                }
                
                .tracker-title {
                    all: initial !important;
                    display: block !important;
                    font-size: 13px !important;
                    font-weight: bold !important;
                    color: #0052cc !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                    font-family: inherit !important;
                }
                
                .tracker-toggle {
                    all: initial !important;
                    display: flex !important;
                    background: none !important;
                    border: none !important;
                    font-size: 14px !important;
                    color: #0052cc !important;
                    cursor: pointer !important;
                    padding: 2px !important;
                    width: 20px !important;
                    height: 20px !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-family: inherit !important;
                }
                
                .tracker-content {
                    all: initial !important;
                    display: block !important;
                    max-height: 0 !important;
                    overflow: hidden !important;
                    transition: max-height 0.3s ease !important;
                }
                
                .tracker-container.expanded .tracker-content {
                    max-height: 300px !important;
                }
                
                .tracker-list {
                    all: initial !important;
                    display: block !important;
                    padding: 8px 0 !important;
                    max-height: 220px !important;
                    overflow-y: auto !important;
                    box-sizing: border-box !important;
                }
                
                .visit-record {
                    all: initial !important;
                    display: block !important;
                    padding: 8px 12px !important;
                    border-bottom: 1px solid #e6f0ff !important;
                    cursor: pointer !important;
                    box-sizing: border-box !important;
                }
                
                .visit-record:hover {
                    background: #f0f8ff !important;
                }
                
                .visit-record-title {
                    all: initial !important;
                    display: block !important;
                    font-size: 12px !important;
                    color: #003366 !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                    margin-bottom: 2px !important;
                    font-family: inherit !important;
                }
                
                .visit-record-time {
                    all: initial !important;
                    display: block !important;
                    font-size: 10px !important;
                    color: #6699cc !important;
                    font-family: inherit !important;
                }
                
                .tracker-controls {
                    all: initial !important;
                    display: flex !important;
                    padding: 8px 12px !important;
                    gap: 8px !important;
                    border-top: 1px solid #e6f0ff !important;
                    box-sizing: border-box !important;
                }
                
                .tracker-btn {
                    all: initial !important;
                    display: block !important;
                    flex: 1 !important;
                    padding: 6px !important;
                    background: #e6f0ff !important;
                    border: 1px solid #b3d1ff !important;
                    border-radius: 4px !important;
                    color: #0052cc !important;
                    cursor: pointer !important;
                    font-size: 11px !important;
                    text-align: center !important;
                    font-family: inherit !important;
                    box-sizing: border-box !important;
                }
                
                .tracker-btn:hover {
                    background: #d0e7ff !important;
                }
                
                /* 空状态提示 */
                .tracker-empty {
                    all: initial !important;
                    display: block !important;
                    text-align: center !important;
                    color: #999 !important;
                    padding: 20px !important;
                    font-size: 11px !important;
                    font-family: inherit !important;
                }
                
                /* 移动端适配 */
                @media (max-width: 768px) {
                    :host {
                        bottom: ${CONFIG.MOBILE_BOTTOM}px !important;
                        left: 50% !important;
                        transform: translateX(-50%) !important;
                        width: auto !important;
                    }
                    
                    .tracker-container.expanded {
                        width: calc(100vw - 40px) !important;
                        max-width: 280px !important;
                    }
                }
                
                /* 桌面端样式 */
                @media (min-width: 769px) {
                    :host {
                        bottom: ${CONFIG.DESKTOP_BOTTOM}px !important;
                        left: ${CONFIG.DESKTOP_LEFT}px !important;
                        right: auto !important;
                        transform: none !important;
                    }
                }
                
                /* 滚动条样式 */
                .tracker-list::-webkit-scrollbar {
                    width: 4px !important;
                }
                
                .tracker-list::-webkit-scrollbar-track {
                    background: #f1f1f1 !important;
                }
                
                .tracker-list::-webkit-scrollbar-thumb {
                    background: #c1d7ff !important;
                    border-radius: 2px !important;
                }
                
                .tracker-list::-webkit-scrollbar-thumb:hover {
                    background: #a3c3ff !important;
                }
                
                /* 拖动时的特殊样式 */
                .tracker-container.dragging {
                    transform: none !important;
                    left: var(--drag-left) !important;
                    top: var(--drag-top) !important;
                    right: auto !important;
                    bottom: auto !important;
                }
            `;
            
            // 创建容器结构
            const container = document.createElement('div');
            container.className = 'tracker-container collapsed';
            container.innerHTML = `
                <div class="tracker-header">
                    <div class="tracker-title">访问记录</div>
                    <button class="tracker-toggle">▶</button>
                </div>
                <div class="tracker-content">
                    <div class="tracker-list"></div>
                    <div class="tracker-controls">
                        <button class="tracker-btn" id="tracker-clear">清空</button>
                        <button class="tracker-btn" id="tracker-refresh">刷新</button>
                    </div>
                </div>
            `;
            
            // 添加到Shadow DOM
            this.shadowRoot.appendChild(style);
            this.shadowRoot.appendChild(container);
            
            this.bindEvents();
        }

        setInitialPosition() {
            // 根据设备类型设置初始位置
            if (Utils.isMobile()) {
                // 移动端：底部正中间
                this.container.style.position = 'fixed';
                this.container.style.left = '50%';
                this.container.style.top = 'auto';
                this.container.style.right = 'auto';
                this.container.style.bottom = `${CONFIG.MOBILE_BOTTOM}px`;
                this.container.style.transform = 'translateX(-50%)';
                
                // 获取并保存初始位置
                const rect = this.container.getBoundingClientRect();
                this.containerStartX = (window.innerWidth - rect.width) / 2;
                this.containerStartY = window.innerHeight - rect.height - CONFIG.MOBILE_BOTTOM;
            } else {
                // 桌面端：左下角
                this.container.style.position = 'fixed';
                this.container.style.left = `${CONFIG.DESKTOP_LEFT}px`;
                this.container.style.top = 'auto';
                this.container.style.right = 'auto';
                this.container.style.bottom = `${CONFIG.DESKTOP_BOTTOM}px`;
                this.container.style.transform = 'none';
                
                // 获取并保存初始位置
                const rect = this.container.getBoundingClientRect();
                this.containerStartX = CONFIG.DESKTOP_LEFT;
                this.containerStartY = window.innerHeight - rect.height - CONFIG.DESKTOP_BOTTOM;
            }
        }

        setupResizeListener() {
            // 窗口大小变化时重新定位
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    // 如果当前不是拖动状态，则重新设置位置
                    if (!this.isDragging) {
                        this.setInitialPosition();
                    }
                }, 250);
            });
        }

        bindEvents() {
            const header = this.shadowRoot.querySelector('.tracker-header');
            const toggleBtn = this.shadowRoot.querySelector('.tracker-toggle');
            const clearBtn = this.shadowRoot.querySelector('#tracker-clear');
            const refreshBtn = this.shadowRoot.querySelector('#tracker-refresh');
            
            // 点击标题展开/收起
            header.addEventListener('click', (e) => {
                if (this.isDragging) return;
                e.stopPropagation();
                this.toggle();
            });
            
            // 点击按钮展开/收起
            toggleBtn.addEventListener('click', (e) => {
                if (this.isDragging) return;
                e.stopPropagation();
                this.toggle();
            });
            
            // 清空按钮
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearRecords();
            });
            
            // 刷新按钮
            refreshBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadRecords();
            });
            
            // 移动端长按拖动
            header.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            header.addEventListener('touchend', this.handleTouchEnd.bind(this));
            header.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            
            // PC端拖动
            header.addEventListener('mousedown', this.handleMouseDown.bind(this));
        }

        handleTouchStart(e) {
            e.stopPropagation();
            this.pressTimer = setTimeout(() => {
                this.startDragging(e.touches[0]);
            }, 500);
        }

        handleTouchEnd(e) {
            clearTimeout(this.pressTimer);
            if (this.isDragging) {
                this.stopDragging();
            }
        }

        handleTouchMove(e) {
            if (this.isDragging && e.touches.length === 1) {
                e.preventDefault();
                this.handleDrag(e.touches[0]);
            }
        }

        handleMouseDown(e) {
            e.stopPropagation();
            e.preventDefault();
            
            this.pressTimer = setTimeout(() => {
                this.startDragging(e);
            }, 500);
            
            // 添加全局鼠标事件监听
            const onMouseMove = (moveEvent) => {
                if (this.isDragging) {
                    moveEvent.preventDefault();
                    this.handleDrag(moveEvent);
                }
            };
            
            const onMouseUp = (upEvent) => {
                clearTimeout(this.pressTimer);
                if (this.isDragging) {
                    this.stopDragging();
                }
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }

        startDragging(startEvent) {
            this.isDragging = true;
            const container = this.shadowRoot.querySelector('.tracker-container');
            container.classList.add('dragging');
            
            // 获取当前容器位置
            const rect = this.container.getBoundingClientRect();
            
            // 记录初始位置
            this.dragStartX = startEvent.clientX;
            this.dragStartY = startEvent.clientY;
            this.containerStartX = rect.left;
            this.containerStartY = rect.top;
            
            // 切换到left/top定位以便拖动
            this.container.style.position = 'fixed';
            this.container.style.left = `${rect.left}px`;
            this.container.style.top = `${rect.top}px`;
            this.container.style.right = 'auto';
            this.container.style.bottom = 'auto';
            this.container.style.transform = 'none';
            
            // 设置CSS自定义属性用于拖动时的样式
            this.container.style.setProperty('--drag-left', `${rect.left}px`);
            this.container.style.setProperty('--drag-top', `${rect.top}px`);
        }

        handleDrag(currentEvent) {
            if (!this.isDragging) return;
            
            const deltaX = currentEvent.clientX - this.dragStartX;
            const deltaY = currentEvent.clientY - this.dragStartY;
            
            const newX = this.containerStartX + deltaX;
            const newY = this.containerStartY + deltaY;
            
            // 限制在视口内
            const maxX = window.innerWidth - this.container.offsetWidth;
            const maxY = window.innerHeight - this.container.offsetHeight;
            
            const boundedX = Math.max(10, Math.min(newX, maxX - 10));
            const boundedY = Math.max(10, Math.min(newY, maxY - 10));
            
            // 更新位置
            this.container.style.left = `${boundedX}px`;
            this.container.style.top = `${boundedY}px`;
            this.container.style.setProperty('--drag-left', `${boundedX}px`);
            this.container.style.setProperty('--drag-top', `${boundedY}px`);
            
            // 更新初始位置以便连续拖动
            this.dragStartX = currentEvent.clientX;
            this.dragStartY = currentEvent.clientY;
            this.containerStartX = boundedX;
            this.containerStartY = boundedY;
        }

        stopDragging() {
            this.isDragging = false;
            const container = this.shadowRoot.querySelector('.tracker-container');
            container.classList.remove('dragging');
            
            // 清除临时定位样式
            this.container.style.removeProperty('--drag-left');
            this.container.style.removeProperty('--drag-top');
            
            // 如果是在移动端，移除transform以保持拖动后的位置
            if (!Utils.isMobile()) {
                this.container.style.transform = 'none';
            }
            
            // 保存当前位置
            const rect = this.container.getBoundingClientRect();
            this.containerStartX = rect.left;
            this.containerStartY = rect.top;
        }

        toggle() {
            if (this.isDragging) return;
            
            this.isExpanded = !this.isExpanded;
            
            if (this.isExpanded) {
                this.expand();
            } else {
                this.collapse();
            }
        }

        expand() {
            const container = this.shadowRoot.querySelector('.tracker-container');
            const toggleBtn = this.shadowRoot.querySelector('.tracker-toggle');
            
            container.classList.remove('collapsed');
            container.classList.add('expanded');
            toggleBtn.textContent = '▼';
            this.loadRecords(); // 确保内容已加载
        }

        collapse() {
            const container = this.shadowRoot.querySelector('.tracker-container');
            const toggleBtn = this.shadowRoot.querySelector('.tracker-toggle');
            
            container.classList.remove('expanded');
            container.classList.add('collapsed');
            toggleBtn.textContent = '▶';
        }

        loadRecords() {
            const records = Utils.getRecords();
            const listElement = this.shadowRoot.querySelector('.tracker-list');
            
            if (!listElement) {
                console.warn('列表元素未找到');
                return;
            }
            
            if (records.length === 0) {
                listElement.innerHTML = '<div class="tracker-empty">暂无访问记录</div>';
                return;
            }
            
            listElement.innerHTML = records.map(record => `
                <div class="visit-record" data-page="${record.page}">
                    <div class="visit-record-title" title="${record.title}">${record.title}</div>
                    <div class="visit-record-time">${record.formattedTime}</div>
                </div>
            `).join('');
            
            // 绑定记录点击事件
            this.shadowRoot.querySelectorAll('.visit-record').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const page = item.getAttribute('data-page');
                    this.navigateToPage(page);
                });
                
                // 移动端触摸支持
                item.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                });
            });
        }

        navigateToPage(pageName) {
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            const targetUrl = basePath + pageName;

            // 检查是否是当前页面
            if (pageName === Utils.getCurrentPagePath()) {
                return;
            }

            // 尝试访问页面
            fetch(targetUrl, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        window.location.href = targetUrl;
                    } else {
                        alert('页面不存在: ' + pageName);
                    }
                })
                .catch(() => {
                    alert('无法访问页面: ' + pageName);
                });
        }

        clearRecords() {
            if (confirm('确定要清空所有访问记录吗？')) {
                Utils.saveRecords([]);
                this.loadRecords();
            }
        }
    }

    // 初始化
    function init() {
        // 防止重复初始化
        if (document.getElementById('visit-tracker-container')) {
            console.log('访问记录管理器已存在');
            return;
        }
        
        console.log('初始化访问记录管理器...');
        
        // 添加当前页面记录
        Utils.addRecord(Utils.getCurrentPagePath());
        
        // 创建UI
        const tracker = new VisitTracker();
        
        // 页面切换时添加记录
        window.addEventListener('pageshow', () => {
            setTimeout(() => {
                Utils.addRecord(Utils.getCurrentPagePath());
                tracker.loadRecords(); // 刷新显示
            }, 100);
        });
        
        // 页面可见性变化时添加记录
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => {
                    Utils.addRecord(Utils.getCurrentPagePath());
                    tracker.loadRecords(); // 刷新显示
                }, 100);
            }
        });
        
        // 暴露到全局
        window.VisitTracker = {
            toggle: () => tracker.toggle(),
            addRecord: () => Utils.addRecord(Utils.getCurrentPagePath()),
            clearRecords: () => tracker.clearRecords(),
            getRecords: () => Utils.getRecords()
        };
        
        console.log('访问记录管理器初始化完成');
    }

    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(init, 100);
        });
    } else {
        setTimeout(init, 100);
    }
})();



