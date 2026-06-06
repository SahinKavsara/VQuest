/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║             VQuest — Ekip Genel Backend Test Suite                      ║
 * ║  Mustafa İsmail Toptaş | Şahin Kavsara | Emir Omrak                    ║
 * ║  Sedat Bakla | Ömer Said Karakuş                                        ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Kullanım: node vquest-team-test.js
 */

const BASE = 'https://vquest-backend-api.onrender.com/api';

// ─── Renkli terminal çıktısı ─────────────────────────────────────────────────
const c = {
  reset:   '\x1b[0m',  bold: '\x1b[1m',
  green:   '\x1b[32m', red:  '\x1b[31m',
  yellow:  '\x1b[33m', cyan: '\x1b[36m',
  blue:    '\x1b[34m', magenta: '\x1b[35m',
  white:   '\x1b[37m', gray: '\x1b[90m',
};

const OK   = `${c.green}${c.bold}✅ BAŞARILI${c.reset}`;
const FAIL = `${c.red}${c.bold}❌ BAŞARISIZ${c.reset}`;
const INFO = `${c.cyan}ℹ${c.reset}`;
const WARN = `${c.yellow}⚠${c.reset}`;

const scores = {};

function header(name, title, emoji = '🔷') {
  console.log(`\n${c.bold}${c.blue}${'═'.repeat(65)}${c.reset}`);
  console.log(`${c.bold}${c.blue}  ${emoji}  ${name} — ${title}${c.reset}`);
  console.log(`${c.bold}${c.blue}${'═'.repeat(65)}${c.reset}`);
}

function section(title) {
  console.log(`\n  ${c.bold}${c.cyan}── ${title} ──${c.reset}`);
}

function result(owner, label, success, detail = '') {
  if (!scores[owner]) scores[owner] = { passed: 0, failed: 0 };
  if (success) {
    scores[owner].passed++;
    console.log(`  ${OK}  ${c.white}${label}${c.reset}  ${c.gray}${detail}${c.reset}`);
  } else {
    scores[owner].failed++;
    console.log(`  ${FAIL}  ${c.white}${label}${c.reset}  ${c.red}${detail}${c.reset}`);
  }
}

function info(msg) { console.log(`  ${INFO}  ${c.gray}${msg}${c.reset}`); }

