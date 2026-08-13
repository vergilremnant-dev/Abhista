import app from './api-lib/app.js';

const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`  Local Serverless API Gateway: http://127.0.0.1:${port}`);
  console.log(`======================================================\n`);
});
