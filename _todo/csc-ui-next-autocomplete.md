# CAutocomplete
- We want to create a new CAutocomplete component

## Behaviour
- use separate search input above of the options
- make the field clearable.
  - 'clearable' prop (boolean)
- filter by default by start of the option labels
  - filtering function should be customizable
- should inform the user if there are no search results
  - prepend the information text with an orange (text-warning-600) '<c-icon :path="mdiAlert" />'
- selected item should be indicated clearly in the dropdown options
- all options should be visible when the dropdown is open, unless the user has entered a filtering query
- follow standard accessibility / best practices for autocompletes / comboboxes
- should have the same functionality as CTextField (minus the rows prop for example)
  - floating label
  - hint
  - validation
  - slots
  - etc.

## Usage

```html
<c-autocomplete name="foo" label="Choose an option" placeholder="Type to filter..." clearable>
  <c-option value="option-1">Option 1</c-option>
  <c-option value="option-2">Option 2</c-option>
  <c-option value="option-3">Option 3</c-option>
  <c-option value="option-4" disabled>Option 4</c-option>
  <c-option value="option-5">Option 5</c-option>
  <c-option value="option-6">Option 6</c-option>
</c-autocomplete>
```

### Custom filter method
in vue:

```html
<c-autocomplete
  v-model="selectedOption"
  :filter="(option, query) => option.label.toLowerCase().includes(query.toLowerCase())"
  label="Choose an option"
  placeholder="Type to filter..."
  clearable
>
  <c-option value="option-1">Option 1</c-option>
  ...
</c-autocomplete>
```

in vanilla js

```typescript
<script type="module">
  const autocomplete = document.querySelector('.custom-filter');

  // Custom filter that matches anywhere in the label (not just the start)
  autocomplete.filter = (option, query) => {
    return option.label.toLowerCase().includes(query.toLowerCase());
  };
</script>
```

## Visual references

![Autocomplete open](./data/autocomplete-open.jpg)
![Autocomplete open, no search results](./data/autocomplete-no-results.jpg)

- do not create the component to match the references. Get the basic idea from them and match current component styling (CMenu for the options and dropdown, old c-autocomplete from csc-ui for the input)
