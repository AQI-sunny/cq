// 用户数据本地存储管理
const UserStorage = {
  // 保存用户信息到localStorage
  saveUser: function(userData) {
    try {
      localStorage.setItem('forum_user', JSON.stringify(userData));
      return true;
    } catch (e) {
      console.error('保存用户数据失败:', e);
      return false;
    }
  },

  // 获取当前登录用户
  getCurrentUser: function() {
    try {
      const userStr = localStorage.getItem('forum_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('获取用户数据失败:', e);
      return null;
    }
  },

  // 更新用户密码
  updatePassword: function(newPassword) {
    const user = this.getCurrentUser();
    if (user) {
      user.password = newPassword;
      user.lastPasswordChange = new Date().toISOString();
      return this.saveUser(user);
    }
    return false;
  }
};