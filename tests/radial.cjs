// Test de régression navigateur. Playwright est requis uniquement pour ce test.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],checks=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../labo-sru-bnf.html')).href);
  await page.locator('#value-0').fill('Victor Hugo');
  await page.locator('#execute').click();
  await page.waitForFunction(()=>state.result&&!state.controller,null,{timeout:65000});
  const title=await page.evaluate(()=>state.result.records[0].model.fields.find(f=>f.tag==='200').subfields.find(s=>s.code==='a').value);
  await page.locator('.card').first().getByRole('button',{name:'Exploser',exact:true}).click();
  await page.locator('.radial-options button').filter({hasText:/^2XX$/}).click();
  assert.ok((await page.locator('.radial-side').innerText()).includes(title));
  checks.push('Titre 200$a réel visible dès le bloc 2XX');
  await page.locator('.radial-options button').filter({hasText:/^200(?: × \d+)?$/}).click();
  assert.ok((await page.locator('.radial-side').innerText()).includes(title));
  assert.ok((await page.locator('.radial-side').innerText()).includes('200$a'));
  checks.push('Champ 200 : repère 200$a et valeur complète');
  await page.locator('.radial-options button').first().click();
  assert.ok((await page.locator('.radial-options').innerText()).includes(title.slice(0,40)));
  await page.locator('.radial-options button').filter({hasText:/^200\$a · /}).first().focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.radial-full-value').innerText(),title);
  checks.push('Aperçu du sous-champ et sélection clavier vers la valeur complète');
  const long='Valeur complète accentuée <script> & "guillemets" '.repeat(15);
  await page.evaluate(long=>{
   const model={leader:'',format:'UNIMARC',type:'bibliographic',fields:[{tag:'606',ind1:' ',ind2:'0',occurrence:1,subfields:[{code:'a',value:long},{code:'a',value:'Second $a'}]},{tag:'606',ind1:' ',ind2:' ',occurrence:2,subfields:[{code:'a',value:'Autre occurrence'}]}]};
   const rec={model,human:{title:'Fixture de test : répétitions'}};
   const hierarchy=buildRadialHierarchy(rec);state.radial=[0,0];
   renderNoticeExploder(rec,$('detail-content'));
   window.radialFixture=rec;
  },long);
  assert.equal(await page.locator('.radial-side dd').count(),3);
  assert.equal(await page.locator('.radial-side dd').first().textContent(),long);
  assert.equal(await page.locator('.radial-side script').count(),0);
  checks.push('Occurrences et sous-champs répétés : trois valeurs distinctes, texte long sans injection');
  for(const width of [390,768,1440]){
   await page.setViewportSize({width,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   assert.ok(await page.locator('#detail').evaluate(n=>n.scrollWidth<=n.clientWidth+1));
  }
  checks.push('Absence de débordement à 390, 768 et 1440 pixels');
  assert.deepEqual(errors,[]);checks.push('Aucune exception JavaScript');
  console.log(JSON.stringify({checks,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
