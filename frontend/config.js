/**
 * API 配置文件
 * 根据环境自动切换 API 地址
 */

// 获取当前环境
const getEnvironment = () => {
  const hostname = window.location.hostname;

  // 生产环境判断
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return 'production';
  }

  return 'development';
};

// API 配置
const API_CONFIG = {
  development: {
    BASE_URL: 'http://localhost:5000',
    WS_URL: 'ws://localhost:5000'
  },

  production: {
    // Render 部署后，将 YOUR_RENDER_APP_URL 替换为实际的后端 URL
    // 例如: 'https://aichat-backend.onrender.com'
    BASE_URL: window.location.origin,

    // 如果前后端分离部署，使用后端的实际 URL
    // BASE_URL: 'https://your-backend.onrender.com',

    WS_URL: '' // WebSocket 地址（如需要）
  }
};

// 获取当前环境的 API 配置
const env = getEnvironment();
const config = API_CONFIG[env];

// 导出配置
window.API_BASE_URL = config.BASE_URL;
window.API_WS_URL = config.WS_URL;
window.ENVIRONMENT = env;

// 开发模式下输出配置信息
if (env === 'development') {
  console.log('🔧 API 配置:', config);
  console.log('📡 API 地址:', window.API_BASE_URL);
}

// 导出为模块（如果使用 ES6 模块）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ...config, ENVIRONMENT: env };
}
