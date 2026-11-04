# Ассеты и GSAP

Проверено 3 ноября 2026 года.

## Изображения

Источник — предоставленная папка `TAKTO-assets`. Она содержит 24 PNG и 12 SVG-иконок. По приложенному README изображения являются визуальными концептами, а не фотографиями выполненных заказов. Их нельзя использовать как доказательство характеристик материалов или портфолио реального производства.

`scripts/optimize-assets.mjs` создаёт WebP-копии в `public/assets`: hero сохраняет ширину 1536 px, остальные изображения уменьшаются до 800 px, качество WebP — 82. Оригиналы сохраняются. Размеры результатов записываются в `docs/asset-optimization.json`.

Изображение `24-hero` содержит полноценную предметную композицию с коробкой, биркой, визитками и голографическими элементами. Оно отличается от композиции на референсе. `10-surface-stickers` показывает наклейки на ноутбуке; это не фотография оформления витрин. Использование этих материалов не означает точного совпадения предметных фотографий с референсом. Сам референс не используется целиком как фон сайта.

Дополнительно встроенным `image_gen` созданы две предметные иллюстрации, визуально проверенные после генерации: `assets-generated/vinyl.png` (лаймовый рулон винила) и `assets-generated/windows.png` (витрина TAKTO с лаймовой графикой). Оптимизированные версии — `public/assets/vinyl.webp` и `public/assets/windows.webp`. Они тоже являются концептами, а не фотографиями реальных заказов.

Промпт vinyl: “Use case: product-mockup. Asset type: square category product photo for TAKTO creative print studio website. Primary request: photorealistic premium neon acid-lime vinyl film roll on a warm light grey seamless studio surface (#EAE5E1). A single thick vinyl roll lies horizontally on a diagonal with the open brown cardboard core facing camera toward lower left and long glossy lime cylinder extending toward upper right, small curl of film underneath. Tight editorial closeup, whole core visible, film fills most of frame with clean margin. Realistic satin highlights, detailed concentric layers at core edge, soft contact shadows, softbox lighting. Square 1:1 composition. No labels, lettering, logos, objects, people, border or watermark. Do not create UI; only the product photograph.”

Промпт windows: “Use case: product-mockup. Asset type: square category image for a premium creative print and branding studio website. Primary request: realistic exterior architectural photograph of a contemporary dark navy storefront with tall floor-to-ceiling glass panes and a central glass door, decorated with striking acid neon lime flowing wavy vinyl graphic decals across the lower glass area. Clean white TAKTO. wordmark on center glass with tiny lime final dot, exact text TAKTO. only, no other text. Realistic reflective slightly tinted glass, black metal mullions, subtle warm ceiling spotlights visible inside. Tight composition facing storefront at a modest angle, complete white wordmark visible in upper middle, lime waves occupying lower third. Premium European design studio aesthetic. Overcast soft daylight, high detail. Square 1:1 image, no people, cars, signs, borders or watermark. Do not create a webpage/UI; only the storefront photograph.”

## Архив GSAP

Предоставленный `gsap-public.zip` проверен непосредственно. Заголовки `esm/gsap-core.js`, `esm/ScrollTrigger.js` и `esm/SplitText.js` указывают версию **3.15.0**. Архив содержит ESM-, UMD-, minified- и исходные варианты, включая ScrollTrigger, SplitText, Flip, ScrollSmoother, MotionPathPlugin и CustomEase.

ESM `index.js` импортирует `gsap-core.js` и `CSSPlugin.js` и регистрирует CSSPlugin. ScrollTrigger импортирует `Observer.js`, поэтому ручное копирование одного файла ScrollTrigger нарушило бы зависимость. Для React/Vite выбраны пакетные импорты из единственной npm-копии `gsap@3.15.0` и интеграция через `@gsap/react`. Архив служит проверенным локальным справочником; одновременно подключать его скрипты и npm-пакет не требуется.

## Лицензия

В заголовках файлов сохранены указания на авторские права и [стандартную лицензию GSAP](https://gsap.com/community/standard-license/). Официальная страница разрешает использование GSAP и плагинов, включая SplitText, в коммерческих сайтах без лицензионной платы. Ограничения касаются конкурирующих визуальных конструкторов анимаций; нельзя удалять или изменять уведомления о правах. TAKTO использует библиотеку для анимации собственного интерфейса. Условия лицензии следует сохранять вместе с распространяемыми файлами библиотеки.
