/**
 * 访问记录12.31 9：26备份
 * 蓝白简约风格访问记录管理器
 * 默认收起状态，支持移动端、多浏览器及 Taptap 小程序 H5 兼容
 */
(function () {
    'use strict';

    // 配置常量
    const CONFIG = {
        STORAGE_KEY: 'visited_pages_tracker',
        MAX_RECORDS: 50
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

    class UIManager {
        constructor() {
            this.isExpanded = false;
            this.container = null;
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
        }

        addStyles() {
            const style = document.createElement('style');
            style.textContent = `
                #visit-tracker-container {
                    position: fixed;
                    bottom: 16px;
                    right: 16px;
                    z-index: 9999;
                    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
                    background: #ffffff;
                    border: 1px solid #d0e7ff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 82, 204, 0.15);
                    max-width: 280px;
                    overflow: hidden;
                    transition: max-height 0.3s ease-in-out;
                }

                #visit-tracker-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 12px;
                    background: #f0f8ff;
                    cursor: pointer;
                    user-select: none;
                }

                #visit-tracker-title {
                    font-size: 13px;
                    font-weight: bold;
                    color: #0052cc;
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
                }

                #visit-tracker-content {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-in-out;
                }

                .visit-tracker-expanded #visit-tracker-content {
                    max-height: 300px;
                }

                #visit-tracker-list {
                    padding: 8px 0;
                    max-height: 220px;
                    overflow-y: auto;
                }

                .visit-record {
                    padding: 6px 12px;
                    border-bottom: 1px solid #e6f0ff;
                    cursor: pointer;
                    transition: background-color 0.2s;
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
                }

                .visit-record-time {
                    font-size: 10px;
                    color: #6699cc;
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
                }

                #visit-tracker-controls button:hover {
                    background: #cce6ff;
                }

                /* 移动端适配 */
                @media (max-width: 768px) {
                    #visit-tracker-container {
                        bottom: 12px;
                        right: 12px;
                        left: 12px;
                        max-width: calc(100vw - 24px);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        bindEvents() {
            const toggleBtn = document.getElementById('visit-tracker-toggle');
            const clearBtn = document.getElementById('visit-tracker-clear');
            const refreshBtn = document.getElementById('visit-tracker-refresh');
            const header = document.getElementById('visit-tracker-header');

            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });

            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearRecords();
            });

            refreshBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.loadRecords();
            });

            header.addEventListener('click', () => {
                this.toggle();
            });
        }

        toggle() {
            this.isExpanded = !this.isExpanded;
            if (this.isExpanded) {
                this.container.classList.add('visit-tracker-expanded');
                document.getElementById('visit-tracker-toggle').textContent = '▼';
            } else {
                this.container.classList.remove('visit-tracker-expanded');
                document.getElementById('visit-tracker-toggle').textContent = '▶';
            }
        }

        collapse() {
            this.isExpanded = false;
            this.container.classList.remove('visit-tracker-expanded');
            document.getElementById('visit-tracker-toggle').textContent = '▶';
        }

        loadRecords() {
            const records = Utils.getRecords();
            const listElement = document.getElementById('visit-tracker-list');

            if (records.length === 0) {
                listElement.innerHTML = '<div style="text-align:center;color:#999;padding:16px;font-size:11px;">暂无访问记录</div>';
                return;
            }

            listElement.innerHTML = records.map(record => `
                <div class="visit-record" data-page="${record.page}">
                    <div class="visit-record-title">${record.title}</div>
                    <div class="visit-record-time">${record.formattedTime}</div>
                </div>
            `).join('');

            document.querySelectorAll('.visit-record').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const page = item.getAttribute('data-page');
                    this.navigateToPage(page);
                });
            });
        }

        navigateToPage(pageName) {
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            const targetUrl = basePath + pageName;

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

    function init() {
        const currentPage = Utils.getCurrentPagePath();
        Utils.addRecord(currentPage);
        new UIManager();

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (checkCompatibility()) init();
        });
    } else {
        if (checkCompatibility()) init();
    }

    window.VisitTracker = {
        addRecord: Utils.addRecord,
        getRecords: Utils.getRecords,
        clearRecords: () => Utils.saveRecords([]),
        isTaptapMiniProgram: isTaptapMiniProgram
    };
})();