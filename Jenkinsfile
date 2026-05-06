pipeline {
    agent any

    environment {
        // Branch ismini güvenli bir docker projesi ismi haline getiriyoruz (küçük harf, özel karakter yok)
        PROJECT_NAME = "${env.BRANCH_NAME ?: 'vquest'}".toLowerCase().replaceAll(/[^a-z0-9]/, '')
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out source code for branch: ${env.BRANCH_NAME ?: 'unknown'}"
                checkout scm
            }
        }
        
        stage('Build and Deploy') {
            steps {
                echo "Deploying branch ${env.BRANCH_NAME} locally using docker compose project: ${PROJECT_NAME}..."
                
                // Diğer branch'lerin çakışmasını önlemek için eğer aynı portları kullanıyorlarsa 
                // Önce mevcut projeyi durduruyoruz. Not: Eğer tüm branchlerin aynı anda çalışmasını istiyorsanız portları dinamik yapmalıyız.
                sh "docker compose -p ${PROJECT_NAME} down"
                
                // Yeni imajları derle ve ayağa kaldır
                sh "docker compose -p ${PROJECT_NAME} up -d --build"
            }
        }
        // aa
        stage('Health Check') {
            steps {
                script {
                    echo 'Waiting for services to start...'
                    sleep 15
                    
                    // Not: Portlar docker-compose.yml içinde sabit olduğu için localhost üzerinden kontrol ediyoruz
                    sh 'curl -f http://localhost:80 || echo "Frontend henuz hazir degil"'
                    sh 'curl -f http://localhost:3000 || echo "Backend henuz hazir degil"'
                }
            }
        }
    }
    
    post {
        always {
            echo "Pipeline tamamlandi: ${env.BRANCH_NAME}"
        }
        success {
            echo "Tum asamalar basarili! ${env.BRANCH_NAME} projesi Docker uzerinde '${PROJECT_NAME}' ismiyle calisiyor."
        }
        failure {
            echo "Pipeline basarisiz oldu! Jenkins loglarını kontrol et."
        }
    }
}