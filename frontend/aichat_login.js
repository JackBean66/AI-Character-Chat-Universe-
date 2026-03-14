// 全局变量
const API_BASE_URL = 'http://localhost:5000/api';
let currentForm = 'login';

// DOM 加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已登录
    checkLoginStatus();
    
    // 表单切换
    document.getElementById('loginBtn').addEventListener('click', () => switchForm('login'));
    document.getElementById('registerBtn').addEventListener('click', () => switchForm('register'));
    
    // 表单提交
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // 输入框实时验证
    setupInputValidation();
});

// 检查登录状态
async function checkLoginStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/check`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // 已登录，跳转到主页面
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.log('未登录或检查失败:', error);
    }
}

// 切换表单
function switchForm(formType) {
    currentForm = formType;
    
    // 更新按钮状态
    document.getElementById('loginBtn').classList.toggle('active', formType === 'login');
    document.getElementById('registerBtn').classList.toggle('active', formType === 'register');
    
    // 切换表单显示
    document.getElementById('loginForm').classList.toggle('active', formType === 'login');
    document.getElementById('registerForm').classList.toggle('active', formType === 'register');
    
    // 清除所有错误消息
    clearAllErrors();
    hideMessage();
}

// 显示/隐藏密码
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.nextElementSibling;
    const icon = toggleBtn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// 显示错误消息
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// 清除错误消息
function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

// 清除所有错误消息
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}

// 显示消息提示
function showMessage(message, type = 'success') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = 'block';
    
    // 自动隐藏
    setTimeout(() => {
        hideMessage();
    }, 5000);
}

// 隐藏消息提示
function hideMessage() {
    const messageBox = document.getElementById('messageBox');
    messageBox.style.display = 'none';
}

// 显示加载状态
function showLoading(buttonId) {
    const button = document.getElementById(buttonId);
    const spinner = button.querySelector('.spinner');
    const text = button.querySelector('span');
    
    button.disabled = true;
    text.style.opacity = '0.5';
    spinner.classList.remove('hidden');
}

// 隐藏加载状态
function hideLoading(buttonId) {
    const button = document.getElementById(buttonId);
    const spinner = button.querySelector('.spinner');
    const text = button.querySelector('span');
    
    button.disabled = false;
    text.style.opacity = '1';
    spinner.classList.add('hidden');
}

// 设置输入验证
function setupInputValidation() {
    // 登录表单验证
    const loginUsername = document.getElementById('loginUsername');
    const loginPassword = document.getElementById('loginPassword');
    
    loginUsername.addEventListener('input', () => clearError('loginUsernameError'));
    loginPassword.addEventListener('input', () => clearError('loginPasswordError'));
    
    // 注册表单验证
    const registerUsername = document.getElementById('registerUsername');
    const registerEmail = document.getElementById('registerEmail');
    const registerFullName = document.getElementById('registerFullName');
    const registerPassword = document.getElementById('registerPassword');
    const registerConfirmPassword = document.getElementById('registerConfirmPassword');
    
    registerUsername.addEventListener('input', () => {
        clearError('registerUsernameError');
        validateUsername(registerUsername.value);
    });
    
    registerEmail.addEventListener('input', () => {
        clearError('registerEmailError');
        validateEmail(registerEmail.value);
    });
    
    registerFullName.addEventListener('input', () => clearError('registerFullNameError'));
    registerPassword.addEventListener('input', () => clearError('registerPasswordError'));
    registerConfirmPassword.addEventListener('input', () => clearError('registerConfirmPasswordError'));
}

// 验证用户名
function validateUsername(username) {
    if (username.length < 3) {
        showError('registerUsernameError', '用户名至少3个字符');
        return false;
    }
    if (username.length > 20) {
        showError('registerUsernameError', '用户名不能超过20个字符');
        return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        showError('registerUsernameError', '用户名只能包含字母、数字、下划线和连字符');
        return false;
    }
    return true;
}

// 验证邮箱
function validateEmail(email) {
    if (!email) return true;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('registerEmailError', '邮箱格式不正确');
        return false;
    }
    return true;
}

// 验证密码
function validatePassword(password) {
    if (password.length < 6) {
        showError('registerPasswordError', '密码至少6个字符');
        return false;
    }
    return true;
}

// 验证确认密码
function validateConfirmPassword(password, confirmPassword) {
    if (password !== confirmPassword) {
        showError('registerConfirmPasswordError', '两次输入的密码不一致');
        return false;
    }
    return true;
}

// 处理登录
async function handleLogin(event) {
    event.preventDefault();
    
    // 清除之前的错误
    clearAllErrors();
    hideMessage();
    
    // 获取表单数据
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    // 简单验证
    let isValid = true;
    
    if (!username) {
        showError('loginUsernameError', '请输入用户名或邮箱');
        isValid = false;
    }
    
    if (!password) {
        showError('loginPasswordError', '请输入密码');
        isValid = false;
    }
    
    if (!isValid) return;
    
    showLoading('loginSubmitBtn');

try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        }),
        credentials: 'include'
    });
    
    // 首先检查HTTP状态
    console.log('响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
        // 处理HTTP错误
        const errorText = await response.text();
        console.error('HTTP错误响应:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // 获取响应文本（用于调试）
    const responseText = await response.text();
    console.log('原始响应文本:', responseText);
    
    // 解析JSON
    let data;
    try {
        data = JSON.parse(responseText);
    } catch (parseError) {
        console.error('JSON解析失败:', parseError);
        console.error('原始文本:', responseText);
        throw new Error('服务器返回的数据格式错误');
    }
    
    console.log('解析后的数据:', data);
    
    // ✅ 检查数据格式
    if (!data) {
        throw new Error('服务器返回空数据');
    }
    
    // ✅ 根据实际数据结构调整
    const isSuccess = data.status === 'success' || data.success === true;
    
    if (isSuccess) {
        console.log('✅ 登录成功，数据:', data);
        
        // ✅ 确保使用 data.user，而不是未定义的 user 变量
        const userData = data.user || data.data || data;
        console.log('要保存的用户数据:', userData);
        
        if (userData) {
            // ✅ 统一使用 'user' 作为键名
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('✅ 用户信息已保存到 localStorage');
        }
        
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
        
        showMessage('登录成功！正在跳转...', 'success');
        window.location.href = 'aichat_root.html';
       
    } else {
        // 显示后端返回的错误信息
        const errorMsg = data.message || data.error || '登录失败';
        console.error('登录失败:', errorMsg);
        showError('loginPasswordError', errorMsg);
        showMessage(errorMsg, 'error');
    }
    
} catch (error) {
    console.error('登录请求失败:', error);
    showMessage('网络错误: ' + error.message, 'error');
} finally {
    hideLoading('loginSubmitBtn');
}
}

// 处理注册
async function handleRegister(event) {
    event.preventDefault();
    
    // 清除之前的错误
    clearAllErrors();
    hideMessage();
    
    // 获取表单数据
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const fullName = document.getElementById('registerFullName').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();
    
    // 验证数据
    let isValid = true;
    
    if (!validateUsername(username)) isValid = false;
    if (!validateEmail(email)) isValid = false;
    if (!fullName) {
        showError('registerFullNameError', '请输入姓名');
        isValid = false;
    }
    if (!validatePassword(password)) isValid = false;
    if (!validateConfirmPassword(password, confirmPassword)) isValid = false;
    
    
    
    
   try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            email: email,
            full_name: fullName,
            password: password
        }),
        credentials: 'include'
    });
    
    // ✅ 先检查HTTP状态
    if (!response.ok) {
        const errorText = await response.text();
        console.error('注册HTTP错误:', response.status, errorText);
        throw new Error(`注册失败: HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('注册响应:', data);
    
    if (data.status === 'success') {
        showMessage('注册成功！正在自动登录...', 'success');
        
        // ✅ 延迟一下，然后调用登录接口
        setTimeout(async () => {
            try {
                // 使用刚注册的账号密码自动登录
                const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    credentials: 'include',
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });
                
                // ✅ 检查登录响应
                if (!loginResponse.ok) {
                    const loginError = await loginResponse.text();
                    console.error('登录HTTP错误:', loginResponse.status, loginError);
                    throw new Error(`自动登录失败: HTTP ${loginResponse.status}`);
                }
                
                const loginData = await loginResponse.json();
                console.log('自动登录响应:', loginData);
                
                if (loginData.status === 'success') {
                    // ✅ 这里才是真正的用户数据
                    localStorage.setItem('user', JSON.stringify(loginData.user));
                    localStorage.setItem('authToken', loginData.token);
                    
                    showMessage('自动登录成功！正在跳转...', 'success');
                    
                    setTimeout(() => {
                        window.location.href = 'aichat_root.html';
                    }, 1500);
                } else {
                    showMessage('注册成功，但自动登录失败，请手动登录', 'warning');
                    // ✅ 切换到登录表单并预填用户名
                    switchToLogin();
                    document.getElementById('loginUsername').value = username;
                }
                
            } catch (error) {
                console.error('自动登录失败:', error);
                showMessage('注册成功，请手动登录', 'success');
                // ✅ 切换到登录表单
                switchToLogin();
                document.getElementById('loginUsername').value = username;
            }
        }, 1000);
        
    } else {
        // ✅ 处理注册失败
        const errorMsg = data.message || data.error || '注册失败';
        console.error('注册失败:', errorMsg);
        showError('registerFormError', errorMsg);
        showMessage(errorMsg, 'error');
    }
    
} catch (error) {
    console.error('注册请求失败:', error);
    showMessage('网络错误: ' + error.message, 'error');
} finally {
    // ✅ 重置按钮状态
    hideLoading('registerSubmitBtn');
}
}



// 测试 API 连接
async function testAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/test`);
        const data = await response.json();
        console.log('API 测试结果:', data);
        return data.status === 'success';
    } catch (error) {
        console.error('API 测试失败:', error);
        return false;
    }
}

// 获取数据库信息（调试用）
async function getDBInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/db_info`);
        const data = await response.json();
        console.log('数据库信息:', data);
        return data;
    } catch (error) {
        console.error('获取数据库信息失败:', error);
        return null;
    }
}

// 登出函数（可以放在其他页面使用）
async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // 清除本地存储
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            
            // 跳转到登录页
            window.location.href = 'aichat_login.html';
        }
    } catch (error) {
        console.error('登出失败:', error);
    }
}

// 页面初始化时测试连接
window.onload = function() {
    // 可选：测试 API 连接
    testAPI();
};