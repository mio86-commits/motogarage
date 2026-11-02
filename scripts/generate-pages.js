const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://motogarage-nsk.ru';
const TEMPLATE_PATH = path.join(__dirname, '..', 'product.html');
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_DIR = path.join(__dirname, '..');

const TYPES = ['moto', 'akrap'];

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

    // ЖЕСТКО БЕРЕМ ИМЯ ФАЙЛА КАК ID (без .json)
    const id = file.replace('.json', '');
    
    const title = item.title || 'Товар';
    const pageUrl = `${SITE_URL}/${type}/${id}.html`;
    
    // Просто подставляем ID в шаблон. Мета-теги подтянутся скриптом на странице
    let newHtml = template.replace(/<title>.*?<\/title>/, `<title>${title} — MotoGarage NSK</title>`);
    
    const outDir = path.join(OUTPUT_DIR, type);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const outPath = path.join(outDir, `${id}.html`);
    fs.writeFileSync(outPath, newHtml);
    console.log(`Сгенерирован: ${type}/${id}.html`);
  });
});
console.log('Готово!');
