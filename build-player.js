#!/usr/bin/env node

const path = require('path')
const sh = require('shelljs')
const tmp = require('tmp')
const commitish = process.argv[2]

if (!commitish) {
  console.error('Usage: ./build-player.js <commitish>')
  process.exit(1)
}

const REPO_URL = 'git@github.com:Versal/playa.git'

const tempPath = tmp.dirSync().name
const playaPath = `${tempPath}/playa`

sh.exec(`git clone ${REPO_URL} ${playaPath}`)
sh.cd(playaPath)

sh.exec(`git checkout ${commitish}`)
sh.exec('npm install')
sh.exec('bower install')

sh.exec(`npm run build`)
const shortSha = sh.exec(`git rev-parse HEAD`).stdout.trim().slice(0, 6)

try {
  sh.exec('git checkout gh-pages')
} catch(e) {
  sh.exec('git checkout -b gh-pages')
}

sh.cd(__dirname)

const commitsPath = `${__dirname}/commits`
sh.mkdir('-p', commitsPath)

sh.rm('-rf', `${commitsPath}/${shortSha}`)
sh.cp('-r', `${playaPath}/dist`, `${commitsPath}/${shortSha}`)
sh.rm('-rf', `${__dirname}/bower_components`)
sh.cp('-r', `${playaPath}/bower_components`, `${__dirname}/bower_components`)

sh.exec('git add ./commits')
const commitMessage = `Added commit ${shortSha}\n\nRequested: ${commitish}`
sh.exec(`git commit -m\"${commitMessage}\"`)
