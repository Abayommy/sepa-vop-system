// src/index.ts
import createApp from './app';
import config from './config';

function startServer() {
  const app = createApp();

  // Prefer PORT from env (Render/Heroku/etc.), fall back to config, then 3000
  const port = Number(process.env.PORT ?? config.app.port ?? 3000);

  const server = app.listen(port, () => {
    console.log(`🚀 SEPA VoP System running on port ${port}`);
    console.log(`📊 Environment: ${config.app.env}`);
    console.log(`🔧 API Version: ${config.app.version}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} signal received: closing HTTP server`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer();
