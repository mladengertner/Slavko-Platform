// @ts-nocheck
/* eslint-disable */
const fs = require('fs');
const path = require('path');

// This interface matches the structure from the user's prompt
interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  failures: string[];
}

// Interfaces to loosely match Playwright's JSON report structure
interface PlaywrightJSONReport {
  suites: Suite[];
}
interface Suite {
  title: string;
  file: string;
  specs: Spec[];
  suites?: Suite[];
}
interface Spec {
  title: string;
  ok: boolean;
  tests: Test[];
}
interface Test {
  timeout: number;
  annotations: any[];
  expectedStatus: string;
  projectName: string;
  results: Result[];
  status: string;
}
interface Result {
  workerIndex: number;
  status: 'passed' | 'failed' | 'timedOut' | 'skipped';
  duration: number;
  error?: { message: string; stack: string; value: string };
  stdout: any[];
  stderr: any[];
  retry: number;
  startTime: string;
  attachments: any[];
}


function processSuite(suite: Suite, suitePath: string[]): TestResult {
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    let duration = 0;
    const failures: string[] = [];

    suite.specs.forEach(spec => {
        const test = spec.tests[0]; // Assuming one test per spec for simplicity here
        if (test) {
            const result = test.results[0];
            if (result) {
                duration += result.duration;
                if (result.status === 'passed') {
                    passed++;
                } else if (result.status === 'skipped') {
                    skipped++;
                } else {
                    failed++;
                    failures.push(`[${spec.title}]: ${result.error?.message?.split('\\n')[0] || 'Test failed'}`);
                }
            }
        }
    });

    suite.suites?.forEach(subSuite => {
        const subResult = processSuite(subSuite, [...suitePath, suite.title]);
        passed += subResult.passed;
        failed += subResult.failed;
        skipped += subResult.skipped;
        duration += subResult.duration;
        failures.push(...subResult.failures);
    });

    return {
        suite: [...suitePath, suite.title].filter(Boolean).join(' > '),
        passed,
        failed,
        skipped,
        duration,
        failures
    };
}


function generateReport() {
  const jsonReportPath = path.resolve(process.cwd(), 'test-results.json');
  if (!fs.existsSync(jsonReportPath)) {
    console.error('Error: test-results.json not found. Run playwright tests with JSON reporter first.');
    const errorReport = `# 🚀 INNOVAFORGE PRE-LAUNCH TEST REPORT
## Generated: ${new Date().toISOString()}

### EXECUTIVE SUMMARY
- **Status**: 🔴 ERROR
- **Details**: Test results file (test-results.json) was not found. Could not generate report.

### RECOMMENDATION
⚠️ **LAUNCH BLOCKED**
`;
    fs.writeFileSync('TEST_REPORT.md', errorReport);
    return;
  }

  const jsonReport: PlaywrightJSONReport = JSON.parse(fs.readFileSync(jsonReportPath, 'utf-8'));
  
  const results: TestResult[] = jsonReport.suites.map(suite => processSuite(suite, [])).filter(r => r.passed + r.failed + r.skipped > 0);

  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const totalTests = totalPassed + totalFailed + totalSkipped;

  const report = `
# 🚀 INNOVAFORGE PRE-LAUNCH TEST REPORT
## Generated: ${new Date().toISOString()}

### EXECUTIVE SUMMARY
- **Total Tests**: ${totalTests}
- **Passed**: ${totalPassed} ✅
- **Failed**: ${totalFailed} ${totalFailed === 0 ? '✅' : '❌'}
- **Skipped**: ${totalSkipped}
- **Duration**: ${(totalDuration / 1000).toFixed(2)}s
- **Status**: ${totalFailed === 0 ? '🟢 READY FOR LAUNCH' : '🔴 ISSUES FOUND'}

### DETAILED BREAKDOWN
${results.map(r => `
#### ${r.suite || 'General'}
- Passed: ${r.passed}
- Failed: ${r.failed}
- Skipped: ${r.skipped}
- Duration: ${(r.duration / 1000).toFixed(2)}s
${r.failures.length > 0 ? `
**Failures:**
${r.failures.map(f => `- ${f}`).join('\n')}
` : ''}
`).join('\n')}

### RECOMMENDATION
${totalFailed === 0 
  ? '🎯 **SYSTEMS ARE GO FOR LAUNCH**\\n\\nNo critical issues found. Platform is production-ready.' 
  : '⚠️ **LAUNCH BLOCKED**\\n\\nCritical issues must be resolved before launch.'}
`;

  fs.writeFileSync('TEST_REPORT.md', report.trim());
  console.log('✅ Test report generated: TEST_REPORT.md');
}

generateReport();