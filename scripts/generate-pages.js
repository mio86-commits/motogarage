const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://motogarage-nsk.ru';
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_DIR = path.join(__dirname, '..');

const TYPES = ['moto', 'akrap'];

TYPES.forEach(type => {
  const typeDir = path.join(DATA_DIR, type);
  if (!fs.existsSync(typeDir)) return;

  const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.json'));
  
  files.forEach(file => {
    const rawData = fs.readFileSync(path.join(typeDir, file), 'utf8');
    let item;
    try { item = JSON.parse(rawData); } catch (e) { return; }

    // ID = имя файла без .json
    const id = file.replace('.json', '');
    const title = item.title || 'Товар';
    const description = item.desc || 'Оригинальный выхлоп Akrapovič и мотоциклы из Японии.';
    
    // Ищем первую картинку
    let imgPath = item.image || 'favicon.png';
    if (!imgPath.includes('/')) {
      // Если картинка в корне, просто добавляем её
      imgPath = imgPath;
    }
    // Убираем лишние слеши в начале
    imgPath = imgPath.replace(/^\//, '');
    const imageUrl = `${SITE_URL}/${imgPath}`;
    const pageUrl = `${SITE_URL}/${type}/${id}.html`;

    // Читаем наш шаблон (product.html)
    const templatePath = path.join(OUTPUT_DIR, 'product.html');
    if (!fs.existsSync(templatePath)) {
        console.error('Нет файла product.html!');
        return;
    }
    let newHtml = fs.readFileSync(templatePath, 'utf8');

    // ЖЕСТКО ПРОПИСЫВАЕМ SEO ТЕГИ В HTML
    newHtml = newHtml
      .replace(/<title>.*?<\/title>/, `<title>${title} — MotoGarage NSK</title>`)
      .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${description}">`)
      .replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${title} — MotoGarage NSK">`)
      .replace(/<meta property="og:description" content=".*?">/, `<meta property="og:description" content="${description}">`)
      .replace(/<meta property="og:image" content=".*?">/, `<meta property="og:image" content="${imageUrl}">`)
      .replace(/<meta property="og:url" content=".*?">/, `<meta property="og:url" content="${pageUrl}">`);

    // СОЗДАЕМ ФАЙЛ
    const outDir = path.join(OUTPUT_DIR, type);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, `${id}.html`), newHtml);
    console.log(`Сгенерирован: ${type}/${id}.html`);
  });
});
console.log('Все страницы сгенерированы!');
