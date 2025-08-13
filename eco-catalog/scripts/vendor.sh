#!/bin/sh
set -e
BASE_DIR="$(dirname "$0")/.."
LIB_DIR="$BASE_DIR/libs"
mkdir -p "$LIB_DIR"
cd "$LIB_DIR"

fetch() {
  FILE="$1"
  PKG="$2"
  VERSION="$3"
  DIST="$4"
  if [ -f "$FILE" ]; then
    echo "Skipped $FILE"
    return
  fi
  TAR_URL="https://registry.npmjs.org/$PKG/-/${PKG##*/}-$VERSION.tgz"
  if curl -fsL "$TAR_URL" | tar -xzOf - "package/$DIST" > "$FILE" 2>/dev/null; then
    echo "Downloaded $FILE from npm"
    return
  fi
  JSDELIVR="https://cdn.jsdelivr.net/npm/$PKG@$VERSION/$DIST"
  if curl -fsL --retry 2 -o "$FILE" "$JSDELIVR"; then
    echo "Downloaded $FILE from jsDelivr"
    return
  fi
  UNPKG="https://unpkg.com/$PKG@$VERSION/$DIST"
  if curl -fsL --retry 2 -o "$FILE" "$UNPKG"; then
    echo "Downloaded $FILE from unpkg"
    return
  fi
  echo "Failed to download $FILE" >&2
}

fetch react.production.min.js react 18.2.0 umd/react.production.min.js
fetch react-dom.production.min.js react-dom 18.2.0 umd/react-dom.production.min.js
fetch dayjs.min.js dayjs 1.11.10 dayjs.min.js
fetch antd.min.js antd 5.13.2 dist/antd.min.js
fetch antd.min.css antd 5.13.2 dist/antd.min.css
fetch icons.min.js @ant-design/icons 5.2.5 dist/index.umd.js
fetch echarts.min.js echarts 5.5.0 dist/echarts.min.js
fetch jszip.min.js jszip 3.10.1 dist/jszip.min.js
fetch FileSaver.min.js file-saver 2.0.5 dist/FileSaver.min.js

echo "Vendor libraries ready in $LIB_DIR"
