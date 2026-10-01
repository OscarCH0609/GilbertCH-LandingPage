// Genera los derivados del kit de marca.
// Uso: npm run derivados
import sharp from "sharp";

// Imagen Open Graph de 1200 x 630 px derivada del hero (el texto queda centrado).
await sharp("src/assets/kit/hero.png")
  .resize({ height: 630 })
  .extract({ left: 156, top: 0, width: 1200, height: 630 })
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile("public/og-image.jpg");

// Monograma grande para el hero, recortado en cuadrado del monograma en alta resolución (1353 x 1162 px).
await sharp("src/assets/kit/monograma-alta.webp")
  .extract({ left: 147, top: 31, width: 1100, height: 1100 })
  .png()
  .toFile("src/assets/monograma-hero.png");

// Ícono para dispositivos Apple (180 px) a partir del favicon de 512 px.
await sharp("public/favicon-512.png").resize(180).png().toFile("public/apple-touch-icon.png");

console.log("Derivados generados.");
