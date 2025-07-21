#!/usr/bin/env node

/**
 * Pre-uninstall cleanup script for Gemini CLI Router
 * Stops running proxy services and cleans up processes
 * 
 * @author Jason Zhang
 */

import { execSync } from 'child_process';

console.log('🧹 Cleaning up Gemini CLI Router...');

try {
  // Kill any processes using port 3458
  try {
    const result = execSync('lsof -ti:3458', { encoding: 'utf8' }).trim();
    
    if (result) {
      const pids = result.split('\n').filter(pid => pid.trim());
      console.log(`🔪 Killing processes using port 3458: ${pids.join(', ')}`);
      
      pids.forEach(pid => {
        try {
          execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          console.log(`   ✅ Killed process ${pid}`);
        } catch (error) {
          console.log(`   ⚠️  Failed to kill process ${pid}`);
        }
      });
    }
  } catch (error) {
    // No processes found on port, which is fine
  }

  console.log('✅ Cleanup complete');
  console.log('');
  console.log('📝 Note: Configuration files in ~/.gemini-cli-router were preserved');
  console.log('   Delete manually if you want to remove all traces');

} catch (error) {
  console.error('❌ Cleanup failed:', error.message);
}