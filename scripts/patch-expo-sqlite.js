const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(
  __dirname,
  '../node_modules/expo-sqlite/web/worker.ts'
);

if (fs.existsSync(targetPath)) {
  let content = fs.readFileSync(targetPath, 'utf8');

  // 1. Update _vfs type if needed
  if (content.includes('let _vfs: AccessHandlePoolVFS | null = null;')) {
    content = content.replace(
      'let _vfs: AccessHandlePoolVFS | null = null;',
      'let _vfs: AccessHandlePoolVFS | MemoryVFS | null = null;\nlet _initPromise: Promise<{ sqlite3: SQLiteAPI; vfs: AccessHandlePoolVFS | MemoryVFS; vfsMemory: MemoryVFS }> | null = null;'
    );
  }

  // 2. Patch maybeInitAsync implementation to prevent race conditions and handle OPFS failures gracefully
  const oldFunctionHeader = `async function maybeInitAsync(): Promise<{
  sqlite3: SQLiteAPI;
  vfs: AccessHandlePoolVFS;
  vfsMemory: MemoryVFS;
}> {
  if (!_sqlite3) {`;

  const newFunction = `async function maybeInitAsync(): Promise<{
  sqlite3: SQLiteAPI;
  vfs: AccessHandlePoolVFS | MemoryVFS;
  vfsMemory: MemoryVFS;
}> {
  if (_sqlite3 != null && _vfs != null && _vfsMemory != null) {
    return { sqlite3: _sqlite3, vfs: _vfs, vfsMemory: _vfsMemory };
  }

  if (_initPromise) {
    return _initPromise;
  }

  _initPromise = (async () => {
    try {
      if (!_sqlite3) {
        const module = await WaSQLiteFactory({
          locateFile: () => wasmModule,
        });
        const sqliteInstance = SQLite.Factory(module) as SQLiteAPI;
        if (!sqliteInstance) {
          throw new Error('Failed to initialize wa-sqlite');
        }

        let persistentVfs: AccessHandlePoolVFS | MemoryVFS | null = null;
        try {
          persistentVfs = await AccessHandlePoolVFS.create(VFS_NAME_PERSISTENT, module);
        } catch (e) {
          console.warn('[expo-sqlite web] AccessHandlePoolVFS unavailable, falling back to MemoryVFS:', e);
          persistentVfs = await MemoryVFS.create(VFS_NAME_PERSISTENT, module);
        }

        if (persistentVfs == null) {
          persistentVfs = await MemoryVFS.create(VFS_NAME_PERSISTENT, module);
        }
        sqliteInstance.vfs_register(persistentVfs, true);

        const memoryVfs = await MemoryVFS.create(VFS_NAME_MEMORY, module);
        if (memoryVfs == null) {
          throw new Error('Failed to initialize MemoryVFS');
        }
        sqliteInstance.vfs_register(memoryVfs, false);

        _sqlite3 = sqliteInstance;
        _vfs = persistentVfs;
        _vfsMemory = memoryVfs;
      }

      if (_vfs == null || _vfsMemory == null) {
        throw new Error('Invalid VFS state');
      }
      return { sqlite3: _sqlite3, vfs: _vfs, vfsMemory: _vfsMemory };
    } catch (err) {
      _initPromise = null;
      throw err;
    }
  })();

  return _initPromise;
}`;

  const oldFunctionRegex = /async function maybeInitAsync\(\): Promise<[\s\S]*?>\s*\{[\s\S]*?return \{ sqlite3: _sqlite3, vfs: _vfs, vfsMemory: _vfsMemory \};\s*\}/;

  if (oldFunctionRegex.test(content) && !content.includes('AccessHandlePoolVFS unavailable, falling back to MemoryVFS')) {
    content = content.replace(oldFunctionRegex, newFunction);
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('[patch-expo-sqlite] Successfully patched worker.ts with race-safe and fallback-enabled maybeInitAsync.');
  } else if (content.includes('AccessHandlePoolVFS unavailable, falling back to MemoryVFS')) {
    console.log('[patch-expo-sqlite] worker.ts is already patched.');
  } else {
    console.warn('[patch-expo-sqlite] Could not match target maybeInitAsync signature in worker.ts.');
  }
} else {
  console.log('[patch-expo-sqlite] expo-sqlite worker.ts not found.');
}
