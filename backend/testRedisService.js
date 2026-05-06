import { addQuestion, getAllQuestions, updateQuestion, deleteQuestion } from './services/redisDataService.js';

async function runTests() {
  console.log("RabbitMQ bağlantısının kurulması için 1 saniye bekleniyor...");
  await new Promise(resolve => setTimeout(resolve, 1500));
  console.log("\n=== REDIS SERVİS TESTİ BAŞLIYOR ===\n");

  // 1. Ekleme Testi
  console.log("1. Yeni Soru Ekleniyor...");
  const newQuestion = await addQuestion({
    title: "Dünyanın en yüksek dağı hangisidir?",
    options: ["K2", "Everest", "Ağrı"],
    correctAnswer: "Everest"
  });
  console.log("✅ Eklendi:", newQuestion);
  console.log("------------------------------------------");

  // 2. Getirme Testi
  console.log("2. Tüm Sorular Getiriliyor...");
  let allQuestions = await getAllQuestions();
  console.log("📖 Mevcut Sorular:", allQuestions);
  console.log("------------------------------------------");

  // 3. Güncelleme Testi
  console.log("3. Soru Güncelleniyor...");
  const updatedQuestion = await updateQuestion(newQuestion.id, {
    title: "Dünyanın en yüksek dağı hangisidir? (Güncellendi)",
    options: ["K2", "Everest", "Ağrı", "Alpler"],
    correctAnswer: "Everest"
  });
  console.log("🔄 Güncellendi:", updatedQuestion);
  console.log("------------------------------------------");

  // 4. Silme Testi
  console.log("4. Soru Siliniyor...");
  const deleteResult = await deleteQuestion(newQuestion.id);
  console.log("🗑️ Silme İşlemi:", deleteResult);
  console.log("------------------------------------------");

  // 5. Son Kontrol
  console.log("5. Silme İşlemi Sonrası Liste Kontrolü...");
  allQuestions = await getAllQuestions();
  console.log("✨ Kalan Sorular:", allQuestions);

  console.log("\n=== TEST BAŞARIYLA TAMAMLANDI ===");
  process.exit(0);
}

runTests().catch(err => {
  console.error("❌ Test sırasında hata oluştu:", err);
  process.exit(1);
});
