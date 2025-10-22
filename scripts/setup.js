#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🍽️  BiteQubeAI Setup Script');
console.log('================================\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creating .env file from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created!');
    console.log('⚠️  Please update the .env file with your actual API keys and URLs.\n');
  } else {
    console.log('❌ .env.example file not found. Creating basic .env file...');
    const basicEnv = `# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Hugging Face Configuration
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key
`;
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Basic .env file created!');
    console.log('⚠️  Please update the .env file with your actual API keys and URLs.\n');
  }
} else {
  console.log('✅ .env file already exists.\n');
}

// Check if node_modules exists
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!\n');
  } catch (error) {
    console.log('❌ Failed to install dependencies. Please run "npm install" manually.\n');
  }
} else {
  console.log('✅ Dependencies already installed.\n');
}

// Display next steps
console.log('🚀 Next Steps:');
console.log('1. Update your .env file with actual API keys');
console.log('2. Set up your Supabase project (see README.md)');
console.log('3. Get your Hugging Face API key');
console.log('4. Run "npm run dev" to start development server');
console.log('\n📚 For detailed setup instructions, see:');
console.log('   - README.md for complete documentation');
console.log('   - DEPLOYMENT.md for production deployment');
console.log('\n🎉 Happy coding!');
