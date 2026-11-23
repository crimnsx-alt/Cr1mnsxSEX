# Quick Start Guide

## 1. Запуск локального сервера
```bash
node scripts/server.js
```
Сервер запустится на `http://localhost:8080/` и `http://127.0.0.1:8080/` с поддержкой IPv4 и IPv6, CORS и автоматическим отключением кэширования для dev-режима.

## 2. Проверка синтаксиса JavaScript перед коммитом
```bash
for f in js/*.js; do node --input-type=module --check < "$f" && echo "$f OK"; done
```

## 3. Коммит и деплой на GitHub Pages
```bash
git add .
git commit -m "feat: your commit message"
git push origin main
```
GitHub Pages автоматически собирает и публикует сайт по адресу:
https://crimnsx-alt.github.io/Cr1mnsxSEX/
