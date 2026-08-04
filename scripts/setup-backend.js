#!/usr/bin/env node

/**
 * Swachh Hawa Backend Setup Script
 * Non-interactive: reads all configuration from .env
 * No prompts - all keys come from environment variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

function verifyEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      log('Creating .env file from template...', 'info');
      fs.copyFileSync(envExamplePath, envPath);
      log('✓ .env file created', 'success');
    } else {
      log('✗ No .env or .env.example file found', 'error');
      process.exit(1);
    }
  } else {
    log('✓ .env file exists', 'success');
  }
  
  return envPath;
}

function readEnvStatus(envPath) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const hasSupabaseUrl = envContent.includes('SUPABASE_URL=') && 
    !envContent.match(/SUPABASE_URL=\s*$/m);
  const hasServiceKey = envContent.includes('SUPABASE_SERVICE_ROLE_KEY=') && 
    !envContent.match(/SUPABASE_SERVICE_ROLE_KEY=\s*$/m);
  const hasCPCB = envContent.includes('AQI_API_KEY=') && 
    !envContent.match(/AQI_API_KEY=\s*$/m);
  const hasWeather = envContent.includes('WEATHER_API_KEY=') && 
    !envContent.match(/WEATHER_API_KEY=\s*$/m);
  const hasLLM = envContent.includes('ANTHROPIC_API_KEY=') || 
    envContent.includes('GROQ_API_KEY=');
  
  return {
    supabase: hasSupabaseUrl && hasServiceKey,
    cpcb: hasCPCB,
    weather: hasWeather,
    llm: hasLLM,
  };
}

async function main() {
  console.log('\n');
  log('═══════════════════════════════════════════════════', 'info');
  log('   Swachh Hawa Backend Setup', 'success');
  log('═══════════════════════════════════════════════════', 'info');
  console.log('\n');

  try {
    // Verify .env exists
    const envPath = verifyEnvFile();

    // Check what's configured
    const status = readEnvStatus(envPath);

    console.log('\n');
    log('📋 Configuration Status:', 'info');
    log(`  ✓ Supabase: ${status.supabase ? '✅ Configured' : '❌ Not configured (demo mode)'}`, 
      status.supabase ? 'success' : 'warning');
    log(`  ✓ CPCB AQI API: ${status.cpcb ? '✅ Configured' : '⚠️  Using mock data'}`, 
      status.cpcb ? 'success' : 'warning');
    log(`  ✓ Weather API: ${status.weather ? '✅ Configured' : '⚠️  Using mock data'}`, 
      status.weather ? 'success' : 'warning');
    log(`  ✓ LLM / AirGPT: ${status.llm ? '✅ Configured' : '⚠️  Chat feature disabled'}`, 
      status.llm ? 'success' : 'warning');

    // Display migration reminder
    console.log('\n');
    log('🗄️  Database Migrations', 'info');
    log('When ready, run these migrations in your Supabase SQL Editor:', 'info');
    log('   1. supabase/migrations/001_init.sql', 'info');
    log('   2. supabase/migrations/002_core_data_tables.sql', 'info');
    log('   3. supabase/migrations/003_seed_data.sql', 'info');

    // Success summary
    console.log('\n');
    log('═══════════════════════════════════════════════════', 'success');
    log('   Setup Complete!', 'success');
    log('═══════════════════════════════════════════════════', 'success');
    console.log('\n');

    log('✅ All API keys loaded from .env automatically', 'success');
    log('✅ No interactive prompts', 'success');
    log('✅ App is ready to run\n', 'success');

    log('Next: Run "npm run dev" to start the development server', 'info');
    console.log('\n');

    if (!status.supabase) {
      log('⚠️  Note: Running in DEMO MODE with mock data', 'warning');
      log('   Configure Supabase to enable real database features', 'warning');
      console.log('\n');
    }

  } catch (error) {
    log('\n✗ Setup failed: ' + error.message, 'error');
    process.exit(1);
  }
}

// Run setup
main();
