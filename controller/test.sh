#!/bin/sh
set -e

echo "🧪 Running Node.js Tests..."
echo ""

echo "📝 Checking code formatting with Prettier..."
npx prettier . --check
echo "✅ Prettier check passed!"
echo ""

echo "🔨 Building TypeScript (production check)..."
npx tsc --build --clean
echo "✅ TypeScript build passed!"
echo ""

echo "🔍 Type checking with TypeScript..."
npx tsc --noEmit
echo "✅ TypeScript check passed!"
echo ""

echo "🧪 Running test suite..."
npm run test
echo "✅ Tests passed!"
echo ""

echo "🎉 All Node.js checks completed successfully!"