// 获取开关元素
const autoShowButton = document.getElementById('autoShowButton');
const toggleNotepadButton = document.getElementById('toggleNotepad');

// 从存储中加载开关状态
chrome.storage.sync.get(['autoShowButton'], function(result) {
    autoShowButton.checked = result.autoShowButton || false;
});

// 监听开关变化
autoShowButton.addEventListener('change', function() {
    const isChecked = this.checked;
    // 保存开关状态
    chrome.storage.sync.set({autoShowButton: isChecked});
    
    // 向content script发送消息
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'toggleAutoShow',
                value: isChecked
            }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('发送消息失败:', chrome.runtime.lastError);
                }
            });
        }
    });
});

// 监听记事本按钮点击
toggleNotepadButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleNotepad'});
        }
    });
}); 