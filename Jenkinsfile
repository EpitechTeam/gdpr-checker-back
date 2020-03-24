node {
  try {
    stage('Checkout') {
      checkout scm
    }
    stage('Environment') {
      sh 'git --version'
      echo "Branch: ${env.BRANCH_NAME}"
      sh 'docker -v'
      sh 'export NODE_ENV=production'
      sh 'printenv'
    }
    stage('Build') {
      if (env.BRANCH_NAME == 'master') {
        sh 'docker-compose build'
      }
    }
    stage('Deploy'){
      if (env.BRANCH_NAME == 'master'){
        sh 'docker-compose up -d'
      }
    }
  }
  catch (err) {
    throw err
  }
}