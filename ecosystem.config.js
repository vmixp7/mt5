module.exports = {
  apps: [
    {
      name: "mt5proxy", // 你可以自訂應用名稱
      script: "app.js", // 你的主程式檔案
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      node_args: "--max-old-space-size=2048", // 記憶體上限 2GB
      instances: 'max', // 啟動幾個實例（你也可以用 'max' 自動判斷 CPU 核心數）
      autorestart: true,
      watch: false,
      max_memory_restart: "2G", // 當超過 2G 記憶體時自動重啟
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
