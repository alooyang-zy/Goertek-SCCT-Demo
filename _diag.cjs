const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push('PAGEERROR: ' + err.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text()); });

  await page.goto('http://114.132.63.242/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.evaluate(() => switchPage('cost'));
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => ({
    sCards: document.querySelectorAll('.v56-s4-card').length,
    treeRoot: document.querySelector('.v56-db-l1 .v56-db-node'),
    dCards: document.querySelectorAll('.v56-dmg-card').length,
    kpiGrid: document.getElementById('v56-sKpiGrid')?.innerHTML?.substring(0,80),
    costTree: document.getElementById('v56-costTree')?.innerHTML?.substring(0,80),
    dMatrix: document.getElementById('v56-dMatrix')?.innerHTML?.substring(0,80)
  }));

  console.log(JSON.stringify(info, null, 2));
  if (errors.length) console.log('\nERRORS:\n' + errors.join('\n'));
  else console.log('\nNo errors');

  await browser.close();
})();
