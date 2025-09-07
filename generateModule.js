const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const pluralize = require('pluralize'); // Import pluralize for proper pluralization

const moduleName = process.argv[2];
const mode = process.argv[3] === 's' ? 's' : 'p'; // 's' for singular, 'p' for plural (default)
if (!moduleName) {
  console.error('Please provide a module name.');
  process.exit(1);
}

let targetName;
if (mode === 's') {
  targetName = pluralize.singular(moduleName);
} else {
  targetName = pluralize(moduleName);
}

try {
  console.log(`Generating module: ${targetName}`);
  execSync(`npx nest g module ${targetName}`, { stdio: 'inherit' });

  console.log(`Generating controller: ${targetName}`);
  execSync(`npx nest g co ${targetName} --no-spec`, { stdio: 'inherit' });

  console.log(`Generating service: ${targetName}`);
  execSync(`npx nest g service ${targetName}/providers/${targetName} --no-spec --flat`, {
    stdio: 'inherit',
  });

  // Generate folders for dtos, enums, interfaces, constants
  const baseDir = path.join(process.cwd(), 'src', targetName);
  const folders = ['dtos', 'enums', 'interfaces', 'constants'];
  folders.forEach(folder => {
    const folderPath = path.join(baseDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(`Created folder: ${folderPath}`);
    }
  });

  console.log('Module generation completed successfully.');
} catch (error) {
  console.error('An error occurred during module generation:', error.message);
  process.exit(1);
}
