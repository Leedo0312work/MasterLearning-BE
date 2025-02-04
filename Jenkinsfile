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
    }
    stages {
        stage("get information project") {
            agent {
                label "development-agent"
            }
            steps {
                script {
                    CI_PROJECT_NAME = sh(script: "git config --get remote.origin.url | sed 's/.*\\(\\/\\([a-zA-Z0-9_-]*\\)\\.git\\)/\\2/'", returnStdout: true).trim()

                    def CI_COMMIT_HASH = sh(script: "git rev-parse HEAD", returnStdout: true).trim()
                    CI_COMMIT_SHORT_SHA = CI_COMMIT_HASH.take(8)

                    IMAGE_VERSION = "${USER_PROJECT}/${PROJECT_NAME}:${CI_COMMIT_SHORT_SHA}"
                }
            }
        }

        stage("build") {
            agent {
                label "development-agent"
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${REGISTRY_CREDENTIALS}", passwordVariable: "DOCKER_PASSWORD", usernameVariable: "DOCKER_USERNAME")]) {
                        sh "docker pull ${REGISTRY_URL}/${USER_PROJECT}/${PROJECT_NAME}:latest || true"
                        sh "docker build --cache-from ${REGISTRY_URL}/${USER_PROJECT}/${PROJECT_NAME}:latest --tag ${REGISTRY_URL}/${IMAGE_VERSION} ."
                        
                        sh "docker login ${REGISTRY_URL} -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}"
                        sh "docker push ${REGISTRY_URL}/${IMAGE_VERSION} "
                        sh "docker logout"
                    }
                }
            }
        }

        stage("release tag") {
            agent {
                label "development-agent"
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${REGISTRY_CREDENTIALS}", passwordVariable: "DOCKER_PASSWORD", usernameVariable: "DOCKER_USERNAME")]) {
                        sh "docker login ${REGISTRY_URL} -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}"
                        
                        sh "docker pull ${REGISTRY_URL}/${IMAGE_VERSION}"
                        
                        sh "docker tag ${REGISTRY_URL}/${IMAGE_VERSION} ${REGISTRY_URL}/${USER_PROJECT}/${PROJECT_NAME}:latest"
                        sh "docker push ${REGISTRY_URL}/${USER_PROJECT}/${PROJECT_NAME}:latest"
                        sh "docker logout"
                    }
                }
            }
        }

        stage("deploy") {
            agent {
                label "development-agent"
            }
            steps {
                script {
                    sh(script: """
                        cd /home/project/workspace/masterlearning
                        docker compose down
                        sleep 5
                        docker-compose up -d
                    """, label: "Deploy with Docker Compose")
                }
            }
        }
    }
}