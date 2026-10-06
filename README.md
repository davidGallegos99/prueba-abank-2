# MarketWatch Lite

Dashboard de criptomonedas construido con Angular 22, TypeScript y Sass. Consulta los 50 principales activos por capitalización en CoinGecko y muestra precio en USD, símbolo y variación de las últimas 24 horas.

## Ejecutar localmente

Requisitos: Node.js 24.15 o superior dentro de la rama 24 (también compatible con Node 22.22.3 o Node 26), npm y conexión a Internet.

```bash
nvm install
nvm use
npm ci
npm start
```

Abrir `http://localhost:4200`. Si no utilizas nvm, instala una versión compatible de Node antes de ejecutar los comandos de npm.

```bash
npm run build        # Compilación de producción en dist/marketwatch-lite/browser
npm run lint         # ESLint para TypeScript y plantillas, incluidas reglas de accesibilidad
npm run lint:fix     # Correcciones automáticas de ESLint
npm run format      # Aplicar Prettier al proyecto
npm run format:check # Verificar formato
npm test            # Pruebas unitarias sin modo watch
npx playwright install chromium
npm run test:e2e    # Pruebas de interacción y diseño responsivo
```

VS Code incluye recomendaciones de extensiones y configuración para aplicar Prettier y correcciones de ESLint al guardar.

## Tecnologías y estructura

- Angular con componentes standalone y signals: estado reactivo sin una biblioteca adicional.
- HttpClient y RxJS: consultas HTTP tipadas con tiempo máximo de espera.
- Sass, Grid y Flexbox: diseño mobile-first sin dependencias de UI.
- Modal nativo `dialog`: navegación por teclado, cierre con Escape, foco contenido y regreso al control de apertura.
- `api/market-api.interface.ts` define el contrato `MarketApi` y su token de inyección. `MarketApiService` implementa exclusivamente las llamadas HTTP.
- `store/market.store.ts` administra estado de solo lectura, refresco automático, carga, errores, filtros, detalle y favoritos. Depende del contrato de API, no de su implementación.
- `models/` contiene contratos de datos; `utils/` mantiene filtrado y validación como funciones puras.
- `App` compone componentes y abre el modal. Resumen, filtros, lista y detalle tienen sus propias plantillas y estilos; intercambian datos mediante inputs/outputs.
- `Change` reutiliza la presentación de variaciones.
- Vitest y Playwright comprueban lógica, recuperación ante errores, persistencia y vistas de 375, 768 y 1440 píxeles.

## Configuración de entornos

`src/environments/environment.ts` contiene la URL base del API y los intervalos de refresco/espera de producción. `environment.development.ts` se selecciona mediante `fileReplacements` en la configuración de desarrollo.

```bash
npm start                              # environment.development.ts
npm run build                          # environment.ts (producción)
npm run build -- --configuration development
```

Para apuntar a otro servidor, modifica `apiBaseUrl` en el entorno correspondiente. Ambos entornos usan CoinGecko por defecto. La configuración del frontend es pública; no debe contener secretos.

## Funcionalidades

Búsqueda inmediata por nombre o símbolo; detalle con capitalización, volumen, máximo/mínimo y oferta circulante; skeleton inicial; actualización automática cada 60 segundos y actualización manual. Los datos se conservan ante un fallo posterior de la API, con advertencia y opción de reintento.

Bonus: orden ascendente/descendente por precio y variación, filtro por alza/baja y rango de precio, favoritos persistentes mediante localStorage y vista de solo favoritos. Si el navegador bloquea el almacenamiento, los favoritos siguen funcionando durante la sesión y se muestra un aviso.

## Consideraciones

La información se obtiene de [CoinGecko](https://docs.coingecko.com/reference/coins-markets), mediante su endpoint público `/api/v3/coins/markets`, sin claves incrustadas. No es una transmisión por WebSocket: la actualización ocurre mediante consultas periódicas. Se omiten consultas en pestañas ocultas y se actualiza al regresar. Una consulta tardía no se solapa con la siguiente.

El acceso público depende de disponibilidad, CORS y límites de CoinGecko. Los errores 429 se muestran explícitamente y se reintenta en el siguiente ciclo. No se presentan datos ficticios como cotizaciones reales. Las pruebas de navegador interceptan la API con datos deterministas para no consumir su cuota.

Los resúmenes representan únicamente los activos consultados, no el mercado completo. Valores no disponibles se presentan como `—`. Todos los precios están denominados en USD. Favoritos son locales al navegador y no se sincronizan entre dispositivos.

Compatibilidad de Node documentada en [Angular](https://angular.dev/reference/versions). El proyecto no incluye credenciales ni requiere un backend.
