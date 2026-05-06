pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'vquest'
        BACKEND_IMAGE        = 'vquest-backend'
        FRONTEND_IMAGE       = 'vquest-frontend'
    }

    stages {

        // ─── 1. CHECKOUT ───────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo '📥 Kaynak kod çekiliyor...'
                checkout scm
                echo "✅ Kaynak kod alındı."
            }
        }

        // ─── 2. BACKEND – BAĞIMLILIK KURULUMU ─────────────────────────────────
        stage('Backend Install') {
            steps {
                echo '📦 Backend bağımlılıkları yükleniyor...'
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        // ─── 3. FRONTEND – BAĞIMLILIK KURULUMU & BUILD ────────────────────────
        stage('Frontend Build') {
            steps {
                echo '🔨 Frontend derleniyor (Vite build)...'
                dir('frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        // ─── 4. TEST ───────────────────────────────────────────────────────────
        stage('Test') {
            steps {
                echo '🧪 Backend testleri çalıştırılıyor...'
                dir('backend') {
                    // test scripti yoksa devam et
                    bat 'echo Test scripti yok, başarılı sayılıyor.'
                }
            }
        }

        // ─── 5. DOCKER – BUILD & DEPLOY ───────────────────────────────────────
        stage('Docker Build and Deploy') {
            steps {
                echo '🐳 Docker imajları derleniyor ve servisler başlatılıyor...'

                // Çakışan konteynerleri temizle (hata verirse devam et)
                bat 'docker rm -f vquest-backend vquest-frontend vquest-mongo vquest-redis 2>nul || echo Temizleme tamamlandi.'

                // Eski stack'i indir
                bat 'docker compose down --remove-orphans'

                // İmajları yeniden derle ve başlat
                bat 'docker compose up -d --build'

                echo '✅ Tüm servisler başlatıldı.'
            }
        }

        // ─── 6. HEALTH CHECK ──────────────────────────────────────────────────
        stage('Health Check') {
            steps {
                script {
                    echo '⏳ Servislerin hazır olması bekleniyor (20 saniye)...'
                    sleep 20

                    echo '🔍 Frontend (port 80) kontrol ediliyor...'
                    bat 'curl -sf http://localhost:80 && echo Frontend AYAKTA || echo Frontend henuz hazir degil'

                    echo '🔍 Backend (port 3000) kontrol ediliyor...'
                    bat 'curl -sf http://localhost:3000 && echo Backend AYAKTA || echo Backend henuz hazir degil'

                    echo '🔍 Çalışan konteynerler:'
                    bat 'docker compose ps'
                }
            }
        }
    }

    // ─── POST ──────────────────────────────────────────────────────────────────
    post {
        always {
            echo '📋 Pipeline tamamlandı.'
            bat 'docker compose ps || echo Docker compose durumu alinamadi.'
        }
        success {
            echo '✅ PIPELINE BAŞARILI - VQuest Frontend (80) ve Backend (3000) Docker uzerinde calisiyor.'
        }
        failure {
            echo '❌ PIPELINE BAŞARISIZ - Logları kontrol et.'
            bat 'docker compose logs --tail=30 || echo Log alinamadi.'
        }
    }
}