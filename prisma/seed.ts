// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Avvio popolamento database (Seed)...');

  // Pulizia iniziale
  await prisma.orderItem.deleteMany();
  await prisma.classDailyOrder.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.school.deleteMany();

  const defaultPassword = await bcrypt.hash('password123', 10);

  // 1. Creazione Scuole
  const daVinci = await prisma.school.create({
    data: {
      name: 'Liceo Scientifico Leonardo da Vinci',
      code: 'LICEO-DAVINCI',
      address: 'Via Roma 12, Milano',
      enableStockTracking: true, // Scuola con gestione scorte attiva!
      orderCutoffTime: '09:30',
    },
  });

  const marconi = await prisma.school.create({
    data: {
      name: 'Istituto Tecnico Industriale Marconi',
      code: 'ITIS-MARCONI',
      address: 'Viale Europa 80, Milano',
      enableStockTracking: false, // Scuola senza gestione scorte
      orderCutoffTime: '09:45',
    },
  });

  // 2. Creazione Sedi (Branches)
  const daVinciCentrale = await prisma.branch.create({
    data: {
      schoolId: daVinci.id,
      name: 'Sede Centrale',
      address: 'Via Roma 12 (Edificio Storico)',
    },
  });

  const daVinciSuccursale = await prisma.branch.create({
    data: {
      schoolId: daVinci.id,
      name: 'Succursale Ovest',
      address: 'Via Garibaldi 45 (Palazzina B)',
    },
  });

  const marconiCentrale = await prisma.branch.create({
    data: {
      schoolId: marconi.id,
      name: 'Campus Principale',
      address: 'Viale Europa 80',
    },
  });

  // 3. Creazione Classi
  const classe3A = await prisma.classroom.create({
    data: {
      schoolId: daVinci.id,
      branchId: daVinciCentrale.id,
      name: '3A',
      section: 'Scientifico Tradizionale',
      floor: '2° Piano - Aula 204',
      academicYear: '2025/2026',
    },
  });

  const classe4B = await prisma.classroom.create({
    data: {
      schoolId: daVinci.id,
      branchId: daVinciCentrale.id,
      name: '4B',
      section: 'Scienze Applicate',
      floor: '1° Piano - Aula 112',
      academicYear: '2025/2026',
    },
  });

  const classe5A_Succ = await prisma.classroom.create({
    data: {
      schoolId: daVinci.id,
      branchId: daVinciSuccursale.id,
      name: '5A',
      section: 'Linguistico',
      floor: 'Terra - Aula 12',
      academicYear: '2025/2026',
    },
  });

  const classe3INFO = await prisma.classroom.create({
    data: {
      schoolId: marconi.id,
      branchId: marconiCentrale.id,
      name: '3INFO-A',
      section: 'Informatica e Telecomunicazioni',
      floor: 'Laboratori - Ala Est',
      academicYear: '2025/2026',
    },
  });

  // 4. Creazione Categorie
  const catPanini = await prisma.category.create({
    data: { name: 'Panini Caldi', icon: 'Sandwich', sortOrder: 1 },
  });
  const catFocacce = await prisma.category.create({
    data: { name: 'Focacce & Piadine', icon: 'Flame', sortOrder: 2 },
  });
  const catGlutenFree = await prisma.category.create({
    data: { name: 'Gluten Free & Veg', icon: 'Salad', sortOrder: 3 },
  });
  const catSnack = await prisma.category.create({
    data: { name: 'Snack & Dolci', icon: 'Cookie', sortOrder: 4 },
  });
  const catBibite = await prisma.category.create({
    data: { name: 'Bevande', icon: 'CupSoda', sortOrder: 5 },
  });

  // 5. Creazione Prodotti (Listino)
  const prodCotto = await prisma.product.create({
    data: {
      categoryId: catPanini.id,
      name: 'Panino Cotto & Fontina',
      description: 'Prosciutto cotto artigianale, fontina DOP fusa, pane ciabattina croccante',
      price: 2.80,
      imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=60',
      isAvailable: true,
      stockQuantity: 40, // per Da Vinci con stock attivo
      allergens: 'Glutine, Lattosio',
      isVegetarian: false,
      isGlutenFree: false,
    },
  });

  const prodSalame = await prisma.product.create({
    data: {
      categoryId: catPanini.id,
      name: 'Panino Salame Nostrano',
      description: 'Salame nostrano dolce, maionese leggera, pane tartaruga',
      price: 2.70,
      imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=500&auto=format&fit=crop&q=60',
      isAvailable: true,
      stockQuantity: 25,
      allergens: 'Glutine, Uova',
      isVegetarian: false,
      isGlutenFree: false,
    },
  });

  const prodFocacciaCrudo = await prisma.product.create({
    data: {
      categoryId: catFocacce.id,
      name: 'Focaccia Crudo & Stracchino',
      description: 'Focaccia genovese all’olio extravergine con prosciutto crudo di Parma e stracchino fresco',
      price: 3.20,
      imageUrl: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=500&auto=format&fit=crop&q=60',
      isAvailable: true,
      stockQuantity: 15,
      allergens: 'Glutine, Lattosio',
      isVegetarian: false,
      isGlutenFree: false,
    },
  });

  const prodPiadinaVeg = await prisma.product.create({
    data: {
      categoryId: catFocacce.id,
      name: 'Piadina Rucola, Squacquerone & Pomodorini',
      description: 'Piadina romagnola calda, formaggio squacquerone fresco, rucola selvatica e pomodorini',
      price: 3.50,
      imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=60',
      isAvailable: true,
      stockQuantity: 10,
      allergens: 'Glutine, Lattosio',
      isVegetarian: true,
      isGlutenFree: false,
    },
  });

  const prodCeliaco = await prisma.product.create({
    data: {
      categoryId: catGlutenFree.id,
      name: 'Panino Senza Glutine Cotto & Provola',
      description: 'Preparato in laboratorio protetto certificato AIC, confezionato singolarmente sigillato',
      price: 3.80,
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60',
      isAvailable: true,
      stockQuantity: 8,
      allergens: 'Lattosio (Certificato Senza Glutine)',
      isVegetarian: false,
      isGlutenFree: true,
    },
  });

  const prodPizzetta = await prisma.product.create({
    data: {
      categoryId: catFocacce.id,
      name: 'Pizzetta Margherita Calda',
      description: 'Pomodoro italiano 100%, fior di latte filante, origano profumato',
      price: 2.20,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60',
      isAvailable: true,
      stockQuantity: 30,
      allergens: 'Glutine, Lattosio',
      isVegetarian: true,
      isGlutenFree: false,
    },
  });

  const prodMuffin = await prisma.product.create({
    data: {
      categoryId: catSnack.id,
      name: 'Muffin Cuore di Cioccolato',
      description: 'Muffin soffice con gocce di cioccolato fondente e cuore morbido',
      price: 1.80,
      imageUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500&auto=format&fit=crop&q=60',
      isAvailable: true,
      stockQuantity: 20,
      allergens: 'Glutine, Lattosio, Uova, Soia',
      isVegetarian: true,
      isGlutenFree: false,
    },
  });

  const prodAcqua = await prisma.product.create({
    data: {
      categoryId: catBibite.id,
      name: 'Acqua Naturale 500ml',
      description: 'Bottiglietta 100% plastica riciclata rPET',
      price: 1.00,
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=60',
      isAvailable: true,
      stockQuantity: 100,
      allergens: 'Nessuno',
      isVegetarian: true,
      isGlutenFree: true,
    },
  });

  const prodSuccoACE = await prisma.product.create({
    data: {
      categoryId: catBibite.id,
      name: 'Succo di Frutta ACE 200ml',
      description: 'Arancia, Carota e Limone con vitamine A, C, E',
      price: 1.50,
      imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&auto=format&fit=crop&q=60',
      isAvailable: true,
      stockQuantity: 35,
      allergens: 'Nessuno',
      isVegetarian: true,
      isGlutenFree: true,
    },
  });

  const prodCola = await prisma.product.create({
    data: {
      categoryId: catBibite.id,
      name: 'Bibita Zero Lattina 330ml',
      description: 'Senza zuccheri e senza calorie, servita fresca',
      price: 1.80,
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60',
      isAvailable: false, // Esempio di prodotto non disponibile / esaurito
      stockQuantity: 0,
      allergens: 'Nessuno',
      isVegetarian: true,
      isGlutenFree: true,
    },
  });

  // 6. Creazione Utenti di Esempio
  // Studente standard 3A
  const mario = await prisma.user.create({
    data: {
      name: 'Mario Rossi',
      email: 'mario.rossi@scuola.it',
      passwordHash: defaultPassword,
      role: 'STUDENT',
      schoolId: daVinci.id,
      branchId: daVinciCentrale.id,
      classroomId: classe3A.id,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Altra studentessa 3A
  const giulia = await prisma.user.create({
    data: {
      name: 'Giulia Verdi',
      email: 'giulia.verdi@scuola.it',
      passwordHash: defaultPassword,
      role: 'STUDENT',
      schoolId: daVinci.id,
      branchId: daVinciCentrale.id,
      classroomId: classe3A.id,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Responsabile di Classe 3A
  const luca = await prisma.user.create({
    data: {
      name: 'Luca Bianchi (Resp. 3A)',
      email: 'luca.bianchi@scuola.it',
      passwordHash: defaultPassword,
      role: 'CLASS_REP',
      schoolId: daVinci.id,
      branchId: daVinciCentrale.id,
      classroomId: classe3A.id,
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Responsabile 5A Succursale
  const matteo = await prisma.user.create({
    data: {
      name: 'Matteo Colombo (Resp. 5A Succursale)',
      email: 'matteo.colombo@scuola.it',
      passwordHash: defaultPassword,
      role: 'CLASS_REP',
      schoolId: daVinci.id,
      branchId: daVinciSuccursale.id,
      classroomId: classe5A_Succ.id,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Personale Servizio Ristorazione / Bar
  const barStaff = await prisma.user.create({
    data: {
      name: 'Luigi Esposito (Bar & Ristorazione)',
      email: 'bar@scuola.it',
      passwordHash: defaultPassword,
      role: 'CATERING',
      schoolId: daVinci.id,
      branchId: daVinciCentrale.id,
      avatarUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=150&auto=format&fit=crop&q=80',
    },
  });

  // Amministratore Scolastico
  const admin = await prisma.user.create({
    data: {
      name: 'Prof.ssa Anna Ferrari (Admin)',
      email: 'admin@scuola.it',
      passwordHash: defaultPassword,
      role: 'ADMIN',
      schoolId: daVinci.id,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 7. Creazione Ordine Simulato di Esempio per Oggi (Classe 3A)
  const todayStr = new Date().toISOString().split('T')[0];

  const order3A = await prisma.classDailyOrder.create({
    data: {
      classroomId: classe3A.id,
      date: todayStr,
      status: 'DRAFT', // Inizialmente in bozza, in attesa di conferma del responsabile Luca
      totalAmount: 7.00,
      notes: 'Busta 3A - Consegna Piano 2',
    },
  });

  // Articolo per Mario (Panino cotto e acqua)
  await prisma.orderItem.create({
    data: {
      orderBatchId: order3A.id,
      studentId: mario.id,
      productId: prodCotto.id,
      quantity: 1,
      unitPrice: prodCotto.price,
      customization: 'Senza formaggio, ben riscaldato',
      isPaid: false,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderBatchId: order3A.id,
      studentId: mario.id,
      productId: prodAcqua.id,
      quantity: 1,
      unitPrice: prodAcqua.price,
      customization: '',
      isPaid: false,
    },
  });

  // Articolo per Giulia (Piadina e Muffin)
  await prisma.orderItem.create({
    data: {
      orderBatchId: order3A.id,
      studentId: giulia.id,
      productId: prodPiadinaVeg.id,
      quantity: 1,
      unitPrice: prodPiadinaVeg.price,
      customization: 'Tagliata a metà',
      isPaid: true, // Giulia ha già dato i soldi al responsabile!
    },
  });

  console.log('✅ Popolamento completato con successo!');
  console.log('🔑 Credenziali di test create (Password: "password123"):');
  console.log('   - Studente 3A:        mario.rossi@scuola.it');
  console.log('   - Resp. Classe 3A:    luca.bianchi@scuola.it');
  console.log('   - Resp. 5A Succ.:     matteo.colombo@scuola.it');
  console.log('   - Bar / Ristorazione: bar@scuola.it');
  console.log('   - Amministratore:     admin@scuola.it');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

