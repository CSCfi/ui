import { ComponentData } from 'src/interfaces/documentation';
import sanitizeHtml from 'sanitize-html';
import docs from '../../../../../docs.json';

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

export function sanitize(code, sanitize = true) {
  return sanitize
    ? sanitizeHtml(code, {
        allowedTags: false,
        allowedAttributes: {
          '*': allowedAttributes,
        },
      })
    : code;
}
