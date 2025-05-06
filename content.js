// 创建插件的命名空间
window.ImageCopyPlugin = window.ImageCopyPlugin || {};

// 调试日志函数
function log(message, type = 'info') {
    const prefix = '[图片复制插件]';
    switch(type) {
        case 'error':
            console.error(prefix, message);
            break;
        case 'warn':
            console.warn(prefix, message);
            break;
        default:
            console.log(prefix, message);
    }
}

// 创建复制按钮
function createCopyButton() {
    try {
        const button = document.createElement('button');
        button.className = 'copy-link-button';
        button.innerHTML = '复制链接';
        button.title = '复制链接';
        
        // 使用更明显的样式
        Object.assign(button.style, {
            position: 'fixed',
            padding: '8px 16px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            zIndex: '999999',
            display: 'block',
            margin: '0',
            fontFamily: 'Arial, sans-serif'
        });

        return button;
    } catch (error) {
        log('创建复制按钮失败: ' + error.message, 'error');
        return null;
    }
}

// 创建记事本界面
function createNotepad() {
    try {
        const notepad = document.createElement('div');
        notepad.className = 'image-copy-notepad';
        
        // 设置记事本样式
        Object.assign(notepad.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '250px',
            height: '300px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            borderRadius: '6px',
            zIndex: '999999',
            display: 'none',
            flexDirection: 'column',
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px'
        });

        // 创建标题栏
        const header = document.createElement('div');
        Object.assign(header.style, {
            padding: '6px 10px',
            backgroundColor: '#4285f4',
            color: 'white',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'move',
            fontSize: '12px'
        });
        header.innerHTML = `
            <span style="font-weight: bold;">链接记事本</span>
            <div>
                <button id="copy-all" style="background: none; border: none; color: white; cursor: pointer; margin-right: 8px; font-size: 12px;">复制全部</button>
                <button id="minimize-notepad" style="background: none; border: none; color: white; cursor: pointer; margin-right: 8px; font-size: 12px;">_</button>
                <button id="clear-notepad" style="background: none; border: none; color: white; cursor: pointer; font-size: 12px;">清空</button>
            </div>
        `;
        notepad.appendChild(header);

        // 创建内容区域
        const content = document.createElement('div');
        Object.assign(content.style, {
            flex: '1',
            padding: '8px',
            overflowY: 'auto',
            backgroundColor: '#f5f5f5',
            fontSize: '12px'
        });
        notepad.appendChild(content);

        // 添加到body
        document.body.appendChild(notepad);

        // 添加清空按钮事件
        document.getElementById('clear-notepad').addEventListener('click', () => {
            content.innerHTML = '';
            log('记事本已清空');
        });

        // 添加最小化按钮事件
        document.getElementById('minimize-notepad').addEventListener('click', () => {
            notepad.style.display = 'none';
            log('记事本已最小化');
        });

        // 添加复制全部按钮事件
        document.getElementById('copy-all').addEventListener('click', () => {
            const links = Array.from(content.querySelectorAll('a')).map(a => a.href);
            if (links.length > 0) {
                const allLinks = links.join('\n');
                copyToClipboard(allLinks);
                log('已复制所有链接');
            } else {
                log('记事本为空', 'warn');
            }
        });

        // 添加拖拽功能
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === header) {
                isDragging = true;
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                setTranslate(currentX, currentY, notepad);
            }
        }

        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
        }

        return { notepad, content };
    } catch (error) {
        log('创建记事本失败: ' + error.message, 'error');
        return null;
    }
}

// 显示记事本
function showNotepad() {
    try {
        if (window.ImageCopyPlugin.notepad) {
            window.ImageCopyPlugin.notepad.notepad.style.display = 'flex';
            log('记事本已显示');
        }
    } catch (error) {
        log('显示记事本失败: ' + error.message, 'error');
    }
}

// 隐藏记事本
function hideNotepad() {
    try {
        if (window.ImageCopyPlugin.notepad) {
            window.ImageCopyPlugin.notepad.notepad.style.display = 'none';
            log('记事本已隐藏');
        }
    } catch (error) {
        log('隐藏记事本失败: ' + error.message, 'error');
    }
}

// 添加链接到记事本
function addLinkToNotepad(link) {
    try {
        if (!window.ImageCopyPlugin.notepad) {
            log('记事本不存在，尝试重新创建', 'warn');
            const notepad = createNotepad();
            if (notepad) {
                window.ImageCopyPlugin.notepad = notepad;
            } else {
                log('创建记事本失败', 'error');
                return;
            }
        }

        const content = window.ImageCopyPlugin.notepad.content;
        const linkElement = document.createElement('div');
        Object.assign(linkElement.style, {
            padding: '6px',
            marginBottom: '6px',
            backgroundColor: 'white',
            borderRadius: '4px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px'
        });

        const linkText = document.createElement('a');
        linkText.href = link;
        linkText.textContent = link;
        linkText.target = '_blank';
        Object.assign(linkText.style, {
            color: '#4285f4',
            textDecoration: 'none',
            flex: '1',
            marginRight: '8px',
            wordBreak: 'break-all',
            fontSize: '12px'
        });

        const copyButton = document.createElement('button');
        copyButton.textContent = '复制';
        Object.assign(copyButton.style, {
            padding: '2px 6px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '11px',
            whiteSpace: 'nowrap'
        });

        copyButton.addEventListener('click', () => {
            copyToClipboard(link);
        });

        linkElement.appendChild(linkText);
        linkElement.appendChild(copyButton);
        content.insertBefore(linkElement, content.firstChild);
        
        log('链接已添加到记事本');
    } catch (error) {
        log('添加链接到记事本失败: ' + error.message, 'error');
    }
}

