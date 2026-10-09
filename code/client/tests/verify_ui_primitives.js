// code/client/tests/verify_ui_primitives.js
/**
 * Standalone Empirical Challenger Verification Script for Milestone 1 UI Primitives
 * Mounts/renders every UI component in src/components/ui/ across variant combinations,
 * empty props, extreme edge cases, and unexpected props.
 * Outputs a full pass/fail audit report with exact errors.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { createJiti } from 'jiti';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jiti = createJiti(__filename, {
  alias: {
    '@': path.resolve(__dirname, '../src'),
    'clsx': path.resolve(__dirname, '../src/lib/shims/clsx.js'),
    'tailwind-merge': path.resolve(__dirname, '../src/lib/shims/tailwind-merge.js'),
    'class-variance-authority': path.resolve(__dirname, '../src/lib/shims/cva.js'),
    '@radix-ui/react-slot': path.resolve(__dirname, '../src/lib/shims/radix-slot.js'),
  },
});

const { cn } = jiti('../src/lib/utils.js');
const { clsx } = jiti('../src/lib/shims/clsx.js');
const { twMerge } = jiti('../src/lib/shims/tailwind-merge.js');
const { cva } = jiti('../src/lib/shims/cva.js');
const { Slot } = jiti('../src/lib/shims/radix-slot.js');

const buttonModule = jiti('../src/components/ui/button.jsx');
const cardModule = jiti('../src/components/ui/card.jsx');
const dialogModule = jiti('../src/components/ui/dialog.jsx');
const inputModule = jiti('../src/components/ui/input.jsx');
const labelModule = jiti('../src/components/ui/label.jsx');
const selectModule = jiti('../src/components/ui/select.jsx');
const tableModule = jiti('../src/components/ui/table.jsx');
const tabsModule = jiti('../src/components/ui/tabs.jsx');
const badgeModule = jiti('../src/components/ui/Badge.jsx');
const textareaModule = jiti('../src/components/ui/textarea.jsx');
const progressModule = jiti('../src/components/ui/progress.jsx');
const alertModule = jiti('../src/components/ui/alert.jsx');
const separatorModule = jiti('../src/components/ui/separator.jsx');
const avatarModule = jiti('../src/components/ui/avatar.jsx');
const dropdownModule = jiti('../src/components/ui/dropdown-menu.jsx');
const emptyStateModule = jiti('../src/components/ui/EmptyState.jsx');
const statCardModule = jiti('../src/components/ui/StatCard.jsx');
const fileUploadModule = jiti('../src/components/ui/FileUpload.jsx');
const loadingSpinnerModule = jiti('../src/components/ui/LoadingSpinner.jsx');
const paginationModule = jiti('../src/components/ui/Pagination.jsx');

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  defects: [],
};

function testCase(componentName, testScenario, fn) {
  results.total++;
  try {
    fn();
    results.passed++;
    console.log(`  [PASS] ${componentName} - ${testScenario}`);
  } catch (err) {
    results.failed++;
    const defect = {
      component: componentName,
      scenario: testScenario,
      error: err.message,
    };
    results.defects.push(defect);
    console.error(`  [FAIL] ${componentName} - ${testScenario}: ${err.message}`);
  }
}

function render(el) {
  return ReactDOMServer.renderToStaticMarkup(el);
}

console.log('=============================================================');
console.log(' EMPIRICAL VERIFICATION HARNESS: UI PRIMITIVES STRESS TEST   ');
console.log('=============================================================');

// 1. Button
console.log('\nTesting: Button & buttonVariants');
testCase('Button', 'Render with empty props', () => {
  const html = render(React.createElement(buttonModule.Button));
  if (!html.includes('button')) throw new Error('Expected button element');
});

testCase('Button', 'Variants combination matrix', () => {
  const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];
  const sizes = ['default', 'sm', 'lg', 'icon'];
  for (const v of variants) {
    for (const s of sizes) {
      const html = render(React.createElement(buttonModule.Button, { variant: v, size: s }, 'Txt'));
      if (!html.includes('Txt')) throw new Error(`Failed to render variant ${v} size ${s}`);
    }
  }
});

testCase('Button', 'Extreme/Unexpected props: unknown variant and size', () => {
  const html = render(React.createElement(buttonModule.Button, { variant: 'invalid-var', size: 'invalid-sz' }, 'Safe'));
  if (!html.includes('Safe')) throw new Error('Failed to fallback safely');
});

testCase('Button', 'asChild with React element', () => {
  const html = render(React.createElement(buttonModule.Button, { asChild: true }, React.createElement('a', { href: '#' }, 'Link')));
  if (!html.includes('<a') || !html.includes('Link')) throw new Error('Failed asChild link rendering');
});

// 2. Badge
console.log('\nTesting: Badge & badgeVariants');
testCase('Badge', 'Render with empty props', () => {
  const html = render(React.createElement(badgeModule.Badge));
  if (!html.includes('span')) throw new Error('Expected span element');
});

testCase('Badge', 'Hybrid legacy and shadcn variants', () => {
  const allVariants = ['success', 'danger', 'warning', 'info', 'default', 'primary', 'secondary', 'destructive', 'outline'];
  for (const v of allVariants) {
    const html = render(React.createElement(badgeModule.Badge, { variant: v }, v));
    if (!html.includes(v)) throw new Error(`Failed variant ${v}`);
  }
});

testCase('Badge', 'Null/undefined variant', () => {
  render(React.createElement(badgeModule.Badge, { variant: null }, 'NullVar'));
  render(React.createElement(badgeModule.Badge, { variant: undefined }, 'UndefVar'));
});

// 3. Card
console.log('\nTesting: Card Family');
testCase('Card', 'Compound structure with empty props on children', () => {
  const el = React.createElement(cardModule.Card, null,
    React.createElement(cardModule.CardHeader, null,
      React.createElement(cardModule.CardTitle, null, 'Title'),
      React.createElement(cardModule.CardDescription, null, 'Desc')
    ),
    React.createElement(cardModule.CardContent, null, 'Content'),
    React.createElement(cardModule.CardFooter, null, 'Footer')
  );
  const html = render(el);
  if (!html.includes('Title') || !html.includes('Desc')) throw new Error('Missing card parts');
});

// 4. Dialog
console.log('\nTesting: Dialog Family');
testCase('Dialog', 'Render closed dialog with empty props', () => {
  const el = React.createElement(dialogModule.Dialog, null,
    React.createElement(dialogModule.DialogTrigger, null, 'Open'),
    React.createElement(dialogModule.DialogContent, null, 'Body')
  );
  const html = render(el);
  if (!html.includes('Open') || html.includes('Body')) throw new Error('Closed dialog rendered body');
});

testCase('Dialog', 'Render open dialog (open=true)', () => {
  const el = React.createElement(dialogModule.Dialog, { open: true },
    React.createElement(dialogModule.DialogContent, null,
      React.createElement(dialogModule.DialogHeader, null,
        React.createElement(dialogModule.DialogTitle, null, 'Modal')
      )
    )
  );
  const html = render(el);
  if (!html.includes('Modal')) throw new Error('Open dialog failed to render modal content');
});

// 5. Input, Label, Textarea
console.log('\nTesting: Input, Label, Textarea');
testCase('Input', 'Render with empty props and type permutations', () => {
  render(React.createElement(inputModule.Input));
  render(React.createElement(inputModule.Input, { type: 'password', disabled: true }));
  render(React.createElement(inputModule.Input, { type: 'date', value: '2026-04-17' }));
});

testCase('Label', 'Render with empty props and htmlFor', () => {
  render(React.createElement(labelModule.Label));
  render(React.createElement(labelModule.Label, { htmlFor: 'email' }, 'Email'));
});

testCase('Textarea', 'Render with empty props and rows/cols', () => {
  render(React.createElement(textareaModule.Textarea));
  render(React.createElement(textareaModule.Textarea, { rows: 8, defaultValue: 'Clinical observations' }));
});

// 6. Select
console.log('\nTesting: Select Family');
testCase('Select', 'Compound Select with empty props and items', () => {
  const el = React.createElement(selectModule.Select, { defaultValue: 'a' },
    React.createElement(selectModule.SelectTrigger, null,
      React.createElement(selectModule.SelectValue, { placeholder: 'Select...' })
    ),
    React.createElement(selectModule.SelectContent, null,
      React.createElement(selectModule.SelectItem, { value: 'a' }, 'Option A'),
      React.createElement(selectModule.SelectItem, { value: 'b' }, 'Option B')
    )
  );
  render(el);
});

// 7. Table
console.log('\nTesting: Table Family');
testCase('Table', 'Full Table rendering with empty props', () => {
  const el = React.createElement(tableModule.Table, null,
    React.createElement(tableModule.TableHeader, null,
      React.createElement(tableModule.TableRow, null,
        React.createElement(tableModule.TableHead, null, 'Head')
      )
    ),
    React.createElement(tableModule.TableBody, null,
      React.createElement(tableModule.TableRow, null,
        React.createElement(tableModule.TableCell, null, 'Data')
      )
    )
  );
  render(el);
});

// 8. Tabs
console.log('\nTesting: Tabs Family');
testCase('Tabs', 'Compound Tabs with defaultValue', () => {
  const el = React.createElement(tabsModule.Tabs, { defaultValue: 'tab1' },
    React.createElement(tabsModule.TabsList, null,
      React.createElement(tabsModule.TabsTrigger, { value: 'tab1' }, 'Tab 1'),
      React.createElement(tabsModule.TabsTrigger, { value: 'tab2' }, 'Tab 2')
    ),
    React.createElement(tabsModule.TabsContent, { value: 'tab1' }, 'Content 1'),
    React.createElement(tabsModule.TabsContent, { value: 'tab2' }, 'Content 2')
  );
  const html = render(el);
  if (!html.includes('Content 1') || html.includes('Content 2')) throw new Error('Tabs active mismatch');
});

// 9. Progress
console.log('\nTesting: Progress');
testCase('Progress', 'Boundary values and non-positive max defenses', () => {
  render(React.createElement(progressModule.Progress));
  render(React.createElement(progressModule.Progress, { value: 0 }));
  render(React.createElement(progressModule.Progress, { value: 100 }));
  render(React.createElement(progressModule.Progress, { value: -50, max: 100 }));
  render(React.createElement(progressModule.Progress, { value: 9999, max: 100 }));
  render(React.createElement(progressModule.Progress, { value: 50, max: 0 }));
  render(React.createElement(progressModule.Progress, { value: 50, max: -10 }));
});

// 10. Alert & Separator & Avatar & DropdownMenu
console.log('\nTesting: Alert, Separator, Avatar, DropdownMenu');
testCase('Alert', 'Variants (default, destructive, success, warning, info)', () => {
  const vars = ['default', 'destructive', 'success', 'warning', 'info'];
  for (const v of vars) {
    render(React.createElement(alertModule.Alert, { variant: v },
      React.createElement(alertModule.AlertTitle, null, 'Title'),
      React.createElement(alertModule.AlertDescription, null, 'Desc')
    ));
  }
});

testCase('Separator', 'Horizontal and vertical orientation', () => {
  render(React.createElement(separatorModule.Separator, { orientation: 'horizontal' }));
  render(React.createElement(separatorModule.Separator, { orientation: 'vertical', decorative: false }));
});

testCase('Avatar', 'Compound Avatar elements', () => {
  render(React.createElement(avatarModule.Avatar, null,
    React.createElement(avatarModule.AvatarImage, { src: 'https://example.com/p.jpg' }),
    React.createElement(avatarModule.AvatarFallback, null, 'MB')
  ));
});

testCase('DropdownMenu', 'DropdownMenu compound elements', () => {
  render(React.createElement(dropdownModule.DropdownMenu, null,
    React.createElement(dropdownModule.DropdownMenuTrigger, null, 'Trigger'),
    React.createElement(dropdownModule.DropdownMenuContent, null,
      React.createElement(dropdownModule.DropdownMenuItem, null, 'Item')
    )
  ));
});

// 11. Secondary Primitives: FileUpload, LoadingSpinner, Pagination
console.log('\nTesting: Secondary UI Primitives');
testCase('FileUpload', 'Render with empty props', () => {
  render(React.createElement(fileUploadModule.default || fileUploadModule));
});

testCase('LoadingSpinner', 'Render with empty props', () => {
  render(React.createElement(loadingSpinnerModule.default || loadingSpinnerModule));
});

testCase('Pagination', 'Render with empty props', () => {
  render(React.createElement(paginationModule.default || paginationModule));
});

// 12. Potential Crash Points: EmptyState & StatCard
console.log('\nTesting: EmptyState and StatCard Empty Props (Adversarial Oracles)');
testCase('EmptyState', 'Render with empty props {} (CRASH CHECK)', () => {
  // If EmptyState does not guard against undefined icon, this throws Element type is invalid!
  const Comp = emptyStateModule.default || emptyStateModule;
  render(React.createElement(Comp));
});

testCase('StatCard', 'Render with empty props {} (CRASH CHECK)', () => {
  // If StatCard does not guard against undefined icon, this throws Element type is invalid!
  const Comp = statCardModule.default || statCardModule;
  render(React.createElement(Comp));
});

console.log('\n=============================================================');
console.log(` SUMMARY: Total: ${results.total} | Passed: ${results.passed} | Failed: ${results.failed}`);
console.log('=============================================================');

if (results.defects.length > 0) {
  console.log('\nCONFIRMED DEFECTS:');
  for (const d of results.defects) {
    console.log(` - ${d.component} [${d.scenario}]: ${d.error}`);
  }
}
