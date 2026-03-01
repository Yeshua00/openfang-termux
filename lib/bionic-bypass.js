import fs from 'fs';
import path from 'path';

export function isAndroid() {
  return process.platform === 'android' ||
         fs.existsSync('/data/data/com.termux') ||
         process.env.TERMUX_VERSION !== undefined;
}
