const { exec } = require("child_process")

exec(
  `
    rimraf ./VueDevTools\\ Extension/Resources/* && 
    cp -r ../shell-chrome/build ../shell-chrome/icons ../shell-chrome/popups ../shell-chrome/devtools-background.html ../shell-chrome/devtools.html ../shell-chrome/manifest.json ./VueDevTools\\ Extension/Resources/ && 
    xcodebuild -scheme VueDevTools -archivePath ./archive archive &&
    xcodebuild -exportArchive -archivePath ./archive.xcarchive -exportPath ../../dist/safari -exportOptionsPlist ./exportOptions.plist
`,
  (error, stdout, stderr) => {
    if (error) {
      console.log(error);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  }
);

// TODO PERSONAL SIGN

// rimraf ./app/'VueDevTools Extension'/Resources/* && cp -r build icons popups devtools-background.html devtools.html manifest.json ./app/'VueDevTools Extension'/Resources/
// cd ./app && xcodebuild -scheme VueDevTools -archivePath ./archive archive
// cd ./app && xcodebuild -exportArchive -archivePath ./archive.xcarchive -exportPath ../../dist/safari -exportOptionsPlist ./exportOptions.plist
