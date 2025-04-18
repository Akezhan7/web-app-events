# Проверка структуры проекта и исправление проблем с фронтендом

Проблема в том, что папка `client` не была найдена или фронтенд не был собран при деплое.

## Шаги для проверки структуры проекта

1. Проверьте локальную структуру проекта:
   ```bash
   ls -la
   ```

2. Убедитесь, что есть папка `client`:
   ```bash
   ls -la client/
   ```

3. Если папка `client` существует, проверьте package.json:
   ```bash
   cat client/package.json
   ```

## Если папка client отсутствует

Если папка `client` отсутствует, вам нужно создать минимальный фронтенд:

1. Создайте папку client:
   ```bash
   mkdir -p client/src/components
   mkdir -p client/public
   ```

2. Создайте базовый package.json:
   ```bash
   cd client
   npm init -y
   npm install react react-dom react-router-dom axios
   npm install --save-dev @vitejs/plugin-react vite
   ```

3. Добавьте в package.json скрипты:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview"
   }
   ```

4. Создайте минимальную структуру React приложения

Не забудьте добавить, закоммитить и запушить изменения:
```bash
git add .
git commit -m "Add client folder structure"
git push origin main
```
