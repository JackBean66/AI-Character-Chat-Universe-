const API_BASE = 'http://localhost:5000/api';

// 登录功能
async function login() {
    const username = document.getElementById('usernameInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    
    if (!username || !password) {
        showLoginResult('请输入用户名和密码', true);
        return;
    }

    showLoginResult('🔐 登录中...');
    
    try {
        // 这里调用后端的登录API
        // 注意：你需要先在后端实现登录API
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // 登录成功，保存用户信息到localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token || 'demo-token');
            localStorage.setItem('loginTime', new Date().toISOString());
            
            showLoginResult('✅ 登录成功！正在跳转...');
            
            // 1.5秒后跳转到dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showLoginResult(`登录失败: ${data.error}`, true);
        }
    } catch (error) {
        // 如果后端还没有登录API，使用模拟登录
        if (error.message.includes('Failed to fetch')) {
            // 模拟登录（开发用）
            simulateLogin(username, password);
        } else {
            showLoginResult(`请求失败: ${error}`, true);
        }
    }
}

// 模拟登录（开发阶段使用）
function simulateLogin(username, password) {
    // 模拟API响应延迟
    setTimeout(() => {
        // 简单的验证逻辑
        if (username && password.length >= 3) {
            const userData = {
                id: 1,
                username: username,
                email: `${username}@example.com`,
                role: 'admin',
                name: username
            };
            
            // 保存到localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', 'demo-token-' + Date.now());
            localStorage.setItem('loginTime', new Date().toISOString());
            
            showLoginResult('✅ 模拟登录成功！正在跳转...');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showLoginResult('❌ 用户名或密码不正确', true);
        }
    }, 800);
}

// 测试自动登录
function testAutoLogin() {
    document.getElementById('usernameInput').value = 'admin';
    document.getElementById('passwordInput').value = '123456';
    login();
}

// 注册功能（简单演示）
function register() {
    const username = prompt('请输入用户名:');
    if (username) {
        alert(`注册功能开发中...\n用户名: ${username}\n请使用任意密码登录`);
        document.getElementById('usernameInput').value = username;
        document.getElementById('passwordInput').focus();
    }
}

// 显示登录结果
function showLoginResult(message, isError = false) {
    const resultDiv = document.getElementById('loginResult');
    resultDiv.textContent = message;
    resultDiv.style.color = isError ? '#dc3545' : '#28a745';
    resultDiv.style.borderColor = isError ? '#dc3545' : '#28a745';
}

// 页面加载时检查是否已登录
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 登录页面已加载');
    
    // 如果已经登录，直接跳转
    const user = localStorage.getItem('user');
    if (user) {
        showLoginResult('检测到已登录，正在跳转...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }
    
    // 回车键登录
    document.getElementById('passwordInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
});