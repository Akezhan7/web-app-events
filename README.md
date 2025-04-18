# Events Application

Event management application with React frontend and Express backend.

## Setup and Installation

1. Clone the repository
2. Install all dependencies:
   ```
   npm run install-all
   ```
3. Create environment files:
   - Copy `.env.example` to `.env` in root directory
   - Copy `server/.env.example` to `server/.env`
   - Configure the variables as needed

## Development

To run the application in development mode:

```
npm start
```

## Production Deployment

1. Build the application:
   ```
   npm run build:all
   ```

2. Start the production server:
   ```
   npm run start:prod
   ```

## Деплой на Render.com

### Подготовка

1. Создайте аккаунт на [Render.com](https://render.com)
2. Подключите свой GitHub репозиторий

### Web Service для сервера и клиента (объединенный деплой)

1. В Render Dashboard выберите "New" → "Web Service"
2. Подключите ваш репозиторий
3. Настройте следующие параметры:
   - **Name**: events-application (или любое другое имя)
   - **Environment**: Node
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free (или другой по вашему выбору)

4. В разделе "Environment Variables" добавьте все переменные из `.env.example`
5. Нажмите "Create Web Service"

### Отслеживание статуса

После создания сервиса, Render автоматически запустит процесс сборки и деплоя.
Вы можете отслеживать статус в разделе "Events" вашего Web Service.

## Project Structure

- `client/` - React frontend application
- `server/` - Express backend API
- `package.json` - Root package for running both client and server

## Environment Variables

See `.env.example` for required environment variables.
