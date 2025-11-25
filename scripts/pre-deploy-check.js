#!/usr/bin/env node

/**
 * Pre-Deployment Checklist Script
 * Run this before deploying to Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Pre-Deployment Checks...\n');

let errors = [];
let warnings = [];
let success = [];

// 1. Check required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
  'vercel.json',
  'package.json',
  'index.html',
  'server.js',
  'init-database.js',
  'api/health.js',
  'api/auth/register.js',
  'api/auth/login.js',
  'api/productivity/stats.js',
  'api/exports/index.js',
  'js/api-client.js',
  'js/export-service-pro.js'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    success.push(`✅ ${file} exists`);
  } else {
    errors.push(`❌ Missing file: ${file}`);
  }
});

// 2. Check vercel.json configuration
console.log('\n⚙️  Checking vercel.json...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  
  if (vercelConfig.rewrites) {
    success.push('✅ vercel.json has rewrites configured');
  } else {
    warnings.push('⚠️  vercel.json missing rewrites');
  }
  
  if (vercelConfig.headers) {
    success.push('✅ CORS headers configured');
  } else {
    warnings.push('⚠️  No CORS headers in vercel.json');
  }
} catch (e) {
  errors.push('❌ Invalid vercel.json: ' + e.message);
}

// 3. Check package.json dependencies
console.log('\n📦 Checking package.json...');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = [
    'express',
    '@neondatabase/serverless',
    'jsonwebtoken',
    'bcryptjs'
  ];
  
  requiredDeps.forEach(dep => {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      success.push(`✅ ${dep} installed`);
    } else {
      errors.push(`❌ Missing dependency: ${dep}`);
    }
  });
} catch (e) {
  errors.push('❌ Invalid package.json: ' + e.message);
}

// 4. Check API endpoints structure
console.log('\n🔌 Checking API endpoints...');
const apiEndpoints = [
  { path: 'api/health.js', exported: 'GET handler' },
  { path: 'api/auth/register.js', exported: 'POST handler' },
  { path: 'api/auth/login.js', exported: 'POST handler' },
  { path: 'api/productivity/stats.js', exported: 'GET handler' },
  { path: 'api/exports/index.js', exported: 'POST handler' }
];

apiEndpoints.forEach(({ path: apiPath, exported }) => {
  if (fs.existsSync(apiPath)) {
    const content = fs.readFileSync(apiPath, 'utf8');
    if (content.includes('module.exports') || content.includes('export default')) {
      success.push(`✅ ${apiPath} exports handler`);
    } else {
      errors.push(`❌ ${apiPath} doesn't export handler properly`);
    }
  }
});

// 5. Check frontend configuration
console.log('\n🎨 Checking frontend files...');
const indexHtml = fs.readFileSync('index.html', 'utf8');

if (indexHtml.includes('professionalExportService')) {
  success.push('✅ Professional export service integrated');
} else {
  errors.push('❌ Export service not integrated in index.html');
}

if (indexHtml.includes('apiClient')) {
  success.push('✅ API client integrated');
} else {
  errors.push('❌ API client not integrated in index.html');
}

// 6. Check API client configuration
console.log('\n🔧 Checking API client...');
const apiClient = fs.readFileSync('js/api-client.js', 'utf8');

if (apiClient.includes('localhost') && apiClient.includes('vercel.app')) {
  success.push('✅ API client handles both localhost and production');
} else {
  warnings.push('⚠️  Check API client baseURL detection');
}

if (apiClient.includes('full_name') && apiClient.includes('userId')) {
  success.push('✅ API client stores complete user data');
} else {
  errors.push('❌ API client not storing complete user data');
}

// 7. Check export service
console.log('\n📄 Checking export service...');
const exportService = fs.readFileSync('js/export-service-pro.js', 'utf8');

if (exportService.includes('fetchProductivityData')) {
  success.push('✅ Export service fetches from backend');
} else {
  errors.push('❌ Export service missing backend fetch');
}

if (exportService.includes('userEmail') && exportService.includes('userId')) {
  success.push('✅ Export service displays user info');
} else {
  errors.push('❌ Export service not displaying user info');
}

// 8. Check database initialization
console.log('\n🗄️  Checking database setup...');
const schemaPath = path.join(__dirname, 'database', 'schema.sql');
let dbSchema = '';

if (fs.existsSync(schemaPath)) {
  dbSchema = fs.readFileSync(schemaPath, 'utf8');
  success.push('✅ database/schema.sql exists');
} else {
  warnings.push('⚠️  database/schema.sql not found');
}

const requiredTables = [
  'users',
  'work_sessions',
  'emotion_history',
  'productivity_stats',
  'work_notes',
  'alert_logs',
  'absence_logs',
  'export_history'
];

requiredTables.forEach(table => {
  if (dbSchema.includes(`CREATE TABLE IF NOT EXISTS ${table}`) || 
      dbSchema.includes(`CREATE TABLE ${table}`)) {
    success.push(`✅ ${table} table defined`);
  } else {
    errors.push(`❌ Missing table definition: ${table}`);
  }
});

// 9. Check environment variables documentation
console.log('\n🔐 Checking environment variables...');
const readmeFiles = ['README.md', 'DEPLOY-VERCEL.md'];
let envVarDocumented = false;

readmeFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('DATABASE_URL') && content.includes('JWT_SECRET')) {
      envVarDocumented = true;
    }
  }
});

if (envVarDocumented) {
  success.push('✅ Environment variables documented');
} else {
  warnings.push('⚠️  Environment variables not documented');
}

// Print results
console.log('\n' + '='.repeat(60));
console.log('📊 RESULTS\n');

if (success.length > 0) {
  console.log('✅ SUCCESS (' + success.length + '):\n');
  success.forEach(msg => console.log('  ' + msg));
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS (' + warnings.length + '):\n');
  warnings.forEach(msg => console.log('  ' + msg));
}

if (errors.length > 0) {
  console.log('\n❌ ERRORS (' + errors.length + '):\n');
  errors.forEach(msg => console.log('  ' + msg));
}

console.log('\n' + '='.repeat(60));

// Final verdict
if (errors.length === 0) {
  console.log('\n✅ ✅ ✅  ALL CHECKS PASSED - READY TO DEPLOY! ✅ ✅ ✅\n');
  console.log('Next steps:');
  console.log('1. Run: node init-database.js (if not done)');
  console.log('2. Test locally: node server.js');
  console.log('3. Deploy: vercel --prod');
  console.log('4. Set environment variables in Vercel dashboard');
  console.log('5. Test production deployment\n');
  process.exit(0);
} else {
  console.log('\n❌ ❌ ❌  ERRORS FOUND - FIX BEFORE DEPLOYING! ❌ ❌ ❌\n');
  console.log('Please fix the errors above before deploying.\n');
  process.exit(1);
}
