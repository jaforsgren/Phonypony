#!/usr/bin/env node

/**
 * PhonyPony CLI Entry Point
 * 
 * This is the main entry point for the PhonyPony CLI tool.
 * It delegates to the CLI module which uses the unified API.
 */

import { runCLI } from './cli';

if (require.main === module) {
  runCLI().catch(console.error);
}
