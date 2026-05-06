import Redis from 'ioredis';
import crypto from 'crypto'; // UUID oluşturmak için Node.js'in gömülü modülü

// Redis bağlantısını başlat (Ayarlar docker-compose yapınıza uyumlu)
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/* =========================================
   SORULAR (QUESTIONS) SERVİSİ
   ========================================= */

// 1. Tüm soruları getir
export async function getAllQuestions() {
  const questionsHash = await redis.hgetall('questions');
  // questionsHash formatı: { "id1": "{...}", "id2": "{...}" }
  // Object.values ile sadece değerleri alıp JSON formatına dönüştürüyoruz
  return Object.values(questionsHash).map(item => JSON.parse(item));
}

// 2. Yeni soru ekle
export async function addQuestion(questionData) {
  const id = crypto.randomUUID();
  const dataToSave = { id, ...questionData };
  
  await redis.hset('questions', id, JSON.stringify(dataToSave));
  return dataToSave;
}

// 3. Mevcut soruyu güncelle
export async function updateQuestion(id, updatedData) {
  const dataToSave = { id, ...updatedData };
  
  // Aynı id (field) üzerine yazarak güncellemeyi sağlar
  await redis.hset('questions', id, JSON.stringify(dataToSave));
  return dataToSave;
}

// 4. Soruyu sil
export async function deleteQuestion(id) {
  await redis.hdel('questions', id);
  return { success: true, message: `Soru ${id} başarıyla silindi.` };
}

/* =========================================
   KATEGORİLER (CATEGORIES) SERVİSİ
   ========================================= */

// 1. Tüm kategorileri getir
export async function getAllCategories() {
  const categoriesHash = await redis.hgetall('categories');
  return Object.values(categoriesHash).map(item => JSON.parse(item));
}

// 2. Yeni kategori ekle
export async function addCategory(categoryData) {
  const id = crypto.randomUUID();
  const dataToSave = { id, ...categoryData };
  
  await redis.hset('categories', id, JSON.stringify(dataToSave));
  return dataToSave;
}

// 3. Mevcut kategoriyi güncelle
export async function updateCategory(id, updatedData) {
  const dataToSave = { id, ...updatedData };
  
  await redis.hset('categories', id, JSON.stringify(dataToSave));
  return dataToSave;
}