// 复制链接到剪贴板
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        // 显示复制成功提示
        const tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = '已复制！';
        
        // 使用更明显的样式
        Object.assign(tooltip.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#4285f4',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            fontSize: '14px',
            zIndex: '1000000',
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            fontWeight: 'bold'
        });

        document.body.appendChild(tooltip);
        
        // 2秒后移除提示
        setTimeout(() => {
            tooltip.remove();
        }, 2000);
        log('链接已复制到剪贴板');
    } catch (err) {
        log('复制失败: ' + err.message, 'error');
    }
}

// 查找最近的父级a标签
function findParentAnchor(element) {
    try {
        let current = element;
        while (current && current !== document.body) {
            if (current.tagName === 'A') {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    } catch (error) {
        log('查找父级a标签失败: ' + error.message, 'error');
        return null;
    }
}

// 处理鼠标进入事件
function handleMouseEnter(e) {
    try {
        const img = e.target;
        log('鼠标进入图片');
        
        // 检查是否已经有按钮
        if (document.querySelector('.copy-link-button')) {
            log('按钮已存在');
            return;
        }
        
        const button = createCopyButton();
        if (!button) {
            log('创建按钮失败');
            return;
        }

        // 获取图片的位置信息
        const rect = img.getBoundingClientRect();
        
        // 设置按钮位置 - 放在图片右下角
        button.style.top = (rect.bottom - 50) + 'px';
        button.style.left = (rect.right - 50) + 'px';
        
        // 将按钮添加到body
        document.body.appendChild(button);
        
        log('按钮已添加');
        
        // 添加点击事件
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const parentAnchor = findParentAnchor(img);
            if (parentAnchor && parentAnchor.href) {
                const link = parentAnchor.href;
                copyToClipboard(link);
                addLinkToNotepad(link);
            } else {
                log('未找到可复制的链接', 'warn');
            }
        });

        // 为按钮添加鼠标进入和离开事件
        button.addEventListener('mouseenter', (event) => {
            event.stopPropagation();
            // 防止触发图片的mouseleave事件
            img.setAttribute('data-button-hover', 'true');
        });

        button.addEventListener('mouseleave', (event) => {
            event.stopPropagation();
            img.removeAttribute('data-button-hover');
            // 检查鼠标是否真的离开了图片区域
            const imgRect = img.getBoundingClientRect();
            const mouseX = event.clientX;
            const mouseY = event.clientY;
            
            if (mouseX < imgRect.left || mouseX > imgRect.right || 
                mouseY < imgRect.top || mouseY > imgRect.bottom) {
                button.remove();
                log('按钮已移除');
            }
        });
    } catch (error) {
        log('处理鼠标进入事件失败: ' + error.message, 'error');
    }
}

// 处理鼠标离开事件
function handleMouseLeave(e) {
    try {
        const img = e.target;
        // 如果鼠标移到了按钮上，不移除按钮
        if (img.getAttribute('data-button-hover') === 'true') {
            return;
        }
        
        const button = document.querySelector('.copy-link-button');
        if (button) {
            button.remove();
            log('按钮已移除');
        }
    } catch (error) {
        log('处理鼠标离开事件失败: ' + error.message, 'error');
    }
}

// 为图片添加事件监听器
function addImageListeners() {
    try {
        // 获取所有图片元素
        const images = document.querySelectorAll('img');
        const newImages = Array.from(images).filter(img => !img.hasAttribute('data-copy-listener'));
        
        if (newImages.length > 0) {
            log(`为 ${newImages.length} 个新图片添加事件监听器`);
            
            // 为每个新图片添加事件监听器
            newImages.forEach(img => {
                img.setAttribute('data-copy-listener', 'true');
                img.addEventListener('mouseenter', handleMouseEnter);
                img.addEventListener('mouseleave', handleMouseLeave);
            });
        }
    } catch (error) {
        log('添加图片事件监听器失败: ' + error.message, 'error');
    }
}

// 初始化函数
function initialize() {
    try {
        // 确保document.body存在
        if (!document.body) {
            log('等待DOM加载...', 'warn');
            return;
        }

        // 如果已经初始化过，则不再重复初始化
        if (window.ImageCopyPlugin.initialized) {
            return;
        }

        // 创建记事本
        const notepad = createNotepad();
        if (notepad) {
            window.ImageCopyPlugin.notepad = notepad;
            log('记事本创建成功');
        }

        // 为现有图片添加事件监听器
        addImageListeners();

        // 创建并配置MutationObserver
        if (!window.ImageCopyPlugin.observer) {
            window.ImageCopyPlugin.observer = new MutationObserver((mutations) => {
                try {
                    mutations.forEach((mutation) => {
                        if (mutation.addedNodes.length) {
                            addImageListeners();
                        }
                    });
                } catch (error) {
                    log('处理DOM变化失败: ' + error.message, 'error');
                }
            });

            // 开始观察
            window.ImageCopyPlugin.observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        window.ImageCopyPlugin.initialized = true;
        log('插件初始化成功');
    } catch (error) {
        log('初始化失败: ' + error.message, 'error');
    }
}

// 等待DOM加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// 添加页面完全加载后的处理
window.addEventListener('load', () => {
    if (!window.ImageCopyPlugin.initialized) {
        initialize();
    }
});

// 添加消息监听器
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleNotepad') {
        if (window.ImageCopyPlugin.notepad) {
            const isVisible = window.ImageCopyPlugin.notepad.notepad.style.display === 'flex';
            if (isVisible) {
                hideNotepad();
            } else {
                showNotepad();
            }
        }
    }
}); 