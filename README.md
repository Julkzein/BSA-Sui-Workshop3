## Sui X BSA hackathon III workshop

### Sui Move Modules: Publisher, Capability and Hot Potato patterns

##### What you will learn in this module:

#### Publisher Module
The publisher module demonstrates access control using Sui's Publisher object:

- **OTW (One-Time Witness)**: Uses a `HERO` struct with `drop` ability as the one-time witness that uniquely identifies this module at publish time.

- **Publisher object with claim_and_keep on publish**: 
  ```move
  fun init(otw: HERO, ctx: &mut TxContext) {
      package::claim_and_keep(otw, ctx);
  }
  ```
  This creates a Publisher object during package initialization and transfers it to the publisher's address.

- **Functions gating with the Publisher object**: Functions like `create_hero` and `transfer_hero` require a Publisher object as an argument to authorize operations.

- **Manual assertion of the rightful publisher object**:
  ```move
  assert!(publisher.from_module<HERO>(), EWrongPublisher);
  ```
  Verifies that the provided Publisher object belongs to this specific module.

- **Tests with the correct Publisher**: Includes tests demonstrating successful usage with the correct Publisher object.

- **New test module to demonstrate wrong publisher object**: Separate test module shows that a Publisher from another module cannot be used to call functions in this module.

- **Publisher being a singleton due to OTW**: Only one Publisher object for the HERO module can exist in the system, ensuring there can be only one hero minter for this module.

#### Capability Module
The capability module demonstrates access control using a capability pattern:

- **Admin cap pattern based on object ownership**: Uses an `AdminCap` struct that only the module creator receives initially.

- **No need to check for module**: The AdminCap is tied to the specific module by design, so no explicit module verification is needed.

- **Hero minters can co-exist**: Multiple admin capabilities can exist in the system through the `new_admin` function:
  ```move
  public fun new_admin(_: &AdminCap, to: address, ctx: &mut TxContext) {
      let admin_cap = AdminCap {
          id: object::new(ctx),
      };
      transfer::transfer(admin_cap, to);
  }
  ```

- **Initial AdminCap distribution**: Only the package publisher receives the initial AdminCap during initialization:
  ```move
  fun init(ctx: &mut TxContext) {
      let admin_cap = AdminCap {
          id: object::new(ctx),
      };
      transfer::transfer(admin_cap, ctx.sender());
  }
  ```

- **Permission by capability reference**: Functions like `create_hero` and `transfer_hero` take a reference to the AdminCap to authorize operations.

- **Delegation model**: Existing admins can create new admins, creating a delegation pattern for authorizatio"n.

### Key Differences

- The Publisher pattern ensures a **singleton** authority tied to the module publisher.
- The Capability pattern allows for **multiple** authorized entities through delegation.
- Publisher requires verification of module origin, while Capability relies on object ownership.

## Hot Potato Pattern 
The hot potato pattern demonstrates transaction-level obligation enforcement using structs without abilities:

- **Struct without abilities**: Uses a struct with no key, store, copy, or drop abilities, creating an obligation that must be fulfilled within the transaction.

- **Cannot be stored or ignored**: The hot potato cannot be stored as an object, kept as a field in another struct, copied, or discarded - it must be explicitly unpacked:
  ```move
   public struct Request {}  // No abilities = hot potato
  
  public fun confirm_request(request: Request) {
      let Request {} = request;  // Must unpack to avoid abort
  }
  ```

- **Transaction-level enforcement**: If the hot potato is not properly handled before the transaction ends, the transaction will abort due to unused value without drop ability.

- **Borrowing with guaranteed return**: Creates a promise mechanism that ensures borrowed values are returned to the correct container:
  ```move
  public struct Promise {
      id: ID,
      container_id: ID,
  }
  
  public fun borrow_val<T: key + store>(container: &mut Container<T>): (T, Promise) {
      let value = container.value.extract();
      let id = object::id(&value);
      (value, Promise { id, container_id: object::id(container) })
  }
  ```
- **Flash loan implementation**: Enables same-transaction borrowing and repayment, ensuring borrowed funds are returned before transaction completion.
- **Variable-path execution**: Decouples operations from payment methods, allowing different execution paths while maintaining obligation enforcement:
 ```move
  public struct Ticket { amount: u64 }
  
  public fun purchase_phone(ctx: &mut TxContext): (Phone, Ticket) {
      // Customer gets item and payment obligation
  }
  
  // Multiple payment methods can consume the same ticket
  public fun pay_in_bonus_points(ticket: Ticket, payment: Coin<BONUS>) { ... }
  public fun pay_in_usd(ticket: Ticket, payment: Coin<USD>) { ... }
  ```
-**Compositional linking**: Enables different modules to interact through shared hot potato obligations, creating modular and extensible systems where each module can add requirements or processing steps.
-**Framework usage**: Widely used in Sui Framework components like sui::borrow, sui::transfer_policy (TransferRequest), and sui::token (ActionRequest) for enforcing completion of multi-step operations.


---
### Useful Links
 - [The Publisher Authority](https://move-book.com/programmability/publisher.html)
 - [Pattern: Capability](https://move-book.com/programmability/capability.html)
 - [Pattern: Hot Potato](https://move-book.com/programmability/hot-potato-pattern)
 - 
