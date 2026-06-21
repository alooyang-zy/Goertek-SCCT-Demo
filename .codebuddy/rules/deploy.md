---
description: 歌尔控制塔部署协议 - 生产环境更新同步
alwaysApply: false
enabled: true
---

# 歌尔供应链控制塔 — 部署协议

## 生产环境信息
- IP: 114.132.63.242
- 实例: lhins-ftf1tsob (ap-guangzhou)
- 域名: goertek.scct.cloud
- Node.js: 端口 80
- Python API: 端口 5000

## 代码同步到生产步骤
1. 本地开发完成 → `git add -A && git commit -m "..." && git push`
2. Lighthouse 上传: `deploy_project_preparation` 到服务器
3. 覆盖文件: `cp -r /root/new-upload/* /root/Goertek-SCCT-Demo_xxx/`
4. 重启服务: `pkill -f 'node server' && pkill -f uvicorn && bash /root/start-scct.sh`

## 快速重启
```bash
bash /root/start-scct.sh
```

## 查看日志
```bash
tail -f /tmp/node-server.log
tail -f /tmp/python-api.log
```

## 回滚
使用 git revert 后重新部署
