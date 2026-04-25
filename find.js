const fs = require('fs');

function findWebp(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.webp')) {
      console.log('Found webp:', dir + '/' + file);
    }
  }
}

findWebp('/public');
findWebp('/');
