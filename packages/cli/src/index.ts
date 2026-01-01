// @bf-i18n/cli - CLI tool for backend-friendly i18n

import { Command } from 'commander';
import { parseCommand, validateCommand, convertCommand, extractCommand } from './commands/index.js';

const program = new Command();

program.name('bf-i18n').description('CLI tool for backend-friendly i18n').version('0.4.0');

// Add commands
program.addCommand(parseCommand);
program.addCommand(validateCommand);
program.addCommand(convertCommand);
program.addCommand(extractCommand);

program.parse(process.argv);
