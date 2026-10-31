const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const directory = path.resolve('public/products');
  const files = fs.readdirSync(directory).filter(file => file.endsWith('-packshot.png'));
  let originalBytes = 0, optimizedBytes = 0;
  for (const file of files) {
    const source = path.join(directory, file);
    const destination = source.replace(/\.png$/, '.webp');
    originalBytes += fs.statSync(source).size;
    await sharp(source).webp({ quality: 92, alphaQuality: 100, effort: 5 }).toFile(destination);
    optimizedBytes += fs.statSync(destination).size;
  }
  console.log(JSON.stringify({ files: files.length, originalBytes, optimizedBytes }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
