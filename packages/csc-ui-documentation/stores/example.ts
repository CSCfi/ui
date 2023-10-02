import { defineStore } from 'pinia';
import { ComponentData } from '../types/docs.d';
import { components } from '../docs.json';

export const useExampleStore = defineStore('example', () => {
  const currentComponent = ref('');

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
      .map((item) => ({
        ...item,
        props: item.props.filter((e) =>
          e.docsTags.every((tag: any) => tag.name !== 'private'),
        ),
        events: item.events.filter((e) =>
          e.docsTags.every((tag) => tag.name !== 'private'),
        ),
      }));

    return parentComponents.map((item) => {
      const children = parsed
        .filter((component) =>
          component.docsTags.some(
            (docsTag) => docsTag.name === 'parent' && docsTag.text === item.tag,
          ),
        )
        .map((child) => ({
          ...child,
          props: child.props.filter((e) =>
            e.docsTags.every((tag: any) => tag.name !== 'private'),
          ),
          events: child.events.filter((e) =>
            e.docsTags.every((tag) => tag.name !== 'private'),
          ),
        }));

      return { ...item, children };
    });
  };

  const parsedData = ref(parseComponents(components));

  const componentData = computed(() => {
    return parsedData.value.find(
      (component) => component.tag === currentComponent.value,
    );
  });

  return { componentData, currentComponent, parsedData };
});
