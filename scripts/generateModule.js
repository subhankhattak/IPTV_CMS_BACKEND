const { execSync } = require('child_process');

const moduleName = process.argv[2];
if (!moduleName) {
  console.error('Please provide a module name.');
  process.exit(1);
}

const pluralizedName = `${moduleName}s`;

try {
  console.log(`Generating module: ${pluralizedName}`);
  execSync(`npx nest g module ${pluralizedName}`, { stdio: 'inherit' });

  console.log(`Generating controller: ${pluralizedName}`);
  execSync(`npx nest g co ${pluralizedName} --no-spec`, { stdio: 'inherit' });

  console.log(`Generating service: ${pluralizedName}`);
  execSync(
    `npx nest g service ${pluralizedName}/providers/${pluralizedName} --no-spec --flat`,
    { stdio: 'inherit' },
  );

  console.log(`Generating schema: ${pluralizedName}`);
  execSync(
    `npx nest g class ${pluralizedName}/${moduleName}.schema --no-spec --flat`,
    { stdio: 'inherit' },
  );

  console.log(`Generating DTOs: ${pluralizedName}`);
  execSync(
    `npx nest g class ${pluralizedName}/dtos/create-${moduleName}.dto --no-spec --flat`,
    { stdio: 'inherit' },
  );
  execSync(
    `npx nest g class ${pluralizedName}/dtos/update-${moduleName}.dto --no-spec --flat`,
    { stdio: 'inherit' },
  );

  console.log('Module generation completed successfully.');
} catch (error) {
  console.error('An error occurred during module generation:', error.message);
  process.exit(1);
}
