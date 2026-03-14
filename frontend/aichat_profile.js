// profile_simple.js - 最简单的用户信息显示
console.log('JS文件已加载');

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始显示信息');
    
    // 获取用户数据
    // 浏览器的内置对象
    const userData = localStorage.getItem('user');
    console.log('用户数据:', userData);
    
    // 获取显示元素
    const loading = document.getElementById('loading');
    const profileCard = document.getElementById('profileCard');
    
    if (userData) {
        try {
            // 解析用户数据
            const user = JSON.parse(userData);
            console.log('解析成功:', user);
            
            // 隐藏加载动画
            loading.style.display = 'none';
            
            // 生成头像首字母
            let avatarLetter = 'U';
            if (user.full_name && user.full_name.length > 0) {
                avatarLetter = user.full_name.charAt(0).toUpperCase();
            } else if (user.username && user.username.length > 0) {
                avatarLetter = user.username.charAt(0).toUpperCase();
            }
            
            // 获取用户名
            let userName = '用户';
            if (user.full_name) {
                userName = user.full_name;
            } else if (user.username) {
                userName = user.username;
            }
            
            // 显示用户信息
            profileCard.innerHTML = `
                <div class="avatar">${avatarLetter}</div>
                <h2>${userName}</h2>
                <div class="username">${user.username || '用户'}</div>
                
                <div class="welcome-message">
                   欢迎回来，${userName}！
                </div>
                
                <button class="logout-btn" onclick="logout()">
                    退出登录
                </button>
            `;
            
            // 显示卡片
            profileCard.style.display = 'block';
            
            console.log('用户信息显示完成');
            
        } catch (error) {
            console.error('解析失败:', error);
            showNoData();
        }
    } else {
        console.log('没有用户数据');
        showNoData();
    }
});

// 显示无数据状态
function showNoData() {
    const loading = document.getElementById('loading');
    const profileCard = document.getElementById('profileCard');
    
    loading.style.display = 'none';
    profileCard.innerHTML = `
        <div class="avatar">?</div>
        <h2>未登录</h2>
        <div class="username">请先登录</div>
        
        <div class="welcome-message">
            <i class="fas fa-user"></i> 您还没有登录
        </div>
        
        <button class="logout-btn" onclick="window.location.href='aichat_login.html'">
            <i class="fas fa-sign-in-alt"></i> 去登录
        </button>
    `;
    profileCard.style.display = 'block';
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        alert('已退出登录');
        window.location.href = 'aichat_root.html';
    }
}

// 调试函数
console.log('JS文件加载完成');