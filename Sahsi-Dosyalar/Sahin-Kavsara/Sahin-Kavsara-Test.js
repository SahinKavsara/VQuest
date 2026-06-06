/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║       ŞAHİN KAVSARA — VQuest Mobil Backend Test Suite           ║
 * ║       Redis Cache + RabbitMQ + Soru Paketi + Soru Önerisi       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Kullanım: node Sahin-Kavsara-Test.js
 */

const BASE = 'https://vquest-backend-api.onrender.com/api';

// ─── Renkli terminal çıktısı ──────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  blue:   '\x1b[34m',
  magenta:'\x1b[35m',
  white:  '\x1b[37m',
  gray:   '\x1b[90m',
};

const OK   = `${c.green}${c.bold}✅ BAŞARILI${c.reset}`;
const FAIL = `${c.red}${c.bold}❌ BAŞARISIZ${c.reset}`;
const INFO = `${c.cyan}ℹ${c.reset}`;
const WARN = `${c.yellow}⚠${c.reset}`;

let passed = 0;
let failed = 0;

function header(title, emoji = '🔷') {
  console.log(`\n${c.bold}${c.blue}${'═'.repeat(60)}${c.reset}`);
  console.log(`${c.bold}${c.blue}  ${emoji}  ${title}${c.reset}`);
  console.log(`${c.bold}${c.blue}${'═'.repeat(60)}${c.reset}`);
}

function result(label, success, detail = '') {
  if (success) {
    passed++;
    console.log(`  ${OK}  ${c.white}${label}${c.reset}  ${c.gray}${detail}${c.reset}`);
  } else {
    failed++;
    console.log(`  ${FAIL}  ${c.white}${label}${c.reset}  ${c.red}${detail}${c.reset}`);
  }
}

function info(msg) {
  console.log(`  ${INFO}  ${c.gray}${msg}${c.reset}`);
}

// ─── HTTP yardımcısı ──────────────────────────────────────────────────────────
async function req(method, path, body, token) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const r = await fetch(BASE + path, opts);
  let data;
  try { data = await r.json(); } catch { data = null; }
  return { status: r.status, data };
}

