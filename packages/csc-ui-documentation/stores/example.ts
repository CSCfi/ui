import { defineStore } from 'pinia';
import { components } from '../../csc-ui/docs.json';
import { ComponentData } from '~/types/docs';

export const useExampleStore = defineStore('example', () => {
  const currentComponent = ref('');

  const pageTitles = ref<{ title: string; subtitle: string }>();

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

  return { componentData, currentComponent, parsedData, pageTitles };
});
