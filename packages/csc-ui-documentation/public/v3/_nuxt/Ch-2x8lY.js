import{n as c}from"./BnYXMzso.js";import{m as d,c as u,o as m,a as t,b as e,y as b,p as s}from"./Ch6KfFdQ.js";const p={class:"mt-6"},h={gap:"8"},g=["path"],v={outlined:""},k=["path"],y={class:"mt-6"},x={class:"mt-6"},f={class:"mt-6"},r=`--c-primary-100: var(--c-link-100);
  --c-primary-200: var(--c-link-200);
  --c-primary-300: var(--c-link-300);
  --c-primary-400: var(--c-link-400);
  --c-primary-500: var(--c-link-500);
  --c-primary-600: var(--c-link-600);
  --c-primary-700: var(--c-link-700);
  --c-primary-800: var(--c-link-800);
  --c-primary-900: var(--c-link-900);
  --c-primary-rgb: var(--c-link-rgb);`,i=`/* customize the c-switch */
  --c-switch-border-color: var(--c-black);
  --c-switch-handle-color: var(--c-black);
  --c-switch-border-color-active: var(--c-accent-600);
  --c-switch-slider-color-active: transparent;
  --c-switch-handle-color-active: var(--c-accent-600);

  /* customize c-icon-button border radius */
  --c-icon-button-border-radius: 4px;`,w=`.custom-button {
  /**
   * We're using the properties from the c-button,
   * but the same effect could be achieved by customizing the theme
   * inside here just like we did in the first example globally.
   */
  --c-button-background-color: var(--c-info-400);
  --c-button-text-color: var(--c-info-900);
  --c-button-background-color-hover: var(--c-accent-400);
  --c-button-border-radius: 100vw;
}`,C=`.custom-button {
  --c-button-background-color: $c-info-400;
  --c-button-text-color: $c-info-900;
  --c-button-background-color-hover: $c-accent-400;
  --c-button-border-radius: 100vw;
}`,z=`.custom-font {
  --c-font-family: cursive;
}`,S='<c-button class="custom-font">I should look different now</c-button>',$=d({__name:"customization",setup(j){const l=`:root {
  ${r}
}`,a=`:root {
  ${i}
}`;return(O,o)=>{const n=b("code-block");return m(),u("c-card",null,[o[13]||(o[13]=t("h1",{class:"text-4xl capitalize font-bold text-primary-600 pl-6"}," Customization ",-1)),t("c-card-content",null,[o[0]||(o[0]=t("h2",{class:"text-2xl capitalize font-bold text-primary-600"},"Components",-1)),o[1]||(o[1]=t("p",null,"CSC-UI components can be customized through the design tokens.",-1)),o[2]||(o[2]=t("p",null," Customizations can be made to the theme colors or individual components either globally or by component / container. ",-1)),o[3]||(o[3]=t("h2",{class:"text-xl text-primary"},"Customizing a theme color globally",-1)),e(n,{code:l,theme:"atom-one-dark",lang:"css","code-block-radius":"6px",highlightjs:"","persistent-copy-button":""})]),t("c-card-content",{style:r},o[4]||(o[4]=[t("div",null,[t("c-button",null,"Button")],-1),t("c-switch",null,"Switch",-1),t("c-checkbox",{"hide-details":""},"Checkbox",-1),t("c-tags",null,[t("c-tag",null,"Tag"),t("c-tag",{active:""},"Tag")],-1)])),t("c-card-content",p,[o[5]||(o[5]=t("h2",{class:"text-xl text-primary"},"Customizing components globally",-1)),e(n,{code:a,theme:"atom-one-dark",lang:"css","code-block-radius":"6px",highlightjs:"","persistent-copy-button":""})]),t("c-card-content",{style:i},[o[6]||(o[6]=t("c-switch",null,"Switch",-1)),t("c-row",h,[t("c-icon-button",null,[t("c-icon",{path:s(c)},null,8,g)]),t("c-icon-button",v,[t("c-icon",{path:s(c)},null,8,k)])])]),t("c-card-content",y,[o[7]||(o[7]=t("h2",{class:"text-xl text-primary"}," Customizing a component with a CSC class ",-1)),e(n,{code:'<c-button class="custom-button">Button</c-button>',theme:"atom-one-dark",lang:"html","code-block-radius":"6px",highlightjs:"","persistent-copy-button":""}),e(n,{code:w,theme:"atom-one-dark",lang:"css","code-block-radius":"6px",highlightjs:"","persistent-copy-button":""})]),o[14]||(o[14]=t("c-card-content",null,[t("div",null,[t("c-button",{class:"custom-button"},"Button")])],-1)),t("c-card-content",x,[o[8]||(o[8]=t("h2",{class:"text-xl text-primary"},"Customizing SCSS variables",-1)),o[9]||(o[9]=t("p",null," All the design tokens are also available as SCSS variables. They can be used to customize The components as well. ",-1)),e(n,{code:C,theme:"atom-one-dark",lang:"scss","code-block-radius":"6px",highlightjs:"","persistent-copy-button":""})]),t("c-card-content",f,[o[10]||(o[10]=t("h2",{class:"text-2xl capitalize font-bold text-primary-600"},"Typography",-1)),o[11]||(o[11]=t("p",null,"Font family used by CSC UI can also be customized",-1)),e(n,{code:z,theme:"atom-one-dark",lang:"css","code-block-radius":"6px",highlightjs:"","persistent-copy-button":""}),e(n,{code:S,theme:"atom-one-dark",lang:"html","code-block-radius":"6px",highlightjs:"","persistent-copy-button":""}),o[12]||(o[12]=t("div",null,[t("c-button",{class:"custom-font"},"I should look different now")],-1))])])}}});export{$ as default};
