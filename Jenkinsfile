pipeline {
    agent none
    environment {
        USER_PROJECT = "masterlearning"
        PROJECT_NAME = "masterlearning-be"
        CI_CIMMIT_SHORT_SHA = ""
        CI_PROJECT_NAME = ""
        IMAGE_VERSION = ""

        REGISTRY_URL = "registry.leedowork.id.vn"
        REGISTRY_CREDENTIALS = "harbor-registry-user"
        ENV_FILE = "env-masterlearning-be"
    }
    stages {
        stage('get information project') {
            agent {
                label 'development-agent'
            }
            steps {
                script {
                    withCredentials([file(credentialsId: "${ENV_FILE}", variable: 'ENV_FILE_PATH')]) {
                        sh "cp ${ENV_FILE_PATH} .env" 
                    }
                    CI_PROJECT_NAME = sh(script: "git config --get remote.origin.url | sed 's/.*\\(\\/\\([a-zA-Z0-9_-]*\\)\\.git\\)/\\2/'", returnStdout: true).trim()

                    def CI_COMMIT_HASH = sh(script: "git rev-parse HEAD", returnStdout: true).trim()
                    CI_COMMIT_SHORT_SHA = CI_COMMIT_HASH.take(8)

                    IMAGE_VERSION = "${USER_PROJECT}/${PROJECT_NAME}:${CI_COMMIT_SHORT_SHA}"
                    
                }
            }
        }

        stage('build') {
            agent {
                label 'development-agent'
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${REGISTRY_CREDENTIALS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh 'docker pull ${REGISTRY_URL}/${USER_PROJECT}/${PROJECT_NAME}:latest || true'
                        sh 'docker build --cache-from ${REGISTRY_URL}/${USER_PROJECT}/${PROJECT_NAME}:latest --tag ${IMAGE_VERSION} .'
                        sh 'docker push ${REGISTRY_URL}/${IMAGE_VERSION} '
                    }
                }
            }
        }

        stage('tag latest') {
            agent {
                label 'development-agent'
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${REGISTRY_CREDENTIALS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh "docker login ${REGISTRY_URL} -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}"
                        
                        sh "docker pull ${REGISTRY_URL}/${IMAGE_VERSION}"
                        
                        sh "docker tag ${REGISTRY_URL}/${IMAGE_VERSION} ${REGISTRY_URL}/${USER_PROJECT}/${PROJECT_NAME}:latest"
                        sh "docker push ${REGISTRY_URL}/${USER_PROJECT}/${PROJECT_NAME}:latest"
                    }
                }
            }
        }

        stage('deploy') {
            agent {
                label 'development-agent'
            }
            steps {
                script {
                    sh(script: """
                        pwd
                        cd ../
                        pwd
                        docker-compose -f docker-compose.yml up --build -d
                    """, label: "Deploy with Docker Compose")
                }
            }
        }
    }
}
