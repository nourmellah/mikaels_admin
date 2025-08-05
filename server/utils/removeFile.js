const fs   = require('fs');
const path = require('path');

/**
 * Given a URL like '/uploads/12345-67890.png',
 * resolve it into your disk path and unlink it.
 */
function removeFile(fileUrl) {
  if (!fileUrl) return;
  const filename = path.basename(fileUrl);
  const filepath = path.join(__dirname, '../uploads', filename);
  fs.unlink(filepath, err => {
    if (err && err.code !== 'ENOENT') {
      console.error(`Failed to delete file ${filepath}`, err);
    }
  });
}

module.exports = removeFile;
