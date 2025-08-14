import { createApp } from './app';
import { config } from './config';

const startServer = async () => {
  try {
    const app = createApp();

    const server = app.listen(config.app.port, () => {
      console.log(`🚀 SEPA VoP System running on port ${config.app.port}`);
      console.log(`📊 Environment: ${config.app.env}`);
      console.log(`🔧 API Version: ${config.app.apiVersion}`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
