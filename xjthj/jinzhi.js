// 禁用右键菜单
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    alert('右键功能已禁用');
    return false;
});

// 禁用F12、Ctrl+Shift+I、Ctrl+Shift+J等
document.addEventListener('keydown', function(e) {
    // F12
    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+I (Chrome, Firefox)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+Shift+J (Chrome)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+U (查看源代码)
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }
    
    // Ctrl+S (保存页面)
    if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
    }
});

// 禁用开发者工具打开检测（基础版）
(function() {
    var devtools = /./;
    devtools.toString = function() {
        return 'devtools detection';
    }
    console.log('%c', devtools);
})();