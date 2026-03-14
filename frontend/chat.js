// ==================== 完整的聊天系统 chat.js ====================
// 包含：自动按钮绑定 + 完整聊天界面

// 全局变量
let currentCharacter = null;
let currentWork = null;
let chatHistory = [];

// API 配置 - 自动检测环境
// 如果加载了 config.js，使用其中的配置；否则使用默认值
let apiBaseURL = (typeof window.API_BASE_URL !== 'undefined') ? window.API_BASE_URL : 'http://localhost:5000';

// ==================== 聊天页面HTML和CSS ====================

// 聊天页面样式
const chatPageStyle = `
<style>
    /* 聊天页面容器 - 改成白色背景 */
    .chat-page-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 1000;
        display: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
    }
    
    .chat-page-container.active {
        display: block;
    }
    
    /* 聊天主窗口 - 全屏白色 */
    .chat-window {
        width: 100%;
        height: 100%;
        background: white;
        display: flex;
        flex-direction: column;
    }
    
    /* 聊天头部 - 简洁灰色 */
    .chat-header {
        background: #f7f7f8;
        border-bottom: 1px solid #e5e5e5;
        padding: 15px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    
    .character-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .character-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #10a37f 0%, #1a7f64 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 1.2rem;
        color: white;
    }
    
    .character-text h2 {
        margin: 0;
        font-size: 1.2rem;
        color: #333;
        font-weight: 600;
    }
    
    .character-text .work {
        margin: 3px 0 0 0;
        font-size: 0.9rem;
        color: #666;
    }
    
    /* 关闭按钮 - 简洁样式 */
    .close-chat {
        background: transparent;
        border: 1px solid #ddd;
        color: #666;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1rem;
        transition: all 0.2s;
    }
    
    .close-chat:hover {
        background: #f0f0f0;
        color: #333;
    }
    
    /* 消息区域 - 白色背景 */
    .chat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        background: white;
        display: flex;
        flex-direction: column;
        gap: 16px;
        max-width: 800px;
        margin: 0 auto;
        width: 100%;
    }
    
    /* 消息气泡 - 简洁风格 */
    .message {
        max-width: 80%;
    }
    
    .user-message {
        align-self: flex-end;
    }
    
    .character-message {
        align-self: flex-start;
    }
    
    .message-content {
        padding: 12px 16px;
        border-radius: 12px;
        position: relative;
        line-height: 1.6;
        word-wrap: break-word;
        font-size: 0.95rem;
    }
    
    .character-message .message-content {
        background: #f7f7f8;
        border: 1px solid #e5e5e5;
        color: #333;
    }
    
    .user-message .message-content {
        background: #10a37f;
        color: white;
    }
    
    .message-sender {
        font-size: 0.85rem;
        margin-bottom: 4px;
        font-weight: 600;
    }
    
    .character-message .message-sender {
        color: #10a37f;
    }
    
    .user-message .message-sender {
        color: #10a37f;
    }
    
    /* 输入区域 - 简洁样式 */
    .chat-input-area {
        background: white;
        border-top: 1px solid #e5e5e5;
        padding: 16px 20px;
        max-width: 800px;
        margin: 0 auto;
        width: 100%;
    }
    
    .input-group {
        display: flex;
        gap: 10px;
    }
    
    #chat-message-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #d9d9e3;
        border-radius: 12px;
        font-size: 1rem;
        outline: none;
        transition: all 0.2s;
        background: white;
        color: #333;
    }
    
    #chat-message-input:focus {
        border-color: #10a37f;
        box-shadow: 0 0 0 2px rgba(16, 163, 127, 0.1);
    }
    
    #send-chat-message {
        padding: 12px 24px;
        background: #10a37f;
        color: white;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        transition: all 0.2s;
        min-width: 80px;
    }
    
    #send-chat-message:hover:not(:disabled) {
        background: #0d8c6c;
    }
    
    #send-chat-message:disabled {
        background: #c1c1c1;
        cursor: not-allowed;
    }
    
    /* 加载动画 - 简洁版 */
    .typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        background: #f7f7f8;
        border-radius: 12px;
        width: fit-content;
        border: 1px solid #070707ff;
    }
    
    .typing-dot {
        width: 6px;
        height: 6px;
        background: #10a37f;
        border-radius: 50%;
        animation: typing 1.4s infinite;
    }
    
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-6px); }
    }
    
    /* 滚动条样式 */
    .chat-messages::-webkit-scrollbar {
        width: 6px;
    }
    
    .chat-messages::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }
    
    .chat-messages::-webkit-scrollbar-thumb {
        background: #d1d1d1;
        border-radius: 3px;
    }
    
    .chat-messages::-webkit-scrollbar-thumb:hover {
        background: #b1b1b1;
    }
    
    /* 系统消息 */
    .system-message .message-content {
        background: #fff8e6;
        border: 1px solid #ffeaa7;
        color: #856404;
    }
    
    .system-message .message-sender {
        color: #e67e22;
    }
</style>
`;

