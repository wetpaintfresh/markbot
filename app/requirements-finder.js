'use strict';

const path = require('path');
const exists = require('./file-exists');
const markbotMain = require('./markbot-main');
const screenshotNamingService = require('./checks/screenshots/naming-service');

let missingFiles = [];

const lockMarkbotFile = function (locker, markbotFile) {
  locker.lockString('markbot', JSON.stringify(markbotFile));
};

const lockMarkbotIgnoreFile = function (locker, markbotIgnoreFile) {
  locker.lockString('markbotignore', JSON.stringify(markbotIgnoreFile));
};

const lockFiles = function (locker, currentFolderPath, files) {
  files.forEach(function (file) {
    let filePath = path.resolve(currentFolderPath + '/' + file.path);

    if (!file.locked) return;

    if (!exists.check(filePath)) {
      missingFiles.push(file.path);
      return;
    }

    if (file.locked) locker.lockFile(file.path, filePath);
  });
};

const lockScreenshots = function (locker, currentFolderPath, files) {
  files.forEach(function (file) {
    let screenshotSizes = (Array.isArray(file.sizes)) ? file.sizes.slice(0) : Object.keys(file.sizes);

    screenshotSizes.forEach(function (size) {
      let screenshotFileName = screenshotNamingService.getScreenshotFilename(screenshotNamingService.makeScreenshotBasename(file), size);
      let screenshotPath = path.resolve(currentFolderPath + '/' + screenshotNamingService.REFERENCE_SCREENSHOT_FOLDER + '/' + screenshotFileName);

      if (!exists.check(screenshotPath)) {
        missingFiles.push(screenshotFileName);
        return;
      }

      locker.lockFile(screenshotFileName, screenshotPath);
    });
  });
};

const lock = function (locker, currentFolderPath, markbotFileParsed, markbotFile, markbotIgnoreFile) {
  missingFiles = [];
  locker.reset();

  lockMarkbotFile(locker, markbotFile);
  lockMarkbotIgnoreFile(locker, markbotIgnoreFile);

  if (markbotFile.html) lockFiles(locker, currentFolderPath, markbotFile.html);
  if (markbotFile.css) lockFiles(locker, currentFolderPath, markbotFile.css);
  if (markbotFile.js) lockFiles(locker, currentFolderPath, markbotFile.js);
  if (markbotFile.screenshots) lockScreenshots(locker, currentFolderPath, markbotFile.screenshots);
  if (markbotFileParsed.screenshots) lockScreenshots(locker, currentFolderPath, markbotFileParsed.screenshots);

  missingFiles = [...new Set(missingFiles)];

  if (missingFiles.length > 0) {
    markbotMain.send('alert', `The following files could not be locked because they’re missing:\n• ${missingFiles.join('\n• ')}`);
  }
};

module.exports = {
  lock: lock
};
