// ============================================
// 推理板悬浮组件 - external.js
// 使用方法：在HTML页面中引入此文件
// ============================================

class EvidenceBoard {
    constructor() {
        // 推理板数据模型
        this.questions = [
            { id: 1, text: "死者：", answer: "李建兴", hintPage: "页面01", userInput: "", solved: true },
            { id: 2, text: "死因：", answer: "急性心脏病发作", hintPage: "页面20", userInput: "", solved: false },
            { id: 3, text: "毒药：", answer: "地高辛", hintPage: "页面06", userInput: "", solved: false },
            { id: 4, text: "毒药增强物：", answer: "蜂蜜柚子茶", hintPage: "页面06/24", userInput: "", solved: false },
            { id: 5, text: "下毒者：", answer: "张伟", hintPage: "页面04/05", userInput: "", solved: false },
            { id: 6, text: "下毒方式：", answer: "蜂蜜柚子茶", hintPage: "页面08", userInput: "", solved: false },
            { id: 7, text: "监控矛盾：", answer: "3秒画面被插入", hintPage: "页面23", userInput: "", solved: false },
            { id: 8, text: "篡改技术：", answer: "安盾科技系统", hintPage: "页面03", userInput: "", solved: false },
            { id: 9, text: "凶手权限账号：", answer: "AD-ZW001", hintPage: "页面23", userInput: "", solved: false },
            { id: 10, text: "抛尸时间掩护：", answer: "火警系统", hintPage: "页面25", userInput: "", solved: false },
            { id: 11, text: "财务动机金额：", answer: "870万元", hintPage: "页面21", userInput: "", solved: false },
            { id: 12, text: "境外账户名：", answer: "Zhong Wei", hintPage: "页面21", userInput: "", solved: false },
            { id: 13, text: "关键物证：", answer: "鹰头袖扣", hintPage: "页面22", userInput: "", solved: false },
            { id: 14, text: "目击证人拍摄设备：", answer: "iPhone 14 Pro", hintPage: "页面22", userInput: "", solved: false },
            { id: 15, text: "财务总监加密密码：圆周率后", answer: "6位", hintPage: "页面21", userInput: "", solved: false }
        ];

        // 已解锁的B线页面
        this.unlockedPages = {
            '页面21': false, // 异常资金流
            '页面22': false, // 茶水间照片
            '页面23': false, // 时间线矛盾
            '页面24': false, // 三线证据
            '页面25': false  // 办公室闯入
        };

        // 当前所在页面
        this.currentPage = "首页";
        
        // 初始化
        this.init();
    }

    init() {
        // 创建悬浮按钮
        this.createFloatingButton();
        
        // 创建推理板容器（初始隐藏）
        this.createBoardContainer();
        
        // 监听页面变化
        this.setupPageObserver();
        
        // 加载保存的进度
        this.loadProgress();
    }

