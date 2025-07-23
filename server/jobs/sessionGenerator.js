// Runs every 30 minutes to generate sessions for past lessons that lack them

const cron = require('node-cron');
const svc = require('../services/groupSessionService');
const { startOfWeek } = require('date-fns');

// Schedule: every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  try {
    const now = new Date();
    // Compute Monday of current week (weekStartsOn = 1)
    const weekStartDate = startOfWeek(now, { weekStartsOn: 1 });
    const isoWeekStart = weekStartDate.toISOString().split('T')[0];

    const created = await svc.generateSessionsForWeek(isoWeekStart);
    if (created.length > 0) {
      console.log(`[SessionGenerator] Created ${created.length} sessions for week ${isoWeekStart}`);
    }
  } catch (err) {
    console.error('[SessionGenerator] Error generating weekly sessions:', err);
  }
});

console.log('[SessionGenerator] Job scheduled: runs every 30 minutes');
