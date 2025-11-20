#!/bin/sh
set -e

echo "✨ Formatting Node.js code..."
echo ""

echo "📝 Running Prettier..."
npx prettier . --write
echo "✅ Code formatted!"
echo ""

echo "🎉 Formatting complete!"