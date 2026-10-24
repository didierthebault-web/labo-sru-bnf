const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../labo-sru-bnf.html')).href);
  await page.locator('#value-0').fill('Victor Hugo');await page.locator('#execute').click();
  await page.waitForFunction(()=>state.result&&!state.controller,null,{timeout:65000});
  const history=await page.evaluate(()=>JSON.stringify(state.history));assert.notEqual(history,'[]');
  await page.locator('#to-expert').click();await page.locator('#editor').fill('bib.title all "Autre recherche"');
  await page.locator('#size').selectOption('50');await page.locator('#compact').click();
  await page.getByRole('link',{name:'Le Labo SRU',exact:true}).focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('#value-0').inputValue(),'');
  assert.equal(await page.locator('#editor').inputValue(),'');
  assert.equal(await page.locator('#guided-tab').getAttribute('aria-selected'),'true');
  assert.equal(await page.locator('#size').inputValue(),'20');
  assert.equal(await page.evaluate(()=>state.result),null);
  assert.equal(await page.evaluate(()=>JSON.stringify(state.history)),history);
  assert.equal(await page.locator('#history .history-item').count(),1);
  assert.equal(await page.locator('#result-list .card').count(),0);
  assert.ok(await page.locator('#value-0').evaluate(e=>document.activeElement===e));
  // Une réponse tardive ne doit pas repeupler les résultats après le retour à l’accueil.
  await page.route('https://catalogue.bnf.fr/api/SRU?**',async route=>{await new Promise(r=>setTimeout(r,400));try{await route.fulfill({status:200,contentType:'application/xml',body:'<searchRetrieveResponse><version>1.2</version><numberOfRecords>0</numberOfRecords></searchRetrieveResponse>'});}catch{}});
  await page.locator('#value-0').fill('En cours');await page.locator('#execute').click();
  await page.waitForFunction(()=>!!state.controller);
  await page.getByRole('link',{name:'Le Labo SRU',exact:true}).click();
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(()=>state.result),null);
  assert.equal(await page.evaluate(()=>JSON.stringify(state.history)),history);
  assert.equal(await page.locator('#status').innerText(),'');
  assert.deepEqual(errors,[]);
  console.log('PASS : retour accueil au clavier, champs et résultats effacés, paramètres réinitialisés, historique conservé, appel en cours annulé sans réponse tardive.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
