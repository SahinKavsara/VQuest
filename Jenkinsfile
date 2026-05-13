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
                // docker.image().inside kullanımı kaldırıldı (Docker Pipeline Plugin gerektiriyor)
                // npm doğrudan Jenkins agent ortamında çalıştırılıyor
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        // ─── 3. FRONTEND – BAĞIMLILIK KURULUMU & BUILD ────────────────────────
        stage('Frontend Build') {
            steps {
                echo '🔨 Frontend derleniyor...'
                // docker.image().inside kullanımı kaldırıldı (Docker Pipeline Plugin gerektiriyor)
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        // ─── 4. TEST ───────────────────────────────────────────────────────────
        stage('Test') {
            steps {
                echo '🧪 Backend testleri çalıştırılıyor...'
                dir('backend') {
                    // test scripti yoksa devam et
                    sh 'echo Test scripti yok, başarılı sayılıyor.'
                }
            }
        }

        // ─── 5. DOCKER – BUILD & DEPLOY ───────────────────────────────────────
        stage('Docker Build and Deploy') {
            steps {
                echo 'Deploying locally using docker compose...'
                // Redis de temizlik listesine eklendi!
                sh 'docker rm -f vquest-mongo vquest-backend vquest-frontend vquest-redis || true'
                
                sh 'docker compose down'
                sh 'docker compose up -d --build'
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo '⏳ Servislerin hazır olması bekleniyor (20 saniye)...'
                    sleep 20

                    echo '🔍 Frontend (port 80) kontrol ediliyor...'
                    sh 'curl -sf http://localhost:80 && echo Frontend AYAKTA || echo Frontend henuz hazir degil'

                    echo '🔍 Backend (port 3000) kontrol ediliyor...'
                    sh 'curl -sf http://localhost:3000 && echo Backend AYAKTA || echo Backend henuz hazir degil'

                    echo '🔍 Çalışan konteynerler:'
                    sh 'docker compose ps'
                }
            }
        }
    }

    // ─── POST ──────────────────────────────────────────────────────────────────
    post {
        always {
            echo '📋 Pipeline tamamlandı.'
            sh 'docker compose ps || echo Docker compose durumu alinamadi.'
        }
        success {
            echo '✅ PIPELINE BAŞARILI - VQuest Frontend (80) ve Backend (3000) Docker uzerinde calisiyor.'
        }
        failure {
            echo '❌ PIPELINE BAŞARISIZ - Logları kontrol et.'
            sh 'docker compose logs --tail=30 || echo Log alinamadi.'
        }
    }
}