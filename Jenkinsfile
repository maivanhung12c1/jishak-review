namespace = "production"
serviceName = "jishak-review"
serevice = "Jishak Reviews"

pineline {
    agent {
        label 'Jenkins-Agent'
    }

    tools {
        nodejs 'NodeJS'
        dockerTool 'Docker'
    }

    environment {
        DOCKER_CREDENTIALS = credentials('dockerhub')
        IMAGE_NAME = "mvhung12c1/jishak-review"
        IMAGE_TAG = "stable-${BUILD_NUMBER}"
    }

    stages {
        stage("Cleanup Workspace") {
            steps {
                cleanWs()
            }
        }
        stage("Prepare Environment") {
            steps {
                git branch: 'main', credentialsId: 'github', url: 'https://github.com/maivanhung12c1/jishak-review'
                sh 'npm install'
            }
        }
    }
}