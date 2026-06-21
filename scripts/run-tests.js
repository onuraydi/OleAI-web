import { startVitest } from 'vitest/node';

async function run() {
  const vitest = await startVitest('test', [], {
    coverage: { enabled: true }
  });
  
  if (vitest) {
    await vitest.close();
  }
  
  process.exit(process.exitCode || 0);
}

run();
