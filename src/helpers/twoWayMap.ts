export default class TwoWayMap<K, V> {
    keyToValue: Map<K, V>;
    valueToKey: Map<V, K>;
    constructor() {
        this.keyToValue = new Map<K, V>();
        this.valueToKey = new Map<V, K>();
    }
    set(key: K, value: V) {
        this.keyToValue.set(key, value);
        this.valueToKey.set(value, key);
    }
    getKey(value: V) {
        return this.valueToKey.get(value);
    }
    getValue(key: K) {
        return this.keyToValue.get(key);
    }
    deleteKey(key: K) {
        const value = this.keyToValue.get(key);
        this.keyToValue.delete(key);
        this.valueToKey.delete(value!);
    }
    deleteValue(value: V) {
        const key = this.valueToKey.get(value);
        this.valueToKey.delete(value);
        this.keyToValue.delete(key!);
    }
    clear() {
        this.keyToValue.clear();
        this.valueToKey.clear();
    }
    get size() {
        return this.keyToValue.size;
    }
}