// 聊天页面HTML - 保持原结构，但更简洁
const chatPageHTML = `
<div class="chat-page-container">
    <div class="chat-window">
        <div class="chat-header">
            <div class="character-info">
                <div class="character-avatar" id="chat-avatar">?</div>
                <div class="character-text">
                    <h2 id="chat-character">选择角色</h2>
                    <p class="work" id="chat-work">开始对话</p>
                </div>
            </div>
            <button class="close-chat" onclick="closeChatPage()">✕</button>
        </div>
        
        <div class="chat-messages" id="chat-messages">
            <!-- 消息会动态添加到这里 -->
        </div>
        
        <div class="chat-input-area">
            <div class="input-group">
                <input 
                    type="text" 
                    id="chat-message-input"
                    placeholder="输入消息..."
                    onkeypress="handleChatEnter(event)"
                >
                <button id="send-chat-message" onclick="sendChatMessage()">
                    发送
                </button>
            </div>
        </div>
    </div>
</div>
`;
// ==================== 聊天核心函数 ====================

// 切换到聊天页面
function switchToChatPage(character, work) {
    currentCharacter = character;
    currentWork = work;
    chatHistory = [];
    
    console.log(`🎭 开始与 ${character} 对话，来自: ${work}`);
    
    // 初始化聊天界面
    initChatPage(character, work);
    
    // 显示聊天页面
    const chatPage = document.querySelector('.chat-page-container');
    if (chatPage) {
        chatPage.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
    
    // 添加欢迎消息
    addChatMessage({
        sender: character,
        text: `你好！我是${character}，来自《${work}》。有什么想和我聊的吗？`,
        isUser: false,
        time: getCurrentTime()
    });
    
    // 聚焦输入框
    setTimeout(() => {
        const input = document.getElementById('chat-message-input');
        if (input) input.focus();
    }, 300);
}

// 关闭聊天页面
function closeChatPage() {
    if (confirm('确定要结束对话吗？未保存的对话将会丢失。')) {
        const chatPage = document.querySelector('.chat-page-container');
        if (chatPage) {
            chatPage.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        // 清空消息
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        
        // 重置状态
        currentCharacter = null;
        currentWork = null;
        chatHistory = [];
    }
}

// 初始化聊天页面
function initChatPage(character, work) {
    // 添加聊天页面到body（如果还没有）
    if (!document.querySelector('.chat-page-container')) {
        document.head.insertAdjacentHTML('beforeend', chatPageStyle);
        document.body.insertAdjacentHTML('beforeend', chatPageHTML);
    }
    
    // 更新页面信息
    const avatarElement = document.getElementById('chat-avatar');
    const characterElement = document.getElementById('chat-character');
    const workElement = document.getElementById('chat-work');
    
    if (avatarElement) avatarElement.textContent = character.charAt(0);
    if (characterElement) characterElement.textContent = character;
    if (workElement) workElement.textContent = work;
    
    // 清空消息区域
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
    
    // 启用输入框
    const input = document.getElementById('chat-message-input');
    const sendBtn = document.getElementById('send-chat-message');
    if (input) input.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
}

// 添加消息到聊天窗口
function addChatMessage({ sender, text, isUser, time }) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'character-message'}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-sender">${sender}</div>
            <div class="message-text">${formatMessageText(text)}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
    
    // 保存到历史记录
    if (isUser) {
        chatHistory.push({
            user: text,
            character: '',
            time: new Date().toISOString()
        });
    } else {
        if (chatHistory.length > 0) {
            chatHistory[chatHistory.length - 1].character = text;
        }
    }
}

