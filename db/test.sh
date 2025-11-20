#!/bin/bash
set -e

echo "🧪 Running Python Tests..."
echo ""

echo "📝 Running Ruff linter..."
ruff check .
echo "✅ Ruff check passed!"
echo ""

echo "🔍 Running Mypy type checker..."
mypy db
echo "✅ Mypy check passed!"
echo ""

echo "🧪 Running unit tests..."
python -m unittest discover -s db/tests/ -p "*_test.py"
echo "✅ Unit tests passed!"
echo ""

echo "🎉 All Python checks completed successfully!"