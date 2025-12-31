// 返回按钮通用JS文件 - 修复移动端溢出与偏移问题
(function() {
    'use strict';
    
    // 配置项
    const config = {
        // 默认返回链接
        defaultLink: './SY.html',
        
        // 备用链接数组（按优先级排序）
        backupLinks: [
            './SY.html',
            'https://sylvie-seven-cq.top/xjthj/SY.html'
        ],
        
        // 按钮样式
        buttonSize: '60px',
        buttonColor: '#4aade2ff',
        buttonHoverColor: '#3583e8ff',
        iconColor: '#ffffff',
        zIndex: 9999,
        
        // 默认位置（右下角）
        defaultRight: '20px',
        defaultBottom: '20px',
        
        // 是否启用拖拽功能
        draggable: true,
        
        // 移动端配置
        mobileButtonSize: '50px',
        mobileThreshold: 768
    };
    
    // 检测是否为移动端
    function isMobile() {
        return window.innerWidth <= config.mobileThreshold;
    }
    
    // 获取有效的返回链接
    function getReturnLink() {
        if (config.defaultLink) return config.defaultLink;
        for (let link of config.backupLinks) {
            if (link) return link;
        }
        return 'javascript:history.back();';
    }
    
    // 创建返回按钮
    function createReturnButton() {
        if (document.getElementById('universal-return-button')) return;
        
        const button = document.createElement('div');
        button.id = 'universal-return-button';
        button.title = '返回搜索页面 (可拖动)';
        
        // 基础样式
        const size = isMobile() ? config.mobileButtonSize : config.buttonSize;
        button.style.cssText = `
            position: fixed;
            width: ${size};
            height: ${size};
            background-color: ${config.buttonColor};
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            cursor: move;
            z-index: ${config.zIndex};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.3s, box-shadow 0.3s; /* 去掉了 transform 的 transition 以避免拖拽延迟 */
            user-select: none;
            -webkit-user-select: none;
            touch-action: none; /* 关键：禁止浏览器默认触摸行为 */
            
            /* 默认右下角定位 */
            right: ${config.defaultRight};
            bottom: ${config.defaultBottom};
            left: auto;
            top: auto;
        `;
        
        // 图标SVG
        button.innerHTML = `
            <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="pointer-events: none;">
                <path d="M19 12H5" stroke="${config.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 19L5 12L12 5" stroke="${config.iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        
        // 点击事件（区分点击和拖拽）
        let isDragAction = false;
        
        button.addEventListener('click', function(e) {
            if (isDragAction) {
                isDragAction = false;
                return;
            }
            
            const link = getReturnLink();
            if (link.startsWith('javascript:')) {
                eval(link.substring(11));
            } else {
                window.location.href = link;
            }
        });
        
        // 桌面端悬停效果
        if (!isMobile()) {
            button.addEventListener('mouseenter', () => {
                button.style.backgroundColor = config.buttonHoverColor;
                button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = config.buttonColor;
                button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            });
        }
        
        document.body.appendChild(button);
        
        // 初始化拖拽逻辑
        if (config.draggable) {
            initDraggable(button, (dragged) => isDragAction = dragged);
        }
        
        return button;
    }
    
    // 修复后的拖拽核心逻辑
    function initDraggable(element, setDragStatus) {
        let isDragging = false;
        let shiftX = 0; // 手指按下的位置与元素左上角的X偏移
        let shiftY = 0; // 手指按下的位置与元素左上角的Y偏移
        
        // 核心移动函数
        function moveAt(clientX, clientY) {
            // 1. 计算新的 left/top
            let newX = clientX - shiftX;
            let newY = clientY - shiftY;
            
            // 2. 获取视口尺寸
            const winWidth = window.innerWidth || document.documentElement.clientWidth;
            const winHeight = window.innerHeight || document.documentElement.clientHeight;
            const rect = element.getBoundingClientRect();
            
            // 3. 严格的边界限制 (Clamp)
            // 最小值不能小于0，最大值不能超过 (视口宽 - 元素宽)
            const maxX = winWidth - rect.width;
            const maxY = winHeight - rect.height;
            
            newX = Math.min(Math.max(0, newX), maxX);
            newY = Math.min(Math.max(0, newY), maxY);
            
            // 4. 应用样式
            // 拖拽时，必须清除 right/bottom，强制使用 left/top
            element.style.right = 'auto';
            element.style.bottom = 'auto';
            element.style.left = newX + 'px';
            element.style.top = newY + 'px';
            
            return { x: newX, y: newY };
        }
        
        // 开始拖拽处理
        function onStart(clientX, clientY) {
            isDragging = false; // 初始状态不是拖拽（可能是点击）
            
            // 获取当前的绝对位置
            const rect = element.getBoundingClientRect();
            
            // 计算手指点击点相对于元素左上角的偏移
            shiftX = clientX - rect.left;
            shiftY = clientY - rect.top;
            
            element.style.transition = 'none'; // 拖拽时移除过渡，防止迟滞
        }
        
        // 移动处理
        function onMove(clientX, clientY) {
            isDragging = true;
            if (setDragStatus) setDragStatus(true);
            moveAt(clientX, clientY);
        }
        
        // 结束处理
        function onEnd() {
            element.style.transition = 'background-color 0.3s, box-shadow 0.3s'; // 恢复过渡
            
            if (isDragging) {
                // 保存最后的位置
                const rect = element.getBoundingClientRect();
                localStorage.setItem('returnButtonPos', JSON.stringify({
                    x: rect.left,
                    y: rect.top
                }));
            }
        }
        
        // --- 鼠标事件监听 ---
        element.addEventListener('mousedown', function(e) {
            // 左键才触发
            if (e.button !== 0) return;
            e.preventDefault();
            onStart(e.clientX, e.clientY);
            
            function onMouseMove(e) {
                onMove(e.clientX, e.clientY);
            }
            
            function onMouseUp() {
                onEnd();
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        
        // --- 触摸事件监听 (移动端关键) ---
        element.addEventListener('touchstart', function(e) {
            // 阻止默认行为（防止滚动）
            // 如果你希望在按钮上滑动时页面不滚动，保留 preventDefault
            // 如果希望在按钮上能触发页面滚动（不建议），去掉它
            // e.preventDefault(); 
            
            const touch = e.touches[0];
            onStart(touch.clientX, touch.clientY);
        }, { passive: false });
        
        element.addEventListener('touchmove', function(e) {
            // 必须阻止默认行为，否则会触发页面滚动，导致坐标计算错误
            e.preventDefault(); 
            const touch = e.touches[0];
            onMove(touch.clientX, touch.clientY);
        }, { passive: false });
        
        element.addEventListener('touchend', function(e) {
            onEnd();
        });
        
        // --- 恢复保存的位置 ---
        try {
            const saved = localStorage.getItem('returnButtonPos');
            if (saved) {
                const pos = JSON.parse(saved);
                // 简单的校验，防止位置超出当前屏幕太大
                if (pos.x < window.innerWidth && pos.y < window.innerHeight) {
                    element.style.right = 'auto';
                    element.style.bottom = 'auto';
                    element.style.left = pos.x + 'px';
                    element.style.top = pos.y + 'px';
                }
            }
            // 如果没有保存的位置，CSS 默认的 right/bottom 会自动生效，无需处理
        } catch (e) {
            console.error('读取位置失败', e);
        }
    }
    
    // 窗口大小改变时的适配
    window.addEventListener('resize', function() {
        const button = document.getElementById('universal-return-button');
        if (!button) return;
        
        // 更新大小
        const size = isMobile() ? config.mobileButtonSize : config.buttonSize;
        button.style.width = size;
        button.style.height = size;
        
        // 检查溢出并重置回屏幕内 (如果它是用 left/top 定位的)
        if (button.style.left !== 'auto') {
            const rect = button.getBoundingClientRect();
            const winWidth = window.innerWidth;
            const winHeight = window.innerHeight;
            
            let newLeft = rect.left;
            let newTop = rect.top;
            
            if (rect.right > winWidth) newLeft = winWidth - rect.width;
            if (rect.bottom > winHeight) newTop = winHeight - rect.height;
            
            button.style.left = Math.max(0, newLeft) + 'px';
            button.style.top = Math.max(0, newTop) + 'px';
        }
    });
    
    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createReturnButton);
    } else {
        createReturnButton();
    }
    
})();