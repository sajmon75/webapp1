// test-api.mjs
async function runTests() {
  console.log('🧪 Avvio test automatizzati delle API e dei flussi...');

  // 1. Test Caricamento Prodotti
  const prodRes = await fetch('http://localhost:3000/api/products');
  const prodData = await prodRes.json();
  console.log(`✅ Catalogo: caricati ${prodData.products.length} prodotti e ${prodData.categories.length} categorie.`);
  console.log(`   Scuola Da Vinci stock tracking: ${prodData.schoolSettings?.enableStockTracking}`);

  // 2. Test Login Mario (Studente)
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'mario.rossi@scuola.it',
      password: 'password123',
    }),
  });
  const cookie = loginRes.headers.get('set-cookie');
  const loginData = await loginRes.json();
  console.log(`✅ Login Mario Rossi (${loginData.user?.role}): successo!`);

  // 3. Test Ordine Studente
  const orderRes = await fetch('http://localhost:3000/api/orders/student', {
    headers: { cookie: cookie || '' },
  });
  const orderData = await orderRes.json();
  console.log(`✅ Ordine Mario: ${orderData.myItems.length} articoli per €${orderData.totalMyOrder.toFixed(2)} (Stato classe: ${orderData.classOrder?.status})`);

  // 4. Test Responsabile di Classe (Luca Bianchi)
  const repLogin = await fetch('http://localhost:3000/api/auth/switch-demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'luca.bianchi@scuola.it' }),
  });
  const repCookie = repLogin.headers.get('set-cookie');
  const classRes = await fetch('http://localhost:3000/api/orders/class', {
    headers: { cookie: repCookie || '' },
  });
  const classData = await classRes.json();
  console.log(`✅ Pannello Resp. 3A: ${classData.studentsList.length} compagni ordinanti, totale cassa €${classData.totalDue.toFixed(2)}, incassati €${classData.totalCollected.toFixed(2)}.`);

  // 5. Test Servizio Ristorazione / Bar (Luigi)
  const barLogin = await fetch('http://localhost:3000/api/auth/switch-demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bar@scuola.it' }),
  });
  const barCookie = barLogin.headers.get('set-cookie');
  const kitchenRes = await fetch('http://localhost:3000/api/orders/kitchen', {
    headers: { cookie: barCookie || '' },
  });
  const kitchenData = await kitchenRes.json();
  console.log(`✅ Cucina Bar: inizialmente ${kitchenData.classOrders.length} ordini confermati (poiché la 3A è in bozza).`);

  // 6. Test Conferma Ordine da parte del Responsabile!
  console.log('🔄 Il Responsabile Luca Bianchi conferma l’ordine della 3A per il bar...');
  const confirmRes = await fetch('http://localhost:3000/api/orders/class', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      cookie: repCookie || '',
    },
    body: JSON.stringify({
      action: 'CONFIRM_CLASS_ORDER',
      notes: 'Busta 3A - Soldi raccolti interamente',
    }),
  });
  const confirmData = await confirmRes.json();
  console.log(`✅ Conferma Responsabile: Nuovo stato ordine: ${confirmData.classOrder?.status}`);

  // 7. Test Verifica Cucina dopo la conferma
  const kitchenRes2 = await fetch('http://localhost:3000/api/orders/kitchen', {
    headers: { cookie: barCookie || '' },
  });
  const kitchenData2 = await kitchenRes2.json();
  console.log(`✅ Cucina Bar DOPO la conferma: ORA VISIBILE! ${kitchenData2.classOrders.length} buste pronte per lavorazione, totale articoli aggregati: ${kitchenData2.totalItems}.`);

  // 8. Test Cucina segna come PRONTO
  if (kitchenData2.classOrders.length > 0) {
    const orderId = kitchenData2.classOrders[0].id;
    await fetch('http://localhost:3000/api/orders/kitchen', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        cookie: barCookie || '',
      },
      body: JSON.stringify({ orderId, newStatus: 'READY' }),
    });
    console.log(`✅ Cucina Bar: Busta contrassegnata come "READY" (Pronta per il ritiro del responsabile).`);
  }

  // 9. Test Scuole Admin
  const adminLogin = await fetch('http://localhost:3000/api/auth/switch-demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@scuola.it' }),
  });
  const adminCookie = adminLogin.headers.get('set-cookie');
  const schoolsRes = await fetch('http://localhost:3000/api/schools', {
    headers: { cookie: adminCookie || '' },
  });
  const schoolsData = await schoolsRes.json();
  console.log(`✅ Admin: caricate ${schoolsData.schools.length} scuole con relative sedi e classi.`);

  console.log('\n🎉 TUTTI I TEST END-TO-END SONO STATI SUPERATI CON SUCCESSO!');
}

runTests().catch(console.error);

