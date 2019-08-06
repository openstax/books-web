declare module 'weak-map' {
  interface WeakMap<K = any, V = any> {
    /**
     * Removes `key` and its value from the cache.
     * @param key The key of the value to remove.
     * @return Returns `true` if the entry was removed successfully, else `false`.
     */
    delete(key: Key): boolean;

    /**
     * Gets the cached value for `key`.
     * @param key The key of the value to get.
     * @return Returns the cached value.
     */
    get(key: K): V;

    /**
     * Checks if a cached value for `key` exists.
     * @param key The key of the entry to check.
     * @return Returns `true` if an entry for `key` exists, else `false`.
     */
    has(key: K): V;

    /**
     * Sets `value` to `key` of the cache.
     * @param key The key of the value to cache.
     * @param value The value to cache.
     * @return Returns the cache object.
     */
    set(key: K, value: V): WeakMap<K, V>;

    /**
     * Removes all key-value entries from the map.
     */
    clear(): void;
  }

  interface WeakMapConstructor {
    new(): WeakMap;
  }

  class WeakMap {
    constructor();
  }

  export = WeakMap;
}
