
/**
//有效的visit.js备份！12.31下午（准备优化样式使其不受html影响）
 * 蓝白简约风格访问记录管理器
 * 简化版：点击展开/收起，长按拖动
 */
(function () {
    'use strict';

    const CONFIG = {
        STORAGE_KEY: 'visited_pages_tracker',
        MAX_RECORDS: 50,
        COLLAPSED_WIDTH: '100px'
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
        }
    };

    class VisitTracker {
        constructor() {
            this.isExpanded = false;
            this.isDragging = false;
            this.init();
        }

        init() {
            this.createUI();
            this.loadRecords();
            this.collapse();
        }

        createUI() {
            // 创建容器
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
            
            // 添加样式
            const style = document.createElement('style');
            style.textContent = `
                #visit-tracker-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 9999;
                    background: white;
                    border: 1px solid #d0e7ff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 82, 204, 0.15);
                    overflow: hidden;
                    transition: all 0.3s ease;
                    cursor: default;
                    user-select: none;
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                }
                
                #visit-tracker-container.collapsed {
                    width: 100px;
                }
                
                #visit-tracker-container.expanded {
                    width: 280px;
                }
                
                #visit-tracker-header {
                    padding: 10px 12px;
                    background: #f0f8ff;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                }
                
                #visit-tracker-title {
                    font-size: 13px;
                    font-weight: bold;
                    color: #0052cc;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
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
                }
                
                #visit-tracker-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease;
                }
                
                #visit-tracker-container.expanded #visit-tracker-content {
                    max-height: 300px;
                }
                
                #visit-tracker-list {
                    padding: 8px 0;
                    max-height: 220px;
                    overflow-y: auto;
                }
                
                .visit-record {
                    padding: 8px 12px;
                    border-bottom: 1px solid #e6f0ff;
                    cursor: pointer;
                }
                
                .visit-record:hover {
                    background: #f0f8ff;
                }
                
                .visit-record-title {
                    font-size: 12px;
                    color: #003366;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .visit-record-time {
                    font-size: 10px;
                    color: #6699cc;
                }
                
                #visit-tracker-controls {
                    padding: 8px 12px;
                    display: flex;
                    gap: 8px;
                    border-top: 1px solid #e6f0ff;
                }
                
                #visit-tracker-controls button {
                    flex: 1;
                    padding: 6px;
                    background: #e6f0ff;
                    border: 1px solid #b3d1ff;
                    border-radius: 4px;
                    color: #0052cc;
                    cursor: pointer;
                    font-size: 11px;
                }
                
                #visit-tracker-controls button:hover {
                    background: #d0e7ff;
                }
                
                /* 空状态提示 */
                .visit-tracker-empty {
                    text-align: center;
                    color: #999;
                    padding: 20px;
                    font-size: 11px;
                }
                
                /* 移动端适配 */
                @media (max-width: 768px) {
                    #visit-tracker-container {
                        bottom: 10px;
                        right: 10px;
                    }
                    
                    #visit-tracker-container.collapsed {
                        width: 100px;
                    }
                    
                    #visit-tracker-container.expanded {
                        width: calc(100vw - 40px);
                        max-width: 280px;
                        left: 50%;
                        transform: translateX(-50%);
                        right: auto;
                    }
                    
                    #visit-tracker-container.dragging {
                        cursor: move;
                        opacity: 0.9;
                        box-shadow: 0 4px 20px rgba(0, 82, 204, 0.3);
                    }
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(this.container);
            
            this.bindEvents();
        }

        bindEvents() {
            const header = document.getElementById('visit-tracker-header');
            const toggleBtn = document.getElementById('visit-tracker-toggle');
            const clearBtn = document.getElementById('visit-tracker-clear');
            const refreshBtn = document.getElementById('visit-tracker-refresh');
            
            // 点击标题展开/收起
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
            
            // 点击按钮展开/收起
            toggleBtn.addEventListener('click', (e) => {
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
            let pressTimer;
            header.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                pressTimer = setTimeout(() => {
                    this.startDragging(e.touches[0]);
                }, 500);
            }, { passive: false });
            
            header.addEventListener('touchend', (e) => {
                clearTimeout(pressTimer);
                if (this.isDragging) {
                    this.stopDragging();
                }
            });
            
            document.addEventListener('touchmove', (e) => {
                if (this.isDragging && e.touches.length === 1) {
                    e.preventDefault();
                    this.handleDrag(e.touches[0]);
                }
            }, { passive: false });
            
            // PC端拖动
            header.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                pressTimer = setTimeout(() => {
                    this.startDragging(e);
                }, 500);
            });
            
            document.addEventListener('mouseup', (e) => {
                clearTimeout(pressTimer);
                if (this.isDragging) {
                    this.stopDragging();
                }
            });
            
            document.addEventListener('mousemove', (e) => {
                if (this.isDragging) {
                    e.preventDefault();
                    this.handleDrag(e);
                }
            });
        }

        startDragging(startEvent) {
            this.isDragging = true;
            this.container.classList.add('dragging');
            
            // 记录初始位置
            this.dragStartX = startEvent.clientX;
            this.dragStartY = startEvent.clientY;
            
            const rect = this.container.getBoundingClientRect();
            this.containerStartX = rect.left;
            this.containerStartY = rect.top;
        }

        handleDrag(currentEvent) {
            const deltaX = currentEvent.clientX - this.dragStartX;
            const deltaY = currentEvent.clientY - this.dragStartY;
            
            const newX = this.containerStartX + deltaX;
            const newY = this.containerStartY + deltaY;
            
            // 限制在视口内
            const maxX = window.innerWidth - this.container.offsetWidth;
            const maxY = window.innerHeight - this.container.offsetHeight;
            
            const boundedX = Math.max(10, Math.min(newX, maxX - 10));
            const boundedY = Math.max(10, Math.min(newY, maxY - 10));
            
            this.container.style.left = `${boundedX}px`;
            this.container.style.top = `${boundedY}px`;
            this.container.style.right = 'auto';
            this.container.style.bottom = 'auto';
        }

        stopDragging() {
            this.isDragging = false;
            this.container.classList.remove('dragging');
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
            this.container.classList.remove('collapsed');
            this.container.classList.add('expanded');
            document.getElementById('visit-tracker-toggle').textContent = '▼';
            this.loadRecords(); // 确保内容已加载
        }

        collapse() {
            this.container.classList.remove('expanded');
            this.container.classList.add('collapsed');
            document.getElementById('visit-tracker-toggle').textContent = '▶';
        }

        loadRecords() {
            const records = Utils.getRecords();
            const listElement = document.getElementById('visit-tracker-list');
            
            if (!listElement) {
                console.warn('列表元素未找到');
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
            
            // 绑定记录点击事件
            document.querySelectorAll('.visit-record').forEach(item => {
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