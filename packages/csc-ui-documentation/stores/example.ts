import { defineStore } from 'pinia';
import { components, typeLibrary } from '../../csc-ui/docs.json';
import { ComponentData } from '~/types/docs';

export const useExampleStore = defineStore('example', () => {
  const currentComponent = ref('');

  const parseChild = (child: ComponentData) => ({
    ...child,
    props: child.props.filter((e) =>
      e.docsTags.every((tag: any) => tag.name !== 'private'),
    ),
    events: child.events.filter((e) =>
      e.docsTags.every((tag) => tag.name !== 'private'),
    ),
    methods: child.methods.filter((e) =>
      e.docsTags.every((tag) => tag.name !== 'private'),
    ),
  });

  const parseComponents = (items: any) => {
    const parsed: ComponentData[] = items.map((component: any) => ({
      ...component,
      name: component.tag.replace(/^c-/, '').replaceAll('-', ' '),
    }));

    const parentComponents = parsed
      .filter(
        (component) =>
          !component.docsTags.some((docsTag) => docsTag.name === 'parent'),
      )
      .map(parseChild);

    return parentComponents.map((item) => {
      const children = parsed
        .filter((component) =>
          component.docsTags.some(
            (docsTag) => docsTag.name === 'parent' && docsTag.text === item.tag,
          ),
        )
        .map(parseChild);

      return { ...item, children };
    });
  };

  const parsedData = ref(parseComponents(components));

  const componentData = computed(() => {
    return parsedData.value.find(
      (component) => component.tag === currentComponent.value,
    );
  });

  const types = computed(() => {
    const definitions = new Map();

    Object.values(typeLibrary).forEach((type) => {
      const tag = type.path.split('/').at(-1)?.replace('.tsx', '');
      const definition = type.declaration.replace('export ', '');

      if (tag?.startsWith('c-') && !definition.startsWith('type _')) {
        const existingItem = definitions.get(tag) || [];

        definitions.set(tag, [...existingItem, definition]);
      }
    });

    return definitions;
  });

  return { componentData, currentComponent, parsedData, types };
});
