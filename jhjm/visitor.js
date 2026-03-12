// 修复版单行访客统计系统 - visitor-system-fixed.js
(function() {
    'use strict';
    
    // 配置项 - 针对小网站调整
    const CONFIG = {
        // 本地存储键名
        storageKeys: {
            totalVisits: 'vs_total_visits',
            uniqueVisitors: 'vs_unique_visitors',
            todayVisits: 'vs_today_visits',
            visitorId: 'vs_visitor_id',
            firstVisit: 'vs_first_visit',
            sessionStart: 'vs_session_start'
        },
        
        // 模拟参数 - 小网站基数
        simulation: {
            baseTotal: 850,      // 减少基数
            baseUnique: 320,     // 减少基数
            hourlyFactor: {
                0: 0.1, 1: 0.05, 2: 0.05, 3: 0.05, 4: 0.1, 5: 0.15,
                6: 0.3, 7: 0.5, 8: 0.8, 9: 1.0, 10: 1.2, 11: 1.5,
                12: 1.3, 13: 1.4, 14: 1.6, 15: 1.8, 16: 2.0, 17: 1.8,
                18: 1.5, 19: 1.2, 20: 0.9, 21: 0.6, 22: 0.4, 23: 0.2
            },
            dailyFactor: {
                0: 0.6, 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.2, 6: 0.8
            }
        },
        
        // 默认显示配置
        defaultDisplay: {
            style: 'full',
            theme: 'blue',
            position: 'center',
            refresh: true,
            show: ['total', 'unique', 'today', 'online'],
            width: 'auto',
            align: 'center'  // 默认居中
        }
    };
    
    // 主类
    class FixedVisitorSystem {
        constructor() {
            this.initData();
            this.scanAndRender();
            this.setupAutoRefresh();
        }
        
        // 初始化数据
        initData() {
            const now = new Date();
            const hour = now.getHours();
            const day = now.getDay();
            
            // 时间系数
            const hourFactor = CONFIG.simulation.hourlyFactor[hour] || 1;
            const dayFactor = CONFIG.simulation.dailyFactor[day] || 1;
            const timeFactor = hourFactor * dayFactor;
            const randomFactor = 0.8 + Math.random() * 0.4;
            const overallFactor = timeFactor * randomFactor;
            
            // 初始化或更新数据
            let totalVisits = localStorage.getItem(CONFIG.storageKeys.totalVisits);
            let uniqueVisitors = localStorage.getItem(CONFIG.storageKeys.uniqueVisitors);
            const today = now.toDateString();
            const todayKey = `${CONFIG.storageKeys.todayVisits}_${today}`;
            let todayVisits = localStorage.getItem(todayKey);
            
            // 总访问量（小网站模式）
            if (!totalVisits) {
                totalVisits = CONFIG.simulation.baseTotal + Math.floor(Math.random() * 200);
            } else {
                // 小网站每次增加1-3个访问量
                const increment = Math.floor((0.5 + Math.random() * 2.5) * overallFactor);
                totalVisits = parseInt(totalVisits) + Math.max(1, increment);
            }
            localStorage.setItem(CONFIG.storageKeys.totalVisits, totalVisits);
            
            // 独立访客（小网站模式）
            if (!uniqueVisitors) {
                uniqueVisitors = Math.floor(totalVisits / (3 + Math.random() * 2)); // 访问频率较低
            } else if (Math.random() < 0.15) { // 降低新访客概率
                uniqueVisitors = parseInt(uniqueVisitors) + 1;
            }
            localStorage.setItem(CONFIG.storageKeys.uniqueVisitors, uniqueVisitors);
            
            // 今日访问量（小网站模式）
            if (!todayVisits) {
                todayVisits = Math.floor(15 * overallFactor); // 基数降低
            } else {
                todayVisits = parseInt(todayVisits) + Math.floor((0.5 + Math.random() * 1.5) * overallFactor);
            }
            localStorage.setItem(todayKey, todayVisits);
            
            // 访客标识
            let visitorId = localStorage.getItem(CONFIG.storageKeys.visitorId);
            let isNewVisitor = false;
            
            if (!visitorId) {
                visitorId = 'vid_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
                localStorage.setItem(CONFIG.storageKeys.visitorId, visitorId);
                localStorage.setItem(CONFIG.storageKeys.firstVisit, now.toISOString());
                isNewVisitor = true;
            }
            
            // 会话管理
            let sessionStart = localStorage.getItem(CONFIG.storageKeys.sessionStart);
            const sessionTimeout = 30 * 60 * 1000;
            if (!sessionStart || (now - new Date(sessionStart)) > sessionTimeout) {
                sessionStart = now.toISOString();
                localStorage.setItem(CONFIG.storageKeys.sessionStart, sessionStart);
            }
            
            // 在线用户计算（小网站模式）
            const onlineUsers = this.calculateOnlineUsers(timeFactor);
            
            this.data = {
                total: parseInt(totalVisits),
                unique: parseInt(uniqueVisitors),
                today: parseInt(todayVisits),
                online: onlineUsers,
                visitorId: visitorId,
                isNew: isNewVisitor,
                lastUpdate: now
            };
        }
        
        // 计算在线用户（小网站模式）
        calculateOnlineUsers(timeFactor) {
            const now = new Date();
            const hour = now.getHours();
            let base = 1 + Math.floor(Math.random() * 5); // 降低基数
            
            if (hour >= 9 && hour <= 17) base *= 2;
            else if (hour >= 18 && hour <= 22) base *= 1.5;
            
            return Math.max(1, Math.floor(base * timeFactor * (0.7 + Math.random() * 0.6)));
        }
        
        // 扫描并渲染所有实例
        scanAndRender() {
            const containers = document.querySelectorAll('[id^="visitor-stats"], .visitor-stats');
            
            containers.forEach(container => {
                const config = this.parseConfig(container);
                this.render(container, config);
            });
        }
        
        // 解析配置
        parseConfig(container) {
            const config = { ...CONFIG.defaultDisplay };
            
            // 从data属性获取配置
            if (container.dataset.style) config.style = container.dataset.style;
            if (container.dataset.theme) config.theme = container.dataset.theme;
            if (container.dataset.position) config.position = container.dataset.position;
            if (container.dataset.refresh) config.refresh = container.dataset.refresh === 'true';
            if (container.dataset.show) config.show = container.dataset.show.split(',');
            if (container.dataset.width) config.width = container.dataset.width;
            if (container.dataset.align) config.align = container.dataset.align;
            
            return config;
        }
        
        // 渲染访客统计 - 修复居中问题
        render(container, config) {
            const styles = this.getStyles(config);
            const content = this.getContent(config);
            
            // 清空容器并应用样式
            container.innerHTML = '';
            
            // 创建样式元素
            const styleEl = document.createElement('style');
            styleEl.textContent = styles;
            document.head.appendChild(styleEl);
            
            // 创建内容容器
            const contentDiv = document.createElement('div');
            contentDiv.className = `vs-container vs-${config.style} vs-theme-${config.theme} vs-align-${config.align}`;
            
            // 设置宽度
            if (config.width !== 'auto') {
                contentDiv.style.width = config.width;
            }
            
            // 设置居中
            if (config.align === 'center') {
                contentDiv.style.margin = '0 auto';
                contentDiv.style.display = 'block';
                
                if (config.style === 'minimal' || config.style === 'badge' || config.style === 'navbar') {
                    contentDiv.style.display = 'inline-block';
                }
            } else if (config.align === 'right') {
                contentDiv.style.marginLeft = 'auto';
                contentDiv.style.display = 'block';
                
                if (config.style === 'minimal' || config.style === 'badge' || config.style === 'navbar') {
                    contentDiv.style.display = 'inline-block';
                    contentDiv.style.marginLeft = 'auto';
                    contentDiv.style.marginRight = '0';
                }
            }
            
            contentDiv.innerHTML = content;
            container.appendChild(contentDiv);
        }
        
        // 获取样式
        getStyles(config) {
            const themes = {
                blue: { primary: '#3498db', secondary: '#2980b9', light: '#ebf5fb', text: '#2c3e50' },
                green: { primary: '#27ae60', secondary: '#219653', light: '#e8f5e9', text: '#2e7d32' },
                purple: { primary: '#9b59b6', secondary: '#8e44ad', light: '#f3e5f5', text: '#6a1b9a' },
                orange: { primary: '#e67e22', secondary: '#d35400', light: '#fef9e7', text: '#e65100' },
                gray: { primary: '#7f8c8d', secondary: '#5d6d7e', light: '#f8f9fa', text: '#5d6d7e' },
                dark: { primary: '#34495e', secondary: '#2c3e50', light: '#ecf0f1', text: '#2c3e50' }
            };
            
            const theme = themes[config.theme] || themes.blue;
            
            return `
                .vs-container {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                }
                
                /* 完整版样式 */
                .vs-full {
                    background: white;
                    border-radius: 10px;
                    padding: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    border-left: 4px solid ${theme.primary};
                    max-width: 600px;
                }
                
                .vs-full .vs-title {
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: ${theme.text};
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .vs-full .vs-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
                }
                
                .vs-full .vs-stat-item {
                    text-align: center;
                }
                
                .vs-full .vs-stat-value {
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: ${theme.primary};
                    line-height: 1;
                }
                
                .vs-full .vs-stat-label {
                    font-size: 0.85rem;
                    color: ${theme.secondary};
                    margin-top: 5px;
                }
                
                /* 简约版样式 */
                .vs-minimal {
                    background: ${theme.light};
                    border-radius: 6px;
                    padding: 10px 15px;
                    font-size: 0.9rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 15px;
                    max-width: 100%;
                }
                
                .vs-minimal .vs-stat {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    white-space: nowrap;
                }
                
                /* 紧凑版样式 */
                .vs-compact {
                    background: white;
                    border-radius: 8px;
                    padding: 15px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    max-width: 400px;
                }
                
                .vs-compact .vs-stats {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: space-between;
                }
                
                /* 标签版样式 */
                .vs-badge {
                    display: inline-flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    max-width: 100%;
                    justify-content: ${config.align === 'center' ? 'center' : 
                                     config.align === 'right' ? 'flex-end' : 'flex-start'};
                }
                
                .vs-badge .vs-badge-item {
                    background: ${theme.light};
                    color: ${theme.primary};
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    border: 1px solid ${theme.primary}20;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    white-space: nowrap;
                }
                
                /* 导航栏版样式 */
                .vs-navbar {
                    display: inline-flex;
                    align-items: center;
                    gap: 15px;
                    font-size: 0.9rem;
                    max-width: 100%;
                }
                
                .vs-navbar .vs-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    color: ${theme.text};
                    white-space: nowrap;
                }
                
                /* 页脚版样式 */
                .vs-footer {
                    display: flex;
                    justify-content: ${config.align === 'center' ? 'center' : 
                                    config.align === 'right' ? 'flex-end' : 'flex-start'};
                    gap: 25px;
                    text-align: center;
                    padding: 15px 0;
                    flex-wrap: wrap;
                    max-width: 100%;
                }
                
                .vs-footer .vs-footer-item {
                    min-width: 80px;
                }
                
                .vs-footer .vs-footer-value {
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: ${theme.primary};
                }
                
                .vs-footer .vs-footer-label {
                    font-size: 0.8rem;
                    color: ${theme.secondary};
                }
                
                /* 对齐方式 */
                .vs-align-center {
                    text-align: center;
                    margin-left: auto;
                    margin-right: auto;
                }
                
                .vs-align-left {
                    text-align: left;
                    margin-right: auto;
                }
                
                .vs-align-right {
                    text-align: right;
                    margin-left: auto;
                }
                
                /* 响应式 */
                @media (max-width: 768px) {
                    .vs-full .vs-stats-grid { 
                        grid-template-columns: repeat(2, 1fr); 
                        gap: 12px;
                    }
                    .vs-full { padding: 15px; }
                    .vs-full .vs-stat-value { font-size: 1.4rem; }
                    
                    .vs-footer { 
                        gap: 15px; 
                        justify-content: center;
                    }
                    
                    .vs-navbar { 
                        flex-wrap: wrap; 
                        gap: 10px;
                        justify-content: ${config.align === 'center' ? 'center' : 
                                        config.align === 'right' ? 'flex-end' : 'flex-start'};
                    }
                    
                    .vs-minimal {
                        flex-wrap: wrap;
                        justify-content: ${config.align === 'center' ? 'center' : 
                                        config.align === 'right' ? 'flex-end' : 'flex-start'};
                    }
                }
                
                @media (max-width: 480px) {
                    .vs-full .vs-stats-grid { grid-template-columns: 1fr; }
                    .vs-full .vs-title { flex-direction: column; align-items: flex-start; gap: 8px; }
                    
                    .vs-minimal { 
                        flex-direction: column; 
                        align-items: ${config.align === 'center' ? 'center' : 
                                    config.align === 'right' ? 'flex-end' : 'flex-start'}; 
                        gap: 8px; 
                    }
                    
                    .vs-footer .vs-footer-item { min-width: 70px; }
                    .vs-badge { justify-content: center; }
                }
                
                /* 图标样式 */
                .vs-icon {
                    font-size: 0.9em;
                }
                
                /* 数字格式化 - 显示真实数字（不过千） */
                .vs-small-number {
                    font-size: 1.4rem;
                }
            `;
        }
        
        // 获取内容
        getContent(config) {
            const stats = this.data;
            const icons = {
                total: '👥', unique: '👤', today: '📅', online: '🟢',
                total_fa: '<i class="fas fa-users"></i>',
                unique_fa: '<i class="fas fa-user-check"></i>',
                today_fa: '<i class="fas fa-calendar-day"></i>',
                online_fa: '<i class="fas fa-wifi"></i>'
            };
            
            // 小网站专用格式化函数 - 显示真实数字
            const formatNumber = (num) => {
                // 小网站直接显示完整数字
                return num.toLocaleString();
            };
            
            const statItems = config.show.map(stat => {
                const value = formatNumber(stats[stat]);
                const label = {
                    total: '总访问',
                    unique: '独立访客',
                    today: '今日访问',
                    online: '在线'
                }[stat];
                
                return { stat, value, label };
            });
            
            switch(config.style) {
                case 'minimal':
                    return statItems.map(item => 
                        `<div class="vs-stat">
                            <span class="vs-icon">${icons[item.stat]}</span>
                            <span>${item.label}: <strong>${item.value}</strong></span>
                        </div>`
                    ).join('');
                
                case 'compact':
                    return `
                        <div class="vs-stats">
                            ${statItems.map(item => `
                                <div>
                                    <div class="vs-small-number" style="font-weight: bold; color: #3498db;">
                                        ${item.value}
                                    </div>
                                    <div style="font-size: 0.8rem; color: #7f8c8d;">
                                        ${item.label}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                
                case 'badge':
                    return statItems.map(item => 
                        `<div class="vs-badge-item">
                            <span class="vs-icon">${icons[item.stat]}</span>
                            ${item.value} ${item.label}
                        </div>`
                    ).join('');
                
                case 'navbar':
                    return statItems.map(item => 
                        `<div class="vs-nav-item">
                            <span class="vs-icon">${icons[item.stat]}</span>
                            <span>${item.value}</span>
                        </div>`
                    ).join('');
                
                case 'footer':
                    return statItems.map(item => `
                        <div class="vs-footer-item">
                            <div class="vs-footer-value">${item.value}</div>
                            <div class="vs-footer-label">${item.label}</div>
                        </div>
                    `).join('');
                
                case 'full':
                default:
                    return `
                        <div class="vs-title">
                            <span>📊 网站访问统计</span>
                            <span style="font-size: 0.8rem; color: #7f8c8d;">
                                更新: ${this.getTimeAgo()}
                            </span>
                        </div>
                        <div class="vs-stats-grid">
                            ${statItems.map(item => `
                                <div class="vs-stat-item">
                                    <div class="vs-stat-value">${item.value}</div>
                                    <div class="vs-stat-label">${item.label}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="margin-top: 15px; font-size: 0.75rem; color: #95a5a6; text-align: center;">
                            您是${stats.isNew ? '新' : '回访'}访客 | 会话ID: ${stats.visitorId.substring(0, 12)}...
                        </div>
                    `;
            }
        }
        
        // 获取相对时间
        getTimeAgo() {
            const now = new Date();
            const diff = now - this.data.lastUpdate;
            const mins = Math.floor(diff / 60000);
            
            if (mins < 1) return '刚刚';
            if (mins < 60) return `${mins}分钟前`;
            return `${Math.floor(mins/60)}小时前`;
        }
        
        // 设置自动刷新
        setupAutoRefresh() {
            // 每30秒更新一次在线用户和访问量
            setInterval(() => {
                this.initData();
                this.scanAndRender();
            }, 30000);
        }
    }
    
    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.visitorSystem = new FixedVisitorSystem();
        });
    } else {
        window.visitorSystem = new FixedVisitorSystem();
    }
})();