/**
 * 极简页码显示系统
 * 只显示"？/总页码数"格式，无导航功能
 * 适用于单个页面组
 */

const SimplePageCounter = {
    // 配置：您的页面组
    // 请在这里添加您的所有HTML页面文件名，按顺序排列
    pageList: [
        // 示例：按您的实际文件名修改
    


'SY.html',
'jump1.html',
'smw.html',
'jqt简历.html',
'ycbg.html',
'ycbg222.html',
'langr.html',
'pingz.html',
'tiaojie.html',
'屏障2.0.html',
'brht.html',
'logs.html',
'chanpin.html',
'qiantai.html',
'7D401.html',
'pingz3-denglu.html',
'scan.html',
/* 'search.html', */
'shouquanm - xuliny.html',
'xjthj-qt.html',
'chajlquanxianm.html',
'lxm.html',
'quzhu.html',
'biaog111.html',
'shouquanm-xuliny.html',
'shouquanm.html',
'lubos.html',
'building.html',
'WEAK.html',
/* 'wjmydh.html', */
'zbjs.html',
'xly.html',
'yjyjyjj.html',
'fanzhi.html',
'dxsdxs.html',

'hidden-114.html',
'co134-lxc.html',

'ta.html',
'horrorsy.html',
'bejieju.html',
'bejieju2.html',
'nest.html',
'SGXY.html',
'jiejuaaa.html',
'jiejubbb.html',
'jiejucc.html'
],
    
    // 样式 - 极简风格
    styles: `
        #simple-page-counter {
            position: fixed;
            bottom: 12px;
            right: 12px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 3px;
            padding: 5px 8px;
            font-size: 12px;
            font-family: monospace;
            font-weight: bold;
            z-index: 9999;
            opacity: 0.7;
            transition: opacity 0.2s;
            cursor: default;
            user-select: none;
        }
        
        #simple-page-counter:hover {
            opacity: 0.9;
        }
        
        /* 移动端更小 */
        @media (max-width: 768px) {
            #simple-page-counter {
                font-size: 11px;
                padding: 4px 6px;
                bottom: 8px;
                right: 8px;
            }
        }
    `,
    
    // 初始化
    init: function() {
        // 注入样式
        this.injectStyles();
        
        // 获取当前页码
        const pageNumber = this.getPageNumber();
        
        // 显示页码
        if (pageNumber) {
            this.showPageCounter(pageNumber);
        }
    },
    
    // 注入样式
    injectStyles: function() {
        if (!document.getElementById('simple-counter-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'simple-counter-styles';
            styleEl.textContent = this.styles;
            document.head.appendChild(styleEl);
        }
    },
    
    // 获取当前页码
    getPageNumber: function() {
        // 获取当前文件名
        const currentFile = this.getCurrentFileName();
        
        // 在页面列表中查找当前文件
        const pageIndex = this.pageList.indexOf(currentFile);
        
        if (pageIndex !== -1) {
            // 找到文件，返回页码信息
            return {
                current: pageIndex + 1,  // 当前是第几页（从1开始）
                total: this.pageList.length  // 总页数
            };
        }
        
        // 如果没找到，尝试其他方法
        
        // 方法1: 从URL参数获取
        const urlInfo = this.getFromURL();
        if (urlInfo) return urlInfo;
        
        // 方法2: 从data属性获取
        const dataInfo = this.getFromData();
        if (dataInfo) return dataInfo;
        
        // 方法3: 从文件名猜测（如果文件名包含数字）
        const guessInfo = this.guessFromFilename(currentFile);
        if (guessInfo) return guessInfo;
        
        return null;
    },
    
    // 从URL参数获取页码
    getFromURL: function() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // 检查常见页码参数
        const pageParams = ['page', 'p', 'pg', 'pagenum'];
        for (const param of pageParams) {
            if (urlParams.has(param)) {
                const pageNum = parseInt(urlParams.get(param)) || 1;
                return {
                    current: pageNum,
                    total: this.pageList.length || pageNum + 5
                };
            }
        }
        
        return null;
    },
    
    // 从data属性获取
    getFromData: function() {
        const pageElements = document.querySelectorAll('[data-page], [data-page-num], [data-current-page]');
        
        for (const el of pageElements) {
            let current = 1;
            
            if (el.dataset.page) {
                current = parseInt(el.dataset.page);
            } else if (el.dataset.pageNum) {
                current = parseInt(el.dataset.pageNum);
            } else if (el.dataset.currentPage) {
                current = parseInt(el.dataset.currentPage);
            }
            
            if (current > 0) {
                return {
                    current: current,
                    total: this.pageList.length || current + 3
                };
            }
        }
        
        return null;
    },
    
    // 从文件名猜测（如果文件名包含数字）
    guessFromFilename: function(filename) {
        // 提取文件名中的数字
        const matches = filename.match(/\d+/g);
        
        if (matches && matches.length > 0) {
            const pageNum = parseInt(matches[0]);
            if (pageNum > 0) {
                return {
                    current: pageNum,
                    total: this.pageList.length || pageNum + 3
                };
            }
        }
        
        return null;
    },
    
    // 获取当前文件名
    getCurrentFileName: function() {
        return window.location.pathname.split('/').pop() || 'index.html';
    },
    
    // 显示页码计数器
    showPageCounter: function(pageInfo) {
        // 移除已存在的
        const existing = document.getElementById('simple-page-counter');
        if (existing) existing.remove();
        
        // 创建计数器
        const counter = document.createElement('div');
        counter.id = 'simple-page-counter';
        
        // 设置文本格式：当前页/总页数
        counter.textContent = `${pageInfo.current}/${pageInfo.total}`;
        
        // 添加到页面
        document.body.appendChild(counter);
        
        // 可选：添加标题属性显示更多信息
        counter.title = `当前第 ${pageInfo.current} 页，共 ${pageInfo.total} 页`;
    }
};

// 使用方法：
// 1. 修改上面的 pageList 数组，添加您的所有HTML文件名
// 2. 将此JS文件引入到您的所有HTML页面中

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SimplePageCounter.init());
} else {
    setTimeout(() => SimplePageCounter.init(), 100);
}

// 暴露为全局对象
window.SimplePageCounter = SimplePageCounter;