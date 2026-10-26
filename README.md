# NF Digital — landing page

Landing responsive de NF Digital construida con Vanilla JavaScript, Three.js, GSAP y ScrollTrigger.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Ejecutar en local

```bash
npm install
npm run dev
```

Vite mostrará la URL local (normalmente http://localhost:5173). Para generar la versión de producción:

```bash
npm run build
npm run preview
```

## Estructura

```text
nf-digital/
├── index.html
├── package.json
└── src/
    ├── main.js     # escena Three.js, scroll GSAP y formulario
    └── style.css   # estilos, layout y responsive
```

La animación principal utiliza un timeline GSAP con `ScrollTrigger` y `scrub`, de modo que el objeto 3D cambia de posición, escala y color según el avance por la página. En móviles se ajusta el zoom de cámara y el pixel ratio. El formulario es una demo estática: prepara un correo mediante `mailto:` a `hola@nfdigital.studio` (cambia esa dirección por la real antes de publicar).
