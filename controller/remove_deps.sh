#!/bin/bash

# Navigate to controller directory
cd controller

echo "=== Removing unused dependencies ==="

# Remove unused dependencies
npm uninstall \
  @canvasjs/react-charts \
  @chakra-ui/button \
  @coreui/coreui \
  @coreui/react \
  @dnd-kit/core \
  @emotion/babel-plugin \
  @next/font \
  @react-pdf/renderer \
  @slack/web-api \
  @types/canvasjs \
  @types/react-inner-image-zoom \
  @types/react-modal \
  @uiw/react-textarea-code-editor \
  async \
  attr-accept \
  chart.js \
  dotenv \
  fuse.js \
  ldrs \
  lodash.debounce \
  next-remove-imports \
  papaparse \
  pluralize \
  react-card-flip \
  react-chartjs-2 \
  react-datepicker \
  react-dropzone \
  react-file-picker \
  react-google-charts \
  react-inner-image-zoom \
  react-markdown \
  react-modal \
  styled-components \
  use-file-picker

echo ""
echo "=== Removing unused devDependencies ==="

npm uninstall --save-dev \
  @types/async \
  @types/eslint \
  @types/lodash.debounce \
  @types/papaparse

echo ""
echo "=== Adding missing dependencies ==="

npm install moment minimist protobufjs monaco-editor

echo ""
echo "=== Checking protobuf dependencies ==="
echo "Verify these are actually used in gen-interfaces:"
echo "  - @bufbuild/protobuf"
echo "  - google-protobuf"
echo "  - ts-proto"
echo ""
echo "If gen-interfaces doesn't use them, run:"
echo "  npm uninstall @bufbuild/protobuf google-protobuf ts-proto"

echo ""
echo "=== Moving react-dom types to devDependencies ==="
# @types/react-dom should be in devDependencies
npm uninstall @types/react-dom
npm install --save-dev @types/react-dom

echo ""
echo "=== Complete! ==="
echo "Now run: npm run build"
echo "Then check standalone size: du -sh .next/standalone/node_modules"