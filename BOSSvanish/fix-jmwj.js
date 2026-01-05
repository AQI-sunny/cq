// pages.js - 修复PC端Edge和Google浏览器打不开窗口的问题

// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', function() {
    // 设备检测
    const isTouchDevice = 'ontouchstart' in window || 
                          navigator.maxTouchPoints > 0 || 
                          (window.DocumentTouch && document instanceof DocumentTouch);
    
    // 获取DOM元素 - 使用更安全的获取方式
    const closeWindowBtn = document.getElementById('closeWindowBtn');
    const fileArea = document.getElementById('fileArea');
    const modalOverlay = document.getElementById('modalOverlay');
    
    // important弹窗元素
    const importantModal = document.getElementById('importantModal');
    const closeImportantModal = document.getElementById('closeImportantModal');
    const closeImportantBtn = document.getElementById('closeImportantBtn');
    
    // fcjh弹窗元素
    const fcjhModal = document.getElementById('fcjhModal');
    const closeFcjhModal = document.getElementById('closeFcjhModal');
    const closeFcjhBtn = document.getElementById('closeFcjhBtn');
    
    // 当前选中的文件和窗口状态
    let selectedFile = null;
    let isMaximized = false;
    
    // 存储原始body样式用于还原
    let originalBodyStyle = {};
    
    // 初始化函数
    function init() {
        console.log('初始化页面脚本...');
        
        // 保存原始样式
        saveOriginalStyles();
        
        // 初始化所有事件监听器
        initializeEventListeners();
        
        // 初始化模态框按钮
        initializeModalButtons();
        
        // 设置真实视口高度（移动端适配）
        setRealViewportHeight();
        
        // 添加窗口调整大小监听
        setupResizeListeners();
        
        // 初始化完成
        console.log('页面脚本初始化完成');
    }
    
    // 保存原始样式
    function saveOriginalStyles() {
        if (document.body) {
            originalBodyStyle = {
                margin: document.body.style.margin || getComputedStyle(document.body).margin,
                borderRadius: document.body.style.borderRadius || getComputedStyle(document.body).borderRadius,
                maxWidth: document.body.style.maxWidth || getComputedStyle(document.body).maxWidth,
                maxHeight: document.body.style.maxHeight || getComputedStyle(document.body).maxHeight,
                overflow: document.body.style.overflow || getComputedStyle(document.body).overflow
            };
        }
    }
    
    // 初始化所有事件监听器
    function initializeEventListeners() {
        // 关闭窗口按钮
        if (closeWindowBtn) {
            closeWindowBtn.addEventListener('click', closeWindowHandler);
        }
        
        // 最小化按钮
        const minimizeBtn = document.querySelector('.window-btn.minimize');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', minimizeWindowHandler);
        }
        
        // 最大化按钮
        const maximizeBtn = document.querySelector('.window-btn.maximize');
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', maximizeWindowHandler);
        }
        
        // 文件区域点击事件
        if (fileArea) {
            // 使用事件委托处理文件点击
            fileArea.addEventListener('click', fileClickHandler);
            
            // 触摸设备添加触摸事件
            if (isTouchDevice) {
                fileArea.addEventListener('touchstart', fileTouchHandler, { passive: true });
            }
            
            // 桌面端双击事件
            if (!isTouchDevice) {
                fileArea.addEventListener('dblclick', fileDoubleClickHandler);
            }
        }
        
        // 工具栏按钮
        document.querySelectorAll('.toolbar-button').forEach(button => {
            button.addEventListener('click', toolbarButtonHandler);
        });
        
        // 侧边栏项目
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', sidebarItemHandler);
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', keyboardShortcutHandler);
        
        // 阻止右键菜单
        document.addEventListener('contextmenu', contextMenuHandler);
        
        // 模态框遮罩点击
        if (modalOverlay) {
            modalOverlay.addEventListener('click', modalOverlayClickHandler);
        }
    }
    
    // 初始化模态框按钮
    function initializeModalButtons() {
        console.log('初始化模态框按钮...');
        
        // 为 important.txt 弹窗的关闭按钮绑定事件
        if (closeImportantModal) {
            closeImportantModal.onclick = closeModal;
        }
        
        if (closeImportantBtn) {
            closeImportantBtn.onclick = closeModal;
        }
        
        // 为 fcjh.txt 弹窗的关闭按钮绑定事件
        if (closeFcjhModal) {
            closeFcjhModal.onclick = closeModal;
        }
        
        if (closeFcjhBtn) {
            closeFcjhBtn.onclick = closeModal;
        }
        
        // 确保所有模态框初始隐藏
        if (importantModal) importantModal.style.display = 'none';
        if (fcjhModal) fcjhModal.style.display = 'none';
    }
    
    // ========== 事件处理函数 ==========
    
   
    
    // 最小化窗口处理
    function minimizeWindowHandler() {
        console.log('最小化按钮被点击');
        
        // 最小化效果
        document.body.style.transform = 'scale(0.95)';
        document.body.style.opacity = '0.8';
        document.body.style.transition = 'all 0.3s ease';
        
        // 触摸设备优化
        if (isTouchDevice) {
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        }
        
        // 1.5秒后恢复
        setTimeout(() => {
            document.body.style.transform = '';
            document.body.style.opacity = '';
        }, 1500);
    }
    
    // 最大化窗口处理
    function maximizeWindowHandler() {
        console.log('最大化/还原按钮被点击');
        
        if (!isMaximized) {
            // 最大化
            document.body.style.margin = '0';
            document.body.style.borderRadius = '0';
            document.body.style.maxWidth = '100%';
            document.body.style.maxHeight = '100%';
            this.innerHTML = '<i class="fas fa-clone"></i>';
            this.title = '还原';
            isMaximized = true;
        } else {
            // 还原
            document.body.style.margin = originalBodyStyle.margin || '';
            document.body.style.borderRadius = originalBodyStyle.borderRadius || '';
            document.body.style.maxWidth = originalBodyStyle.maxWidth || '';
            document.body.style.maxHeight = originalBodyStyle.maxHeight || '';
            this.innerHTML = '<i class="fas fa-square"></i>';
            this.title = '最大化';
            isMaximized = false;
        }
    }
    
    // 文件点击处理
    function fileClickHandler(e) {
        // 防止事件冒泡
        e.stopPropagation();
        
        let fileItem = e.target.closest('.file-item');
        if (!fileItem) return;
        
        handleFileSelection(fileItem);
        
        // 获取文件信息
        const fileName = fileItem.getAttribute('data-file-name');
        
        // 根据文件名打开对应的弹窗
        if (fileName === 'important.txt' && importantModal) {
            openModal(importantModal);
        } else if (fileName === 'fcjh.txt' && fcjhModal) {
            openModal(fcjhModal);
        }
    }
    
    // 文件触摸处理
    function fileTouchHandler(e) {
        if (e.cancelable) {
            e.preventDefault();
        }
        
        let touch = e.touches[0];
        let targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        let fileItem = targetElement.closest('.file-item');
        
        if (!fileItem) return;
        
        handleFileSelection(fileItem);
        
        // 获取文件信息
        const fileName = fileItem.getAttribute('data-file-name');
        
        // 根据文件名打开对应的弹窗
        if (fileName === 'important.txt' && importantModal) {
            openModal(importantModal);
        } else if (fileName === 'fcjh.txt' && fcjhModal) {
            openModal(fcjhModal);
        }
    }
    
    // 文件双击处理
    function fileDoubleClickHandler(e) {
        let fileItem = e.target.closest('.file-item');
        if (!fileItem) return;
        
        const fileName = fileItem.getAttribute('data-file-name');
        
        if (fileName === 'important.txt' && importantModal) {
            openModal(importantModal);
        } else if (fileName === 'fcjh.txt' && fcjhModal) {
            openModal(fcjhModal);
        }
    }
    
    // 处理文件选择
    function handleFileSelection(fileItem) {
        // 移除所有文件项的选中状态
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // 添加当前文件项的选中状态
        fileItem.classList.add('selected');
        selectedFile = fileItem;
        
        // 更新状态栏
        const statusBar = document.querySelector('.status-bar div:last-child');
        if (statusBar) {
            statusBar.textContent = '已选择 1 个项目';
        }
    }
    
    // 工具栏按钮处理
    function toolbarButtonHandler() {
        console.log('工具栏按钮被点击:', this.textContent.trim());
        
        // 触摸设备优化
        if (isTouchDevice) {
            this.style.backgroundColor = '#d8d8d8';
            setTimeout(() => {
                this.style.backgroundColor = '';
            }, 200);
        }
    }
    
    // 侧边栏项目处理
    function sidebarItemHandler() {
        document.querySelectorAll('.sidebar-item').forEach(i => {
            i.classList.remove('active');
        });
        this.classList.add('active');
    }
    
    // 键盘快捷键处理
    function keyboardShortcutHandler(e) {
        // Alt+F4 关闭窗口
        if (e.altKey && e.key === 'F4') {
            e.preventDefault();
            if (closeWindowBtn) closeWindowBtn.click();
        }
        
        // Esc 关闭弹窗
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    }
    
    // 右键菜单处理
    function contextMenuHandler(e) {
        if (e.target.closest('.file-item') || e.target.closest('.title-bar')) {
            e.preventDefault();
        }
    }
    
    // 模态框遮罩点击处理
    function modalOverlayClickHandler(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    }
    
    // ========== 模态框功能 ==========
    
    // 打开模态框
    function openModal(modal) {
        if (!modal || !modalOverlay) return;
        
        console.log('打开模态框:', modal.id);
        
        // 隐藏所有弹窗
        document.querySelectorAll('.modal').forEach(m => {
            if (m) m.style.display = 'none';
        });
        
        // 显示指定的弹窗
        modal.style.display = 'flex';
        modal.style.flexDirection = 'column';
        modalOverlay.classList.add('active');
        
        // 阻止背景滚动
        document.body.style.overflow = 'hidden';
        
        // 触摸设备优化：禁止背景滚动
        if (isTouchDevice) {
            document.addEventListener('touchmove', preventScroll, { passive: false });
        }
        
        // 确保模态框在视图中居中
        setTimeout(() => {
            modal.scrollTop = 0;
        }, 10);
    }
    
    // 关闭模态框
    function closeModal() {
        if (!modalOverlay) return;
        
        console.log('关闭模态框');
        
        modalOverlay.classList.remove('active');
        
        // 恢复背景滚动
        document.body.style.overflow = originalBodyStyle.overflow || '';
        
        // 触摸设备优化：恢复滚动
        if (isTouchDevice) {
            document.removeEventListener('touchmove', preventScroll);
        }
        
        // 清除文件选择
        if (selectedFile) {
            selectedFile.classList.remove('selected');
            selectedFile = null;
            
            // 更新状态栏
            const statusBar = document.querySelector('.status-bar div:last-child');
            if (statusBar) {
                statusBar.textContent = '已选择 0 个项目';
            }
        }
    }
    
    // 阻止滚动的函数
    function preventScroll(e) {
        if (modalOverlay && modalOverlay.classList.contains('active')) {
            e.preventDefault();
        }
    }
    
    // ========== 辅助函数 ==========
    
    // iOS Safari 100vh修复
    function setRealViewportHeight() {
        if (isTouchDevice && (/iPad|iPhone|iPod/.test(navigator.userAgent) || 
            (navigator.userAgent.includes('Mac') && 'ontouchend' in document))) {
            
            try {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
                
                // 设置body高度
                const bodyHeight = `calc(var(--vh, 1vh) * 100)`;
                document.body.style.height = bodyHeight;
                
                // 设置html高度
                document.documentElement.style.height = bodyHeight;
            } catch (error) {
                console.warn('设置视口高度时出错:', error);
            }
        }
    }
    
    // 设置调整大小监听器
    function setupResizeListeners() {
        window.addEventListener('resize', function() {
            setRealViewportHeight();
            
            // 防抖处理
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(setRealViewportHeight, 250);
        });
        
        window.addEventListener('orientationchange', function() {
            setTimeout(setRealViewportHeight, 100);
        });
    }
    
    // 页面加载完成后的初始化
    function onPageLoad() {
        console.log('页面加载完成，开始初始化...');
        
        // 设置初始透明效果
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        
        // 执行初始化
        init();
        
        // 淡入效果
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 50);
        
        // 检查所有必需元素
        checkRequiredElements();
    }
    
    // 检查必需元素
    function checkRequiredElements() {
        const requiredElements = [
            { id: 'closeWindowBtn', name: '关闭窗口按钮' },
            { id: 'fileArea', name: '文件区域' },
            { id: 'modalOverlay', name: '模态框遮罩' },
            { id: 'importantModal', name: '重要文件模态框' }
        ];
        
        let missingElements = [];
        
        requiredElements.forEach(element => {
            if (!document.getElementById(element.id)) {
                missingElements.push(element.name);
            }
        });
        
        if (missingElements.length > 0) {
            console.warn('以下元素未找到:', missingElements.join(', '));
        }
    }
    
    // 错误处理
    window.addEventListener('error', function(e) {
        console.error('JavaScript错误:', e.message, 'at', e.filename, ':', e.lineno);
        
        // 尝试恢复基本功能
        try {
            if (closeWindowBtn && !closeWindowBtn.onclick) {
                closeWindowBtn.onclick = closeWindowHandler;
            }
        } catch (error) {
            console.error('错误恢复失败:', error);
        }
    });
    
    // 启动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onPageLoad);
    } else {
        onPageLoad();
    }
    
    // 全局导出常用函数（如果需要）
    window.pageUtils = {
        openModal: openModal,
        closeModal: closeModal,
        isTouchDevice: isTouchDevice
    };
    
    console.log('pages.js 加载完成');
});