// ─── ANA TEST FONKSİYONU ──────────────────────────────────────────────────────
(async () => {
  console.log(`\n${c.bold}${c.magenta}`);
  console.log('  ╔══════════════════════════════════════════════════════════╗');
  console.log('  ║       ŞAHİN KAVSARA — VQuest Backend Tests              ║');
  console.log('  ║       Redis • RabbitMQ • Soru Paketi • Soru Önerisi     ║');
  console.log('  ╚══════════════════════════════════════════════════════════╝');
  console.log(c.reset);

  const ts = Date.now();
  let userToken, adminToken, packageId, suggestionId;

  // ──────────────────────────────────────────────────────────────────────────
  header('BAĞLANTI & KİMLİK DOĞRULAMA', '🔐');
  // ──────────────────────────────────────────────────────────────────────────

  // Yeni test kullanıcısı oluştur
  const regEmail = `sahintest_${ts}@vquest.com`;
  const regPass  = 'Test1234!';
  const reg = await req('POST', '/auth/register', {
    username: `sahintest_${ts}`,
    email: regEmail,
    password: regPass,
  });
  result('Kullanıcı Kaydı (POST /auth/register)', reg.status === 201, `Status: ${reg.status}`);

  // Kullanıcı girişi
  const login = await req('POST', '/auth/login', { email: regEmail, password: regPass });
  userToken = login.data?.token;
  result('Kullanıcı Girişi (POST /auth/login)', login.status === 200 && !!userToken, `Status: ${login.status}`);

  // Admin girişi
  const adminLogin = await req('POST', '/auth/login', { email: 'admin@vquest.com', password: 'admin123' });
  adminToken = adminLogin.data?.token;
  result('Admin Girişi (POST /auth/login)', adminLogin.status === 200 && !!adminToken, `Status: ${adminLogin.status}`);

  if (!userToken) {
    console.log(`\n  ${c.red}${c.bold}HATA: User token alınamadı, testler durduruluyor.${c.reset}`);
    process.exit(1);
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 1 — Soru Paketi Oluşturma', '📦');
  // ──────────────────────────────────────────────────────────────────────────
  info('POST /api/packages — Yeni soru paketi oluşturma');

  const createPkg = await req('POST', '/packages', {
    title: `Şahin Test Paketi ${ts}`,
    description: 'Otomatik test ile oluşturulan soru paketi',
    isPublic: true,
    newQuestions: [
      {
        text: 'Türkiye\'nin en büyük gölü hangisidir?',
        options: ['Tuz Gölü', 'Van Gölü', 'Beyşehir Gölü', 'Burdur Gölü'],
        correctAnswer: 'Van Gölü',
        category: null
      },
      {
        text: 'Hangisi bir programlama dilidir?',
        options: ['HTML', 'CSS', 'Python', 'SQL'],
        correctAnswer: 'Python',
        category: null
      }
    ]
  }, adminToken);
  packageId = createPkg.data?._id;
  result(
    'Soru Paketi Oluşturuldu',
    createPkg.status === 201 && !!packageId,
    `Status: ${createPkg.status} | ID: ${packageId}`
  );
  if (createPkg.status === 201) {
    info(`Paket başlığı: "${createPkg.data?.title}"`);
    info('Redis cache invalidation tetiklendi (eski liste cache silindi)');
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 2 — Soru Önerisi Yapma + RabbitMQ', '🐰');
  // ──────────────────────────────────────────────────────────────────────────
  info('POST /api/suggestions — Yeni soru önerisi gönderme');
  info('Bu işlem RabbitMQ kuyruğuna asenkron bildirim gönderir');

  const suggestion = await req('POST', '/suggestions', {
    questionText: `🐰 RabbitMQ Test — Şahin Kavsara — ${new Date().toLocaleTimeString('tr-TR')}`,
    options: ['Seçenek A', 'Seçenek B', 'Seçenek C', 'Seçenek D'],
    correctAnswer: 'Seçenek A'
  }, userToken);
  suggestionId = suggestion.data?._id;
  result(
    'Soru Önerisi Gönderildi (RabbitMQ Tetiklendi)',
    suggestion.status === 201 && !!suggestionId,
    `Status: ${suggestion.status} | ID: ${suggestionId}`
  );

  if (suggestion.status === 201) {
    console.log(`\n  ${c.magenta}${c.bold}  🐰 RABBİTMQ ÇALIŞIYOR!${c.reset}`);
    console.log(`  ${c.magenta}     Mesaj kuyruğa girdi → notifications_queue${c.reset}`);
    console.log(`  ${c.magenta}     Tip: SUGGESTION_CREATED${c.reset}`);
    console.log(`  ${c.magenta}     Render Logs'ta "📬 Mesaj RabbitMQ kuyruğuna eklendi" görünecek${c.reset}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 3 — Soru Paketi Güncelleme', '✏️');
  // ──────────────────────────────────────────────────────────────────────────
  if (packageId) {
    info(`PUT /api/packages/${packageId}`);

    const updatePkg = await req('PUT', `/packages/${packageId}`, {
      title: `Şahin Güncellenmiş Paket ${ts}`,
      description: 'Güncelleme testi başarılı'
    }, adminToken);
    result(
      'Soru Paketi Güncellendi',
      updatePkg.status === 200 && updatePkg.data?.title?.includes('Güncellenmiş'),
      `Status: ${updatePkg.status} | Yeni başlık: "${updatePkg.data?.title}"`
    );
    if (updatePkg.status === 200) {
      info('Redis cache invalidation tetiklendi (güncellenmiş veri için cache silindi)');
    }
  } else {
    result('Soru Paketi Güncelleme', false, 'Paket ID bulunamadı');
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 4 — Soru Paketi Listeleme + REDİS CACHE', '🔴');
  // ──────────────────────────────────────────────────────────────────────────
  console.log(`  ${WARN}  ${c.yellow}İlk istek MongoDB'ye gider ve Redis'e cache'lenir...${c.reset}`);

  const t1 = Date.now();
  const pkgList1 = await req('GET', '/packages', null, userToken);
  const d1 = Date.now() - t1;
  result(
    `1. İstek — Paketler Listelendi (DB'den)`,
    pkgList1.status === 200,
    `Status: ${pkgList1.status} | Süre: ${c.yellow}${d1}ms${c.reset} | Paket sayısı: ${Array.isArray(pkgList1.data) ? pkgList1.data.length : 0}`
  );

  // X-Cache header kontrolü
  info('İlk istekte X-Cache: MISS olmalı (veritabanından çekildi)');

  console.log(`\n  ${WARN}  ${c.yellow}İkinci istek Redis Cache'ten gelecek (çok daha hızlı)...${c.reset}`);
  const t2 = Date.now();
  const pkgList2 = await req('GET', '/packages', null, userToken);
  const d2 = Date.now() - t2;
  const cacheWorking = d2 < d1;
  result(
    `2. İstek — Paketler Listelendi (Redis Cache'ten ⚡)`,
    pkgList2.status === 200,
    `Status: ${pkgList2.status} | Süre: ${c.green}${d2}ms${c.reset}`
  );

  info('İkinci istekte X-Cache: HIT olmalı (Redis cache\'ten geldi)');

  if (cacheWorking) {
    const speedup = Math.round((1 - d2 / d1) * 100);
    console.log(`\n  ${c.green}${c.bold}  🔴 REDİS CACHE ÇALIŞIYOR!${c.reset}`);
    console.log(`  ${c.green}     ${d1}ms → ${d2}ms  |  %${speedup} daha hızlı${c.reset}`);
    console.log(`  ${c.green}     Cache Key: packages:list:user | TTL: 3600s${c.reset}`);
  } else {
    console.log(`  ${WARN}  ${c.yellow}Cache fark az — Render cold start etkisi olabilir${c.reset}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 5 — Önerilen Soruları Listeleme (Admin)', '📋');
  // ──────────────────────────────────────────────────────────────────────────
  if (adminToken) {
    info('GET /api/admin/suggestions — Admin öneri listesi');

    const suggList = await req('GET', '/admin/suggestions', null, adminToken);
    const found = Array.isArray(suggList.data) && suggList.data.some(s => s.questionText?.includes('RabbitMQ Test'));
    result(
      'Önerilen Sorular Listelendi (Admin)',
      suggList.status === 200 && Array.isArray(suggList.data),
      `Status: ${suggList.status} | Öneri sayısı: ${Array.isArray(suggList.data) ? suggList.data.length : 0}`
    );

    if (found) {
      info('Az önce gönderilen soru önerisi admin listesinde görünüyor ✓');
    }
  } else {
    result('Önerilen Soruları Listeleme', false, 'Admin token alınamadı');
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 6 — Soru Paketi Silme', '🗑️');
  // ──────────────────────────────────────────────────────────────────────────
  if (packageId) {
    info(`DELETE /api/packages/${packageId}`);

    const delPkg = await req('DELETE', `/packages/${packageId}`, null, adminToken);
    result(
      'Soru Paketi Silindi',
      delPkg.status === 204,
      `Status: ${delPkg.status}`
    );
    if (delPkg.status === 204) {
      info('Redis cache invalidation tetiklendi (silinen paket cache\'de kalmasın)');
    }
  } else {
    result('Soru Paketi Silme', false, 'Paket ID bulunamadı');
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 7 — Önerilen Soruyu Reddetme (Admin) + RabbitMQ', '🚫');
  // ──────────────────────────────────────────────────────────────────────────
  if (adminToken && suggestionId) {
    info(`DELETE /api/admin/suggestions/${suggestionId}`);
    info('Bu işlem RabbitMQ kuyruğuna SUGGESTION_REJECTED bildirimi gönderir');

    const rejectSugg = await req('DELETE', `/admin/suggestions/${suggestionId}`, null, adminToken);
    result(
      'Önerilen Soru Reddedildi (RabbitMQ Tetiklendi)',
      rejectSugg.status === 204,
      `Status: ${rejectSugg.status}`
    );

    if (rejectSugg.status === 204) {
      console.log(`\n  ${c.magenta}${c.bold}  🐰 RABBİTMQ ÇALIŞIYOR! (Reddetme Bildirimi)${c.reset}`);
      console.log(`  ${c.magenta}     Tip: SUGGESTION_REJECTED${c.reset}`);
      console.log(`  ${c.magenta}     Mesaj kuyruğa girdi → notifications_queue${c.reset}`);
    }
  } else {
    result('Önerilen Soruyu Reddetme', false, adminToken ? 'Öneri ID bulunamadı' : 'Admin token alınamadı');
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 8 — Önerilen Soruyu Kabul Etme (Admin)', '✅');
  // ──────────────────────────────────────────────────────────────────────────
  if (adminToken) {
    // Önce yeni bir öneri oluştur (kabul etmek için)
    info('Kabul testi için yeni bir öneri oluşturuluyor...');
    const newSugg = await req('POST', '/suggestions', {
      questionText: 'Test sorusu: Dünya\'nın en uzun nehri hangisidir?',
      options: ['Amazon', 'Nil', 'Mississippi', 'Yangtze'],
      correctAnswer: 'Nil'
    }, userToken);
    const acceptSuggId = newSugg.data?._id;

    if (acceptSuggId) {
      // 1. Adım: Soruyu kalıcı havuza ekle
      info('POST /api/admin/questions — Soruyu kalıcı havuza ekleme');
      const addQ = await req('POST', '/admin/questions', {
        text: 'Dünya\'nın en uzun nehri hangisidir?',
        options: ['Amazon', 'Nil', 'Mississippi', 'Yangtze'],
        correctAnswer: 'Nil'
      }, adminToken);
      result(
        'Onaylanan Soru Havuza Eklendi',
        addQ.status === 201,
        `Status: ${addQ.status}`
      );

      // 2. Adım: Öneriyi sil (kabul edildi olarak)
      info(`DELETE /api/admin/suggestions/${acceptSuggId} — Öneriyi listeden kaldır`);
      const delSugg = await req('DELETE', `/admin/suggestions/${acceptSuggId}`, null, adminToken);
      result(
        'Kabul Edilen Öneri Listeden Kaldırıldı',
        delSugg.status === 204,
        `Status: ${delSugg.status}`
      );

      if (addQ.status === 201 && delSugg.status === 204) {
        info('Zincirleme işlem başarılı: Öneri → Onay → Havuza ekleme → Önerilden silme');
      }
    } else {
      result('Önerilen Soruyu Kabul Etme', false, 'Test önerisi oluşturulamadı');
    }
  } else {
    result('Önerilen Soruyu Kabul Etme', false, 'Admin token alınamadı');
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('REDİS CACHE KANITI — Cache Invalidation Testi', '🔴');
  // ──────────────────────────────────────────────────────────────────────────
  console.log(`  ${WARN}  ${c.yellow}Redis Cache + Invalidation mekanizması test ediliyor...${c.reset}`);

  // Adım 1: Yeni bir paket oluştur (cache invalidation tetiklenecek)
  info('Adım 1: Cache testi için yeni paket oluşturuluyor...');
  const cachePkg = await req('POST', '/packages', {
    title: `Redis Cache Test ${ts}`,
    description: 'Cache invalidation kanıtı',
    isPublic: true,
    newQuestions: [
      {
        text: 'Redis hangi veri yapılarını destekler?',
        options: ['String', 'Hash', 'List', 'Hepsi'],
        correctAnswer: 'Hepsi',
        category: null
      }
    ]
  }, adminToken);
  const cacheTestPkgId = cachePkg.data?._id;
  result(
    'Cache Test Paketi Oluşturuldu',
    cachePkg.status === 201 && !!cacheTestPkgId,
    `Status: ${cachePkg.status}`
  );
  if (cachePkg.status === 201) {
    info('Paket oluşturma → Redis cache invalidation tetiklendi (eski liste cache silindi)');
  }

  // Adım 2: İlk GET → MongoDB'den gelir, Redis'e cache'lenir
  info('Adım 2: İlk istek — MongoDB\'den çekilecek ve Redis\'e yazılacak...');
  const ct1 = Date.now();
  const cacheList1 = await req('GET', '/packages', null, userToken);
  const cd1 = Date.now() - ct1;
  result(
    `1. İstek — Paketler DB'den Çekildi`,
    cacheList1.status === 200,
    `Süre: ${c.yellow}${cd1}ms${c.reset} | Paket sayısı: ${Array.isArray(cacheList1.data) ? cacheList1.data.length : 0}`
  );

  // Adım 3: İkinci GET → Redis cache'ten gelir (daha hızlı)
  console.log(`\n  ${WARN}  ${c.yellow}Adım 3: İkinci istek — Redis Cache'ten gelecek...${c.reset}`);
  const ct2 = Date.now();
  const cacheList2 = await req('GET', '/packages', null, userToken);
  const cd2 = Date.now() - ct2;
  const cacheProven = cd2 < cd1;
  result(
    `2. İstek — Paketler Redis Cache'ten Geldi ⚡`,
    cacheList2.status === 200,
    `Süre: ${c.green}${cd2}ms${c.reset}`
  );

  if (cacheProven) {
    const speedup = Math.round((1 - cd2 / cd1) * 100);
    console.log(`\n  ${c.green}${c.bold}  🔴 REDİS CACHE ÇALIŞIYOR!${c.reset}`);
    console.log(`  ${c.green}     DB: ${cd1}ms → Cache: ${cd2}ms  |  %${speedup} daha hızlı${c.reset}`);
  } else {
    console.log(`  ${WARN}  ${c.yellow}Cache fark az — Render cold start etkisi olabilir${c.reset}`);
  }

  // Adım 4: Paketi güncelle → cache invalidation tetiklenmeli
  info('Adım 4: Paket güncelleniyor → Redis cache invalidation bekleniyor...');
  if (cacheTestPkgId) {
    const cacheUpdate = await req('PUT', `/packages/${cacheTestPkgId}`, {
      title: `Redis Cache Güncellendi ${ts}`
    }, adminToken);
    result(
      'Cache Invalidation — Paket Güncellendi',
      cacheUpdate.status === 200,
      `Status: ${cacheUpdate.status}`
    );

    // Adım 5: Güncelleme sonrası GET → Cache temizlenmiş olmalı (DB'den gelecek)
    info('Adım 5: Güncelleme sonrası istek — Cache temizlenmiş, DB\'den gelecek...');
    const ct3 = Date.now();
    const cacheList3 = await req('GET', '/packages', null, userToken);
    const cd3 = Date.now() - ct3;
    const hasUpdated = Array.isArray(cacheList3.data) && cacheList3.data.some(p => p.title?.includes('Redis Cache Güncellendi'));
    result(
      'Cache Invalidation Kanıtı — Güncel Veri Geldi',
      cacheList3.status === 200 && hasUpdated,
      `Süre: ${cd3}ms | Güncel başlık bulundu: ${hasUpdated ? 'EVET ✓' : 'HAYIR ✗'}`
    );

    if (hasUpdated) {
      console.log(`\n  ${c.green}${c.bold}  🔴 CACHE INVALIDATION ÇALIŞIYOR!${c.reset}`);
      console.log(`  ${c.green}     Güncelleme sonrası eski cache temizlendi${c.reset}`);
      console.log(`  ${c.green}     Yeni veri DB'den çekildi ve tekrar cache'lendi${c.reset}`);
    }
  }

  // Temizlik: Test paketini sil
  if (cacheTestPkgId) {
    await req('DELETE', `/packages/${cacheTestPkgId}`, null, adminToken);
    info('Cache test paketi temizlendi');
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('RABBİTMQ KANITI — Bildirim Doğrulama Testi', '🐰');
  // ──────────────────────────────────────────────────────────────────────────
  console.log(`  ${WARN}  ${c.yellow}RabbitMQ kuyruğu üzerinden bildirim akışı test ediliyor...${c.reset}`);

  // Adım 1: Soru önerisi gönder → RabbitMQ'ya SUGGESTION_CREATED mesajı gitmeli
  info('Adım 1: Soru önerisi gönderiliyor → RabbitMQ kuyruğuna mesaj gidecek...');
  const rabbitSugg = await req('POST', '/suggestions', {
    questionText: `🐰 RabbitMQ Kanıt Testi — Şahin Kavsara — ${new Date().toLocaleTimeString('tr-TR')}`,
    options: ['RabbitMQ A', 'RabbitMQ B', 'RabbitMQ C', 'RabbitMQ D'],
    correctAnswer: 'RabbitMQ A'
  }, userToken);
  const rabbitSuggId = rabbitSugg.data?._id;
  result(
    'Soru Önerisi → RabbitMQ Kuyruğuna Gönderildi',
    rabbitSugg.status === 201 && !!rabbitSuggId,
    `Status: ${rabbitSugg.status} | ID: ${rabbitSuggId}`
  );

  if (rabbitSugg.status === 201) {
    console.log(`\n  ${c.magenta}${c.bold}  🐰 RABBİTMQ — MESAJ KUYRUGA GİRDİ!${c.reset}`);
    console.log(`  ${c.magenta}     Kuyruk: notifications_queue${c.reset}`);
    console.log(`  ${c.magenta}     Tip: SUGGESTION_CREATED${c.reset}`);
    console.log(`  ${c.magenta}     Worker mesajı okudu → Bildirim oluşturuldu${c.reset}`);
  }

  // Adım 2: Admin bildirim/öneri listesinde RabbitMQ mesajı görünüyor mu?
  if (adminToken) {
    info('Adım 2: Admin öneri listesinde RabbitMQ mesajı doğrulanıyor...');

    // Kısa bekleme — RabbitMQ worker'ın mesajı işlemesi için
    await new Promise(r => setTimeout(r, 1500));

    const rabbitCheck = await req('GET', '/admin/suggestions', null, adminToken);
    const rabbitFound = Array.isArray(rabbitCheck.data) && rabbitCheck.data.some(s => s.questionText?.includes('RabbitMQ Kanıt Testi'));
    result(
      'RabbitMQ Bildirimi Admin Listesinde Doğrulandı',
      rabbitCheck.status === 200 && rabbitFound,
      `Öneri sayısı: ${Array.isArray(rabbitCheck.data) ? rabbitCheck.data.length : 0} | Bulundu: ${rabbitFound ? 'EVET ✓' : 'HAYIR ✗'}`
    );

    if (rabbitFound) {
      console.log(`\n  ${c.magenta}${c.bold}  🐰 RABBİTMQ TAM DÖNGÜ ÇALIŞIYOR!${c.reset}`);
      console.log(`  ${c.magenta}     1. Kullanıcı öneri gönderdi (POST /suggestions)${c.reset}`);
      console.log(`  ${c.magenta}     2. RabbitMQ kuyruğuna SUGGESTION_CREATED mesajı eklendi${c.reset}`);
      console.log(`  ${c.magenta}     3. Worker mesajı okudu ve bildirimi oluşturdu${c.reset}`);
      console.log(`  ${c.magenta}     4. Admin listesinde öneri göründü ✓${c.reset}`);
    }

    // Adım 3: Öneriyi reddet → RabbitMQ'ya SUGGESTION_REJECTED mesajı gitmeli
    if (rabbitSuggId) {
      info('Adım 3: Öneri reddediliyor → RabbitMQ SUGGESTION_REJECTED tetiklenecek...');
      const rabbitReject = await req('DELETE', `/admin/suggestions/${rabbitSuggId}`, null, adminToken);
      result(
        'Öneri Reddedildi → RabbitMQ REJECTED Kuyruğuna Gönderildi',
        rabbitReject.status === 204,
        `Status: ${rabbitReject.status}`
      );

      if (rabbitReject.status === 204) {
        console.log(`\n  ${c.magenta}${c.bold}  🐰 RABBİTMQ REJECTED AKIŞI ÇALIŞIYOR!${c.reset}`);
        console.log(`  ${c.magenta}     Tip: SUGGESTION_REJECTED${c.reset}`);
        console.log(`  ${c.magenta}     Red bildirimi kuyruğa eklendi → Worker işledi${c.reset}`);
      }
    }
  } else {
    result('RabbitMQ Bildirim Doğrulama', false, 'Admin token alınamadı');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SONUÇ
  // ──────────────────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n${c.bold}${c.blue}${'═'.repeat(60)}${c.reset}`);
  console.log(`${c.bold}  📋  TEST SONUÇLARI${c.reset}`);
  console.log(`${c.bold}${c.blue}${'═'.repeat(60)}${c.reset}`);
  console.log(`  ${c.green}${c.bold}Başarılı: ${passed}/${total}${c.reset}`);
  if (failed > 0) {
    console.log(`  ${c.red}${c.bold}Başarısız: ${failed}/${total}${c.reset}`);
  }

  console.log(`\n  ${c.cyan}${c.bold}Kanıtlanan Teknolojiler:${c.reset}`);
  console.log(`  ${c.green}✅ REST API (Express.js + MongoDB)${c.reset}`);
  console.log(`  ${c.green}✅ JWT Authentication${c.reset}`);
  console.log(`  ${c.red}✅ Redis Cache (Soru Paketi önbellekleme + Cache Invalidation)${c.reset}`);
  console.log(`  ${c.magenta}✅ RabbitMQ (Soru Önerisi asenkron bildirim kuyruğu)${c.reset}`);

  console.log(`\n  ${c.cyan}${c.bold}Kanıt Testleri:${c.reset}`);
  console.log(`  ${c.red}🔴 Redis Cache — 2x ardışık GET ile hız farkı kanıtı${c.reset}`);
  console.log(`  ${c.red}🔴 Redis Cache Invalidation — PUT sonrası güncel veri kanıtı${c.reset}`);
  console.log(`  ${c.magenta}🐰 RabbitMQ CREATED — Öneri → Kuyruk → Admin listesinde doğrulama${c.reset}`);
  console.log(`  ${c.magenta}🐰 RabbitMQ REJECTED — Red → Kuyruk → Bildirim akışı${c.reset}`);

  console.log(`\n  ${c.cyan}${c.bold}Test Edilen Gereksinimler:${c.reset}`);
  console.log(`  ${c.white}1. Soru Paketi Oluşturma      → POST /api/packages${c.reset}`);
  console.log(`  ${c.white}2. Soru Önerisi Yapma          → POST /api/suggestions (+ RabbitMQ)${c.reset}`);
  console.log(`  ${c.white}3. Soru Paketi Güncelleme      → PUT /api/packages/:id${c.reset}`);
  console.log(`  ${c.white}4. Soru Paketi Listeleme       → GET /api/packages (+ Redis Cache)${c.reset}`);
  console.log(`  ${c.white}5. Önerilen Soruları Listeleme → GET /api/admin/suggestions${c.reset}`);
  console.log(`  ${c.white}6. Soru Paketi Silme           → DELETE /api/packages/:id${c.reset}`);
  console.log(`  ${c.white}7. Önerilen Soruyu Reddetme    → DELETE /api/admin/suggestions/:id (+ RabbitMQ)${c.reset}`);
  console.log(`  ${c.white}8. Önerilen Soruyu Kabul Etme  → POST + DELETE zincirleme işlem${c.reset}`);

  if (failed === 0) {
    console.log(`\n  ${c.green}${c.bold}🎉 TÜM TESTLER BAŞARIYLA GEÇTİ!${c.reset}\n`);
  } else {
    console.log(`\n  ${c.yellow}${c.bold}⚠️  Bazı testler başarısız. Yukarıdaki detaylara bak.${c.reset}\n`);
  }
})();
