# Puesta en marcha para el demo (para el equipo)

Esto es lo que hay que hacer en un portátil nuevo para presentar. Son seis pasos y todos los comandos se copian tal cual. Si algo falla, abajo hay una lista de problemas.

## Antes de empezar

Pide a tu compañero:

1. El enlace del repositorio: `https://github.com/carlosrodriguezperez/study-vibes`
2. Las dos claves: `OPENROUTER_API_KEY` y `GEMINI_API_KEY`

Y comprueba que tienes **Node.js 20 o superior**:

```bash
node -v
```

Si sale un número menor que 20, o “command not found”, instala la versión LTS desde <https://nodejs.org> y vuelve a comprobarlo.

---

## Paso 1 — Descargar el proyecto

```bash
git clone https://github.com/carlosrodriguezperez/study-vibes.git
cd study-vibes
```

Tarda un poco: el repositorio pesa unos 47 MB por los PDFs de ejemplo.

---

## Paso 2 — Poner las claves

```bash
cp .env.example .env
```

Abre el archivo `.env` con un editor y pega las dos claves:

```
OPENROUTER_API_KEY=<la clave que te ha dado tu compañero>
GEMINI_API_KEY=<la otra clave>
```

Importante: `.env` va en la carpeta `study-vibes`, **no** dentro de `web`. Y no lo subas a Git.

---

## Paso 3 — Instalar

```bash
cd web
npm install
```

Espera a que termine. Tarda un par de minutos y no imprime nada espectacular; es normal.

---

## Paso 4 — Arrancar la app

```bash
npm run dev
```

Espera a ver `Ready`. **Deja esta terminal abierta** durante todo el demo; si la cierras, la web deja de funcionar.

Abre en el navegador: <http://localhost:3000>

---

## Paso 5 — Conseguir el audio del demo

El texto sí viene en el repositorio, pero el audio no (no se sube media generada). Elige una opción:

**Opción A — copiar el audio ya hecho (recomendada, no gasta cuota).**

Copia esta carpeta desde el portátil de tu compañero, a la misma ruta:

```
web/.data/episodes/demo-sets-0001/
```

Debe contener `episode.json` y un archivo `.wav`.

**Opción B — generarlo tú (tarda ~1 minuto y gasta una petición de voz).**

En una segunda terminal:

```bash
cd study-vibes/web
npm run demo:prepare
```

Cuando termine dirá `ready — 1/1 segments` y `demo ready`.

---

## Paso 6 — Comprobar que todo está bien

En una segunda terminal:

```bash
cd study-vibes/web
npm run doctor
```

Todo debe salir con `ok`, y al final: `Everything checks out`.

Después abre <http://localhost:3000/episode/demo-sets-0001> y pulsa **Play**: deben sonar **1:17** seguidos.

---

## Durante el demo

- No cierres la terminal de `npm run dev`.
- Pon el navegador a pantalla completa (F11) y silencia notificaciones.
- Usa el botón **Try the demo episode**, no la subida de PDF. La subida es el extra, no el plato principal.
- Si algo se rompe en directo, vuelve a la página del demo y dale a Play. Ese audio está en tu disco y no depende de internet.

## Chuleta de 2 minutos

1. Abre la página principal.
2. Pulsa **Try the demo episode**.
3. Dale a Play y deja sonar el gancho.
4. Cambia de pestaña, escribe algo, vuelve: el audio sigue y retoma donde estaba.
5. Al terminar, responde una pregunta del check.
6. Cierra con: “tus apuntes, convertidos en un episodio que quieres terminar”.

---

## Si algo va mal

| Problema | Qué hacer |
|---|---|
| Hay transcripción pero no suena | Falta el audio. Vuelve al paso 5. |
| `OPENROUTER_API_KEY is missing` | El `.env` no está en la carpeta `study-vibes`, o arrancaste el servidor antes de crearlo. Corrige la ruta y reinicia `npm run dev`. |
| El puerto 3000 está ocupado | `npm run dev -- -p 3001` y abre `http://localhost:3001`. |
| Error `429` al generar audio | Cuota de voz agotada. Usa la opción A del paso 5. |
| Sigue sonando la versión antigua | Recarga con `Ctrl+Shift+R`. |
| La página se ve sin estilos | Borra `web/node_modules` y `web/.next`, y repite `npm install`. |
| `npm install` falla | Comprueba que estás dentro de `web` y que tienes internet. |

## Antes de salir al escenario

- [ ] `npm run doctor` sin errores
- [ ] El demo suena a 1:17 sin cortes
- [ ] Volumen del portátil comprobado
- [ ] Navegador a pantalla completa
- [ ] Terminal de `npm run dev` abierta
- [ ] Una pestaña con el episodio ya cargado, por si acaso
