// network-optimizer.js - 国外IP登录优化工具
(function() {
    'use strict';
    
    // 配置项
    const CONFIG = {
        // API端点备用列表（你需要替换成自己的）
        apiEndpoints: [
            'https://your-main-api.com/auth',
            'https://your-backup-api.com/auth',
            'https://eu-server.com/auth'  // 欧洲备用服务器
        ],
        timeout: 15000, // 15秒超时
        maxRetries: 3,
        retryDelay: 1000
    };
    
    class NetworkOptimizer {
        constructor() {
            this.currentEndpointIndex = 0;
            this.isTesting = false;
            this.init();
        }
        
        init() {
            // 页面加载时检测网络状况
            this.detectNetworkStatus();
            
            // 重写全局fetch方法以添加重试逻辑
            this.wrapFetch();
            
            // 为登录按钮添加智能重试
            this.enhanceLoginForms();
        }
        
        // 网络状况检测
        async detectNetworkStatus() {
            const testUrls = [
                'https://www.google.com/favicon.ico',
                'https://www.cloudflare.com/favicon.ico',
                'https://api.github.com/favicon.ico'
            ];
            
            let successCount = 0;
            const latencyResults = [];
            
            for (const url of testUrls) {
                try {
                    const startTime = Date.now();
                    const response = await fetch(url, { 
                        method: 'HEAD',
                        cache: 'no-cache',
                        mode: 'no-cors'
                    });
                    const latency = Date.now() - startTime;
                    latencyResults.push(latency);
                    successCount++;
                } catch (error) {
                    console.log(`Network test failed for ${url}`);
                }
            }
            
            this.networkScore = successCount / testUrls.length;
            this.averageLatency = latencyResults.reduce((a, b) => a + b, 0) / latencyResults.length;
            
            this.showNetworkStatus();
        }
        
        // 显示网络状态提示
       /*  showNetworkStatus() {
            if (this.averageLatency > 500) { // 延迟大于500ms
                this.createNotification('您的网络连接较慢，登录过程可能需要更长时间', 'warning');
            }
            
            if (this.networkScore < 0.5) {
                this.createNotification('检测到网络连接问题，部分服务可能不可用', 'error');
            }
        } */
        
        // 创建状态通知
        createNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 6px;
                color: white;
                z-index: 10000;
                font-family: Arial, sans-serif;
                font-size: 14px;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
                ${type === 'warning' ? 'background: #f39c12;' : ''}
                ${type === 'error' ? 'background: #e74c3c;' : ''}
                ${type === 'info' ? 'background: #3498db;' : ''}
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
        
        // 包装fetch方法，添加重试逻辑
        wrapFetch() {
            const originalFetch = window.fetch;
            
            window.fetch = async (input, options = {}) => {
                // 只对API请求应用重试逻辑
                const isApiRequest = typeof input === 'string' && 
                    (input.includes('/auth') || input.includes('/api'));
                
                if (!isApiRequest) {
                    return originalFetch(input, options);
                }
                
                let lastError;
                
                for (let attempt = 0; attempt < CONFIG.maxRetries; attempt++) {
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
                        
                        const fetchOptions = {
                            ...options,
                            signal: controller.signal
                        };
                        
                        const response = await originalFetch(input, fetchOptions);
                        clearTimeout(timeoutId);
                        
                        if (response.ok) {
                            return response;
                        }
                        
                        // 如果是4xx错误，不重试（认证错误等）
                        if (response.status >= 400 && response.status < 500) {
                            return response;
                        }
                        
                        throw new Error(`HTTP ${response.status}`);
                        
                    } catch (error) {
                        lastError = error;
                        
                        if (attempt < CONFIG.maxRetries - 1) {
                            console.log(`请求失败，${CONFIG.retryDelay}ms后重试... (${attempt + 1}/${CONFIG.maxRetries})`);
                            await this.delay(CONFIG.retryDelay * (attempt + 1)); // 递增延迟
                        }
                    }
                }
                
                throw lastError;
            };
        }
        
        // 增强登录表单
        enhanceLoginForms() {
            document.addEventListener('submit', (e) => {
                const form = e.target;
                if (form.method === 'post' && 
                    (form.action.includes('login') || form.querySelector('input[type="password"]'))) {
                    
                    e.preventDefault();
                    this.handleLoginFormSubmit(form);
                }
            });
        }
        
        // 处理登录表单提交
        async handleLoginFormSubmit(form) {
            const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
            const originalText = submitButton?.value || submitButton?.textContent;
            
            // 显示加载状态
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = '登录中...';
                submitButton.style.opacity = '0.7';
            }
            
            try {
                const formData = new FormData(form);
                const action = form.action;
                const method = form.method || 'POST';
                
                const response = await fetch(action, {
                    method: method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const result = await response.json().catch(() => null);
                    this.createNotification('登录成功！', 'success');
                    
                    // 正常提交表单或处理成功逻辑
                    if (result && result.redirect) {
                        window.location.href = result.redirect;
                    } else {
                        form.submit(); // 回退到原始提交
                    }
                } else {
                    throw new Error(`登录失败: ${response.status}`);
                }
                
            } catch (error) {
                console.error('登录错误:', error);
                this.createNotification('登录失败，请检查网络连接或稍后重试', 'error');
                
                // 恢复按钮状态
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                    submitButton.style.opacity = '1';
                }
            }
        }
        
        // 工具函数：延迟
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        // 获取最佳API端点（基于延迟测试）
        async getBestEndpoint() {
            if (this.bestEndpoint) return this.bestEndpoint;
            
            const latencyTests = [];
            
            for (const endpoint of CONFIG.apiEndpoints) {
                try {
                    const startTime = Date.now();
                    await fetch(endpoint, { method: 'HEAD' });
                    const latency = Date.now() - startTime;
                    latencyTests.push({ endpoint, latency });
                } catch (error) {
                    latencyTests.push({ endpoint, latency: Infinity });
                }
            }
            
            latencyTests.sort((a, b) => a.latency - b.latency);
            this.bestEndpoint = latencyTests[0].endpoint;
            
            return this.bestEndpoint;
        }
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.networkOptimizer = new NetworkOptimizer();
        });
    } else {
        window.networkOptimizer = new NetworkOptimizer();
    }
    
    // 暴露到全局，方便调用
    window.NetworkOptimizer = NetworkOptimizer;
    
})();