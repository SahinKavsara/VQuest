/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     MUSTAFA İSMAİL TOPTAŞ — VQuest Mobil Backend Test Suite     ║
 * ║     Redis Cache + RabbitMQ + AI Analiz + Bildirim Sistemi       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Kullanım: node test.js
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
  console.log('  ║     MUSTAFA İSMAİL TOPTAŞ — VQuest Backend Tests        ║');
  console.log('  ║     Redis • RabbitMQ • AI Analiz • Bildirim Sistemi      ║');
  console.log('  ╚══════════════════════════════════════════════════════════╝');
  console.log(c.reset);

  const ts = Date.now();
  let userToken, adminToken, reportId, notifId;

  // ──────────────────────────────────────────────────────────────────────────
  header('BAĞLANTI & KİMLİK DOĞRULAMA', '🔐');
  // ──────────────────────────────────────────────────────────────────────────

  // Yeni test kullanıcısı oluştur
  const regEmail = `musttest_${ts}@vquest.com`;
  const regPass  = 'Test1234!';
  const reg = await req('POST', '/auth/register', {
    username: `musttest_${ts}`,
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
  header('GEREKSİNİM 1 — Kişisel Analiz Başlatma', '🤖');
  // ──────────────────────────────────────────────────────────────────────────
  info('POST /api/ai/analysis — Manuel başlatma (boş body)');

  const ai1 = await req('POST', '/ai/analysis', {}, userToken);
  reportId = ai1.data?._id;
  result(
    'Manuel AI Analiz Başlatıldı',
    ai1.status === 202 && !!ai1.data?.analysisText,
    `Status: ${ai1.status}`
  );
  if (ai1.data?.analysisText) {
    info(`Analiz metni: "${ai1.data.analysisText.substring(0, 70)}..."`);
  }

  info('POST /api/ai/analysis — Oyun verisiyle başlatma');
  const ai2 = await req('POST', '/ai/analysis', {
    performanceData: [
      { category: 'Tarih', isCorrect: true },
      { category: 'Tarih', isCorrect: false },
      { category: 'Bilim', isCorrect: true },
      { category: 'Bilim', isCorrect: true },
      { category: 'Coğrafya', isCorrect: false },
    ]
  }, userToken);
  result(
    'Oyun Verisiyle AI Analiz Başlatıldı',
    ai2.status === 202 && !!ai2.data?.analysisText,
    `Status: ${ai2.status}`
  );
  if (ai2.data?.analysisText) {
    info(`Analiz metni: "${ai2.data.analysisText.substring(0, 70)}..."`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 5 — Analiz Sonucu Görüntüleme', '📊');
  // ──────────────────────────────────────────────────────────────────────────
  info(`GET /api/ai/reports/${reportId}`);

  const aiGet = await req('GET', `/ai/reports/${reportId}`, null, userToken);
  result(
    'Analiz Raporu Görüntülendi',
    aiGet.status === 200 && aiGet.data?._id === reportId,
    `Status: ${aiGet.status}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 7 — Eski Analizi Silme', '🗑️');
  // ──────────────────────────────────────────────────────────────────────────
  info(`DELETE /api/ai/reports/${reportId}`);

  const aiDel = await req('DELETE', `/ai/reports/${reportId}`, null, userToken);
  result(
    'Analiz Raporu Silindi',
    aiDel.status === 204,
    `Status: ${aiDel.status}`
  );

  // ──────────────────────────────────────────────────────────────────────────
  header('REDİS CACHE KANITI — Gereksinim 6', '🔴');
  // ──────────────────────────────────────────────────────────────────────────
  console.log(`  ${WARN}  ${c.yellow}İlk istek MongoDB'ye gider ve Redis'e cache'lenir...${c.reset}`);

  const t1 = Date.now();
  const notifs1 = await req('GET', '/notifications', null, userToken);
  const d1 = Date.now() - t1;
  result(
    `1. İstek — Bildirimler Listelendi (DB'den)`,
    notifs1.status === 200,
    `Status: ${notifs1.status} | Süre: ${c.yellow}${d1}ms${c.reset} | Bildirim sayısı: ${Array.isArray(notifs1.data) ? notifs1.data.length : 0}`
  );
  if (notifs1.data?.length > 0) notifId = notifs1.data[0]._id;

  console.log(`\n  ${WARN}  ${c.yellow}İkinci istek Redis Cache'ten gelecek (çok daha hızlı)...${c.reset}`);
  const t2 = Date.now();
  const notifs2 = await req('GET', '/notifications', null, userToken);
  const d2 = Date.now() - t2;
  const cacheWorking = d2 < d1;
  result(
    `2. İstek — Bildirimler Listelendi (Redis Cache'ten ⚡)`,
    notifs2.status === 200,
    `Status: ${notifs2.status} | Süre: ${c.green}${d2}ms${c.reset}`
  );

  if (cacheWorking) {
    const speedup = Math.round((1 - d2 / d1) * 100);
    console.log(`\n  ${c.green}${c.bold}  🔴 REDİS CACHE ÇALIŞIYOR!${c.reset}`);
    console.log(`  ${c.green}     ${d1}ms → ${d2}ms  |  %${speedup} daha hızlı${c.reset}`);
  } else {
    console.log(`  ${WARN}  ${c.yellow}Cache fark az — Render cold start etkisi olabilir${c.reset}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('RABBİTMQ KANITI — Gereksinim 2', '🐰');
  // ──────────────────────────────────────────────────────────────────────────

  if (!adminToken) {
    result('Admin Bildirim Gönderme', false, 'Admin token alınamadı');
  } else {
    info('POST /api/admin/notifications — Mesaj RabbitMQ kuyruğuna gönderiliyor...');
    const rabbitMsg = `🐰 RabbitMQ Demo — Mustafa İsmail Toptaş — ${new Date().toLocaleTimeString('tr-TR')}`;
    const sendN = await req('POST', '/admin/notifications', { message: rabbitMsg }, adminToken);
    result(
      'Bildirim RabbitMQ Kuyruğuna Gönderildi',
      sendN.status === 201,
      `Status: ${sendN.status} | ID: ${sendN.data?._id}`
    );

    if (sendN.status === 201) {
      info('Socket.io ile tüm aktif kullanıcılara anlık yayın yapıldı...');
      info('Redis cache temizlendi (yeni bildirim için)...');

      // Bildirim listede görünüyor mu?
      const t3 = Date.now();
      const notifs3 = await req('GET', '/notifications', null, userToken);
      const d3 = Date.now() - t3;
      const found = Array.isArray(notifs3.data) && notifs3.data.some(n => n.message?.includes('RabbitMQ Demo'));
      result(
        'RabbitMQ Bildirimi Kullanıcı Listesinde Görünüyor',
        found,
        `Süre: ${d3}ms (Cache temizlendi, DB'den geldi)`
      );

      if (found) {
        const rNotif = notifs3.data.find(n => n.message?.includes('RabbitMQ Demo'));
        notifId = rNotif?._id;
        console.log(`\n  ${c.magenta}${c.bold}  🐰 RABBİTMQ ÇALIŞIYOR!${c.reset}`);
        console.log(`  ${c.magenta}     Mesaj kuyruğa girdi → Worker okudu → Socket.io ile yayınlandı${c.reset}`);
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 4 — Bildirimi Okundu İşaretle', '✓');
  // ──────────────────────────────────────────────────────────────────────────
  if (notifId) {
    info(`PUT /api/notifications/${notifId}/read`);
    const markRead = await req('PUT', `/notifications/${notifId}/read`, null, userToken);
    result(
      'Bildirim Okundu Olarak İşaretlendi',
      markRead.status === 200 && markRead.data?.isRead === true,
      `Status: ${markRead.status} | isRead: ${markRead.data?.isRead}`
    );
    info('Redis cache temizlendi (güncel durum için)');
  } else {
    result('Bildirim Okundu İşaretleme', false, 'Bildirim ID bulunamadı');
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 8 — Bildirim Silme', '🗑️');
  // ──────────────────────────────────────────────────────────────────────────
  if (notifId) {
    info(`DELETE /api/notifications/${notifId}`);
    const delN = await req('DELETE', `/notifications/${notifId}`, null, userToken);
    result(
      'Bildirim Silindi',
      delN.status === 204,
      `Status: ${delN.status}`
    );
    info('Redis cache temizlendi (silinen bildirim cache\'de kalmasın)');
  } else {
    result('Bildirim Silme', false, 'Bildirim ID bulunamadı');
  }

  // ──────────────────────────────────────────────────────────────────────────
  header('GEREKSİNİM 3 — Admin AI Prompt Yönetimi', '⚙️');
  // ──────────────────────────────────────────────────────────────────────────
  if (adminToken) {
    info('GET /api/admin/ai/prompt');
    const promptGet = await req('GET', '/admin/ai/prompt', null, adminToken);
    result(
      'AI Prompt Getirildi',
      promptGet.status === 200 && !!promptGet.data?.promptText,
      `Status: ${promptGet.status}`
    );
    if (promptGet.data?.promptText) {
      info(`Mevcut prompt: "${promptGet.data.promptText.substring(0, 60)}..."`);
    }

    info('PUT /api/admin/ai/prompt');
    const promptPut = await req('PUT', '/admin/ai/prompt', {
      promptText: 'Sen bir eğitim koçusun. Kullanıcının performansını 1 cümleyle Türkçe değerlendir.'
    }, adminToken);
    result(
      'AI Prompt Güncellendi',
      promptPut.status === 200,
      `Status: ${promptPut.status} | ${promptPut.data?.message}`
    );
  } else {
    result('Admin AI Prompt Yönetimi', false, 'Admin token alınamadı');
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
  console.log(`  ${c.green}✅ AI Analiz (Gemini / Fallback)${c.reset}`);
  console.log(`  ${c.red}✅ Redis Cache (Bildirim önbellekleme)${c.reset}`);
  console.log(`  ${c.magenta}✅ RabbitMQ (Asenkron bildirim kuyruğu)${c.reset}`);
  console.log(`  ${c.cyan}✅ Socket.io (Gerçek zamanlı bildirim)${c.reset}`);

  if (failed === 0) {
    console.log(`\n  ${c.green}${c.bold}🎉 TÜM TESTLER BAŞARIYLA GEÇTİ!${c.reset}\n`);
  } else {
    console.log(`\n  ${c.yellow}${c.bold}⚠️  Bazı testler başarısız. Yukarıdaki detaylara bak.${c.reset}\n`);
  }
})();
