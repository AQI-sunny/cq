// pages.js - 只修复PC端Edge和Google浏览器打不开窗口的问题
// 专注于修复弹窗打开问题，不影响原有跳转逻辑

(function() {
    'use strict';
    
    // 确保页面完全加载
    function initialize() {
        console.log('开始初始化弹窗功能...');
        
        // 获取关键DOM元素
        const fileArea = document.getElementById('fileArea');
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (!fileArea || !modalOverlay) {
            console.error('找不到必要的DOM元素');
            return;
        }
        
        // 初始化弹窗按钮事件
        setupModalButtons();
        
        // 绑定文件点击事件
        bindFileClickEvents(fileArea, modalOverlay);
        
        console.log('弹窗功能初始化完成');
    }
    
    // 设置弹窗关闭按钮事件
    function setupModalButtons() {
        // important.txt 弹窗关闭按钮
        const closeImportantModal = document.getElementById('closeImportantModal');
        const closeImportantBtn = document.getElementById('closeImportantBtn');
        
        if (closeImportantModal) {
            closeImportantModal.onclick = closeAllModals;
        }
        
        if (closeImportantBtn) {
            closeImportantBtn.onclick = closeAllModals;
        }
        
        // fcjh.txt 弹窗关闭按钮
        const closeFcjhModal = document.getElementById('closeFcjhModal');
        const closeFcjhBtn = document.getElementById('closeFcjhBtn');
        
        if (closeFcjhModal) {
            closeFcjhModal.onclick = closeAllModals;
        }
        
        if (closeFcjhBtn) {
            closeFcjhBtn.onclick = closeAllModals;
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
    }
    
    // 绑定文件点击事件
    function bindFileClickEvents(fileArea, modalOverlay) {
        // 统一处理文件点击事件
        fileArea.addEventListener('click', function(e) {
            const fileItem = e.target.closest('.file-item');
            if (!fileItem) return;
            
            // 获取文件信息
            const fileName = fileItem.getAttribute('data-file-name');
            const fileType = fileItem.getAttribute('data-file-type');
            
            // 设置选中状态
            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('selected');
            });
            fileItem.classList.add('selected');
            
            // 更新状态栏
            const statusBar = document.querySelector('.status-bar div:last-child');
            if (statusBar) {
                statusBar.textContent = '已选择 1 个项目';
            }
            
            // 根据文件名打开对应弹窗
            if (fileName === 'important.txt') {
                openSpecificModal('importantModal');
            } else if (fileName === 'fcjh.txt') {
                openSpecificModal('fcjhModal');
            }
        });
        
        // 双击打开文件（桌面端）
        fileArea.addEventListener('dblclick', function(e) {
            const fileItem = e.target.closest('.file-item');
            if (!fileItem) return;
            
            const fileName = fileItem.getAttribute('data-file-name');
            
            if (fileName === 'important.txt') {
                openSpecificModal('importantModal');
            } else if (fileName === 'fcjh.txt') {
                openSpecificModal('fcjhModal');
            }
        });
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
        modalOverlay.classList.add('active');
        
        // 阻止背景滚动
        document.body.style.overflow = 'hidden';
        
        console.log('打开弹窗:', modalId);
    }
    
    // 关闭所有弹窗
    function closeAllModals() {
        const modalOverlay = document.getElementById('modalOverlay');
        
        if (!modalOverlay) return;
        
        modalOverlay.classList.remove('active');
        
        // 恢复背景滚动
        document.body.style.overflow = '';
        
        // 清除文件选择状态
        const selectedFiles = document.querySelectorAll('.file-item.selected');
        selectedFiles.forEach(file => {
            file.classList.remove('selected');
        });
        
        // 更新状态栏
        const statusBar = document.querySelector('.status-bar div:last-child');
        if (statusBar) {
            statusBar.textContent = '已选择 0 个项目';
        }
        
        console.log('关闭所有弹窗');
    }
    
    // 修复跨浏览器弹窗兼容性问题
    function fixCrossBrowserModalIssues() {
        // 确保模态框初始隐藏
        const modals = document.querySelectorAll('.modal');
        const modalOverlay = document.getElementById('modalOverlay');
        
        modals.forEach(modal => {
            if (modal) {
                modal.style.display = 'none';
            }
        });
        
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
        }
        
        // 修复Edge和Chrome的CSS显示问题
        document.documentElement.style.setProperty('--modal-z-index', '1000');
        
        // 确保模态框在滚动时保持正确位置
        window.addEventListener('scroll', function() {
            if (modalOverlay && modalOverlay.classList.contains('active')) {
                modalOverlay.style.top = `${window.scrollY}px`;
                modalOverlay.style.height = `calc(100% + ${window.scrollY}px)`;
            }
        });
    }
    
    // 页面加载后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // 先修复跨浏览器兼容性问题
            fixCrossBrowserModalIssues();
            
            // 然后初始化功能
            initialize();
            
            console.log('弹窗修复脚本加载完成');
        });
    } else {
        // 如果DOM已经加载完成，直接执行
        fixCrossBrowserModalIssues();
        initialize();
        console.log('弹窗修复脚本加载完成（DOM已就绪）');
    }
    
    // 导出必要函数到全局作用域（如果需要）
    window.modalUtils = {
        openModal: openSpecificModal,
        closeModal: closeAllModals
    };
})();

