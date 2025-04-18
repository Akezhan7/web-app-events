# Приложение для управления мероприятиями

Приложение позволяет просматривать предстоящие мероприятия, регистрироваться на них, а администраторам создавать и редактировать мероприятия.

## Функциональность

- Таймер обратного отсчета до ближайшего мероприятия
- Регистрация и авторизация пользователей
- Просмотр списка мероприятий
- Регистрация на мероприятия
- Личный кабинет с перечнем мероприятий, на которые зарегистрирован пользователь
- Администраторский интерфейс для управления мероприятиями

## Установка и запуск

### Требования
- Node.js v14+
- npm v6+

### Шаги установки
1. Клонировать репозиторий
2. Установить зависимости:
   ```
   npm run install-all
   ```
3. Запустить приложение:
   ```
   npm start
   ```

Серверная часть будет доступна по адресу: http://localhost:3001
Клиентская часть будет доступна по адресу: http://localhost:3000

## Учетные данные администратора по умолчанию
- Email: admin@example.com
- Пароль: admin123

## Технологии
- Frontend: React, Material-UI, React Router
- Backend: Node.js, Express
- База данных: SQLite

## Дизайн
В приложении реализован современный, отзывчивый интерфейс с использованием Material-UI - популярной библиотеки компонентов React, реализующей Material Design от Google.

Особенности дизайна:
- Адаптивный интерфейс для мобильных и десктопных устройств
- Анимированный таймер обратного отсчета
- Карточки событий с интерактивными элементами
- Настраиваемая тема с основными и вторичными цветами
