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

                    IMAGE_VERSION = "${PROJECT_NAME}:${CI_COMMIT_SHORT_SHA}"
                }
            }
        }

        stage('build') {
            agent {
                label 'development-agent'
            }
            steps {
                script {
                    sh(script: """ docker build -t ${IMAGE_VERSION} . """, label: "")
                }
            }
        }

        stage('push to registry') {
            agent {
                label 'development-agent'
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${REGISTRY_CREDENTIALS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                            sh "docker login ${REGISTRY_URL} -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}"

                            sh "docker tag ${IMAGE_VERSION} ${REGISTRY_URL}/${USER_PROJECT}/${IMAGE_VERSION}"
                            sh "docker push ${REGISTRY_URL}/${USER_PROJECT}/${IMAGE_VERSION}"
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
                        sudo su ${USER_PROJECT} -c "docker rm -f $PROJECT_NAME; docker run --name $PROJECT_NAME -dp 3030:3030 ${REGISTRY_URL}/${USER_PROJECT}/${IMAGE_VERSION}"
                        docker logout ${REGISTRY_URL}
                        pwd
                    """, label: "")
                }
            }
        }

        // stage('deploy') {
        //     agent {
        //         label 'development-agent'
        //     }
        //     steps {
        //         script {
        //             withCredentials([usernamePassword(credentialsId: "${REGISTRY_CREDENTIALS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
        //                 sh "docker login ${REGISTRY_URL} -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}"

        //                 sh(script: """
        //                     docker pull ${REGISTRY_URL}/${USER_PROJECT}/${IMAGE_VERSION}
        //                     sudo su ${USER_PROJECT} -c "docker rm -f $PROJECT_NAME; docker run --name $PROJECT_NAME -dp 3030:3030 ${REGISTRY_URL}/${USER_PROJECT}/${IMAGE_VERSION}"
        //                     docker logout ${REGISTRY_URL}
        //                 """, label: "")
        //             }
        //         }
        //     }
        // }

    }
}