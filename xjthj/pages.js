/**
 * 极简页码显示系统
 * 只显示"？/总页码数"格式，无导航功能
 * 适用于单个页面组
 */

const SimplePageCounter = {
    // 配置：严格按照您要求的顺序排列
    pageList: [
        'SY.html',
        'jqt简历.html',
        'jump1.html',
        'smw.html',
        'ycbg.html',
        'ycbg222.html',
         'chanpin.html',
        'langr.html',
        'pingz.html',
        'tiaojie.html',
        '屏障2.0.html',
        'brht.html',
        'logs.html',
        'quzhu.html',
        'qiantai.html',
        '7D401.html',
        'pingz3-denglu.html',
        'scan.html',
        'xjthj-qt.html',
        'chajlquanxianm.html',
        'lxm.html',
        'biaog111.html',
        'shouquanm.html',
        'lubos.html',
        'building.html',
        'WEAK.html',
        'luqiyan.html',
        'zbjs.html',
        'xly.html',
        'yjyjyjj.html',
        'fanzhi.html',
        'dxsdxs.html',
        'hidden-114.html',
        'co134-lxc.html',
        'ta.html',
        'horrorsy.html',
        'lianxjz.html',
        'bejieju.html',
        'nest.html',
        'sgxy2.html',
        'jiejuaaa.html',
        'jiejubbb.html',
        'bejieju2.html',
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
        
        /* 未找到页面的样式 */
        #simple-page-counter.miss {
            background: rgba(255, 165, 0, 0.7); /* 橙色背景 */
            font-weight: bold;
            animation: blink 2s infinite;
        }
        
        @keyframes blink {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 0.9; }
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
        this.showPageCounter(pageNumber);
        
        // 输出调试信息到控制台
        this.logDebugInfo();
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
    /* getPageNumber: function() {
        // 获取当前文件名
        const currentFile = this.getCurrentFileName();
        
        // 首先尝试精确匹配
        let pageIndex = this.pageList.indexOf(currentFile);
        
        // 如果精确匹配失败，尝试多种匹配策略
        if (pageIndex === -1) {
            // 1. 尝试去除URL编码
            try {
                const decodedFile = decodeURIComponent(currentFile);
                pageIndex = this.pageList.indexOf(decodedFile);
            } catch (e) {
                // 如果解码失败，忽略
            }
        }
        
        // 2. 尝试去除查询参数和哈希
        if (pageIndex === -1) {
            const cleanFile = currentFile.split('?')[0].split('#')[0];
            pageIndex = this.pageList.indexOf(cleanFile);
        }
        
        // 3. 尝试处理空格差异
        if (pageIndex === -1) {
            for (let i = 0; i < this.pageList.length; i++) {
                const pageFile = this.pageList[i];
                const normalizedCurrent = currentFile.replace(/\s+/g, ' ').trim();
                const normalizedPage = pageFile.replace(/\s+/g, ' ').trim();
                
                if (normalizedCurrent === normalizedPage) {
                    pageIndex = i;
                    break;
                }
            }
        }
        
        // 4. 尝试部分匹配
        if (pageIndex === -1) {
            for (let i = 0; i < this.pageList.length; i++) {
                const pageFile = this.pageList[i];
                
                // 检查是否相互包含
                if (currentFile.includes(pageFile) || pageFile.includes(currentFile)) {
                    pageIndex = i;
                    break;
                }
            }
        }
        
        // 返回结果
        if (pageIndex !== -1) {
            return {
                current: pageIndex + 1,  // 当前是第几页（从1开始）
                total: this.pageList.length,  // 总页数
                found: true,
                fileName: this.pageList[pageIndex]
            };
        } else {
            // 没找到页面
            return {
                current: 0,
                total: this.pageList.length,
                found: false,
                fileName: currentFile
            };
        }
    }, */
    
    
    // 从URL参数获取页码（备用方法）
   /*  getFromURL: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const pageParams = ['page', 'p', 'pg', 'pagenum'];
        
        for (const param of pageParams) {
            if (urlParams.has(param)) {
                const pageNum = parseInt(urlParams.get(param)) || 1;
                return {
                    current: pageNum,
                    total: this.pageList.length,
                    found: true
                };
            }
        }
        return null;
    }, */
// 获取当前页码
getPageNumber: function() {
    // 先尝试从URL参数获取（如果有的话）
    const urlPageInfo = this.getFromURL();
    if (urlPageInfo) return urlPageInfo;
    
    // 获取当前文件名
    const currentFile = this.getCurrentFileName();
    
    // 首先尝试去除查询参数和哈希
    const cleanFile = currentFile.split('?')[0].split('#')[0];
    let pageIndex = this.pageList.indexOf(cleanFile);
    
    // 如果没找到，尝试URL解码
    if (pageIndex === -1) {
        try {
            const decodedFile = decodeURIComponent(cleanFile);
            pageIndex = this.pageList.indexOf(decodedFile);
        } catch (e) {
            // 如果解码失败，忽略
        }
    }
    
    // 如果还没找到，尝试精确匹配原始文件名
    if (pageIndex === -1) {
        pageIndex = this.pageList.indexOf(currentFile);
    }
    
    // 尝试处理空格差异
    if (pageIndex === -1) {
        for (let i = 0; i < this.pageList.length; i++) {
            const pageFile = this.pageList[i];
            const normalizedCurrent = cleanFile.replace(/\s+/g, ' ').trim();
            const normalizedPage = pageFile.replace(/\s+/g, ' ').trim();
            
            if (normalizedCurrent === normalizedPage) {
                pageIndex = i;
                break;
            }
        }
    }
    
    // 尝试部分匹配
    if (pageIndex === -1) {
        for (let i = 0; i < this.pageList.length; i++) {
            const pageFile = this.pageList[i];
            
            // 检查是否相互包含
            if (cleanFile.includes(pageFile) || pageFile.includes(cleanFile)) {
                pageIndex = i;
                break;
            }
        }
    }
    
    // 返回结果
    if (pageIndex !== -1) {
        return {
            current: pageIndex + 1,
            total: this.pageList.length,
            found: true,
            fileName: this.pageList[pageIndex]
        };
    } else {
        // 没找到页面
        return {
            current: 0,
            total: this.pageList.length,
            found: false,
            fileName: currentFile
        };
    }
},

// 从URL参数获取页码（备用方法）
getFromURL: function() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParams = ['page', 'p', 'pg', 'pagenum'];
    
    for (const param of pageParams) {
        if (urlParams.has(param)) {
            const pageNum = parseInt(urlParams.get(param)) || 1;
            return {
                current: pageNum,
                total: this.pageList.length,
                found: true
            };
        }
    }
    return null;
},
    
    
    // 获取当前文件名
    getCurrentFileName: function() {
        const pathname = window.location.pathname;
        const filename = pathname.split('/').pop() || 'index.html';
        return filename;
    },
    
    // 显示页码计数器
    showPageCounter: function(pageInfo) {
        // 移除已存在的
        const existing = document.getElementById('simple-page-counter');
        if (existing) existing.remove();
        
        // 创建计数器
        const counter = document.createElement('div');
        counter.id = 'simple-page-counter';
        
        // 根据是否找到页面设置不同的显示
        if (pageInfo.found) {
            // 找到页面：显示 当前页/总页数
            counter.textContent = `${pageInfo.current}/${pageInfo.total}`;
            counter.title = `当前第 ${pageInfo.current} 页，共 ${pageInfo.total} 页（${pageInfo.fileName}）`;
        } else {
            // 没找到页面：显示 miss/总页数
            counter.textContent = `miss/${pageInfo.total}`;
            counter.classList.add('miss');
            counter.title = `页面未在列表中：${pageInfo.fileName}，共 ${pageInfo.total} 页`;
        }
        
        // 添加到页面
        document.body.appendChild(counter);
    },
    
    // 输出调试信息
    /* logDebugInfo: function() {
        console.log('=== 页码调试信息 ===');
        console.log(`总页数: ${this.pageList.length}`);
        console.log('页面列表:');
        this.pageList.forEach((page, index) => {
            console.log(`${index + 1}. ${page}`);
        });
        
        const currentFile = this.getCurrentFileName();
        console.log(`当前文件: ${currentFile}`);
    } */
};

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SimplePageCounter.init());
} else {
    setTimeout(() => SimplePageCounter.init(), 100);
}

// 暴露为全局对象
window.SimplePageCounter = SimplePageCounter;




