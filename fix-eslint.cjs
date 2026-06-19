const fs = require('fs');
const { execSync } = require('child_process');

console.log("Generating eslint report...");
try {
  execSync('npx eslint src --ext ts,tsx --format json -o eslint-report.json', { stdio: 'ignore' });
} catch (e) {
  // eslint exits with 1 if there are errors, which is expected
}

const report = JSON.parse(fs.readFileSync('eslint-report.json', 'utf8'));

let filesModified = 0;

for (const fileResult of report) {
  if (fileResult.messages.length === 0) continue;
  
  let content = fs.readFileSync(fileResult.filePath, 'utf8');
  let originalContent = content;

  // Fix (LucideIcons as any)
  content = content.replace(/\(LucideIcons as any\)/g, "(LucideIcons as Record<string, React.FC<unknown>>)");

  // Replace any in queries (e.g. data: any) with data: unknown
  content = content.replace(/data: any/g, "data: unknown");
  content = content.replace(/error: any/g, "error: unknown");
  content = content.replace(/err: any/g, "err: unknown");
  content = content.replace(/Promise<any>/g, "Promise<unknown>");
  content = content.replace(/Record<string, any>/g, "Record<string, unknown>");
  content = content.replace(/<any, any>/g, "<unknown, unknown>");
  content = content.replace(/<any>/g, "<unknown>");
  content = content.replace(/: any\)/g, ": unknown)");
  content = content.replace(/: any,/g, ": unknown,");
  content = content.replace(/: any;/g, ": unknown;");
  content = content.replace(/: any =/g, ": unknown =");
  content = content.replace(/as any/g, "as unknown");

  // Fix unused vars like 'err' -> '_err'
  content = content.replace(/catch \(err\)/g, "catch (_err)");
  content = content.replace(/catch \(error\)/g, "catch (_error)");
  content = content.replace(/catch \(e\)/g, "catch (_e)");
  
  // Quick fix for '_' is defined but never used
  content = content.replace(/\(_, /g, "(_unused, ");
  
  if (content !== originalContent) {
    fs.writeFileSync(fileResult.filePath, content, 'utf8');
    filesModified++;
  }
}

console.log(`Modified ${filesModified} files with regex bulk-replace.`);
