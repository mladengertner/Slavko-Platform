# InnovaForge™ E2E Test Suite

This directory contains the end-to-end tests for the InnovaForge frontend, written using Playwright.

## 🚀 Getting Started

### 1. Installation

First, ensure you have installed the main project's dependencies:

```bash
npm install
```

Then, install the Playwright browsers:

```bash
npx playwright install
```

### 2. Running the Tests

Before running the tests, make sure the local development server is running in a separate terminal:

```bash
npm run dev
```

Once the server is running (usually at `http://localhost:5173`), you can run the entire test suite with the following command:

```bash
npm run test:e2e
```

To run tests in headed mode for debugging, use the `--headed` flag:

```bash
npm run test:e2e -- --headed
```

### 3. Viewing the Test Report

After a test run is complete, you can view a detailed HTML report:

```bash
npx playwright show-report
```