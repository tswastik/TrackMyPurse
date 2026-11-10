const fs = require('fs');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('@expo/metro/metro-cache');

const config = getDefaultConfig(__dirname);

// Keep Metro's caches inside the project instead of the system temp folder on C:.
const cacheRoot = path.join(__dirname, 'node_modules', '.cache');
const fileMapDir = path.join(cacheRoot, 'metro-file-map');
fs.mkdirSync(fileMapDir, { recursive: true });
config.cacheStores = [new FileStore({ root: path.join(cacheRoot, 'metro') })];
config.fileMapCacheDirectory = fileMapDir;

module.exports = config;
