import pkg from '../../package.json';

/**
 * Single source of truth for the application version.
 * Synchronized automatically with Release Please via package.json.
 */
export const APP_VERSION = pkg.version === '0.0.0' ? '0.1.0' : pkg.version;
export const APP_VERSION_TAG = `v${APP_VERSION}`;
