const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.jsx') || dirFile.endsWith('.js')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src/pages'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('../../../services/api')) {
    content = content.replace(/\.\.\/\.\.\/\.\.\/services\/api/g, '../../services/api');
    changed = true;
  }
  if (content.includes('../../../components/common')) {
    content = content.replace(/\.\.\/\.\.\/\.\.\/components\/common/g, '../../components/common');
    changed = true;
  }
  if (content.includes('../../../context/AuthContext')) {
    content = content.replace(/\.\.\/\.\.\/\.\.\/context\/AuthContext/g, '../../context/AuthContext');
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed paths in', file);
  }
});
console.log('Done fixing paths');
