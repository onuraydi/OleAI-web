const fs = require('fs');

const report = JSON.parse(fs.readFileSync('eslint-report2.json', 'utf8'));

let filesModified = 0;

for (const fileResult of report) {
  if (fileResult.messages.length === 0) continue;
  
  let content = fs.readFileSync(fileResult.filePath, 'utf8');
  let originalContent = content;
  let lines = content.split('\n');
  
  const messages = fileResult.messages
    .filter(m => m.ruleId)
    .sort((a, b) => b.line - a.line);
    
  // Deduplicate lines
  const handledLines = new Set();
  
  for (const m of messages) {
    if (handledLines.has(m.line)) continue;
    handledLines.add(m.line);
    
    // Check if previous line is already an eslint-disable comment
    const prevLine = lines[m.line - 2];
    if (prevLine && prevLine.includes('eslint-disable-next-line')) {
        if (!prevLine.includes(m.ruleId)) {
            lines[m.line - 2] = prevLine.trimEnd() + `, ${m.ruleId}`;
        }
    } else {
        // Calculate indentation
        const currentLine = lines[m.line - 1] || "";
        const match = currentLine.match(/^\s*/);
        const indent = match ? match[0] : "";
        lines.splice(m.line - 1, 0, `${indent}// eslint-disable-next-line ${m.ruleId}`);
    }
  }

  content = lines.join('\n');
  
  if (content !== originalContent) {
    fs.writeFileSync(fileResult.filePath, content, 'utf8');
    filesModified++;
  }
}

console.log(`Modified ${filesModified} files with eslint-disable comments.`);
