# Assets multimedia

Colocá aquí recursos estáticos servidos por Next.js desde `/assets/...`.

## Estructura

| Carpeta | Uso |
| --- | --- |
| `images/backgrounds/` | Fondos, texturas, patrones |
| `images/icons/` | Iconos SVG/PNG |
| `images/illustrations/` | Ilustraciones o mockups |
| `fonts/` | Tipografías locales (si no usás Google Fonts) |

## Uso en el código

```tsx
<img src="/assets/images/icons/logo.svg" alt="Logo" />
```

```css
background-image: url("/assets/images/backgrounds/texture.png");
```

## Convenciones

- Preferí **SVG** para iconos.
- Nombrá archivos en kebab-case: `hero-bg.webp`, `icon-user.svg`.
- No subas archivos enormes sin comprimir.
