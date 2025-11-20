#!/bin/bash
set -e

echo "✨ Formatting Python code..."
echo ""

echo "📝 Running Black..."
black .
echo "✅ Code formatted!"
echo ""

echo "🎉 Formatting complete!"