const { exec } = require('child_process')

exec(
  `
    rimraf ./VueDevTools\\ Extension/Resources/* && 
    cp -r ../shell-chrome/build ../shell-chrome/icons ../shell-chrome/popups ../shell-chrome/devtools-background.html ../shell-chrome/devtools.html ../shell-chrome/manifest.json ./VueDevTools\\ Extension/Resources/ && 
    xcodebuild archive -scheme VueDevTools -archivePath ./archive &&
    xcodebuild -exportArchive -archivePath ./archive.xcarchive -exportPath ../../dist/safari -exportOptionsPlist ./exportOptions.plist
`)
