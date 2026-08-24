# Angular Valuta — Конвертер валют

Веб-приложение для конвертации валют в реальном времени.

## Стек

| Технология | Версия |
|---|---|
| Angular | 22.1.x |
| TypeScript | 7.0.x |
| Angular Material | 22.1.x |
| RxJS | 7.8.x |
| Bootstrap | 5.3.x |
| pnpm | 9.x |

## Быстрый старт

```bash
# Установка pnpm (если нет)
npm install -g pnpm

# Установка зависимостей
pnpm install

# Запуск dev-сервера
pnpm start

# Продакшн-сборка
pnpm run build:prod
```

## API

Используется [Frankfurter API](https://frankfurter.dev) — бесплатный, без API-ключа, курсы ECB (~30 валют, обновление раз в рабочий день).

```
GET https://api.frankfurter.app/latest?base=USD
```

## Декомпозиция

| Сервис | Ответственность |
|---|---|
| `CurrencyCalculatorService` | Чистая логика расчёта курсов |
| `CurrencyAutocompleteService` | Фильтрация и поиск валют для autocomplete |
| `CurrencyHistoryService` | Управление историей конвертаций, localStorage |
| `ConverterFormService` | Создание и валидация reactive form |
| `CurrencySymbolService` | Получение символа валюты по коду |
| `CurrencyExchangeService` | Хранение общего состояния |

## Деплой на Vercel

```bash
pnpm add -D vercel
vercel deploy
```

Конфигурация `vercel.json` уже настроена:

```json
{
  "buildCommand": "pnpm run build:prod",
  "outputDirectory": "dist/client/browser",
  "framework": "angular"
}
```

## Структура проекта

```
src/
├── app/
│   ├── auth/                          # Аутентификация (логин, guard, mock interceptor)
│   ├── components/
│   │   ├── converter/                 # Основной компонент конвертера
│   │   └── history/                   # История конвертаций
│   ├── core/
│   │   ├── alert/                     # Сервис уведомлений
│   │   ├── header/                    # Навигационная панель
│   │   └── not-found/                 # Страница 404
│   └── shared/
│       ├── interface/                 # Модели данных, перечисления
│       └── service/
│           ├── currency-calculator.service.ts
│           ├── currency-autocomplete.service.ts
│           ├── currency-history.service.ts
│           ├── converter-form.service.ts
│           ├── currency-symbol.service.ts
│           ├── currency-exchange.service.ts
│           ├── exchange-rates-api-request.service.ts
│           └── storage.service.ts
├── assets/
│   ├── css/                           # Стили, тема Material
│   ├── font/                          # Шрифты Roboto, Fontello
│   ├── icons/                         # Иконки PWA
│   └── i18n/                          # Переводы
└── environments/
    ├── environment.ts                 # Dev-окружение
    └── environment.prod.ts            # Продакшн-окружение
```

## Авторизация

- Логин: `user1`
- Пароль: `pass1`

Mock-интерсептор имитирует ответ сервера без реального бэкенда.
