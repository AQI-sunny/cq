function addEssentialStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* 坛子容器定位 - 修改为支持拖拽 */
        .tanzi-container {
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 10000;
            display: none;
            flex-direction: column;
            align-items: flex-end; /* 让子元素右对齐 */
        }

        /* 坛子球体样式优化 */
        .tanzi-orb {
            cursor: pointer; /* 默认手型 */
            transition: transform 0.2s, box-shadow 0.2s;
            /* 确保球体位于面板之上或旁边 */
            position: relative;
            z-index: 10002;
        }

        /* 大屏下添加抓取手势 */
        @media (min-width: 769px) {
            .tanzi-orb {
                cursor: grab;
            }
            .tanzi-orb:active {
                cursor: grabbing;
            }
        }

        /* 基础面板样式 - 关键修复 */
        .tanzi-panel {
            /* 桌面端改为绝对定位，相对于容器 */
            position: absolute;
            bottom: 200px; /* 位于球体上方 */
            right: 0;
            width: 350px;
            
            /* 修复1: 桌面端最大高度和滚动 */
            max-height: 100vh; 
            overflow-y: auto;
            
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 10001;
            display: none; /* 默认隐藏 */
            flex-direction: column;
            padding: 0;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;
            border: 1px solid rgba(0,0,0,0.05);
            
            /* 滚动条美化 */
            scrollbar-width: thin;
        }

        .panel-header {
            padding: 15px;
            background: #f5f7fa;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        
        .panel-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #999;
            padding: 0 5px;
        }

        .search-stats-section, .stats-section, .panel-actions {
            padding: 10px 15px;
            flex-shrink: 0;
        }

        .stats-section {
            background: #f8f9fa;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            padding: 12px 15px;
        }
        
        .stats-section .stat-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .stats-section .stat-label {
            font-size: 12px;
            color: #666;
        }
        
        .stats-section .stat-value {
            font-size: 14px;
            font-weight: 600;
            color: #333;
        }
        
        .stats-section .highlight {
            color: #ff4757;
        }

        .keywords-section {
            padding: 10px 15px;
            background: #fafafa;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
            display: flex;
            flex-direction: column;
            min-height: 60px;
            /* 移除固定的 max-height，由 panel 的 flex 和 max-height 控制 */
            flex: 1; 
        }
        
        .keywords-header {
            flex-shrink: 0;
        }

        .panel-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        
        .keywords-list {
            display: flex;
            flex-direction: column;
            gap: 5px;
            /* 关键：让内容撑开，不设死高度，依赖父容器滚动 */
            min-height: 20px; 
            margin-top: 8px;
            padding-right: 2px;
        }
        
        .keyword-item {
            padding: 6px 10px;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
            min-height: 32px;
        }

        .keyword-item.valid {
            background: #e8f5e8 !important;
            color: #2e7d32 !important;
            border-left: 3px solid #4caf50 !important;
        }
        
        .keyword-item.invalid {
            background: #ffebee !important;
            color: #c62828 !important;
            border-left: 3px solid #f44336 !important;
        }
        
        .keyword-count {
            font-size: 11px;
            background: rgba(0,0,0,0.1);
            padding: 2px 6px;
            border-radius: 10px;
            min-width: 20px;
            text-align: center;
            display: inline-block;
            flex-shrink: 0;
        }
        
        .tanzi-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ff4757;
            color: white;
            border-radius: 10px;
            padding: 2px 6px;
            font-size: 12px;
            font-weight: bold;
            min-width: 18px;
            text-align: center;
            z-index: 10003;
        }
        
        .panel-actions {
            display: flex;
            border-top: 1px solid #eee;
            padding: 12px 15px;
        }
        
        .buttons-row {
            display: flex;
            width: 100%;
            gap: 8px;
            justify-content: space-between;
        }

        .short-btn {
            flex: 1;
            min-width: 0;
            padding: 8px 6px !important;
            font-size: 13px !important;
            height: 36px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .short-btn:hover {
            opacity: 0.85;
            transform: translateY(-1px);
        }
        
        .short-btn:active {
            transform: translateY(0);
        }
        
        .short-btn.primary {
            background: linear-gradient(135deg, #ff4757, #ff6b81);
            color: white;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(255, 71, 87, 0.2);
        }
        
        .short-btn.secondary {
            background: linear-gradient(135deg, #e0e0e0, #f0f0f0);
            color: #333;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        #hint-section {
            background: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 8px;
            padding: 12px;
            margin: 10px;
            font-size: 14px;
            color: #1976d2;
            animation: fadeIn 0.3s ease;
            flex-shrink: 0;
        }
        
        .section-title {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
        }
        
        .empty-keywords {
            text-align: center;
            color: #999;
            padding: 20px 0;
            font-size: 13px;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* 移动端适配 - 严格保持原样 */
        @media (max-width: 768px) {
            .tanzi-container {
                bottom: 15px !important;
                right: 15px !important;
                left: auto !important;
                top: auto !important;
                position: fixed !important;
            }
            
            .tanzi-orb {
                width: 50px !important;
                height: 50px !important;
                cursor: default !important; /* 移动端不显示抓手 */
            }
            
            .tanzi-panel {
                position: fixed !important;
                width: 90vw !important;
                max-width: 400px !important;
                left: 50% !important;
                right: auto !important;
                transform: translateX(-50%) !important;
                bottom: 100px !important;
                top: auto !important;
                
                height: 70vh !important;
                max-height: 70vh !important;
                min-height: 300px !important;
                overflow-y: auto !important;
                border: 1px solid #ddd;
                box-shadow: 0 0 100px rgba(0,0,0,0.2);
                background: white !important;
                border-radius: 12px !important;
            }
            
            .search-stats-section, .stats-section {
                padding: 8px 12px !important;
                min-height: auto !important;
                flex-shrink: 0 !important;
            }
            
            .stats-section {
                display: flex !important;
                flex-direction: column !important;
                gap: 6px !important;
            }
            
            .stats-section .stat-item {
                justify-content: flex-start !important;
            }
            
            .keywords-section {
                max-height: none !important;
                height: auto !important;
                min-height: 150px !important;
                overflow-y: visible !important;
                padding: 12px 15px !important;
                flex: 1 !important;
                display: flex !important;
                flex-direction: column !important;
            }
            
            .keywords-list {
                max-height: 30vh !important;
                min-height: 80px !important;
                overflow-y: auto !important;
                margin-top: 8px !important;
                flex: 1 !important;
                border: 1px solid #eee !important;
                border-radius: 6px !important;
                padding: 8px !important;
                background: white !important;
            }
            
            .keyword-item {
                font-size: 13px !important;
                padding: 10px 12px !important;
                min-height: 32px !important;
                word-break: break-word !important;
                white-space: normal !important;
                line-height: 1.4 !important;
                margin-bottom: 5px !important;
            }
            
            .keyword-text {
                flex: 1 !important;
                min-width: 0 !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                max-height: 44px !important;
                display: -webkit-box !important;
                -webkit-line-clamp: 2 !important;
                -webkit-box-orient: vertical !important;
            }
            
            .keyword-count {
                flex-shrink: 0 !important;
                margin-left: 8px !important;
                font-size: 10px !important;
                padding: 2px 6px !important;
                align-self: flex-start !important;
                margin-top: 3px !important;
            }
            
            .panel-title {
                font-size: 15px !important;
            }
            
            .panel-actions {
                padding: 10px 12px !important;
                flex-shrink: 0 !important;
            }
            
            .buttons-row {
                gap: 6px !important;
            }
            
            .short-btn {
                padding: 10px 4px !important;
                font-size: 12px !important;
                height: 38px !important;
                min-width: 60px !important;
                font-weight: 600 !important;
                border-radius: 8px !important;
            }
            
            #hint-section {
                margin: 8px !important;
                padding: 10px !important;
                font-size: 13px !important;
                line-height: 1.5 !important;
                flex-shrink: 0 !important;
            }
            
            #tanzi-confirm-dialog {
                width: 85vw !important;
                margin: 20px !important;
            }
            
            #tanzi-confirm-dialog > div {
                padding: 20px 16px !important;
            }
            
            #tanzi-confirm-cancel, #tanzi-confirm-ok {
                padding: 12px 16px !important;
                font-size: 15px !important;
                min-height: 44px !important;
            }
        }
        
        /* 桌面端滚动条美化 */
        .tanzi-panel::-webkit-scrollbar {
            width: 8px;
        }
        .tanzi-panel::-webkit-scrollbar-track {
            background: #f5f5f5;
            border-radius: 4px;
        }
        .tanzi-panel::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 4px;
        }
        .tanzi-panel::-webkit-scrollbar-thumb:hover {
            background: #aaa;
        }

        /* ========== 消息通知样式 ========== */
        .tanzi-message {
            position: fixed;
            padding: 14px 20px;
            border-radius: 10px;
            z-index: 10003;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            animation: tanziMessageSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            max-width: 320px;
            word-break: break-word;
            color: white;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            overflow: hidden;
        }
        
        .tanzi-message::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: rgba(255, 255, 255, 0.3);
        }
        
        .tanzi-message.success {
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.92), rgba(56, 142, 60, 0.92));
            border-left: 4px solid #4caf50;
        }
        
        .tanzi-message.success::before {
            background: #4caf50;
        }
        
        .tanzi-message.info {
            background: linear-gradient(135deg, rgba(33, 150, 243, 0.92), rgba(21, 101, 192, 0.92));
            border-left: 4px solid #2196f3;
        }
        
        .tanzi-message.info::before {
            background: #2196f3;
        }
        
        .tanzi-message.warning {
            background: linear-gradient(135deg, rgba(255, 152, 0, 0.92), rgba(245, 124, 0, 0.92));
            border-left: 4px solid #ff9800;
        }
        
        .tanzi-message.warning::before {
            background: #ff9800;
        }
        
        @keyframes tanziMessageSlideIn {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        @keyframes tanziMessageFadeOut {
            to {
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
            }
        }
        
        /* 移动端适配 */
        @media (max-width: 768px) {
            .tanzi-message {
                max-width: none;
                width: calc(100vw - 40px);
                margin: 0 20px;
                padding: 16px 20px;
                font-size: 15px;
                text-align: center;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);
}