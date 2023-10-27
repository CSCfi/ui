export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    html.head.push(
      `<link rel="preload" href="https://use.typekit.net/csv4mjm.css" as="style" crossorigin />`,
    );
  });
});
