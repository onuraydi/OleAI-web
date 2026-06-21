const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let modifiedFiles = 0;

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.test.tsx') || filePath.endsWith('.test.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace typical mock type casts and parameters
    content = content.replace(/: unknown/g, ': any');
    content = content.replace(/as unknown/g, 'as any');
    content = content.replace(/<unknown>/g, '<any>');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      modifiedFiles++;
      console.log('Modified', filePath);
    }
  }
});

console.log('Done. Modified ' + modifiedFiles + ' files.');
