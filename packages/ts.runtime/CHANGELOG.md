# @incmix/ts.runtime

## 2.6.0

### Minor Changes

- 2e2f058: All statements following the import statements in the tsr files are now inserted into the transformed file - between the import statements and the statements that follow them.
- 889ffe2: Added support for readonly keyword in TypeOperator.
- c0a1c23: Fixed suboptimal optional key representation - the optional attribute is now appended alongside the rest of a type's attributes
- 4689808: Added support for optional keys in objects

## 2.5.3

### Patch Changes

- 6a22842: fix tsrExtensionRE

## 2.5.2

### Patch Changes

- 05036bf: attempt to fix the vite plugin

## 2.5.1

### Patch Changes

- 8849d42: Fix ts runtime exports

## 2.5.0

### Minor Changes

- 3ad0cc5: Fix resolution in ts.runtime

## 2.4.0

### Minor Changes

- b263b09: Added support for empty statements
- cbf71ab: Fix bug where it was generating `values` instead of `members` this is not breaking because `members` was the expected output

## 2.3.0

### Minor Changes

- 44d9f15: Fixed enum bug. Enum visitor now produces correct export output - however two nodes need be produced in order for the reference that the enum attribute makes to be resolved. Currently only one node is produced.
- f836a11: Fixed enum id reference and finalised enum visit function
- dd1de77: refactor and add tests
- 936f2eb: Added enum visitor function - enums will simply be passed to the runtime (in the front-end)

## 2.2.0

### Minor Changes

- caf4e81: move vite to peer deps

## 2.1.0

### Minor Changes

- 02d9d6f: Add support for interfaces

## 2.0.2

### Patch Changes

- 3401ae2: bump (again)
- 3401ae2: bump again

## 2.0.1

### Patch Changes

- a18b5c7: bump

## 2.0.0

### Major Changes

- f0e767b: Release

### Patch Changes

- 995084a: test

## 1.9.0

### Minor Changes

- 6ee19af: test
- eb453a4: fix main and bin package json fields
- 4a678b2: Add support for arrays and tuple
- 4a7ce88: Add ROADMAP
- da39379: Add support for null, undefined, and optional fields
- ff91bf0: Attempt a fix
- 21d158b: Fix build
- c990f21: Refactor and remove bugs
- cb72d38: abc
- 37d8106: Try to fix changest
