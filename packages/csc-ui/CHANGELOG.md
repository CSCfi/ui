# Changelog

## [2.1.3](https://github.com/CSCfi/ui/compare/v2.1.2...v2.1.3) (2024-03-08)


### Bug Fixes

* **c-tabs:** Handle race condition in initial value handling ([820740d](https://github.com/CSCfi/ui/commit/820740d9ad0b93a863be02e6b98e4aaf1fa52376))

## [2.1.2](https://github.com/CSCfi/ui/compare/v2.1.1...v2.1.2) (2024-03-04)


### Bug Fixes

* **c-navigation-item:** Use anchor element if href prop is set ([818a18a](https://github.com/CSCfi/ui/commit/818a18a39443a25ed3e901b045e04fcbd5b46b3f))

## [2.1.1](https://github.com/CSCfi/ui/compare/v2.1.0...v2.1.1) (2024-03-01)


### Bug Fixes

* **c-accordion-item:** Fix header slot content not rendering when added dynamically ([4add81e](https://github.com/CSCfi/ui/commit/4add81e509d0efe27590061d9957516e8bd6be52))

## [2.1.0](https://github.com/CSCfi/ui/compare/v2.0.2...v2.1.0) (2024-02-27)


### Features

* **c-accordion:** add custom header slot ([a93a5ce](https://github.com/CSCfi/ui/commit/a93a5ce6499b83fa20045a3788a8ede87f29e37f))


### Bug Fixes

* **c-tag:** fix the outline color of the close button on keyboard focus ([8d69052](https://github.com/CSCfi/ui/commit/8d69052b9b12759f606bf5789acb249762d9f3a5))
* **c-tag:** fix the tabindex value of the flat variant ([fd47ecf](https://github.com/CSCfi/ui/commit/fd47ecf79a4514fac7bc25db2a6a44fa0008093c))

## [2.0.2](https://github.com/CSCfi/ui/compare/v2.0.1...v2.0.2) (2024-02-16)


### Bug Fixes

* Corrected repository location ([27a8087](https://github.com/CSCfi/ui/commit/27a808790cad6308a662932b2d55c41c031c0ea9))

## [2.0.1](https://github.com/CSCfi/ui/compare/v2.0.0...v2.0.1) (2024-02-09)


### Bug Fixes

* **c-tabs:** Update content properly on external change ([1166937](https://github.com/CSCfi/ui/commit/1166937ac9b4b3dbc1a3e1310a4fa97da03246bd))

## [2.0.0](https://github.com/CSCfi/ui/compare/v1.3.12...v2.0.0) (2024-02-01)


### ⚠ BREAKING CHANGES

* **c-pagination:** Renamed and moved page sizes to options object. PageSizes should be defined in pagination object instead of the footerOptions object in c-data-table.

### Features

* **c-pagination:** Renamed and moved page sizes to options object ([89f7434](https://github.com/CSCfi/ui/commit/89f74343acb00476827a40fc65e002cd4cf0a9da))


### Bug Fixes

* **c-pagination:** Possibility to override text color ([cf766a2](https://github.com/CSCfi/ui/commit/cf766a22253205bb95874569c669ba6288887e5e))
* **c-toolbar:** Possibility to override z-index ([167a3f7](https://github.com/CSCfi/ui/commit/167a3f7fde6870f4b7dda403ac5d33398022457a))

## [1.3.12](https://github.com/CSCfi/ui/compare/v1.3.11...v1.3.12) (2024-01-26)


### Bug Fixes

* c-checkbox & c-radio-group - Use c-message to display error and hint messages ([243a8bc](https://github.com/CSCfi/ui/commit/243a8bcd75aa27e871caad6cd1bc360b5baae264))

## [1.3.11](https://github.com/CSCfi/ui/compare/v1.3.10...v1.3.11) (2024-01-24)


### Bug Fixes

* c-tag - expose the tag border radius as a css variable ([bb860de](https://github.com/CSCfi/ui/commit/bb860def4be0b204d0a481e5ddce871164cfa045))

## [1.3.10](https://github.com/CSCfi/ui/compare/v1.3.9...v1.3.10) (2024-01-24)


### Bug Fixes

* c-tag - fix the badge position in the small size tags ([8561f42](https://github.com/CSCfi/ui/commit/8561f42ec84f0c9db88bf4af1855f03551c25db3))

## [1.3.9](https://github.com/CSCfi/ui/compare/v1.3.8...v1.3.9) (2024-01-23)


### Bug Fixes

* c-button - prevent content overflow ([3035a25](https://github.com/CSCfi/ui/commit/3035a2508eb22e2ee694d3ee98f42cdee5270463))
* c-navigation-item - allow the long labels to wrap ([3d39c48](https://github.com/CSCfi/ui/commit/3d39c48f6c333345a65f3b006f709afcf8cd8af2))
* c-otp-input - use value prop, add reset method ([089c915](https://github.com/CSCfi/ui/commit/089c91548aff6c5cb707728c18190f7afc595b5a))
* c-select & c-autocomplete - Disable page scroll on open ([2ec055d](https://github.com/CSCfi/ui/commit/2ec055d92386f90b9f6f92dc848d3696bf9e544d))
* c-tags - add small variant ([d6cd89d](https://github.com/CSCfi/ui/commit/d6cd89dd0f598c1c475ba9ff3802444d0a5ba878))

## [1.3.8](https://github.com/CSCfi/ui/compare/v1.3.7...v1.3.8) (2024-01-10)


### Bug Fixes

* c-autocomplete: Clicking outside de-activates the field properly ([3fe1486](https://github.com/CSCfi/ui/commit/3fe1486f0f7a65de37730d56510489db6bdb94a0))

## [1.3.7](https://github.com/CSCfi/ui/compare/v1.3.6...v1.3.7) (2023-12-20)


### Bug Fixes

* c-icon - make c-icon render correctly inside c-option ([1e15b5f](https://github.com/CSCfi/ui/commit/1e15b5f98c42a33801b6139f1ce2b338d9bb7f5f))

## [1.3.6](https://github.com/CSCfi/ui/compare/v1.3.5...v1.3.6) (2023-12-19)


### Bug Fixes

* c-text-field - Use onInput event for value emitting ([05eb741](https://github.com/CSCfi/ui/commit/05eb741f1d8ff2dbacd018164e2765c3d043b9f0))

## [1.3.5](https://github.com/CSCfi/ui/compare/v1.3.4...v1.3.5) (2023-12-15)


### Bug Fixes

* c-text-field - Fix negative number input ([8fb9271](https://github.com/CSCfi/ui/commit/8fb927158b999d30113db9a215c74f1a28d5a5f5))

## [1.3.4](https://github.com/CSCfi/ui/compare/v1.3.3...v1.3.4) (2023-12-14)


### Bug Fixes

* c-checkbox - Fix checkbox reactivity ([8bce735](https://github.com/CSCfi/ui/commit/8bce735117282e34cc66319a64d6e34ceee96eeb))

## [1.3.3](https://github.com/CSCfi/ui/compare/v1.3.2...v1.3.3) (2023-12-12)


### Bug Fixes

* c-autocomplete & c-select - Fix inputs not being disabled when indicated to ([aa17125](https://github.com/CSCfi/ui/commit/aa1712526181ad3148fbaec4a4c36e4762e9b776))

## [1.3.2](https://github.com/CSCfi/ui/compare/v1.3.1...v1.3.2) (2023-12-12)


### Bug Fixes

* c-autocomplete: Customizable messages for minimum query length and no matching items. Fixed outside click closing. ([cd51183](https://github.com/CSCfi/ui/commit/cd5118365da451f1f3ec7b2d47530a5888281730))

## [1.3.1](https://github.com/CSCfi/ui/compare/v1.3.0...v1.3.1) (2023-12-05)


### Bug Fixes

* c-select & c-autocomplete - prevent scrollbar visibility change from closing the dropdown on open ([3399c20](https://github.com/CSCfi/ui/commit/3399c2049f28a39dc5596df4663b20e0d0e89614))

## [1.3.0](https://github.com/CSCfi/ui/compare/v1.2.4...v1.3.0) (2023-12-01)


### Features

* c-main - Use dashboard layout by default ([75c4c85](https://github.com/CSCfi/ui/commit/75c4c8514f1a5c9ed4c9597a73739719d8da5849))
* c-page - Add footer slot ([de1ccbd](https://github.com/CSCfi/ui/commit/de1ccbdbff03baecd2389530fd55884e0d995d85))

## [1.2.4](https://github.com/CSCfi/ui/compare/v1.2.3...v1.2.4) (2023-11-30)


### Bug Fixes

* c-checkbox, c-switch & c-radio-group - Fix usage in html form ([d69b2cd](https://github.com/CSCfi/ui/commit/d69b2cd0f2ee09a80840fcd71ae899549a317846))
* c-table - Fix content not rendering in a basic html page ([93ed5c9](https://github.com/CSCfi/ui/commit/93ed5c9644aa4c1dced28c4ed9a30fd257542e2a))

## [1.2.3](https://github.com/CSCfi/ui/compare/v1.2.2...v1.2.3) (2023-11-30)


### Bug Fixes

* c-autocomplete - fix changeQuery event payload in Firefox ([d12b237](https://github.com/CSCfi/ui/commit/d12b237a68524db38f9988c179c3363e96ca2d3b))
* c-autocomplete & c-select - Fix keyboard navigation in Firefox ([9d29e63](https://github.com/CSCfi/ui/commit/9d29e635a2817dd6b4696b4fb624e5b946b0a0d2))

## [1.2.2](https://github.com/CSCfi/ui/compare/v1.2.1...v1.2.2) (2023-11-28)


### Bug Fixes

* c-select & c-autocomplete - Various fixes ([62fb676](https://github.com/CSCfi/ui/commit/62fb676e4a1c95383fd1c20a67e098b20300fb05))

## [1.2.1](https://github.com/CSCfi/ui/compare/v1.2.0...v1.2.1) (2023-11-24)


### Bug Fixes

* c-slider - fix element size ([cb9e66f](https://github.com/CSCfi/ui/commit/cb9e66f9c12731a762bbce6450b294e529860786))
* c-slider - fix slider tick active state with custom max values ([103c759](https://github.com/CSCfi/ui/commit/103c7594435987af5af75b47615a13108be05a92))

## [1.2.0](https://github.com/CSCfi/ui/compare/v1.1.1...v1.2.0) (2023-11-24)


### Features

* c-slider: New component ([8411454](https://github.com/CSCfi/ui/commit/84114547821d9ffc35ebb5358a2fa0c07690eef8))

## [1.1.1](https://github.com/CSCfi/ui/compare/v1.1.0...v1.1.1) (2023-11-24)


### Bug Fixes

* c-select, c-autocomplete: Fixed background color in mobile ([cd5f4b1](https://github.com/CSCfi/ui/commit/cd5f4b150a16835bb5578ca5aad096218c04c3e9))

## [1.1.0](https://github.com/CSCfi/ui/compare/v1.0.18...v1.1.0) (2023-11-21)


### Features

* c-radio-group: Return value by default. Added return object prop. ([5de552e](https://github.com/CSCfi/ui/commit/5de552ef3e405520003f5039e7c7d13aa631be77))


### Bug Fixes

* c-modal: Handle initial value ([de8ec61](https://github.com/CSCfi/ui/commit/de8ec61a9205862e1f040dc2adb5dbb511b4554d))
* c-select: shadow variant background colors ([f9aab61](https://github.com/CSCfi/ui/commit/f9aab6181a3def4b27e7a96a3a2cd59099a2532c))

## [1.0.18](https://github.com/CSCfi/ui/compare/v1.0.17...v1.0.18) (2023-11-20)


### Bug Fixes

* c-autocomplete, c-select: Fix flashing transition when clicked ([58b364b](https://github.com/CSCfi/ui/commit/58b364b61199f609291ac1b2a2f18dba6d8868e2))
* c-autocomplete: Do not show suggestions if query is empty or in loading state. ([1ca874b](https://github.com/CSCfi/ui/commit/1ca874b75f2a4069c13e4092b053be9ba445d792))
* c-tabs: prevent crash when disabled prop is not set ([5b67097](https://github.com/CSCfi/ui/commit/5b670971f98d13ec2f7be9157545254796be1ccd))
* Theme: Better error color. ([1b8f930](https://github.com/CSCfi/ui/commit/1b8f9309f0fd08f6f6d012e658a65b20b8bbcfb5))

## [1.0.17](https://github.com/CSCfi/ui/compare/v1.0.16...v1.0.17) (2023-11-20)


### Features

* c-autocomplete, c-select: Improved usability in mobile browsers. ([ce13cbe](https://github.com/CSCfi/ui/commit/ce13cbeaf4bc41bedb06921c6bfd8b189d907c11))

## [1.0.16](https://github.com/CSCfi/ui/compare/v1.0.15...v1.0.16) (2023-11-10)


### Bug Fixes

* c-card - prevent content from overflowing the card ([c1c38fb](https://github.com/CSCfi/ui/commit/c1c38fb47871d7d4bb6c97783bcdda6e9ea3b30f))

## [1.0.15](https://github.com/CSCfi/ui/compare/v1.0.14...v1.0.15) (2023-11-10)


### Bug Fixes

* c-card - use display flex on the host ([12f6891](https://github.com/CSCfi/ui/commit/12f6891a3e5bfbe8b1586cf6c25db057008d0856))

## [1.0.14](https://github.com/CSCfi/ui/compare/v1.0.13...v1.0.14) (2023-11-10)


### Bug Fixes

* c-dropdown - fix not being able to scroll with overflowing items ([add36e4](https://github.com/CSCfi/ui/commit/add36e4e19868817894108856904c00c72e7d641))

## [1.0.13](https://github.com/CSCfi/ui/compare/v1.0.12...v1.0.13) (2023-11-10)


### Bug Fixes

* c-dropdown: remove c-dropdowns and use c-dropdown directly on c-select and -c-autocomplete ([d77e897](https://github.com/CSCfi/ui/commit/d77e89733fcbd33c1904e679610bc790fa02505e))

## [1.0.12](https://github.com/CSCfi/ui/compare/v1.0.11...v1.0.12) (2023-11-09)


### Bug Fixes

* c-card: Firefox fullscreen toggle button position fix ([8a44beb](https://github.com/CSCfi/ui/commit/8a44bebb37eee0b210ae799d9b7b9242ebb5f69c))

## [1.0.11](https://github.com/CSCfi/ui/compare/v1.0.10...v1.0.11) (2023-11-09)


### Bug Fixes

* theme - add typography definitions to theme ([1bae3a4](https://github.com/CSCfi/ui/commit/1bae3a4ef05c9583db43c23da9c6cb9b4bd79669))

## [1.0.10](https://github.com/CSCfi/ui/compare/v1.0.9...v1.0.10) (2023-11-08)


### Bug Fixes

* c-tabs - make c-tab-item padding overridable ([9bdf352](https://github.com/CSCfi/ui/commit/9bdf35253ca2856c39646940c59e70076470af8c))

## [1.0.9](https://github.com/CSCfi/ui/compare/v1.0.8...v1.0.9) (2023-11-08)


### Bug Fixes

* c-page - use correct height ([495d585](https://github.com/CSCfi/ui/commit/495d58582572172a8cd3b4d0bf7307114ba39697))

## [1.0.8](https://github.com/CSCfi/ui/compare/v1.0.7...v1.0.8) (2023-11-07)


### Bug Fixes

* c-button - use correct loader color with disabled buttons ([4e5908a](https://github.com/CSCfi/ui/commit/4e5908a68484b8aaea376bc266b0af2017a110d5))

## [1.0.7](https://github.com/CSCfi/ui/compare/v1.0.6...v1.0.7) (2023-11-07)


### Bug Fixes

* c-page - Hide scroll indicator on default, use css variables for max-width and justify-content ([22b9918](https://github.com/CSCfi/ui/commit/22b9918d74661b071c1e094c7e41d7d5326f734f))
* c-side-navigation - remove redundant subnavitem slot ([f926407](https://github.com/CSCfi/ui/commit/f9264078b05020b00d09e66a55563daf44b63dde))

## [1.0.6](https://github.com/CSCfi/ui/compare/v1.0.5...v1.0.6) (2023-11-07)


### Bug Fixes

* c-dropdown - Use viewport size to determine the dropdown position ([33ddfdd](https://github.com/CSCfi/ui/commit/33ddfdd50668dc616958e44d9846ee00fadf6e32))

## [1.0.5](https://github.com/CSCfi/ui/compare/v1.0.4...v1.0.5) (2023-11-06)


### Bug Fixes

* c-autocomplete - Position dropdown on resize ([2208481](https://github.com/CSCfi/ui/commit/2208481e85f20e81269e5c62a6fe295d64de1aae))

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