// 发送消息
async function sendChatMessage() {
    const input = document.getElementById('chat-message-input');
    const sendBtn = document.getElementById('send-chat-message');
    const message = input ? input.value.trim() : '';
    
    if (!message || !currentCharacter) return;
    
    // 添加用户消息
    addChatMessage({
        sender: '你',
        text: message,
        isUser: true,
        time: getCurrentTime()
    });
    
    // 清空输入框
    if (input) input.value = '';
    
    // 禁用发送按钮
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = '发送中...';
    }
    
    // 显示正在输入
    showTypingIndicator();
    
    try {
        // 发送到后端API
        const response = await fetch(`${apiBaseURL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                character: currentCharacter,
                message: message
            })
        });
        
        const data = await response.json();
        
        // 移除正在输入指示器
        removeTypingIndicator();
        
        if (data.status === 'success') {
            // 添加角色回复
            addChatMessage({
                sender: currentCharacter,
                text: data.reply,
                isUser: false,
                time: getCurrentTime()
            });
            
            console.log(`💬 ${currentCharacter} 回复成功，长度: ${data.reply.length}字符`);
        } else {
            // 显示错误信息
            addChatMessage({
                sender: '系统',
                text: `错误: ${data.error || '未知错误'}`,
                isUser: false,
                time: getCurrentTime()
            });
        }
    } catch (error) {
        removeTypingIndicator();
        addChatMessage({
            sender: '系统',
            text: `网络错误: ${error.message}`,
            isUser: false,
            time: getCurrentTime()
        });
        console.error('发送消息失败:', error);
    } finally {
        // 重新启用发送按钮
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.textContent = '发送';
        }
        
        // 滚动到底部
        scrollToBottom();
    }
}

// 显示正在输入指示器
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message character-message';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

// 移除正在输入指示器
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// 处理回车键发送
function handleChatEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

// ==================== 工具函数 ====================

// 获取当前时间
function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

// 格式化消息文本
function formatMessageText(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// 滚动到底部
function scrollToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// ==================== 自动绑定按钮 ====================

// ==================== 自动绑定按钮 ====================

// 自动绑定所有"与角色对话"按钮
function autoBindChatButtons() {
    const chatButtons = document.querySelectorAll('.chat-btn');
    
    console.log(`🔗 找到 ${chatButtons.length} 个聊天按钮`);
    
    chatButtons.forEach(button => {
        // 移除之前可能绑定的事件（防止重复绑定）
        button.removeEventListener('click', handleChatButtonClick);
        // 添加新的事件
        button.addEventListener('click', handleChatButtonClick);
    });
    
    function handleChatButtonClick() {
        console.log('按钮被点击了！');
        
        // 关键修复：支持作家页面的卡片类名
        const card = this.closest('.character-card, .philosopher-card, .writer-card');
        
        if (!card) {
            console.error('找不到角色卡片');
            // 即使找不到卡片，也显示聊天窗口
            switchToChatPage('未知角色', '未知作品');
            return;
        }
        
        console.log('找到卡片：', card);
        
        // 获取角色名 - 支持多种可能的DOM结构
        let characterName = '未知角色';
        
        // 尝试从卡片内找h3元素
        const nameElement = card.querySelector('h3');
        if (nameElement && nameElement.textContent.trim()) {
            characterName = nameElement.textContent.trim();
        } 
        // 如果没找到，尝试从.card-content找
        else if (card.querySelector('.card-content h3')) {
            characterName = card.querySelector('.card-content h3').textContent.trim();
        }
        
        // 获取作品信息
        let work = '未知作品';
        
        // 先尝试从卡片的特定元素找
        const workBadge = card.querySelector('.work-badge');
        const cardEra = card.querySelector('.card-era');
        const cardRole = card.querySelector('.card-role');
        
        if (workBadge && workBadge.textContent.trim()) {
            work = workBadge.textContent.trim();
        } else if (cardEra && cardEra.textContent.trim()) {
            work = cardEra.textContent.trim();
        } else if (cardRole && cardRole.textContent.trim()) {
            work = cardRole.textContent.trim();
        } else {
            // 如果都没找到，尝试从section标题找
            const section = card.closest('section');
            if (section && section.querySelector('h2')) {
                work = section.querySelector('h2').textContent.trim();
            }
        }
        
        console.log(`选择角色: ${characterName}, 作品: ${work}`);
        switchToChatPage(characterName, work);
    }
}
// ==================== 页面加载后初始化 ====================

// 页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        autoBindChatButtons();
        console.log('🎭 聊天系统已加载完成！');
    });
} else {
    autoBindChatButtons();
    console.log('🎭 聊天系统已加载完成！');
}

// 监听DOM变化，动态绑定新按钮
if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
        autoBindChatButtons();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// ==================== 全局导出函数 ====================
// 让HTML中的onclick也能工作
window.switchToChatPage = switchToChatPage;
window.closeChatPage = closeChatPage;
window.sendChatMessage = sendChatMessage;
window.handleChatEnter = handleChatEnter;
window.autoBindChatButtons = autoBindChatButtons;

console.log('💬 聊天系统已初始化');
console.log('🌐 API地址:', apiBaseURL);
console.log('📱 使用: 点击任意"与角色对话"按钮开始聊天');
// ==================== AI助手功能 ====================

// 打开AI助手
function openAIAssistant() {
    console.log('🆘 打开AI助手帮助中心');
    
    // 直接调用AI助手，无需创建特殊卡片
    switchToChatPage('AI助手', '系统助手');
    
    // 添加引导消息
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
        setTimeout(() => {
            addChatMessage({
                sender: 'AI助手',
                text: `您好！我是您的AI助手，很高兴为您服务！

我主要可以帮助您：

系统使用指南
• 如何选择角色开始对话
• 聊天界面功能介绍
• 对话技巧和建议

角色介绍
• 影视角色：沃尔特·怀特、张东升等
• 哲学家：苏格拉底、尼采等  
• 作家：余华、三毛等
• 科幻角色：刘培强、图恒宇等

对话建议
• 如何向角色提问更有效
• 探讨哪些话题更有深度
• 理解角色的回应方式

技术支持
• 常见问题解决
• 功能异常处理
• 使用技巧分享

请告诉我您需要哪方面的帮助，我会为您详细解答！`,
                isUser: false,
                time: getCurrentTime()
            });
        }, 500);
    }
}

// 添加到全局函数列表
window.openAIAssistant = openAIAssistant;