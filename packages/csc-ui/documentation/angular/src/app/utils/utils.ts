import { ComponentData } from 'src/interfaces/documentation';
import sanitizeHtml from 'sanitize-html';
import prettier, { Options } from 'prettier';
import parser from 'prettier/parser-html';
import babelParser from 'prettier/parser-babel';
import docs from '../../../../../docs.json';

const prettierConfig: Options = {
  parser: 'angular',
  plugins: [parser],
  trailingComma: 'all',
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  bracketSpacing: true,
  bracketSameLine: false,
  printWidth: 50,
  htmlWhitespaceSensitivity: 'ignore',
};

const attrs = docs.components?.reduce(
  (items, component) => {
    items.push(...component.props.map((prop) => prop.attr || prop.name));

    return items;
  },
  ['class', 'style', 'slot'],
);

const allowedAttributes = [...new Set(attrs)];

export function parseComponents(docs) {
  const components: ComponentData[] = docs.components.map((component) => ({
    ...component,
    name: component.tag.replace(/^c-/, '').replaceAll('-', ' '),
  }));

  const parentComponents = components
    .filter((component) => !component.docsTags.some((docsTag) => docsTag.name === 'parent'))
    .map((item) => ({
      ...item,
      props: item.props.filter((e) => e.docsTags.every((tag) => tag.name !== 'private')),
      events: item.events.filter((e) => e.docsTags.every((tag) => tag.name !== 'private')),
    }));

  return parentComponents.map((item) => {
    const children = components
      .filter((component) =>
        component.docsTags.some(
          (docsTag) => docsTag.name === 'parent' && docsTag.text === item.tag,
        ),
      )
      .map((child) => ({
        ...child,
        props: child.props.filter((e) => e.docsTags.every((tag) => tag.name !== 'private')),
        events: child.events.filter((e) => e.docsTags.every((tag) => tag.name !== 'private')),
      }));

    return { ...item, children };
  });
}

export function formatScript(code) {
  let formattedCode = '';

  try {
    formattedCode = code
      ? prettier.format(code, {
          ...prettierConfig,
          parser: 'babel',
          plugins: [babelParser],
        })
      : null;
  } catch (error) {
    formattedCode = code;
  } finally {
    return formattedCode;
  }
}

export function formatTemplate(code, sanitize = true) {
  return prettier.format(
    sanitize
      ? sanitizeHtml(code, {
          allowedTags: false,
          allowedAttributes: {
            '*': allowedAttributes,
          },
        })
      : code,
    prettierConfig,
  );
}
