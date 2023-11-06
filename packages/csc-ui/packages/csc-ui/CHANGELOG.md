# Changelog

## [1.0.4](https://github.com/CSCfi/ui/compare/v1.0.3...v1.0.4) (2023-11-06)


### Bug Fixes

* c-dropdown - use dialog element to fix z-index issues when inside c-modal ([4b6ea11](https://github.com/CSCfi/ui/commit/4b6ea11ad2b96cd3c972abd58fc42e92e90a3b52))

## [1.0.3](https://github.com/CSCfi/ui/compare/v1.0.2...v1.0.3) (2023-11-01)


### Bug Fixes

* c-radio-group - Fix using label as a prop with c-radio items ([ceff2fc](https://github.com/CSCfi/ui/commit/ceff2fc419881229e4aa0d26828a2db6389e5e82))

## [1.0.2](https://github.com/CSCfi/ui/compare/v1.0.1...v1.0.2) (2023-10-30)


### Bug Fixes

* Fix CSS root definitions ([0bbbed8](https://github.com/CSCfi/ui/commit/0bbbed81fe0ca0f8cd50e181c33841a848791d81))

## [1.0.1](https://github.com/CSCfi/ui/compare/v1.0.0...v1.0.1) (2023-10-30)


### Bug Fixes

* c-card: Enable scrolling in fullscreen mode ([568f46a](https://github.com/CSCfi/ui/commit/568f46a79809d48a50f31054a2c7a071642a8697))

## [1.0.0](https://github.com/CSCfi/ui/compare/v0.0.1...v1.0.0) (2023-10-27)


### ⚠ BREAKING CHANGES

* Changed label into name in radio group items. Items can now be disabled
* Make otp input and radio button group work with regular form
* Form related components work now with regular form
* Removed c-flex and c-container
* Custom trigger removed: Datatable allows nesting. Renamed simple and nohover props.
* Removed path prop from c-button
* Removed number prop from c-text-field
* Unify c-tab-buttons keyboard usage with c-tabs usage
* New components: c-tab-items and c-tab-item
* Side navigation: Three-level support, Remove named main slot
* Simplified c-link usage with an icon

### Features

* Add loading state to c-icon-button ([07a5523](https://github.com/CSCfi/ui/commit/07a552351a74aa4cb0f9f95852e097cdd2d6a5f3))
* Add prop to justify tabs ([ac53d26](https://github.com/CSCfi/ui/commit/ac53d26a3f97e8c8eade0da38572b5379695c980))
* C-checkbox works inside a native html form ([f5797cd](https://github.com/CSCfi/ui/commit/f5797cd6b8746c248edab823804c078dbe84e89b))
* Changed label into name in radio group items. Items can now be disabled ([62b859f](https://github.com/CSCfi/ui/commit/62b859fc348b8e7e14d1ab294461fcce6f80507d))
* Children can now be nested in c-data-table ([0c8e1b9](https://github.com/CSCfi/ui/commit/0c8e1b9436b6f7566cb9475776d76fd7012cea4d))
* Form related components work now with regular form ([126d367](https://github.com/CSCfi/ui/commit/126d36734a9b987e3efd3cd1a406f52dff764ded))
* Make otp input and radio button group work with regular form ([2e086e3](https://github.com/CSCfi/ui/commit/2e086e3fb92f3f8cc51b58bd32d28dd1f0268e61))
* New component - c-list ([5f088d6](https://github.com/CSCfi/ui/commit/5f088d69684dd97e7ad488ec44432fd42775057a))
* New component - c-page ([51b012e](https://github.com/CSCfi/ui/commit/51b012ee7167563b6b55de98075de03bdf310742))
* New component - c-radio ([f9a6414](https://github.com/CSCfi/ui/commit/f9a64144188c90e7b3ae5a5af7245b1551dd43be))
* New component - c-side-navigation-title ([a05755a](https://github.com/CSCfi/ui/commit/a05755a9d4643b9a47f6ecc3b7e2b192a382184b))
* New component - c-table ([948128f](https://github.com/CSCfi/ui/commit/948128f97f93597707a6d97fec780e8857df37a0))
* new component - c-tags ([8fa8d48](https://github.com/CSCfi/ui/commit/8fa8d487a4d43f208b767d670941b46677e6e09d))
* New component: c-option-value. Used with c-autocomplete ([5aaefa2](https://github.com/CSCfi/ui/commit/5aaefa2854fed945bd6463bb7236f1ede8789b04))
* New components: c-tab-items and c-tab-item ([4571423](https://github.com/CSCfi/ui/commit/4571423ab020b34a65fe7657c2d7e48e9c7ccbf2))
* Removed c-flex and c-container ([3188279](https://github.com/CSCfi/ui/commit/31882794381f5b924fc66bdca4acad54aab99fc9))
* Removed number prop from c-text-field ([8c68a64](https://github.com/CSCfi/ui/commit/8c68a6426d86980a4f6013c0187c51b722b7677a))
* Removed path prop from c-button ([8723101](https://github.com/CSCfi/ui/commit/8723101e60b868b6d2191b388086a41ea10273f2))
* Side navigation: Three-level support, Remove named main slot ([580fb5b](https://github.com/CSCfi/ui/commit/580fb5b60c4d448ef5caec7d181a1d14122b0841))
* Vertical tabs ([c89ba83](https://github.com/CSCfi/ui/commit/c89ba8397839092afee19e5de7da1f2987b2b61b))


### Bug Fixes

* Unify c-tab-buttons keyboard usage with c-tabs usage ([8144cfc](https://github.com/CSCfi/ui/commit/8144cfcc844c289a8081cc62f990d5c06694d91c))
* Use dynamic gap in c-card and c-login-buttons ([7ff05dd](https://github.com/CSCfi/ui/commit/7ff05dd68b6774ad71f26e4aea62b94c2abaa7a4))


### Code Refactoring

* Custom trigger removed: Datatable allows nesting. Renamed simple and nohover props. ([5ad7faf](https://github.com/CSCfi/ui/commit/5ad7fafdac75ac3bd5c34516ef63706e93d624f0))
* Simplified c-link usage with an icon ([4422a0d](https://github.com/CSCfi/ui/commit/4422a0d1d8dce383a06d78e43cc7fafe7dee5996))
