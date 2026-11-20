const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/defaultProducts.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace any lh3.googleusercontent.com/aida/ URLs with verified working Unsplash image
content = content.replace(/https:\/\/lh3\.googleusercontent\.com\/aida\/[^\s'",]+/g, 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Replaced all lingering lh3.googleusercontent.com/aida/ URLs in defaultProducts.js');
