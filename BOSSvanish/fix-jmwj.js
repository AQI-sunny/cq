// pages.js - 修复所有浏览器和设备的文件打开问题
// 全面修复HTML、PDF和TXT文件弹窗，确保跨浏览器兼容

(function() {
    'use strict';
    
    // 全局变量
    let currentFile = null;
    let currentFileType = '';
    let currentFileName = '';
    
    // 文件映射配置
    const fileConfig = {
        // HTML文件映射
        html: {
            '协议草案.html': 'xieyicaoan.html',
            '商业档案.html': 'shangyda.html',
            'police.html': 'shouquanma.html',
            '监控分析报告.html': 'jiank.html',
            '物业维护日志系统.html': 'wuyeriz.html'
        },
        // PDF文件映射
        pdf: {
            '电子扫描件.pdf': 'mingche.html'
        },
        // TXT文件映射
        txt: {
            'important.txt': null, // 使用模态框显示
            'fcjh.txt': null,
            '日程安排.txt': null
        }
    };
    
    // 设备检测
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isEdge = /Edge\/\d+/i.test(navigator.userAgent);
    const isChrome = /Chrome\/\d+/i.test(navigator.userAgent) && !isEdge;
    
    // 确保页面完全加载
    function initialize() {
        console.log('开始初始化文件弹窗功能...');
        console.log('浏览器信息:', navigator.userAgent);
        console.log('设备类型:', isTouchDevice ? '触摸设备' : '桌面设备');
        
        // 修复跨浏览器CSS问题
        fixCrossBrowserCSS();
        
        // 获取关键DOM元素
        const fileArea = document.getElementById('fileArea');
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (!fileArea) {
            console.error('找不到文件区域元素');
            return;
        }
        
        if (!modalOverlay) {
            console.warn('找不到模态框遮罩元素，将创建动态模态框');
            createDynamicModalOverlay();
        }
        
        // 初始化弹窗按钮事件
        setupModalButtons();
        
        // 绑定文件点击事件
        bindFileClickEvents(fileArea);
        
        // 修复模态框显示问题
        fixModalDisplay();
        
        // 初始化模态框内容
        initializeModalContents();
        
        console.log('文件弹窗功能初始化完成');
    }
    
    // 修复跨浏览器CSS问题
    function fixCrossBrowserCSS() {
        // 修复Edge和Chrome的模态框显示问题
        if (isEdge || isChrome) {
            document.documentElement.style.setProperty('--modal-backdrop-filter', 'none');
            
            // 修复模态框动画
            const style = document.createElement('style');
            style.textContent = `
                .modal-overlay {
                    -webkit-backdrop-filter: none !important;
                    backdrop-filter: none !important;
                }
                .modal {
                    -webkit-transform: translateY(0);
                    transform: translateY(0);
                }
                .modal-overlay.active .modal {
                    -webkit-transform: translateY(0) !important;
                    transform: translateY(0) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // 创建动态模态框遮罩
    function createDynamicModalOverlay() {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.id = 'modalOverlay';
        modalOverlay.innerHTML = `
            <!-- HTML文件弹窗 -->
            <div class="modal" id="htmlModal">
                <div class="modal-header">
                    <div class="modal-title" id="htmlModalTitle">HTML文件</div>
                    <button class="modal-close" id="closeHtmlModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="html-modal-content" id="htmlModalContent">
                        <i class="fab fa-html5"></i>
                        <h3 id="htmlFileName">文件名.html</h3>
                        <p>此文件为HTML格式，点击下方按钮打开查看内容</p>
                        <div class="links-container" id="htmlLinksContainer"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelHtmlBtn">取消</button>
                    <button class="btn btn-primary" id="confirmHtmlBtn">打开</button>
                </div>
            </div>
            
            <!-- PDF文件弹窗 -->
            <div class="modal" id="pdfModal">
                <div class="modal-header">
                    <div class="modal-title" id="pdfModalTitle">PDF文件</div>
                    <button class="modal-close" id="closePdfModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="pdf-modal-content" id="pdfModalContent">
                        <i class="fas fa-file-pdf"></i>
                        <h3 id="pdfFileName">文件名.pdf</h3>
                        <p>此文件为PDF格式，点击下方按钮打开查看内容</p>
                        <div class="links-container" id="pdfLinksContainer"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelPdfBtn">取消</button>
                    <button class="btn btn-primary" id="openPdfBtn">打开</button>
                </div>
            </div>
            
            <!-- 重要文件弹窗 -->
            <div class="modal" id="importantModal">
                <div class="modal-header">
                    <div class="modal-title">一些密言.txt</div>
                    <button class="modal-close" id="closeImportantModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="txt-content">
                        调查发现物业管理处的周于彰在12.31日行迹可疑，我黑进了物业管理系统。
                        <br>
                        鉴于严小姐只让我调查李先生的相关黑料，这部分内容我未做深入调查。
                        <br>
                        police系统及其物证编号都是魏警官提供的，至于为什么通过我，这我便不得而知了。我只知道，魏警官并不希望真凶潜逃，无论真相是什么。
                        <br>
                        本次调查的酬金沈小姐已支付，关于李先生的相关资料都在这个文件夹里了，我只做调查，至于是否上交魏警官...这便不关我事了，剩下的由你们决定。
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="closeImportantBtn">关闭</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);
    }
    
    // 初始化模态框内容
    function initializeModalContents() {
        // 为HTML模态框添加链接容器
        const htmlModalContent = document.getElementById('htmlModalContent');
        if (htmlModalContent && !document.getElementById('htmlLinksContainer')) {
            const linksContainer = document.createElement('div');
            linksContainer.className = 'links-container';
            linksContainer.id = 'htmlLinksContainer';
            htmlModalContent.appendChild(linksContainer);
        }
        
        // 为PDF模态框添加链接容器
        const pdfModalContent = document.getElementById('pdfModalContent');
        if (pdfModalContent && !document.getElementById('pdfLinksContainer')) {
            const linksContainer = document.createElement('div');
            linksContainer.className = 'links-container';
            linksContainer.id = 'pdfLinksContainer';
            pdfModalContent.appendChild(linksContainer);
        }
    }
    
    // 设置弹窗关闭按钮事件
    function setupModalButtons() {
        // HTML弹窗关闭按钮
        const closeHtmlModal = document.getElementById('closeHtmlModal');
        const cancelHtmlBtn = document.getElementById('cancelHtmlBtn');
        const confirmHtmlBtn = document.getElementById('confirmHtmlBtn');
        
        if (closeHtmlModal) {
            closeHtmlModal.onclick = closeAllModals;
        }
        
        if (cancelHtmlBtn) {
            cancelHtmlBtn.onclick = closeAllModals;
        }
        
        if (confirmHtmlBtn) {
            confirmHtmlBtn.addEventListener('click', function() {
                openFile(currentFileName, currentFileType);
            });
        }
        
        // PDF弹窗关闭按钮
        const closePdfModal = document.getElementById('closePdfModal');
        const cancelPdfBtn = document.getElementById('cancelPdfBtn');
        const openPdfBtn = document.getElementById('openPdfBtn');
        
        if (closePdfModal) {
            closePdfModal.onclick = closeAllModals;
        }
        
        if (cancelPdfBtn) {
            cancelPdfBtn.onclick = closeAllModals;
        }
        
        if (openPdfBtn) {
            openPdfBtn.addEventListener('click', function() {
                openFile(currentFileName, currentFileType);
            });
        }
        
        // 重要文件弹窗关闭按钮
        const closeImportantModal = document.getElementById('closeImportantModal');
        const closeImportantBtn = document.getElementById('closeImportantBtn');
        
        if (closeImportantModal) {
            closeImportantModal.onclick = closeAllModals;
        }
        
        if (closeImportantBtn) {
            closeImportantBtn.onclick = closeAllModals;
        }
        
        // 点击遮罩层关闭弹窗
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === modalOverlay) {
                    closeAllModals();
                }
            });
        }
        
        // Esc键关闭弹窗
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });
        
        // 确保关闭窗口按钮正常工作
        /* const closeWindowBtn = document.getElementById('closeWindowBtn');
        if (closeWindowBtn && !closeWindowBtn.hasAttribute('data-event-bound')) {
            closeWindowBtn.setAttribute('data-event-bound', 'true');
            closeWindowBtn.addEventListener('click', function() {
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    window.location.href = './reindn.html';
                }, 300);
            });
        } */
    }
    
    // 绑定文件点击事件
    function bindFileClickEvents(fileArea) {
        // 使用事件委托处理文件点击
        fileArea.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            const fileItem = e.target.closest('.file-item');
            if (!fileItem) return;
            
            handleFileClick(fileItem);
        });
        
        // 触摸设备优化
        if (isTouchDevice) {
            fileArea.addEventListener('touchstart', function(e) {
                e.stopPropagation();
            }, { passive: true });
        }
        
        // 桌面设备双击支持
        if (!isTouchDevice) {
            fileArea.addEventListener('dblclick', function(e) {
                const fileItem = e.target.closest('.file-item');
                if (!fileItem) return;
                
                handleFileClick(fileItem);
            });
        }
    }
    
    // 处理文件点击
    function handleFileClick(fileItem) {
        // 获取文件信息
        const fileName = fileItem.getAttribute('data-file-name');
        const fileType = fileItem.getAttribute('data-file-type');
        
        if (!fileName || !fileType) {
            console.warn('文件缺少必要属性:', fileItem);
            return;
        }
        
        // 设置选中状态
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('selected');
        });
        fileItem.classList.add('selected');
        
        // 更新状态栏
        updateStatusBar(1);
        
        // 保存当前文件信息
        currentFile = fileItem;
        currentFileName = fileName;
        currentFileType = fileType;
        
        console.log('点击文件:', fileName, '类型:', fileType);
        
        // 根据文件类型打开对应弹窗
        if (fileType === 'html') {
            openHtmlModal(fileName);
        } else if (fileType === 'pdf') {
            openPdfModal(fileName);
        } else if (fileType === 'txt') {
            openTxtModal(fileName);
        } else {
            console.warn('不支持的文件类型:', fileType);
        }
    }
    
    // 打开HTML模态框
    function openHtmlModal(fileName) {
        // 更新模态框标题
        const htmlModalTitle = document.getElementById('htmlModalTitle');
        const htmlFileName = document.getElementById('htmlFileName');
        
        if (htmlModalTitle) htmlModalTitle.textContent = fileName;
        if (htmlFileName) htmlFileName.textContent = fileName;
        
        // 更新链接容器
        updateHtmlLinks(fileName);
        
        // 打开模态框
        openSpecificModal('htmlModal');
    }
    
    // 打开PDF模态框
    function openPdfModal(fileName) {
        // 更新模态框标题
        const pdfModalTitle = document.getElementById('pdfModalTitle');
        const pdfFileName = document.getElementById('pdfFileName');
        
        if (pdfModalTitle) pdfModalTitle.textContent = fileName;
        if (pdfFileName) pdfFileName.textContent = fileName;
        
        // 更新链接容器
        updatePdfLinks(fileName);
        
        // 打开模态框
        openSpecificModal('pdfModal');
    }
    
    // 打开TXT模态框
    function openTxtModal(fileName) {
        if (fileName === 'important.txt') {
            openSpecificModal('importantModal');
        } else {
            console.warn('未处理的TXT文件:', fileName);
        }
    }
    
    // 更新HTML链接容器
    function updateHtmlLinks(fileName) {
        const linksContainer = document.getElementById('htmlLinksContainer');
        if (!linksContainer) return;
        
        linksContainer.innerHTML = '';
        
        // 添加主链接
        if (fileConfig.html[fileName]) {
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            linkItem.innerHTML = `
                <i class="fab fa-html5 link-icon"></i>
                <div class="link-text">${fileName}</div>
            `;
            linkItem.addEventListener('click', () => {
                openFile(fileName, 'html');
            });
            linksContainer.appendChild(linkItem);
        }
        
        // 对于特定文件添加额外链接
        if (fileName === 'police.html') {
            const extraLink = document.createElement('div');
            extraLink.className = 'link-item';
            extraLink.innerHTML = `
                <i class="fas fa-external-link-alt link-icon"></i>
                <div class="link-text">授权码文件（备用链接）</div>
            `;
            extraLink.addEventListener('click', () => {
                openFile(fileName, 'html');
            });
            linksContainer.appendChild(extraLink);
        }
    }
    
    // 更新PDF链接容器
    function updatePdfLinks(fileName) {
        const linksContainer = document.getElementById('pdfLinksContainer');
        if (!linksContainer) return;
        
        linksContainer.innerHTML = '';
        
        if (fileConfig.pdf[fileName]) {
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            linkItem.innerHTML = `
                <i class="fas fa-file-pdf link-icon"></i>
                <div class="link-text">${fileName}</div>
            `;
            linkItem.addEventListener('click', () => {
                openFile(fileName, 'pdf');
            });
            linksContainer.appendChild(linkItem);
        }
    }
    
    // 打开文件
    function openFile(fileName, fileType) {
        let targetFile = null;
        
        // 根据文件类型获取目标文件
        if (fileType === 'html' && fileConfig.html[fileName]) {
            targetFile = fileConfig.html[fileName];
        } else if (fileType === 'pdf' && fileConfig.pdf[fileName]) {
            targetFile = fileConfig.pdf[fileName];
        }
        
        if (targetFile) {
            // 添加加载效果
            document.body.style.opacity = '0.7';
            document.body.style.transition = 'opacity 0.3s ease';
            
            console.log('正在打开文件:', targetFile);
            
            // 延迟跳转以显示动画
            setTimeout(() => {
                window.location.href = targetFile;
            }, 300);
        } else {
            console.error('找不到对应的文件:', fileName, '类型:', fileType);
            alert('无法打开文件：' + fileName);
            closeAllModals();
        }
    }
    
    // 打开特定弹窗
    function openSpecificModal(modalId) {
        const modal = document.getElementById(modalId);
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (!modal || !modalOverlay) {
            console.error('找不到弹窗或遮罩元素:', modalId);
            return;
        }
        
        // 隐藏所有弹窗
        document.querySelectorAll('.modal').forEach(m => {
            m.style.display = 'none';
        });
        
        // 显示目标弹窗
        modal.style.display = 'flex';
        modalOverlay.style.display = 'flex';
        modalOverlay.classList.add('active');
        
        // 强制重绘以触发动画
        void modalOverlay.offsetWidth;
        
        // 阻止背景滚动
        document.body.style.overflow = 'hidden';
        
        console.log('打开弹窗:', modalId);
    }
    
    // 关闭所有弹窗
    function closeAllModals() {
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (!modalOverlay) return;
        
        modalOverlay.classList.remove('active');
        
        // 延迟隐藏以确保动画完成
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            document.querySelectorAll('.modal').forEach(m => {
                m.style.display = 'none';
            });
        }, 300);
        
        // 恢复背景滚动
        document.body.style.overflow = '';
        
        // 清除文件选择状态
        const selectedFiles = document.querySelectorAll('.file-item.selected');
        selectedFiles.forEach(file => {
            file.classList.remove('selected');
        });
        
        // 更新状态栏
        updateStatusBar(0);
        
        // 重置当前文件
        currentFile = null;
        currentFileName = '';
        currentFileType = '';
        
        console.log('关闭所有弹窗');
    }
    
    // 更新状态栏
    function updateStatusBar(selectedCount) {
        const statusBar = document.querySelector('.status-bar div:last-child');
        if (statusBar) {
            statusBar.textContent = `已选择 ${selectedCount} 个项目`;
        }
    }
    
    // 修复模态框显示问题
    function fixModalDisplay() {
        const modals = document.querySelectorAll('.modal');
        const modalOverlay = document.getElementById('modalOverlay');
        
        // 确保模态框初始隐藏
        modals.forEach(modal => {
            if (modal) {
                modal.style.display = 'none';
            }
        });
        
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
            modalOverlay.classList.remove('active');
        }
        
        // 修复定位问题
        if (modalOverlay) {
            modalOverlay.style.position = 'fixed';
            modalOverlay.style.top = '0';
            modalOverlay.style.left = '0';
            modalOverlay.style.zIndex = '1000';
        }
        
        // 修复滚动时的位置
        window.addEventListener('scroll', function() {
            if (modalOverlay && modalOverlay.classList.contains('active')) {
                modalOverlay.style.top = `${window.scrollY}px`;
                modalOverlay.style.height = `calc(100% + ${Math.abs(window.scrollY)}px)`;
            }
        });
    }
    
    // 触摸设备优化
    function optimizeForTouchDevices() {
        if (!isTouchDevice) return;
        
        // 增加点击区域
        document.querySelectorAll('.file-item').forEach(item => {
            item.style.minHeight = '44px';
            item.style.minWidth = '44px';
        });
        
        // 优化按钮点击
        document.querySelectorAll('button').forEach(button => {
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
        });
        
        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    // 页面加载后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // 先修复跨浏览器兼容性问题
            fixCrossBrowserCSS();
            fixModalDisplay();
            optimizeForTouchDevices();
            
            // 然后初始化功能
            initialize();
            
            console.log('文件弹窗修复脚本加载完成（DOMContentLoaded）');
        });
    } else {
        // 如果DOM已经加载完成，直接执行
        fixCrossBrowserCSS();
        fixModalDisplay();
        optimizeForTouchDevices();
        initialize();
        console.log('文件弹窗修复脚本加载完成（DOM已就绪）');
    }
    
    // 导出必要函数到全局作用域
    window.fileManager = {
        openModal: openSpecificModal,
        closeModal: closeAllModals,
        openFile: openFile,
        getCurrentFile: function() {
            return {
                element: currentFile,
                name: currentFileName,
                type: currentFileType
            };
        }
    };
    
    // 添加全局错误处理
    window.addEventListener('error', function(e) {
        console.error('全局错误:', e.error);
        console.error('发生在:', e.filename, '第', e.lineno, '行');
    });
    
    // 添加未处理的Promise拒绝处理
    window.addEventListener('unhandledrejection', function(e) {
        console.error('未处理的Promise拒绝:', e.reason);
    });
})();
