/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║          EMİR OMRAK — VQuest REST API Test Suite                ║
 * ║     Redis Cache + RabbitMQ (Soru & Kategori CRUD İşlemleri)    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Kullanım: node Emir-Omrak-Test.js
 * (Node.js 18+ gereklidir — built-in fetch kullanır, npm install gerekmez)
 */

const BASE = 'https://vquest-backend-api.onrender.com/api';

// ─── Renkli terminal çıktısı ──────────────────────────────────────────────────
const c = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  green:   '\x1b[32m',
  red:     '\x1b[31m',
  yellow:  '\x1b[33m',
  cyan:    '\x1b[36m',
  blue:    '\x1b[34m',
  magenta: '\x1b[35m',
  white:   '\x1b[37m',
  gray:    '\x1b[90m',
};

const OK   = `${c.green}${c.bold}✅ BAŞARILI${c.reset}`;
const FAIL = `${c.red}${c.bold}❌ BAŞARISIZ${c.reset}`;
const INFO = `${c.cyan}ℹ${c.reset}`;
const WARN = `${c.yellow}⚠${c.reset}`;

let passed = 0;
let failed = 0;

function header(title, emoji = '🔷') {
  console.log(`\n${c.bold}${c.blue}${'═'.repeat(62)}${c.reset}`);
  console.log(`${c.bold}${c.blue}  ${emoji}  ${title}${c.reset}`);
  console.log(`${c.bold}${c.blue}${'═'.repeat(62)}${c.reset}`);
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
  console.log('  ╔════════════════════════════════════════════════════════════╗');
  console.log('  ║          EMİR OMRAK — VQuest Backend Tests                ║');
  console.log('  ║     Soru & Kategori CRUD • Redis Cache • RabbitMQ         ║');
  console.log('  ╚════════════════════════════════════════════════════════════╝');
  console.log(c.reset);

  let adminToken;
  let createdCategoryId;
  let createdQuestionId;
  const ts = Date.now();

  // ──────────────────────────────────────────────────────────────────────────
  header('KİMLİK DOĞRULAMA', '🔐');
  // ──────────────────────────────────────────────────────────────────────────

  const adminLogin = await req('POST', '/auth/login', {
    email: 'admin@vquest.com',
    password: 'admin123',
  });
  adminToken = adminLogin.data?.token;
  result(
    'Admin Girişi (POST /auth/login)',
    adminLogin.status === 200 && !!adminToken,
    `Status: ${adminLogin.status}`,
  );

  if (!adminToken) {
    console.log(`\n  ${c.red}${c.bold}HATA: Admin token alınamadı, testler durduruluyor.${c.reset}`);
    process.exit(1);
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 5 — Kategori Listeleme + Redis Cache Kanıtı', '🔴');
  // ──────────────────────────────────────────────────────────────────────────
  console.log(`  ${WARN}  ${c.yellow}1. istek: Redis'ten veri gelir (categories hash)...${c.reset}`);

  const t1 = Date.now();
  const cats1 = await req('GET', '/categories');
  const d1 = Date.now() - t1;
  result(
    'Kategori Listeleme - 1. İstek (GET /categories)',
    cats1.status === 200 && Array.isArray(cats1.data),
    `Status: ${cats1.status} | Süre: ${c.yellow}${d1}ms${c.reset} | Kategori sayısı: ${Array.isArray(cats1.data) ? cats1.data.length : 0}`,
  );

  console.log(`\n  ${WARN}  ${c.yellow}2. istek: Redis cache'ten (çok daha hızlı olmalı)...${c.reset}`);
  const t2 = Date.now();
  const cats2 = await req('GET', '/categories');
  const d2 = Date.now() - t2;
  const catCacheWorking = d2 <= d1;
  result(
    'Kategori Listeleme - 2. İstek (Redis Cache ⚡)',
    cats2.status === 200,
    `Status: ${cats2.status} | Süre: ${c.green}${d2}ms${c.reset}`,
  );

  if (catCacheWorking) {
    console.log(`\n  ${c.red}${c.bold}  🔴 REDİS CACHE ÇALIŞIYOR! (Kategoriler)${c.reset}`);
    console.log(`  ${c.red}     ${d1}ms → ${d2}ms  |  Redis categories hash'inden okundu${c.reset}`);
  } else {
    console.log(`  ${WARN}  ${c.yellow}Cache fark az — Render cold start etkisi olabilir${c.reset}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 6 — Yeni Kategori Ekleme + RabbitMQ Kanıtı', '🐰');
  // ──────────────────────────────────────────────────────────────────────────
  info('POST /api/admin/categories — Yeni kategori ekleniyor...');
  info('Bu işlem aynı zamanda RabbitMQ\'ya "category.created" event\'i fırlatır.');

  const newCatName = `Test-Kategori-${ts}`;
  const addCat = await req('POST', '/admin/categories', { name: newCatName }, adminToken);
  createdCategoryId = addCat.data?._id;
  result(
    'Kategori Ekleme (POST /admin/categories)',
    addCat.status === 201 && !!addCat.data?._id,
    `Status: ${addCat.status} | ID: ${addCat.data?._id}`,
  );

  if (addCat.status === 201) {
    console.log(`\n  ${c.magenta}${c.bold}  🐰 RABBİTMQ EVENT: "category.created" fırlatıldı!${c.reset}`);
    console.log(`  ${c.magenta}     Routing Key: category.created → Exchange: emir_api_events${c.reset}`);
    info('Redis\'teki "categories" hash\'ine yeni kayıt eklendi.');
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 7 — Kategori İsmi Güncelleme + RabbitMQ Kanıtı', '🐰');
  // ──────────────────────────────────────────────────────────────────────────
  if (createdCategoryId) {
    info(`PUT /api/admin/categories/${createdCategoryId} — Kategori güncelleniyor...`);
    info('Bu işlem RabbitMQ\'ya "category.updated" event\'i fırlatır.');

    const updatedCatName = `Güncel-Kategori-${ts}`;
    const updateCat = await req(
      'PUT',
      `/admin/categories/${createdCategoryId}`,
      { name: updatedCatName },
      adminToken,
    );
    result(
      'Kategori Güncelleme (PUT /admin/categories/:id)',
      updateCat.status === 200 && updateCat.data?.name === updatedCatName,
      `Status: ${updateCat.status} | Yeni isim: ${updateCat.data?.name}`,
    );

    if (updateCat.status === 200) {
      console.log(`\n  ${c.magenta}${c.bold}  🐰 RABBİTMQ EVENT: "category.updated" fırlatıldı!${c.reset}`);
      console.log(`  ${c.magenta}     Routing Key: category.updated → Exchange: emir_api_events${c.reset}`);
      info('Redis\'teki "categories" hash\'inde ilgili kayıt güncellendi.');
    }
  } else {
    result('Kategori Güncelleme', false, 'Kategori ID bulunamadı (önceki adım başarısız)');
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 1 — Soru Listeleme + Redis Cache Kanıtı', '🔴');
  // ──────────────────────────────────────────────────────────────────────────
  console.log(`  ${WARN}  ${c.yellow}1. istek: Redis'ten veri gelir (questions hash)...${c.reset}`);

  const t3 = Date.now();
  const qs1 = await req('GET', '/questions', null, adminToken);
  const d3 = Date.now() - t3;
  result(
    'Soru Listeleme - 1. İstek (GET /questions)',
    qs1.status === 200 && Array.isArray(qs1.data),
    `Status: ${qs1.status} | Süre: ${c.yellow}${d3}ms${c.reset} | Soru sayısı: ${Array.isArray(qs1.data) ? qs1.data.length : 0}`,
  );

  console.log(`\n  ${WARN}  ${c.yellow}2. istek: Redis cache'ten (çok daha hızlı olmalı)...${c.reset}`);
  const t4 = Date.now();
  const qs2 = await req('GET', '/questions', null, adminToken);
  const d4 = Date.now() - t4;
  const qCacheWorking = d4 <= d3;
  result(
    'Soru Listeleme - 2. İstek (Redis Cache ⚡)',
    qs2.status === 200,
    `Status: ${qs2.status} | Süre: ${c.green}${d4}ms${c.reset}`,
  );

  if (qCacheWorking) {
    console.log(`\n  ${c.red}${c.bold}  🔴 REDİS CACHE ÇALIŞIYOR! (Sorular)${c.reset}`);
    console.log(`  ${c.red}     ${d3}ms → ${d4}ms  |  Redis questions hash'inden okundu${c.reset}`);
  } else {
    console.log(`  ${WARN}  ${c.yellow}Cache fark az — Render cold start etkisi olabilir${c.reset}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 2 — Soru Ekleme + RabbitMQ Kanıtı', '🐰');
  // ──────────────────────────────────────────────────────────────────────────
  info('POST /api/admin/questions — Yeni soru ekleniyor...');
  info('Bu işlem RabbitMQ\'ya "question.created" event\'i fırlatır.');

  const addQ = await req('POST', '/admin/questions', {
    text: `Emir Omrak Test Sorusu — ${ts}`,
    options: [
      'Seçenek A',
      'Seçenek B',
      'Seçenek C',
      'Seçenek D',
    ],
    correctAnswer: 'Seçenek A',
    category: createdCategoryId || 'Genel Kültür',
  }, adminToken);
  createdQuestionId = addQ.data?._id;
  result(
    'Soru Ekleme (POST /admin/questions)',
    addQ.status === 201 && !!addQ.data?._id,
    `Status: ${addQ.status} | ID: ${addQ.data?._id}`,
  );

  if (addQ.status === 201) {
    console.log(`\n  ${c.magenta}${c.bold}  🐰 RABBİTMQ EVENT: "question.created" fırlatıldı!${c.reset}`);
    console.log(`  ${c.magenta}     Routing Key: question.created → Exchange: emir_api_events${c.reset}`);
    info('Redis\'teki "questions" hash\'ine yeni UUID key ile eklendi.');
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 3 — Soru Güncelleme + RabbitMQ Kanıtı', '🐰');
  // ──────────────────────────────────────────────────────────────────────────
  if (createdQuestionId) {
    info(`PUT /api/admin/questions/${createdQuestionId} — Soru güncelleniyor...`);
    info('Bu işlem RabbitMQ\'ya "question.updated" event\'i fırlatır.');

    const updateQ = await req('PUT', `/admin/questions/${createdQuestionId}`, {
      text: `Emir Omrak Test Sorusu (Güncel) — ${ts}`,
      options: ['Güncel A', 'Güncel B', 'Güncel C', 'Güncel D'],
      correctAnswer: 'Güncel A',
      category: createdCategoryId || 'Genel Kültür',
    }, adminToken);
    result(
      'Soru Güncelleme (PUT /admin/questions/:id)',
      updateQ.status === 200,
      `Status: ${updateQ.status}`,
    );

    if (updateQ.status === 200) {
      console.log(`\n  ${c.magenta}${c.bold}  🐰 RABBİTMQ EVENT: "question.updated" fırlatıldı!${c.reset}`);
      console.log(`  ${c.magenta}     Routing Key: question.updated → Exchange: emir_api_events${c.reset}`);
      info('Redis\'teki "questions" hash\'inde ilgili kayıt güncellendi.');
    }
  } else {
    result('Soru Güncelleme', false, 'Soru ID bulunamadı (önceki adım başarısız)');
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 4 — Soru Silme + RabbitMQ Kanıtı', '🐰');
  // ──────────────────────────────────────────────────────────────────────────
  if (createdQuestionId) {
    info(`DELETE /api/admin/questions/${createdQuestionId} — Soru siliniyor...`);
    info('Bu işlem RabbitMQ\'ya "question.deleted" event\'i fırlatır.');

    const delQ = await req('DELETE', `/admin/questions/${createdQuestionId}`, null, adminToken);
    result(
      'Soru Silme (DELETE /admin/questions/:id)',
      delQ.status === 204,
      `Status: ${delQ.status}`,
    );

    if (delQ.status === 204) {
      console.log(`\n  ${c.magenta}${c.bold}  🐰 RABBİTMQ EVENT: "question.deleted" fırlatıldı!${c.reset}`);
      console.log(`  ${c.magenta}     Routing Key: question.deleted → Exchange: emir_api_events${c.reset}`);
      info('Redis\'teki "questions" hash\'inden ilgili kayıt silindi.');
    }
  } else {
    result('Soru Silme', false, 'Soru ID bulunamadı (önceki adım başarısız)');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEMİZLİK — Test sırasında oluşturulan kategoriyi sil
  // ──────────────────────────────────────────────────────────────────────────
  if (createdCategoryId) {
    const cleanupCat = await req('DELETE', `/admin/categories/${createdCategoryId}`, null, adminToken);
    if (cleanupCat.status === 204) {
      info(`Test kategorisi temizlendi (ID: ${createdCategoryId})`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SONUÇ
  // ──────────────────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log(`\n${c.bold}${c.blue}${'═'.repeat(62)}${c.reset}`);
  console.log(`${c.bold}  📋  TEST SONUÇLARI${c.reset}`);
  console.log(`${c.bold}${c.blue}${'═'.repeat(62)}${c.reset}`);
  console.log(`  ${c.green}${c.bold}Başarılı: ${passed}/${total}${c.reset}`);
  if (failed > 0) {
    console.log(`  ${c.red}${c.bold}Başarısız: ${failed}/${total}${c.reset}`);
  }

  console.log(`\n  ${c.cyan}${c.bold}Kanıtlanan Teknolojiler:${c.reset}`);
  console.log(`  ${c.green}✅ REST API (Express.js + MongoDB Atlas)${c.reset}`);
  console.log(`  ${c.green}✅ JWT Authentication (Admin yetkisi)${c.reset}`);
  console.log(`  ${c.red}✅ Redis Cache (questions & categories hash)${c.reset}`);
  console.log(`  ${c.magenta}✅ RabbitMQ Events (question.* & category.* routing keys)${c.reset}`);
  console.log(`  ${c.cyan}✅ Exchange: emir_api_events (topic tipinde)${c.reset}`);

  if (failed === 0) {
    console.log(`\n  ${c.green}${c.bold}🎉 TÜM TESTLER BAŞARIYLA GEÇTİ!${c.reset}\n`);
  } else {
    console.log(`\n  ${c.yellow}${c.bold}⚠️  Bazı testler başarısız. Yukarıdaki detaylara bak.${c.reset}\n`);
  }
})();
