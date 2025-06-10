import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

describe('CLI Tests', () => {
  const cliCommand = 'npx ts-node src/index.ts';

  describe('Basic CLI Functionality', () => {
    it('should display help when called with --help', () => {
      const result = execSync(`${cliCommand} --help`, { encoding: 'utf8' });
      
      expect(result).toContain('PhonyPony - TypeScript Mock Data Generator');
      expect(result).toContain('Usage:');
      expect(result).toContain('Examples:');
      expect(result).toContain('Arguments:');
      expect(result).toContain('Options:');
    });

    it('should display help when called with -h', () => {
      const result = execSync(`${cliCommand} -h`, { encoding: 'utf8' });
      
      expect(result).toContain('PhonyPony - TypeScript Mock Data Generator');
      expect(result).toContain('Usage:');
    });

    it('should show error when no file is provided', () => {
      try {
        execSync(`${cliCommand}`, { encoding: 'utf8', stdio: 'pipe' });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.stderr || error.stdout).toContain('Error: TypeScript file path is required');
      }
    });

    it('should show error when file does not exist', () => {
      try {
        execSync(`${cliCommand} non-existent-file.ts`, { encoding: 'utf8', stdio: 'pipe' });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.stderr || error.stdout).toContain('File not found: non-existent-file.ts');
      }
    });
  });
});
