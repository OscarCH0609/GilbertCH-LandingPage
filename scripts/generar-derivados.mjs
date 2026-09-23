// Genera los derivados del kit de marca.
// Uso: npm run derivados
import sharp from "sharp";

// Imagen Open Graph de 1200 x 630 px derivada del hero (el texto queda centrado).
await sharp("src/assets/kit/hero.png")
  .resize({ height: 630 })
  .extract({ left: 156, top: 0, width: 1200, height: 630 })
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile("public/og-image.jpg");

// Monograma grande para el hero, recortado de la foto de perfil de 1080 px.
await sharp("src/assets/kit/perfil-1080.png")
  .extract({ left: 110, top: 120, width: 870, height: 870 })
  .toFile("src/assets/monograma-hero.png");

// Ícono para dispositivos Apple (180 px) a partir del favicon de 512 px.
await sharp("public/favicon-512.png").resize(180).png().toFile("public/apple-touch-icon.png");

console.log("Derivados generados.");
