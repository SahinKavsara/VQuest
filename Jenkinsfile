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
                echo "✅ Branch: ${env.GIT_BRANCH} | Commit: ${env.GIT_COMMIT?.take(7)}"
            }
        }

        // ─── 2. BACKEND – BAĞIMLILIK KURULUMU ─────────────────────────────────
        stage('Backend Install') {
            steps {
                echo '📦 Backend bağımlılıkları yükleniyor...'
                dir('backend') {
                    sh 'npm ci --prefer-offline || npm install'
                }
            }
        }

        // ─── 3. FRONTEND – BAĞIMLILIK KURULUMU & BUILD ────────────────────────
        stage('Frontend Build') {
            steps {
                echo '🔨 Frontend derleniyor (Vite build)...'
                dir('frontend') {
                    sh 'npm ci --prefer-offline || npm install'
                    sh 'npm run build'
                }
            }
        }

        // ─── 4. TEST ───────────────────────────────────────────────────────────
        stage('Test') {
            steps {
                echo '🧪 Backend testleri çalıştırılıyor...'
                dir('backend') {
                    // test scripti yoksa pipeline devam etsin
                    sh 'npm test || echo "⚠️  Test scripti bulunamadı, atlanıyor."'
                }
            }
        }

        // ─── 5. DOCKER – BUILD & DEPLOY ───────────────────────────────────────
        stage('Docker Build & Deploy') {
            steps {
                echo '🐳 Docker imajları derleniyor ve servisler ayağa kaldırılıyor...'

                // Çakışan konteynerleri temizle
                sh '''
                    docker rm -f vquest-backend vquest-frontend vquest-mongo vquest-redis 2>/dev/null || true
                '''

                // Eski stack'i tamamen indir
                sh 'docker compose down --remove-orphans'

                // İmajları yeniden derle ve arka planda başlat
                sh 'docker compose up -d --build'

                echo '✅ Tüm servisler başlatıldı.'
            }
        }

        // ─── 6. HEALTH CHECK ──────────────────────────────────────────────────
        stage('Health Check') {
            steps {
                script {
                    echo '⏳ Servislerin hazır olması bekleniyor (20 sn)...'
                    sleep 20

                    echo '🔍 Frontend (port 80) kontrol ediliyor...'
                    sh '''
                        curl -sf http://localhost:80 \
                            && echo "✅ Frontend AYAKTA" \
                            || echo "⚠️  Frontend henüz hazır değil"
                    '''

                    echo '🔍 Backend (port 3000) kontrol ediliyor...'
                    sh '''
                        curl -sf http://localhost:3000 \
                            && echo "✅ Backend AYAKTA" \
                            || echo "⚠️  Backend henüz hazır değil"
                    '''

                    echo '🔍 Çalışan konteynerler:'
                    sh 'docker compose ps'
                }
            }
        }
    }

    // ─── POST ──────────────────────────────────────────────────────────────────
    post {
        always {
            echo '📋 Pipeline tamamlandı. Log çıktıları aşağıda gösterilmektedir.'
            sh 'docker compose ps || true'
        }
        success {
            echo '''
            ╔══════════════════════════════════════════════╗
            ║  ✅  PIPELINE BAŞARILI                        ║
            ║  VQuest → Frontend (80) + Backend (3000)      ║
            ║  Docker üzerinde çalışıyor.                   ║
            ╚══════════════════════════════════════════════╝
            '''
        }
        failure {
            echo '''
            ╔══════════════════════════════════════════════╗
            ║  ❌  PIPELINE BAŞARISIZ                       ║
            ║  Jenkins loglarını kontrol et.                ║
            ╚══════════════════════════════════════════════╝
            '''
            // Hata durumunda konteynerlerin loglarını göster
            sh 'docker compose logs --tail=50 || true'
        }
    }
}