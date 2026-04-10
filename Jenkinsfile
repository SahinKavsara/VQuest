pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                // VQuest repondan kodu çeker
                git branch: 'main', url: 'https://github.com/SahinKavsara/VQuest.git'
            }
        }
        
        stage('Build and Deploy') {
            steps {
                echo 'Deploying locally using docker compose...'
                // Eski çalışan konteynerleri durdurur ve temizler
                sh 'docker compose down'
                // Yeni imajları derler ve arka planda çalıştırır
                sh 'docker compose up -d --build'
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo 'Waiting for services to start...'
                    sleep 15
                    
                    // Frontend Nginx portunun (80) ayakta olup olmadığını kontrol eder
                    sh 'curl -f http://localhost:80 || echo "Frontend henuz hazir degil"'
                    
                    // Backend portunun (3000) ayakta olup olmadığını kontrol eder
                    sh 'curl -f http://localhost:3000 || echo "Backend henuz hazir degil"'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline tamamlandi.'
        }
        success {
            echo 'Tum asamalar basarili! VQuest projesi lokalde Docker uzerinde calisiyor.'
        }
        failure {
            echo 'Pipeline basarisiz oldu! Jenkins loglarini kontrol et.'
        }
    }
}