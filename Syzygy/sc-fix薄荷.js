/**
 * 修复版搜索逻辑优化版
 * 1. 解决了搜索用户名时会阻断帖子显示的问题。
 * 2. 实现了搜自己时不显示个人主页。
 * 3. 保持了隐藏帖子的权限控制。
 * 4. 新增：查看他人主页时显示权限提示。
 * 5. 确保不改变当前用户的顶部栏显示用户名。
 */

// 覆盖原有的搜索函数
// 假设原代码中 performSearch 是定义在全局作用域的
window.performSearch = function() {
    const query = searchInput.value.trim();
    if (!query) return;

    const lower = query.toLowerCase();
    
    // ===========================
    // 1. 准备帖子数据池 (Pool)
    // ===========================
    let pool = [];
    
    // 加入普通板块帖子 (假设 sections 是全局变量)
    if (typeof sections !== 'undefined') {
        sections.forEach(s => {
            pool = pool.concat(s.posts.map(p => ({ ...p, _section: s.title })));
        });
    }

    // 加入隐藏/特殊帖子 (基于权限)
    // 假设 hiddenPosts 和 currentUser 是全局变量
    if (typeof hiddenPosts !== 'undefined' && typeof currentUser !== 'undefined' && currentUser) {
        hiddenPosts.forEach(post => {
            // A. 有权限限制，且当前用户在白名单内
            if (post.allowedUsers && post.allowedUsers.includes(currentUser)) {
                pool.push({ ...post, _section: post.section });
            }
            // B. 无权限限制 (即所有人可见的隐藏贴，如果有这种逻辑的话)
            else if (!post.allowedUsers) {
                pool.push({ ...post, _section: post.section });
            }
        });
    }

    // ===========================
    // 2. 执行帖子搜索
    // ===========================
    const postResults = pool.filter(p => {
        // 优先匹配 searchKeyword
        if (p.searchKeyword) {
            const keywords = p.searchKeyword.split(',').map(k => k.trim().toLowerCase());
            // 只要匹配中任意一个关键词即可
            if (keywords.some(keyword => keyword === lower || keyword.includes(lower))) {
                return true;
            }
        }
        
        // 常规匹配：标题、内容、作者
        return p.title.toLowerCase().includes(lower) ||
               p.content.toLowerCase().includes(lower) ||
               p.author.toLowerCase().includes(lower);
    });

    // ===========================
    // 3. 执行用户搜索
    // ===========================
    let matchingUsers = [];
    
    // 构建所有可搜索用户列表
    // 需确保 registeredUsers, npcUsers 等是全局变量
    let allUsersList = [];
    
    if (typeof registeredUsers !== 'undefined') {
        allUsersList = allUsersList.concat(registeredUsers.map(u => u.username));
    }
    
    // 添加特定 NPC 或特殊ID
    const specialIds = ['Resonance', '林中的猫', '向阳花开', '逆位的愚者', '404', '不动如山'];
    allUsersList = allUsersList.concat(specialIds);

    if (typeof npcUsers !== 'undefined') {
        allUsersList = allUsersList.concat(npcUsers.map(n => n.username));
    }

    // 过滤用户
    matchingUsers = allUsersList.filter(username => {
        // 匹配用户名
        const isMatch = username.toLowerCase().includes(lower);
        // 关键修改：排除当前登录用户自己
        const isNotSelf = username !== currentUser;
        
        return isMatch && isNotSelf;
    });

    // ===========================
    // 4. 渲染结果
    // ===========================
    clearMain(); // 清空主界面

    let hasContent = false;

    // --- A. 渲染用户结果 ---
    if (matchingUsers.length > 0) {
        const userTitle = document.createElement('h2');
        userTitle.textContent = `用户搜索结果（${matchingUsers.length}）`;
        main.appendChild(userTitle);

        matchingUsers.forEach(username => {
            const userCard = document.createElement('div');
            userCard.className = 'post-card';
            
            // 关键优化：使用自定义的 showOtherUserProfile 函数替代原有的 showUserProfile
            // 这样可以显示权限提示，同时不改变顶部栏当前用户的用户名显示
            userCard.innerHTML = `
                <a href="#" onclick="showOtherUserProfile('${username}'); return false;">${username}</a>
                <div class="post-meta">用户 • 点击查看用户信息</div>
            `;
            main.appendChild(userCard);
        });
        hasContent = true;
    }

    // --- B. 渲染帖子结果 ---
    if (postResults.length > 0) {
        // 如果上面有用户结果，加个分割线或者间距，这里直接追加标题
        const postsTitle = document.createElement('h2');
        postsTitle.textContent = `帖子搜索结果（${postResults.length}）`;
        // 如果上面已经有内容了，可以给标题加个上边距，美观一点
        if (hasContent) postsTitle.style.marginTop = '30px'; 
        main.appendChild(postsTitle);

        // 按时间倒序
        postResults.sort((a, b) => new Date(b.date) - new Date(a.date));

        postResults.forEach(post => {
            // 假设 addPostCard 是全局函数
            addPostCard(post, post._section);
        });
        hasContent = true;
    }

    // --- C. 无结果处理 ---
    if (!hasContent) {
        const empty = document.createElement('div');
        empty.className = 'post-card';
        empty.textContent = '未找到匹配的帖子及相关用户。请尝试其他关键词。';
        main.appendChild(empty);
    }
};

