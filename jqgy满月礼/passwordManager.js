// 密码修改功能
const PasswordManager = {
  // 初始化密码修改表单
  initPasswordForm: function(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) {
      console.warn('密码表单未找到:', formSelector);
      return;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handlePasswordChange(form);
    });

    console.log('密码表单初始化完成');
  },

  // 处理密码修改
  handlePasswordChange: function(form) {
    const formData = new FormData(form);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    // 验证输入
    if (!this.validatePasswordInput(currentPassword, newPassword, confirmPassword)) {
      return;
    }

    // 更新密码
    if (this.changePassword(currentPassword, newPassword)) {
      this.showMessage('密码修改成功！', 'success');
      form.reset();
    } else {
      this.showMessage('当前密码不正确', 'error');
    }
  },

  // 验证密码输入
  validatePasswordInput: function(current, newPass, confirm) {
    if (!current || !newPass || !confirm) {
      this.showMessage('请填写所有字段', 'error');
      return false;
    }

    if (newPass !== confirm) {
      this.showMessage('新密码与确认密码不匹配', 'error');
      return false;
    }

    if (newPass.length < 6) {
      this.showMessage('密码长度至少6位', 'error');
      return false;
    }

    return true;
  },

  // 修改密码核心逻辑
  changePassword: function(currentPassword, newPassword) {
    const user = UserStorage.getCurrentUser();
    
    if (!user) {
      this.showMessage('用户未登录', 'error');
      return false;
    }

    // 验证当前密码
    if (user.password !== currentPassword) {
      return false;
    }

    // 更新密码
    return UserStorage.updatePassword(newPassword);
  },

  // 显示消息提示
  showMessage: function(message, type = 'info') {
    // 移除现有消息
    const existingAlert = document.querySelector('.pm-alert');
    if (existingAlert) {
      existingAlert.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `pm-alert pm-alert-${type}`;
    messageDiv.textContent = message;
    
    // 添加到密码表单容器
    const container = document.querySelector('.pm-form-container') || document.body;
    container.insertBefore(messageDiv, container.firstChild);
    
    // 3秒后自动移除
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 3000);
  }
};