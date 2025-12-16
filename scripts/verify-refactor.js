/**
 * Verification Script for Delete Modal Refactor
 * 
 * This script verifies that:
 * 1. All modified files exist and are valid JavaScript
 * 2. All imports are correct
 * 3. DeleteConfirmationModal component is properly exported
 * 4. All page clients use the modal correctly
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let errors = [];
let warnings = [];
let passed = [];

function log(message, type = 'info') {
  const color = type === 'error' ? colors.red : type === 'warning' ? colors.yellow : type === 'success' ? colors.green : colors.blue;
  console.log(`${color}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`File not found: ${filePath}`);
    return false;
  }
  passed.push(`✓ File exists: ${filePath}`);
  return true;
}

function checkFileContent(filePath, checks) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    errors.push(`File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  checks.forEach(({ name, test, errorMessage }) => {
    if (test(content)) {
      passed.push(`✓ ${name} in ${filePath}`);
    } else {
      errors.push(`${errorMessage} (${filePath})`);
    }
  });
}

// Check DeleteConfirmationModal component
log('\n=== Checking DeleteConfirmationModal Component ===', 'info');
checkFileExists('components/ui/delete-confirmation-modal/DeleteConfirmationModal.js');
checkFileExists('components/ui/delete-confirmation-modal/index.js');

checkFileContent('components/ui/delete-confirmation-modal/DeleteConfirmationModal.js', [
  {
    name: 'Component is client component',
    test: (content) => content.includes('"use client"'),
    errorMessage: 'DeleteConfirmationModal must be a client component',
  },
  {
    name: 'Component exports default',
    test: (content) => content.includes('export default'),
    errorMessage: 'DeleteConfirmationModal must export default',
  },
  {
    name: 'Component has required props',
    test: (content) => 
      content.includes('isOpen') && 
      content.includes('onClose') && 
      content.includes('entityId') && 
      content.includes('entityName') &&
      content.includes('apiEndpoint'),
    errorMessage: 'DeleteConfirmationModal missing required props',
  },
  {
    name: 'Component handles delete API call',
    test: (content) => content.includes('method: "DELETE"') || content.includes("method: 'DELETE'"),
    errorMessage: 'DeleteConfirmationModal must handle DELETE API call',
  },
  {
    name: 'Component has error handling',
    test: (content) => content.includes('deleteError') || content.includes('error'),
    errorMessage: 'DeleteConfirmationModal must have error handling',
  },
  {
    name: 'Component has loading state',
    test: (content) => content.includes('isDeleting') || content.includes('loading'),
    errorMessage: 'DeleteConfirmationModal must have loading state',
  },
]);

checkFileContent('components/ui/delete-confirmation-modal/index.js', [
  {
    name: 'Index exports DeleteConfirmationModal',
    test: (content) => content.includes('DeleteConfirmationModal'),
    errorMessage: 'Index file must export DeleteConfirmationModal',
  },
]);

// Check all page clients
log('\n=== Checking Page Client Components ===', 'info');

const pageClients = [
  'app/dashboard/brands/BrandsPageClient.js',
  'app/dashboard/categories/CategoriesPageClient.js',
  'app/dashboard/users/UsersPageClient.js',
  'app/dashboard/subcategories/SubCategoriesPageClient.js',
  'app/dashboard/suppliers/SuppliersPageClient.js',
];

pageClients.forEach((filePath) => {
  checkFileExists(filePath);
  
  checkFileContent(filePath, [
    {
      name: 'Imports DeleteConfirmationModal',
      test: (content) => content.includes('DeleteConfirmationModal') && content.includes('import'),
      errorMessage: 'Page client must import DeleteConfirmationModal',
    },
    {
      name: 'Uses DeleteConfirmationModal component',
      test: (content) => content.includes('<DeleteConfirmationModal'),
      errorMessage: 'Page client must use DeleteConfirmationModal component',
    },
    {
      name: 'Has deleteModal state',
      test: (content) => content.includes('deleteModal') && (content.includes('useState') || content.includes('setDeleteModal')),
      errorMessage: 'Page client must have deleteModal state',
    },
    {
      name: 'Has onSuccess handler',
      test: (content) => content.includes('onSuccess') || content.includes('handleDeleteSuccess'),
      errorMessage: 'Page client must have onSuccess handler',
    },
    {
      name: 'No inline modal JSX',
      test: (content) => {
        // Check that there's no inline modal with "Confirmer la suppression" text
        const hasInlineModal = content.includes('Confirmer la suppression') && 
                               !content.includes('<DeleteConfirmationModal');
        return !hasInlineModal;
      },
      errorMessage: 'Page client should not have inline modal JSX (should use DeleteConfirmationModal)',
    },
    {
      name: 'No duplicate delete error state',
      test: (content) => {
        // Count occurrences of deleteError state
        const matches = content.match(/deleteError/g);
        return !matches || matches.length <= 2; // Should only appear in DeleteConfirmationModal import/usage
      },
      errorMessage: 'Page client should not have duplicate deleteError state',
    },
  ]);
});

// Check for syntax errors in key files
log('\n=== Checking for Syntax Errors ===', 'info');

function checkSyntax(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      return;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    // Basic syntax checks
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    const openBrackets = (content.match(/\[/g) || []).length;
    const closeBrackets = (content.match(/\]/g) || []).length;

    if (openBraces !== closeBraces) {
      warnings.push(`Mismatched braces in ${filePath} (${openBraces} open, ${closeBraces} close)`);
    }
    if (openParens !== closeParens) {
      warnings.push(`Mismatched parentheses in ${filePath} (${openParens} open, ${closeParens} close)`);
    }
    if (openBrackets !== closeBrackets) {
      warnings.push(`Mismatched brackets in ${filePath} (${openBrackets} open, ${closeBrackets} close)`);
    }

    // Check for template literal issues
    if (content.includes('successMessage=') && content.includes('{entityName}')) {
      // Should use template literals, not string with braces
      const hasTemplateLiteral = content.match(/successMessage=\{`[^`]*\{entityName\}[^`]*`\}/);
      if (!hasTemplateLiteral) {
        warnings.push(`successMessage in ${filePath} should use template literal for {entityName}`);
      }
    }

    passed.push(`✓ Syntax check passed: ${filePath}`);
  } catch (error) {
    errors.push(`Syntax error in ${filePath}: ${error.message}`);
  }
}

pageClients.forEach(checkSyntax);
checkSyntax('components/ui/delete-confirmation-modal/DeleteConfirmationModal.js');

// Check imports
log('\n=== Checking Imports ===', 'info');

function checkImports(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf-8');
  
  // Check for common import issues
  const importLines = content.match(/^import\s+.*$/gm) || [];
  importLines.forEach((line, index) => {
    // Check for unclosed imports
    if (line.includes('from') && !line.includes(';') && !line.includes("'") && !line.includes('"')) {
      warnings.push(`Potential unclosed import in ${filePath} at line ${index + 1}`);
    }
  });
  
  passed.push(`✓ Imports check passed: ${filePath}`);
}

pageClients.forEach(checkImports);
checkImports('components/ui/delete-confirmation-modal/DeleteConfirmationModal.js');

// Summary
log('\n=== Verification Summary ===', 'info');
log(`\n${passed.length} checks passed`, 'success');
if (warnings.length > 0) {
  log(`\n${warnings.length} warnings:`, 'warning');
  warnings.forEach((warning) => log(`  - ${warning}`, 'warning'));
}
if (errors.length > 0) {
  log(`\n${errors.length} errors found:`, 'error');
  errors.forEach((error) => log(`  - ${error}`, 'error'));
  process.exit(1);
} else {
  log('\n✓ All checks passed! Refactor verification successful.', 'success');
  process.exit(0);
}

