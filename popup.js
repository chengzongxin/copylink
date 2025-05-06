document.getElementById('toggleNotepad').addEventListener('click', async () => {
    try {
        // 获取当前标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // 向content script发送消息
        chrome.tabs.sendMessage(tab.id, { action: 'toggleNotepad' });
    } catch (error) {
        console.error('发送消息失败:', error);
    }
}); 