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
        const button = document.createElement('div');
        button.className = 'copy-link-button';
        button.innerHTML = '📋';
        button.title = '复制链接';
        button.style.cssText = `
            display: flex;
            position: absolute;
            top: 5px;
            right: 5px;
            z-index: 999999;
            background-color: rgba(255, 255, 255, 0.9);
            border-radius: 50%;
            width: 24px;
            height: 24px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease;
        `;
        return button;
    } catch (error) {
        log('创建复制按钮失败: ' + error.message, 'error');
        return null;
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
        tooltip.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #333;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 1000000;
            pointer-events: none;
        `;
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

// 查找最近的包含href的父元素
function findParentWithHref(element) {
    try {
        let current = element;
        while (current && current !== document.body) {
            if (current.href) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    } catch (error) {
        log('查找父元素失败: ' + error.message, 'error');
        return null;
    }
}

// 处理鼠标进入事件
function handleMouseEnter(e) {
    try {
        const img = e.target;
        log('鼠标进入图片');
        
        // 检查是否已经有按钮
        if (img.querySelector('.copy-link-button')) {
            log('按钮已存在');
            return;
        }
        
        const button = createCopyButton();
        if (!button) {
            log('创建按钮失败');
            return;
        }
        
        // 确保图片有相对定位
        const imgStyle = window.getComputedStyle(img);
        if (imgStyle.position === 'static') {
            img.style.position = 'relative';
        }
        
        // 添加按钮
        img.appendChild(button);
        log('按钮已添加');
        
        // 添加点击事件
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const parentWithHref = findParentWithHref(img);
            if (parentWithHref && parentWithHref.href) {
                copyToClipboard(parentWithHref.href);
            } else {
                log('未找到可复制的链接', 'warn');
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
        const button = img.querySelector('.copy-link-button');
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