/// Trying to return value to incorrect container.
const ENotCorrectContainer: u64 = 0;
/// Trying to return incorrect value.
const ENotCorrectValue: u64 = 1;

/// A generic container for any Object with `key + store`. The Option type
/// is used to allow taking and putting the value back.
public struct Container<T: key + store> has key {
    id: UID,
    value: Option<T>,
}

/// A Hot Potato struct that is used to ensure the borrowed value is returned.
public struct Promise {
    /// The ID of the borrowed object. Ensures that there wasn't a value swap.
    id: ID,
    /// The ID of the container. Ensures that the borrowed value is returned to
    /// the correct container.
    container_id: ID,
}

/// A function that allows borrowing the value from the container.
public fun borrow_val<T: key + store>(container: &mut Container<T>): (T, Promise) {
    let value = container.value.extract();
    let id = object::id(&value);
    (value, Promise { id, container_id: object::id(container) })
}

/// Put the taken item back into the container.
public fun return_val<T: key + store>(
    container: &mut Container<T>, value: T, promise: Promise
) {
    let Promise { id, container_id } = promise;
    assert!(object::id(container) == container_id, ENotCorrectContainer);
    assert!(object::id(&value) == id, ENotCorrectValue);
    container.value.fill(value);
}