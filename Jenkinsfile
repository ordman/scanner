 pipeline {
     agent {
         docker { image 'node:12.18.3' }
     }
     stages {
         stage('Install dependencies') {
             steps {
                 sh 'yarn install'
             }
         }
         stage('Run test') {
             steps {
                 sh 'yarn test'
             }
         }
         stage('Build es5 package') {
             steps {
                 sh 'yarn build-browser'
             }
         }
         stage('Delivery') {
             steps {
                 cifsPublisher(publishers: [[configName: 'JenkinsBuilds(raptor)', retry: [retries: 1, retryDelay: 10000], transfers: [[cleanRemote: true, excludes: '', flatten: false, makeEmptyDirs: true, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: 'js/mdlp/scanner', remoteDirectorySDF: false, removePrefix: '', sourceFiles: 'demo/*, dist/*, es5/*, package.json, README.md']], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: true]])
             }
         }
     }
 }
