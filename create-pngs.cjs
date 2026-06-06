const fs = require('fs');
const path = require('path');

const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const buffer = Buffer.from(base64Png, 'base64');

const basePath = path.join(__dirname, 'com.fernandor.ytstreammarker.sdPlugin', 'imgs', 'plugin');
if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });

fs.writeFileSync(path.join(basePath, 'category-icon.png'), buffer);
fs.writeFileSync(path.join(basePath, 'category-icon@2x.png'), buffer);
fs.writeFileSync(path.join(basePath, 'marketplace.png'), buffer);
fs.writeFileSync(path.join(basePath, 'marketplace@2x.png'), buffer);
