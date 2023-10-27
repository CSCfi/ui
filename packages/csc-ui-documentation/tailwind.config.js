/** @type {import('tailwindcss').Config} */
import { theme } from './tailwindTheme';

export default {
  content: [],
  theme: {
    extend: {
      ...theme,
    },
  },
  plugins: [],
};