    createFloatingButton() {
        const button = document.createElement('div');
        button.id = 'evidence-board-btn';
        button.innerHTML = '📋 推理板';
        button.style.cssText = `
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            background: linear-gradient(135deg, #1a237e, #3949ab);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-family: 'Microsoft YaHei', sans-serif;
            font-weight: bold;
            font-size: 16px;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            border: 2px solid #5c6bc0;
            text-align: center;
            min-width: 100px;
            user-select: none;
        `;
        
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-50%) scale(1.05)';
            button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(-50%) scale(1)';
            button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        });
        
        button.addEventListener('click', () => this.toggleBoard());
        
        document.body.appendChild(button);
        this.floatingButton = button;
    }

    createBoardContainer() {
        const container = document.createElement('div');
        container.id = 'evidence-board-container';
        container.style.cssText = `
            position: fixed;
            right: 20px;
            top: 50%;
            transform: translateY(-50%) translateX(400px);
            width: 380px;
            height: 80vh;
            max-height: 700px;
            background: rgba(25, 25, 35, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 10000;
            transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            border: 1px solid rgba(92, 107, 192, 0.5);
            display: flex;
            flex-direction: column;
            font-family: 'Microsoft YaHei', sans-serif;
            color: #e0e0e0;
            overflow: hidden;
        `;

        // 标题栏
        const titleBar = document.createElement('div');
        titleBar.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #bb86fc; font-size: 22px;">🔍 案件推理板</h2>
                <button id="close-board" style="
                    background: #ff4444;
                    color: white;
                    border: none;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 16px;
                    line-height: 1;
                ">×</button>
            </div>
            <div style="
                background: rgba(92, 107, 192, 0.2);
                padding: 10px;
                border-radius: 8px;
                margin-bottom: 20px;
                text-align: center;
                border: 1px dashed #5c6bc0;
            ">
                <div style="font-size: 14px; color: #90caf9;">
                    当前页面：<span id="current-page-indicator">${this.currentPage}</span>
                </div>
                <div style="margin-top: 5px;">
                    <span style="color: #4caf50;">✓ 已解决：</span>
                    <span id="solved-count">1</span>/15
                    <span style="margin-left: 15px; color: #ff9800;">🔓 B线解锁：</span>
                    <span id="unlocked-count">0</span>/5
                </div>
            </div>
        `;
        container.appendChild(titleBar);

        // 进度条
        const progressBar = document.createElement('div');
        progressBar.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-size: 13px; color: #90caf9;">推理进度</span>
                    <span style="font-size: 13px; color: #4caf50;" id="progress-percent">7%</span>
                </div>
                <div style="
                    height: 8px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                    overflow: hidden;
                ">
                    <div id="progress-fill" style="
                        height: 100%;
                        background: linear-gradient(90deg, #4caf50, #8bc34a);
                        width: 7%;
                        transition: width 0.5s ease;
                        border-radius: 4px;
                    "></div>
                </div>
            </div>
        `;
        container.appendChild(progressBar);

        // 问题列表容器
        const questionsContainer = document.createElement('div');
        questionsContainer.id = 'questions-container';
        questionsContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding-right: 5px;
            margin-bottom: 20px;
        `;
        container.appendChild(questionsContainer);

        // 控制按钮
        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 10px;
        `;
        controls.innerHTML = `
            <button id="hint-btn" style="
                flex: 1;
                padding: 10px;
                background: linear-gradient(135deg, #3949ab, #5c6bc0);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s;
            ">💡 提示当前页</button>
            <button id="save-btn" style="
                padding: 10px 15px;
                background: rgba(76, 175, 80, 0.2);
                color: #4caf50;
                border: 1px solid #4caf50;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
            ">💾 保存</button>
        `;
        container.appendChild(controls);

        document.body.appendChild(container);
        this.boardContainer = container;

        // 事件监听
        document.getElementById('close-board').addEventListener('click', () => this.toggleBoard());
        document.getElementById('hint-btn').addEventListener('click', () => this.showCurrentPageHint());
        document.getElementById('save-btn').addEventListener('click', () => this.saveProgress());

        // 初始渲染问题列表
        this.renderQuestions();
    }

    renderQuestions() {
        const container = document.getElementById('questions-container');
        container.innerHTML = '';
        
        this.questions.forEach((q, index) => {
            const questionEl = document.createElement('div');
            questionEl.style.cssText = `
                background: ${q.solved ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)'};
                padding: 12px;
                margin-bottom: 10px;
                border-radius: 8px;
                border-left: 4px solid ${q.solved ? '#4caf50' : '#ff9800'};
                transition: all 0.3s;
            `;
            
            questionEl.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <div>
                        <span style="color: ${q.solved ? '#4caf50' : '#ff9800'}; font-weight: bold; margin-right: 5px;">
                            ${q.solved ? '✓' : '?'} ${q.id}.
                        </span>
                        <span style="color: #e0e0e0; font-size: 15px;">${q.text}</span>
                    </div>
                    <span style="
                        font-size: 12px;
                        color: #90caf9;
                        background: rgba(144, 202, 249, 0.2);
                        padding: 2px 8px;
                        border-radius: 10px;
                    ">${q.hintPage}</span>
                </div>
                
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" 
                           id="input-${q.id}" 
                           value="${q.userInput}"
                           placeholder="输入答案..." 
                           style="
                               flex: 1;
                               padding: 8px 12px;
                               background: rgba(255,255,255,0.08);
                               border: 1px solid ${q.solved ? '#4caf50' : 'rgba(92, 107, 192, 0.5)'};
                               border-radius: 6px;
                               color: white;
                               font-size: 14px;
                               outline: none;
                           "
                           ${q.solved ? 'disabled' : ''}>
                    <button class="check-btn" 
                            data-id="${q.id}"
                            style="
                                padding: 8px 16px;
                                background: ${q.solved ? 'rgba(76, 175, 80, 0.3)' : 'linear-gradient(135deg, #3949ab, #5c6bc0)'};
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: ${q.solved ? 'default' : 'pointer'};
                                font-size: 13px;
                                white-space: nowrap;
                                opacity: ${q.solved ? 0.7 : 1};
                            ">
                        ${q.solved ? '已解决' : '检查'}
                    </button>
                </div>
                
                ${q.solved ? `
                <div style="
                    margin-top: 8px;
                    padding: 6px 10px;
                    background: rgba(76, 175, 80, 0.1);
                    border-radius: 4px;
                    font-size: 13px;
                    color: #a5d6a7;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                ">
                    <span>✅ 正确答案：${q.answer}</span>
                </div>
                ` : ''}
            `;
            
            container.appendChild(questionEl);
            
            // 输入框事件监听
            const input = document.getElementById(`input-${q.id}`);
            const checkBtn = questionEl.querySelector('.check-btn');
            
            if (!q.solved) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.checkAnswer(q.id, input.value);
                    }
                });
                
                checkBtn.addEventListener('click', () => {
                    this.checkAnswer(q.id, input.value);
                });
            }
        });
        
        this.updateProgress();
    }

    checkAnswer(questionId, userAnswer) {
        const question = this.questions.find(q => q.id === questionId);
        if (!question) return;
        
        // 清理答案（去除空格，转为小写比较）
        const cleanAnswer = userAnswer.trim().toLowerCase();
        const cleanExpected = question.answer.toLowerCase();
        
        // 检查是否为B线页面解锁关键词
        this.checkForPageUnlock(cleanAnswer);
        
        if (cleanAnswer === cleanExpected) {
            question.solved = true;
            question.userInput = userAnswer;
            
            // 更新UI
            this.renderQuestions();
            
            // 显示成功提示
            this.showNotification(`✅ 第${questionId}题正确！`, 'success');
            
            // 检查是否全部完成
            if (this.questions.every(q => q.solved)) {
                setTimeout(() => {
                    this.showNotification('🎉 恭喜！所有谜题已解开！即将进入结局...', 'success');
                    this.unlockFinale();
                }, 500);
            }
            
            this.saveProgress();
        } else {
            // 显示错误提示
            this.showNotification('❌ 答案不正确，请再想想', 'error');
            
            // 震动输入框
            const input = document.getElementById(`input-${questionId}`);
            input.style.animation = 'shake 0.5s';
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
            
            // 增加提示级别
            this.increaseHintLevel(questionId);
        }
    }

    checkForPageUnlock(answer) {
        const unlockMap = {
            '安盾科技': '页面23',
            '异常资金流': '页面21',
            '茶水间照片': '页面22',
            '时间线矛盾': '页面23',
            '办公室闯入': '页面25',
            '三线证据': '页面24'
        };
        
        for (const [keyword, page] of Object.entries(unlockMap)) {
            if (answer.includes(keyword.toLowerCase()) && !this.unlockedPages[page]) {
                this.unlockedPages[page] = true;
                this.showNotification(`🔓 解锁新线索：${page}！`, 'unlock');
                this.updateProgress();
                this.saveProgress();
            }
        }
    }

    increaseHintLevel(questionId) {
        // 这里可以增加更详细的提示
        const question = this.questions.find(q => q.id === questionId);
        console.log(`问题${questionId}需要更多线索，提示查看：${question.hintPage}`);
    }

    showCurrentPageHint() {
        const hints = {
            '页面01': '查看公司通知，死者姓名就在开头',
            '页面03': '注意文档中提到的公司名称',
            '页面04': '报告中提到了关键人物的背景',
            '页面06': '健康手册记载了药物禁忌',
            '页面08': '监控显示了下毒的具体方式',
            '页面21': '财务报告中的具体数字很重要',
            '页面22': '证据报告中提到拍摄设备型号',
            '页面23': '技术分析揭示了监控篡改细节',
            '页面24': '毒理报告说明毒药作用机制',
            '页面25': '系统日志显示了时间矛盾'
        };
        
        const hint = hints[this.currentPage] || '当前页面暂无直接线索，请查看其他页面';
        this.showNotification(`💡 ${this.currentPage}提示：${hint}`, 'hint');
    }

    showNotification(message, type = 'info') {
        // 移除现有的通知
        const existing = document.querySelector('.board-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'board-notification';
        notification.textContent = message;
        
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            unlock: '#9c27b0',
            hint: '#2196f3'
        };
        
        notification.style.cssText = `
            position: fixed;
            right: 30px;
            bottom: 30px;
            background: ${colors[type] || '#333'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 10001;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            animation: slideIn 0.5s ease, fadeOut 0.5s ease 2.5s forwards;
            font-family: 'Microsoft YaHei', sans-serif;
            font-weight: bold;
            max-width: 300px;
            border-left: 5px solid ${type === 'unlock' ? '#ff9800' : 'rgba(255,255,255,0.3)'};
        `;
        
        document.body.appendChild(notification);
        
        // 自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    updateProgress() {
        const solved = this.questions.filter(q => q.solved).length;
        const unlocked = Object.values(this.unlockedPages).filter(v => v).length;
        const percent = Math.round((solved / 15) * 100);
        
        document.getElementById('solved-count').textContent = solved;
        document.getElementById('unlocked-count').textContent = unlocked;
        document.getElementById('progress-percent').textContent = `${percent}%`;
        document.getElementById('progress-fill').style.width = `${percent}%`;
        
        // 更新按钮上的进度提示
        this.floatingButton.innerHTML = `📋 ${solved}/15`;
    }

    toggleBoard() {
        const container = document.getElementById('evidence-board-container');
        const isHidden = container.style.transform.includes('translateX(400px)');
        
        if (isHidden) {
            container.style.transform = 'translateY(-50%) translateX(0)';
            this.floatingButton.style.opacity = '0.5';
            this.floatingButton.style.pointerEvents = 'none';
        } else {
            container.style.transform = 'translateY(-50%) translateX(400px)';
            this.floatingButton.style.opacity = '1';
            this.floatingButton.style.pointerEvents = 'auto';
        }
    }

    setupPageObserver() {
        // 假设每个页面有一个标识元素
        const observer = new MutationObserver(() => {
            const pageTitle = document.querySelector('.page-title') || 
                             document.querySelector('h1') || 
                             document.title;
            this.currentPage = pageTitle || '未知页面';
            document.getElementById('current-page-indicator').textContent = this.currentPage;
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    saveProgress() {
        const progress = {
            questions: this.questions,
            unlockedPages: this.unlockedPages,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('evidence-board-progress', JSON.stringify(progress));
        this.showNotification('💾 进度已保存', 'success');
    }

    loadProgress() {
        const saved = localStorage.getItem('evidence-board-progress');
        if (saved) {
            try {
                const progress = JSON.parse(saved);
                this.questions = progress.questions || this.questions;
                this.unlockedPages = progress.unlockedPages || this.unlockedPages;
                this.renderQuestions();
                this.showNotification('📂 已加载上次进度', 'success');
            } catch (e) {
                console.error('加载进度失败:', e);
            }
        }
    }

    unlockFinale() {
        // 解锁最终结局
        const finaleBtn = document.createElement('button');
        finaleBtn.id = 'finale-button';
        finaleBtn.innerHTML = '🎬 观看结局';
        finaleBtn.style.cssText = `
            position: fixed;
            left: 50%;
            bottom: 50px;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #9c27b0, #673ab7);
            color: white;
            padding: 15px 40px;
            border-radius: 30px;
            border: none;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 10px 25px rgba(156, 39, 176, 0.4);
            animation: pulse 2s infinite;
        `;
        
        finaleBtn.addEventListener('click', () => {
            // 跳转到结局页面或播放结局动画
            alert('恭喜通关！结局内容加载中...');
            // window.location.href = 'finale.html';
        });
        
        document.body.appendChild(finaleBtn);
    }
}

// ============================================
// 页面集成助手函数
// ============================================

// 自动检测页面内容并提取可能的关键词
function autoExtractKeywords() {
    // 寻找页面中的关键词（简单实现）
    const keywords = {
        '安盾科技': '页面03',
        '地高辛': '页面06',
        '蜂蜜柚子茶': '页面08',
        '张伟': '页面04',
        '870万': '页面21',
        '鹰头袖扣': '页面22',
        '3秒': '页面23',
        '火警系统': '页面25'
    };
    
    const pageText = document.body.innerText.toLowerCase();
    const found = [];
    
    for (const [keyword, page] of Object.entries(keywords)) {
        if (pageText.includes(keyword.toLowerCase())) {
            found.push({ keyword, page });
        }
    }
    
    return found;
}

// 创建页面内的线索高亮
function createClueHighlights() {
    const clues = document.querySelectorAll('.clue, [data-clue]');
    clues.forEach(clue => {
        clue.style.cssText += `
            background: rgba(255, 235, 59, 0.2);
            padding: 2px 4px;
            border-radius: 3px;
            cursor: help;
            position: relative;
            transition: background 0.3s;
        `;
        
        clue.addEventListener('mouseenter', function(e) {
            this.style.background = 'rgba(255, 235, 59, 0.4)';
        });
        
        clue.addEventListener('mouseleave', function(e) {
            this.style.background = 'rgba(255, 235, 59, 0.2)';
        });
        
        // 点击线索可以自动填入推理板
        clue.addEventListener('click', function(e) {
            const clueText = this.dataset.clue || this.textContent;
            console.log('线索点击:', clueText);
            // 这里可以扩展为自动填写推理板
        });
    });
}

// ============================================
// CSS动画定义
// ============================================

const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes slideIn {
        from { 
            transform: translateX(100px);
            opacity: 0;
        }
        to { 
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes pulse {
        0% { transform: translateX(-50%) scale(1); }
        50% { transform: translateX(-50%) scale(1.05); }
        100% { transform: translateX(-50%) scale(1); }
    }
    
    /* 滚动条样式 */
    #questions-container::-webkit-scrollbar {
        width: 8px;
    }
    
    #questions-container::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.05);
        border-radius: 4px;
    }
    
    #questions-container::-webkit-scrollbar-thumb {
        background: rgba(92, 107, 192, 0.5);
        border-radius: 4px;
    }
    
    #questions-container::-webkit-scrollbar-thumb:hover {
        background: rgba(92, 107, 192, 0.8);
    }
    
    /* 输入框焦点样式 */
    #questions-container input:focus {
        border-color: #bb86fc !important;
        box-shadow: 0 0 0 2px rgba(187, 134, 252, 0.3) !important;
    }
    
    /* 按钮悬停效果 */
    #evidence-board-btn:hover {
        background: linear-gradient(135deg, #3949ab, #283593) !important;
    }
    
    #hint-btn:hover, .check-btn:hover:not([disabled]) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2) !important;
    }
`;

document.head.appendChild(style);

// ============================================
// 初始化
// ============================================

// 等待页面加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.EvidenceBoard = new EvidenceBoard();
        createClueHighlights();
    });
} else {
    window.EvidenceBoard = new EvidenceBoard();
    createClueHighlights();
}

// 全局导出
window.autoExtractKeywords = autoExtractKeywords;
window.checkPageForClues = autoExtractKeywords;

console.log('🔍 推理板系统已加载 - 输入 window.EvidenceBoard 查看控制选项');