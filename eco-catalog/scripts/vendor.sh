#!/bin/sh
set -e
BASE_DIR="$(dirname "$0")/.."
LIB_DIR="$BASE_DIR/libs"
mkdir -p "$LIB_DIR"
cd "$LIB_DIR"

download() {
  FILE="$1"
  URL="$2"
  if [ -f "$FILE" ]; then
    echo "Skipped $FILE"
  else
    curl -L --retry 3 -o "$FILE" "$URL"
    echo "Downloaded $FILE"
  fi
}

download react.production.min.js https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js
download react-dom.production.min.js https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js
download antd.min.js https://cdn.jsdelivr.net/npm/antd@5.13.2/dist/antd.min.js
download antd.min.css https://cdn.jsdelivr.net/npm/antd@5.13.2/dist/antd.min.css
download icons.min.js https://cdn.jsdelivr.net/npm/@ant-design/icons@5.2.5/dist/index.umd.js
download dayjs.min.js https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js
download echarts.min.js https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js
download jszip.min.js https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
download FileSaver.min.js https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js

echo "Vendor libraries ready in $LIB_DIR"
