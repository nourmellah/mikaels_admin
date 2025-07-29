// services/scheduler.js
const cron = require('node-cron');
const costTemplateService = require('../services/costTemplateService');
const costService = require('../services/costService');
const { addDays, addWeeks, addMonths, addYears, parseISO } = require('date-fns');

function computeNextDate(lastDateStr, frequency) {
  const last = lastDateStr ? parseISO(lastDateStr) : new Date();
  switch (frequency) {
    case 'daily':   return addDays(last, 1);
    case 'weekly':  return addWeeks(last, 1);
    case 'monthly': return addMonths(last, 1);
    case 'yearly':  return addYears(last, 1);
    default:        throw new Error(`Unknown frequency ${frequency}`);
  }
}

// Every day at 00:05
cron.schedule('5 0 * * *', async () => {
  console.log('[cron] Generating costs from templates…');
  try {
    const templates = await costTemplateService.getAllTemplates();
    for (const tmpl of templates) {
      // 1. fetch last cost by dueDate desc
      const history = await costService.getCostsByTemplateId(tmpl.id);
      const last = history[0]?.dueDate; // e.g. '2025-07-24'
      const next = computeNextDate(last, tmpl.frequency);
      const today = new Date();
      if (next <= today) {
        await costService.createCost({
          costTemplateId: tmpl.id,
          name: tmpl.name,
          dueDate: next.toISOString().slice(0,10),
          amount: tmpl.amount,
          paid: false,
          notes: tmpl.notes ?? null,
          groupId: tmpl.groupId ?? null
        });
        console.log(`→ Created cost for template ${tmpl.name} on ${next}`);
      }
    }
    console.log('[cron] Done.');
  } catch (err) {
    console.error('[cron] Error generating costs:', err);
  }
});