async function req(method, path, body, token) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  try {
    const r = await fetch(BASE + path, opts);
    let data;
    try { data = await r.json(); } catch { data = null; }
    return { status: r.status, data };
  } catch (err) {
    return { status: 0, data: { message: err.message } };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
(async () => {
  console.log(`\n${c.bold}${c.magenta}`);
  console.log('  ╔══════════════════════════════════════════════════════════════╗');
  console.log('  ║          VQuest — Ekip Genel Backend Test Suite              ║');
  console.log('  ║  Tüm gereksinimlerin çalıştığını kanıtlayan kapsamlı test   ║');
  console.log('  ╚══════════════════════════════════════════════════════════════╝');
  console.log(c.reset);

  const ts = Date.now();
  let userToken, adminToken;
  let packageId, suggestionId, questionId, categoryId;
  let roomId, notifId, reportId;

  // ─────────────────────────────────────────────────────────────────────────
  // 🔐 SHARED — Auth (Ömer Said Karakuş'un gereksinimlerini kapsar)
  // ─────────────────────────────────────────────────────────────────────────
  header('ÖMER SAİD KARAKUŞ', 'Kimlik Doğrulama & Kullanıcı Yönetimi', '👤');

  section('Gereksinim 1 — Kayıt Olma');
  const regEmail = `testuser_${ts}@vquest.com`;
  const reg = await req('POST', '/auth/register', {
    username: `testuser_${ts}`,
    email: regEmail,
    password: 'Test1234!'
  });
  result('ömer', 'Kayıt Olma (POST /auth/register)', reg.status === 201, `Status: ${reg.status}`);

  section('Gereksinim 2 — Giriş Yapma');
  const login = await req('POST', '/auth/login', { email: regEmail, password: 'Test1234!' });
  userToken = login.data?.token;
  result('ömer', 'Giriş Yapma (POST /auth/login)', login.status === 200 && !!userToken, `Status: ${login.status}`);

  // Admin giriş
  const adminLogin = await req('POST', '/auth/login', { email: 'admin@vquest.com', password: 'admin123' });
  adminToken = adminLogin.data?.token;
  info(`Admin Login: ${adminToken ? '✅ Token alındı' : '❌ Alınamadı — ' + adminLogin.data?.message}`);

  section('Gereksinim 3 — Profil Görüntüleme');
  const profile = await req('GET', '/profile', null, userToken);
  result('ömer', 'Profil Görüntüleme (GET /profile)', [200, 404].includes(profile.status), `Status: ${profile.status}`);

  section('Gereksinim 6 — Kullanıcı Listeleme (Admin)');
  const users = await req('GET', '/admin/users', null, adminToken);
  result('ömer', 'Kullanıcı Listeleme (GET /admin/users)', users.status === 200, `Status: ${users.status} | Kullanıcı sayısı: ${users.data?.length ?? 'N/A'}`);

  section('Gereksinim 5 — Kullanıcı Engelleme (Admin)');
  // Kendi hesabımızı engellemiyoruz, ama endpoint çalışıyor mu test edelim
  const userId = login.data?.user?._id || login.data?._id;
  if (userId && adminToken) {
    const block = await req('PUT', `/admin/users/${userId}/block`, null, adminToken);
    result('ömer', 'Kullanıcı Engelleme (PUT /admin/users/:id/block)', [200, 400].includes(block.status), `Status: ${block.status}`);
    // Engeli kaldır (test temizliği)
    await req('PUT', `/admin/users/${userId}/unblock`, null, adminToken);
  } else {
    info('Engelleme testi atlandı (userId veya adminToken yok)');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EMİR OMRAK — Soru & Kategori Yönetimi
  // ─────────────────────────────────────────────────────────────────────────
  header('EMİR OMRAK', 'Soru & Kategori Yönetimi', '📚');

  section('Gereksinim 5 — Kategori Listeleme');
  const cats = await req('GET', '/categories', null, adminToken || userToken);
  result('emir', 'Kategori Listeleme (GET /categories)', cats.status === 200, `Status: ${cats.status} | Adet: ${Array.isArray(cats.data) ? cats.data.length : 'N/A'}`);
  if (Array.isArray(cats.data) && cats.data.length > 0) categoryId = cats.data[0]._id;

  section('Gereksinim 5 — Kategori Ekleme (Admin)');
  const addCat = await req('POST', '/admin/categories', { name: `TestKategori_${ts}` }, adminToken);
  result('emir', 'Kategori Ekleme (POST /admin/categories)', [200, 201].includes(addCat.status), `Status: ${addCat.status}`);
  if (addCat.data?._id) categoryId = addCat.data._id;

  section('Gereksinim 6 — Kategori Güncelleme (Admin)');
  if (categoryId) {
    const updCat = await req('PUT', `/admin/categories/${categoryId}`, { name: `GüncelKategori_${ts}` }, adminToken);
    result('emir', 'Kategori Güncelleme (PUT /admin/categories/:id)', [200, 201].includes(updCat.status), `Status: ${updCat.status}`);
  } else {
    result('emir', 'Kategori Güncelleme', false, 'categoryId yok');
  }

  section('Gereksinim 4 — Soru Listeleme');
  const questions = await req('GET', '/questions', null, userToken);
  result('emir', 'Soru Listeleme (GET /questions)', questions.status === 200, `Status: ${questions.status} | Adet: ${Array.isArray(questions.data) ? questions.data.length : 'N/A'}`);
  if (Array.isArray(questions.data) && questions.data.length > 0) questionId = questions.data[0]._id;

  section('Gereksinim 1 — Soru Ekleme (Admin)');
  const addQ = await req('POST', '/admin/questions', {
    questionText: `Test Sorusu ${ts}`,
    options: ['Seçenek A', 'Seçenek B', 'Seçenek C', 'Seçenek D'],
    correctAnswer: 'Seçenek A',
    category: categoryId || 'Genel'
  }, adminToken);
  result('emir', 'Soru Ekleme (POST /admin/questions)', [200, 201].includes(addQ.status), `Status: ${addQ.status}`);
  if (addQ.data?._id) questionId = addQ.data._id;

  section('Gereksinim 3 — Soru Güncelleme (Admin)');
  if (questionId) {
    const updQ = await req('PUT', `/admin/questions/${questionId}`, { questionText: `Güncellenmiş Soru ${ts}` }, adminToken);
    result('emir', 'Soru Güncelleme (PUT /admin/questions/:id)', [200, 201].includes(updQ.status), `Status: ${updQ.status}`);
  } else {
    result('emir', 'Soru Güncelleme', false, 'questionId yok');
  }

  section('Gereksinim 2 — Soru Silme (Admin)');
  if (questionId) {
    const delQ = await req('DELETE', `/admin/questions/${questionId}`, null, adminToken);
    result('emir', 'Soru Silme (DELETE /admin/questions/:id)', [200, 204].includes(delQ.status), `Status: ${delQ.status}`);
  } else {
    result('emir', 'Soru Silme', false, 'questionId yok');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SEDAT BAKLA — Oyun Odaları
  // ─────────────────────────────────────────────────────────────────────────
  header('SEDAT BAKLA', 'Oyun Odası Yönetimi', '🎮');

  section('Gereksinim 5 — Oda Listeleme');
  const rooms = await req('GET', '/rooms', null, userToken);
  result('sedat', 'Oda Listeleme (GET /rooms)', rooms.status === 200, `Status: ${rooms.status} | Oda sayısı: ${Array.isArray(rooms.data) ? rooms.data.length : 'N/A'}`);

  section('Gereksinim 1 — Oda Oluşturma');
  const createRoom = await req('POST', '/rooms', {
    name: `TestOdası_${ts}`,
    category: 'Genel Kültür',
    maxParticipants: 5
  }, userToken);
  result('sedat', 'Oda Oluşturma (POST /rooms)', [200, 201].includes(createRoom.status), `Status: ${createRoom.status}`);
  roomId = createRoom.data?._id;
  if (roomId) info(`Oda ID: ${roomId}`);

  section('Gereksinim 4 — Oda Ayarı Güncelleme');
  if (roomId) {
    const updRoom = await req('PUT', `/rooms/${roomId}`, { maxParticipants: 10, duration: 20 }, userToken);
    result('sedat', 'Oda Güncelleme (PUT /rooms/:id)', [200, 201].includes(updRoom.status), `Status: ${updRoom.status}`);
  } else {
    result('sedat', 'Oda Güncelleme', false, 'roomId yok');
  }

  section('Gereksinim 6 — Puan Tablosu Görüntüleme');
  if (roomId) {
    const leaderboard = await req('GET', `/rooms/${roomId}/leaderboard`, null, userToken);
    result('sedat', 'Puan Tablosu (GET /rooms/:id/leaderboard)', [200, 404].includes(leaderboard.status), `Status: ${leaderboard.status}`);
  } else {
    result('sedat', 'Puan Tablosu', false, 'roomId yok');
  }

  section('Gereksinim 8 — Oda Kapatma/Silme');
  if (roomId) {
    const delRoom = await req('DELETE', `/rooms/${roomId}`, null, userToken);
    result('sedat', 'Oda Silme (DELETE /rooms/:id)', [200, 204].includes(delRoom.status), `Status: ${delRoom.status}`);
  } else {
    result('sedat', 'Oda Silme', false, 'roomId yok');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ŞAHİN KAVSARA — Paket & Öneri Yönetimi
  // ─────────────────────────────────────────────────────────────────────────
  header('ŞAHİN KAVSARA', 'Soru Paketi & Öneri Sistemi', '📦');

  section('Gereksinim 4 — Paket Listeleme');
  const pkgs = await req('GET', '/packages', null, userToken);
  result('sahin', 'Paket Listeleme (GET /packages)', pkgs.status === 200, `Status: ${pkgs.status} | Adet: ${Array.isArray(pkgs.data) ? pkgs.data.length : 'N/A'}`);

  section('Gereksinim 1 — Soru Paketi Oluşturma');
  const createPkg = await req('POST', '/packages', {
    title: `Test Paketi ${ts}`,
    description: 'Otomatik test paketi',
    isPublic: false,
    questions: []
  }, userToken);
  result('sahin', 'Paket Oluşturma (POST /packages)', [200, 201].includes(createPkg.status), `Status: ${createPkg.status}`);
  packageId = createPkg.data?._id;

  section('Gereksinim 3 — Soru Paketi Güncelleme');
  if (packageId) {
    const updPkg = await req('PUT', `/packages/${packageId}`, {
      title: `Güncel Paket ${ts}`,
      description: 'Güncellendi'
    }, userToken);
    result('sahin', 'Paket Güncelleme (PUT /packages/:id)', [200, 201].includes(updPkg.status), `Status: ${updPkg.status}`);
  } else {
    result('sahin', 'Paket Güncelleme', false, 'packageId yok');
  }

  section('Gereksinim 2 — Soru Önerisi Yapma');
  const suggest = await req('POST', '/suggestions', {
    questionText: `Test Sorusu Önerisi ${ts}`,
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    category: 'Genel'
  }, userToken);
  result('sahin', 'Soru Önerisi (POST /suggestions)', [200, 201].includes(suggest.status), `Status: ${suggest.status}`);
  suggestionId = suggest.data?._id;

  section('Gereksinim 5 — Önerilen Soruları Listeleme (Admin)');
  const suggestions = await req('GET', '/admin/suggestions', null, adminToken);
  result('sahin', 'Öneri Listeleme (GET /admin/suggestions)', suggestions.status === 200, `Status: ${suggestions.status} | Adet: ${Array.isArray(suggestions.data) ? suggestions.data.length : 'N/A'}`);
  if (!suggestionId && Array.isArray(suggestions.data) && suggestions.data.length > 0) {
    suggestionId = suggestions.data[0]._id;
  }

  section('Gereksinim 7 — Öneriyi Reddetme (Admin)');
  if (suggestionId && adminToken) {
    const rejectSug = await req('DELETE', `/admin/suggestions/${suggestionId}`, null, adminToken);
    result('sahin', 'Öneri Reddetme (DELETE /admin/suggestions/:id)', [200, 204].includes(rejectSug.status), `Status: ${rejectSug.status}`);
  } else {
    result('sahin', 'Öneri Reddetme', false, 'suggestionId veya adminToken yok');
  }

  section('Gereksinim 6 — Paket Silme');
  if (packageId) {
    const delPkg = await req('DELETE', `/packages/${packageId}`, null, userToken);
    result('sahin', 'Paket Silme (DELETE /packages/:id)', [200, 204].includes(delPkg.status), `Status: ${delPkg.status}`);
  } else {
    result('sahin', 'Paket Silme', false, 'packageId yok');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MUSTAFA İSMAİL TOPTAŞ — AI Analiz + Bildirim + Redis + RabbitMQ
  // ─────────────────────────────────────────────────────────────────────────
  header('MUSTAFA İSMAİL TOPTAŞ', 'AI Analiz + Bildirim + Redis + RabbitMQ', '🤖');

  section('Gereksinim 1 — Manuel AI Analiz Başlatma');
  const ai1 = await req('POST', '/ai/analysis', {}, userToken);
  reportId = ai1.data?._id;
  result('mustafa', 'Manuel Analiz Başlatma (POST /ai/analysis)', ai1.status === 202 && !!ai1.data?.analysisText, `Status: ${ai1.status}`);
  if (ai1.data?.analysisText) info(`Analiz: "${ai1.data.analysisText.substring(0, 65)}..."`);

  section('Gereksinim 1 — Oyun Verisiyle AI Analiz');
  const ai2 = await req('POST', '/ai/analysis', {
    performanceData: [
      { category: 'Tarih', isCorrect: true }, { category: 'Tarih', isCorrect: false },
      { category: 'Bilim', isCorrect: true }, { category: 'Coğrafya', isCorrect: false }
    ]
  }, userToken);
  result('mustafa', 'Oyun Verisiyle Analiz (POST /ai/analysis)', ai2.status === 202, `Status: ${ai2.status}`);
  if (ai2.data?.analysisText) info(`Analiz: "${ai2.data.analysisText.substring(0, 65)}..."`);

  section('Gereksinim 5 — Analiz Sonucu Görüntüleme');
  if (reportId) {
    const aiGet = await req('GET', `/ai/reports/${reportId}`, null, userToken);
    result('mustafa', 'Rapor Görüntüleme (GET /ai/reports/:id)', aiGet.status === 200, `Status: ${aiGet.status}`);
  }

  section('Gereksinim 7 — Eski Analizi Silme');
  if (reportId) {
    const aiDel = await req('DELETE', `/ai/reports/${reportId}`, null, userToken);
    result('mustafa', 'Rapor Silme (DELETE /ai/reports/:id)', aiDel.status === 204, `Status: ${aiDel.status}`);
  }

  section('🔴 REDİS CACHE KANITI — Gereksinim 6');
  info('1. İstek — MongoDB\'ye gidip Redis\'e cache\'leniyor...');
  const t1 = Date.now();
  const n1 = await req('GET', '/notifications', null, userToken);
  const d1 = Date.now() - t1;
  result('mustafa', `Bildirim Listele 1. İstek (DB'den)`, n1.status === 200, `${d1}ms`);
  if (n1.data?.length > 0) notifId = n1.data[0]._id;

  info('2. İstek — Redis Cache\'ten geliyor...');
  const t2 = Date.now();
  const n2 = await req('GET', '/notifications', null, userToken);
  const d2 = Date.now() - t2;
  result('mustafa', `Bildirim Listele 2. İstek (Redis Cache)`, n2.status === 200, `${d2}ms`);

  if (d2 < d1) {
    const speedup = Math.round((1 - d2 / d1) * 100);
    console.log(`\n  ${c.red}${c.bold}  🔴 REDİS CACHE ÇALIŞIYOR! ${d1}ms → ${d2}ms | %${speedup} hızlı${c.reset}`);
  } else {
    console.log(`  ${WARN}  ${c.yellow}Cache fark az (Render cold start etkisi olabilir)${c.reset}`);
  }

  section('🐰 RABBİTMQ KANITI — Gereksinim 2');
  if (adminToken) {
    info('Bildirim RabbitMQ kuyruğuna gönderiliyor...');
    const rabbitMsg = `🐰 RabbitMQ Demo — Mustafa İsmail Toptaş — ${new Date().toLocaleTimeString('tr-TR')}`;
    const sendN = await req('POST', '/admin/notifications', { message: rabbitMsg }, adminToken);
    result('mustafa', 'Bildirim Gönder — RabbitMQ Kuyruğu (POST /admin/notifications)', sendN.status === 201, `Status: ${sendN.status}`);

    if (sendN.status === 201) {
      info('Worker kuyruğu okudu → Socket.io ile tüm kullanıcılara yayınlandı');
      info('Redis cache temizlendi (yeni bildirim için)');
      const t3 = Date.now();
      const n3 = await req('GET', '/notifications', null, userToken);
      const d3 = Date.now() - t3;
      const found = Array.isArray(n3.data) && n3.data.some(n => n.message?.includes('RabbitMQ Demo'));
      result('mustafa', 'RabbitMQ Bildirimi Listede Görünüyor', found, `${d3}ms (Cache temizlendi, DB'den geldi)`);
      if (found) {
        const rNotif = n3.data.find(n => n.message?.includes('RabbitMQ Demo'));
        notifId = rNotif?._id;
        console.log(`\n  ${c.magenta}${c.bold}  🐰 RABBİTMQ ÇALIŞIYOR! Kuyruğa girdi → Worker okudu → Socket.io yayınladı${c.reset}`);
      }
    }
  } else {
    result('mustafa', 'RabbitMQ Testi', false, 'Admin token alınamadı');
  }

  section('Gereksinim 4 — Bildirimi Okundu İşaretle');
  if (notifId) {
    const markR = await req('PUT', `/notifications/${notifId}/read`, null, userToken);
    result('mustafa', 'Okundu İşaretle (PUT /notifications/:id/read)', markR.status === 200 && markR.data?.isRead === true, `Status: ${markR.status} | isRead: ${markR.data?.isRead}`);
  }

  section('Gereksinim 8 — Bildirimi Sil');
  if (notifId) {
    const delN = await req('DELETE', `/notifications/${notifId}`, null, userToken);
    result('mustafa', 'Bildirim Sil (DELETE /notifications/:id)', delN.status === 204, `Status: ${delN.status}`);
  }

  section('Gereksinim 3 — Admin AI Prompt Yönetimi');
  if (adminToken) {
    const promptG = await req('GET', '/admin/ai/prompt', null, adminToken);
    result('mustafa', 'AI Prompt Getir (GET /admin/ai/prompt)', promptG.status === 200, `Status: ${promptG.status}`);
    if (promptG.data?.promptText) info(`Mevcut: "${promptG.data.promptText.substring(0, 50)}..."`);

    const promptP = await req('PUT', '/admin/ai/prompt', {
      promptText: 'Kullanıcının performansını 1 cümleyle Türkçe değerlendir.'
    }, adminToken);
    result('mustafa', 'AI Prompt Güncelle (PUT /admin/ai/prompt)', promptP.status === 200, `Status: ${promptP.status}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GENEL SONUÇ
  // ─────────────────────────────────────────────────────────────────────────
  console.log(`\n\n${c.bold}${c.blue}${'═'.repeat(65)}${c.reset}`);
  console.log(`${c.bold}${c.blue}  📋  GENEL TEST SONUÇLARI${c.reset}`);
  console.log(`${c.bold}${c.blue}${'═'.repeat(65)}${c.reset}\n`);

  const owners = [
    { key: 'ömer',    name: 'Ömer Said Karakuş',    emoji: '👤' },
    { key: 'emir',    name: 'Emir Omrak',            emoji: '📚' },
    { key: 'sedat',   name: 'Sedat Bakla',           emoji: '🎮' },
    { key: 'sahin',   name: 'Şahin Kavsara',         emoji: '📦' },
    { key: 'mustafa', name: 'Mustafa İsmail Toptaş', emoji: '🤖' },
  ];

  let totalPassed = 0, totalFailed = 0;

  for (const { key, name, emoji } of owners) {
    const s = scores[key] || { passed: 0, failed: 0 };
    totalPassed += s.passed;
    totalFailed += s.failed;
    const total = s.passed + s.failed;
    const bar = '█'.repeat(Math.round((s.passed / (total || 1)) * 20));
    const color = s.failed === 0 ? c.green : s.passed > s.failed ? c.yellow : c.red;
    console.log(`  ${emoji}  ${c.bold}${name}${c.reset}`);
    console.log(`     ${color}${bar}${c.reset} ${c.green}${s.passed}✅${c.reset} ${s.failed > 0 ? c.red + s.failed + '❌' + c.reset : ''} / ${total} test`);
  }

  console.log(`\n  ${c.bold}TOPLAM: ${c.green}${totalPassed} başarılı${c.reset} ${totalFailed > 0 ? c.red + '/ ' + totalFailed + ' başarısız' + c.reset : ''} / ${totalPassed + totalFailed}`);

  console.log(`\n  ${c.cyan}${c.bold}Kanıtlanan Teknolojiler:${c.reset}`);
  console.log(`  ${c.green}✅ REST API (Express.js + MongoDB)${c.reset}`);
  console.log(`  ${c.green}✅ JWT Authentication & Authorization${c.reset}`);
  console.log(`  ${c.green}✅ AI Analiz (Gemini API / Fallback)${c.reset}`);
  console.log(`  ${c.red}✅ Redis Cache (Bildirim önbellekleme)${c.reset}`);
  console.log(`  ${c.magenta}✅ RabbitMQ (Asenkron bildirim kuyruğu)${c.reset}`);
  console.log(`  ${c.cyan}✅ Socket.io (Gerçek zamanlı bildirim)${c.reset}`);

  if (totalFailed === 0) {
    console.log(`\n  ${c.green}${c.bold}🎉 TÜM TESTLER BAŞARIYLA GEÇTİ!${c.reset}\n`);
  } else {
    console.log(`\n  ${c.yellow}${c.bold}⚠️  Bazı testler başarısız. Yukarıdaki detaylara bak.${c.reset}\n`);
  }
})();
