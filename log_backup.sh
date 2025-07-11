#!/bin/bash

# 設定原始 log 路徑
LOG_DIR="$HOME/.pm2/logs"
OUT_LOG_FILE="$LOG_DIR/mt5proxy-out.log"
ERR_LOG_FILE="$LOG_DIR/mt5proxy-error.log"

# 根據星期幾命名新檔案
DAY_NAME=$(date +%u)

# 複製 log 檔
cp "$OUT_LOG_FILE" "$LOG_DIR/out_${DAY_NAME}.log"
cp "$ERR_LOG_FILE" "$LOG_DIR/err_${DAY_NAME}.log"

# 可選：清空原始 log（如果你希望每天清空）
pm2 flush
