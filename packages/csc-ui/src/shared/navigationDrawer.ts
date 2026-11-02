/**
 * The side navigation's mobile drawer as c-navigation-button reports it
 * (`aria-expanded`): c-side-navigation writes it, every navigation button
 * reads it, so a button that renders later still reports the drawer. One
 * drawer per page, as one c-navigation-button toggles every drawer.
 */
import { reactive } from 'vue';

export const navigationDrawer = reactive({
  /** A mobile drawer is on the page (a desktop navigation has none). */
  mobile: false,

  open: false,
});
