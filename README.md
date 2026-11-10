# TAKTO. — каталог и управление продукцией

Существующий React/Vite-сайт на Cloudflare Pages. Динамический каталог использует Supabase PostgreSQL, Auth и Storage. `/admin` предназначен для одного владельца; публичной регистрации нет.

- [Подключение Supabase, создание администратора и первой карточки](docs/supabase-setup.md)
- [Архитектура, изменённые файлы и результаты проверок](docs/catalog-implementation.md)

## Локальный запуск

Node.js 24 LTS, npm:

```sh
npm ci
# Скопируйте .env.example в .env.local и укажите публичный URL/ключ проекта.
npm run dev
npm test
npm run build
npm run verify:supabase
```

Для клиента используются только `VITE_SUPABASE_URL` и `VITE_SUPABASE_PUBLISHABLE_KEY`. Пароль и секретные ключи в исходники не помещаются. Без применённой миграции каталог показывает ошибку подключения; демонстрационные товары автоматически не публикуются.
