import cron from 'node-cron';
import { env } from './env';

/**
 * Keep-alive cron job for Render free tier
 * Pings the application every 14 minutes to prevent it from spinning down
 */
export const initializeKeepAliveCron = (): void => {
  if (!env.RENDER_EXTERNAL_URL) {
    console.log('⚠️  RENDER_EXTERNAL_URL not set, skipping keep-alive cron job');
    return;
  }

  // Run every 14 minutes
  cron.schedule('*/14 * * * *', async () => {
    try {
      const healthUrl = `${env.RENDER_EXTERNAL_URL}/health`;
      const response = await fetch(healthUrl);
      
      if (response.ok) {
        console.log('✅ Keep-alive ping sent successfully');
      } else {
        console.warn(`⚠️  Keep-alive ping failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Keep-alive ping error:', error);
    }
  });

  console.log('✅ Keep-alive cron job initialized (every 14 minutes)');
};
