const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://motogarage-nsk.ru';
const TEMPLATE_PATH = path.join(__dirname, '..', 'product.html');
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_DIR = path.join(__dirname, '..');

// Какие типы товаров обрабатываем
const TYPES = ['moto', 'akrap'];

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function cleanDescription(item) {
  let desc = item.desc || '';
  const rawText = item.docs || item.body || '';
  if (!desc && rawText) {
    desc = rawText
      .replace(/<[^>]*>?/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\n/g, ' ')
      .substring(0, 160) + '...';
  }
  return desc || 'Оригинальный выхлоп Akrapovič и мотоциклы из Японии в Новосибирске.';
}

if (!fs.existsSync(TEMPLATE_PATH)) {
  console.error('Шаблон product.html не найден!');
  process.exit(1);
}

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

TYPES.forEach(type => {
  const typeDir = path.join(DATA_DIR, type);
  if (!fs.existsSync(typeDir)) return;

  const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.json'));
  
  files.forEach(file => {
    const rawData = fs.readFileSync(path.join(typeDir, file), 'utf8');
    let item;
    try { item = JSON.parse(rawData); } catch (e) { return; }

     const id = file.replace('.json', '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const title = item.title || 'Товар';
    const description = cleanDescription(item);
    
    // Формируем абсолютный URL картинки
    let imageUrl = `${SITE_URL}/favicon.png`;
    if (item.image) {
      imageUrl = `${SITE_URL}/${item.image.replace(/^\//, '')}`;
    }

    // Формируем URL страницы
    const pageUrl = `${SITE_URL}/${type}/${id}.html`;

    // Заменяем базовые теги в шаблоне на конкретные для этого товара
    let newHtml = template
      .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)} — MotoGarage NSK</title>`)
      .replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escapeHtml(description)}">`)
      .replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${escapeHtml(title)} — MotoGarage NSK">`)
      .replace(/<meta property="og:description" content=".*?">/, `<meta property="og:description" content="${escapeHtml(description)}">`)
      .replace(/<meta property="og:image" content=".*?">/, `<meta property="og:image" content="${imageUrl}">`)
      .replace(/<meta property="og:url" content=".*?">/, `<meta property="og:url" content="${pageUrl}">`);
    
    // Если в шаблоне есть <link rel="canonical">, обновляем и его (если нет - добавим)
    if (newHtml.includes('<link rel="canonical"')) {
        newHtml = newHtml.replace(/<link rel="canonical" href=".*?">/, `<link rel="canonical" href="${pageUrl}">`);
    } else {
        newHtml = newHtml.replace('</head>', `  <link rel="canonical" href="${pageUrl}">\n</head>`);
    }

    // Создаем папку для типа (moto или akrap), если её нет
    const outDir = path.join(OUTPUT_DIR, type);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Записываем файл
    const outPath = path.join(outDir, `${id}.html`);
    fs.writeFileSync(outPath, newHtml);
    console.log(`Сгенерирован: ${type}/${id}.html`);
  });
});

console.log('Готово!');
