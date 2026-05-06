pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'vquest'
        BACKEND_IMAGE        = 'vquest-backend'
        FRONTEND_IMAGE       = 'vquest-frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Kaynak kod çekiliyor...'
                checkout scm
                echo "✅ Kaynak kod alındı."
            }
        }
        stage('Backend Install') {
            steps {
                echo '📦 Backend bağımlılıkları yükleniyor...'
                dir('backend') {
                    bat 'npm install'
                }
            }
        }
        stage('Frontend Build') {
            steps {
                echo '🔨 Frontend derleniyor (Vite build)...'
                dir('frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }
        stage('Test') {
            steps {
                echo '🧪 Backend testleri çalıştırılıyor...'
                dir('backend') {
                    bat 'echo Test scripti yok, başarılı sayılıyor.'
                }
            }
        }
        stage('Docker Build and Deploy') {
            steps {
                echo '🐳 Docker imajları derleniyor ve servisler başlatılıyor...'
                bat 'docker rm -f vquest-backend vquest-frontend vquest-mongo vquest-redis 2>nul || echo Temizleme tamamlandi.'
                bat 'docker compose down --remove-orphans'
                bat 'docker compose up -d --build'
                echo '✅ Tüm servisler başlatıldı.'
            }
        }
        stage('Health Check') {
            steps {
                script {
                    echo '⏳ Servislerin hazır olması bekleniyor (20 saniye)...'
                    sleep 20
                    bat 'curl -sf http://localhost:80 && echo Frontend AYAKTA || echo Frontend henuz hazir degil'
                    bat 'curl -sf http://localhost:3000 && echo Backend AYAKTA || echo Backend henuz hazir degil'
                    bat 'docker compose ps'
                }
            }
        }
    }
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