/**
 * 新增函数：查看其他用户主页（带权限提示）
 * 此函数专门用于查看他人主页，会显示权限提示
 * 不会影响顶部栏当前用户的用户名显示
 * @param {string} username - 要查看的用户名
 */
window.showOtherUserProfile = function(username) {
    // 清空主界面
    clearMain();
    
    // 创建用户信息卡片
    const profileCard = document.createElement('div');
    profileCard.className = 'post-card';
    
    // 显示用户名和权限提示
    profileCard.innerHTML = `
        <h2>${username}</h2>
        <div class="profile-info">
            <div class="info-item">
                <strong>用户名：</strong> ${username}
            </div>
            <div class="info-item">
                <strong>用户状态：</strong> 离线
            </div>
            <div class="info-item">
                <strong>最后活跃：</strong> 未知
            </div>
        </div>
        
        <div class="permission-notice" style="
            margin-top: 20px;
            padding: 15px;
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            color: #856404;
        ">
            <strong>⚠️ 权限提示</strong>
            <p>您无权查看他人的完整个人主页。这是用户的基本信息预览。</p>
            <p>当前登录用户：${currentUser || '未登录'}</p>
        </div>
        
        <div style="margin-top: 20px;">
            <button onclick="window.performSearch()" style="
                padding: 8px 16px;
                background-color: #6c757d;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            ">返回搜索结果</button>
        </div>
    `;
    
    main.appendChild(profileCard);
};

/**
 * 保留原有的 showUserProfile 函数（如果存在）
 * 这个函数可能用于查看当前用户自己的主页
 * 我们只是添加了新的 showOtherUserProfile 函数，不会影响原有功能
 */
if (typeof window.showUserProfile === 'undefined') {
    // 如果原代码没有 showUserProfile 函数，可以创建一个简单的
    window.showUserProfile = function(username) {
        alert(`显示用户 ${username} 的个人主页（原有函数）`);
    }
}

// 重新绑定事件 (防止 HTML 中原本绑定的逻辑冲突)
// 确保页面加载完后执行
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('searchBtn'); // 假设按钮ID是 searchBtn
    const ipt = document.getElementById('searchInput'); // 假设输入框ID是 searchInput

    if (btn) {
        // 克隆节点可以移除之前的 eventListeners，防止触发两次
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.performSearch();
        });
    }

    if (ipt) {
        const newIpt = ipt.cloneNode(true);
        ipt.parentNode.replaceChild(newIpt, ipt);

        newIpt.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                window.performSearch();
            }
        });
    }
    
    // 添加一点样式增强用户体验
    const style = document.createElement('style');
    style.textContent = `
        .profile-info {
            margin: 15px 0;
        }
        .info-item {
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .permission-notice {
            margin-top: 20px;
            padding: 15px;
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            color: #856404;
        }
    `;
    document.head.appendChild(style);
});
