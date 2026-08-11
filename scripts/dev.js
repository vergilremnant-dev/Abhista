import { spawn, execSync } from 'child_process';

console.log('=== STARTING DBC FULL STACK WORKSPACE ===\n');

try {
  console.log('Compiling API TypeScript...');
  execSync('npx tsc -p api/tsconfig.json', { stdio: 'inherit' });
} catch (e) {
  console.error('API TypeScript compilation failed, attempting to start server anyway...');
}

// 1. Spawn Serverless API Gateway
const apiProcess = spawn('node', ['api-dev-server.js'], {
  stdio: 'inherit',
  shell: true
});

// 2. Spawn Vite Dev Server
const viteProcess = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true
});

// Handle termination gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down dev servers...');
  apiProcess.kill();
  viteProcess.kill();
  process.exit();
});
