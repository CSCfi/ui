import { Pipe, PipeTransform } from '@angular/core';
import { ComponentData } from 'src/interfaces/documentation';

interface ComponentGroup {
  name: string;
  components: ComponentData[];
  visible: boolean;
}

@Pipe({
  name: 'menuGroups',
})
export class MenuGroupsPipe implements PipeTransform {
  transform(menuItems: ComponentGroup[], grouped = true): ComponentGroup[] {
    if (!grouped) {
      return menuItems.filter((group) => group.name === 'ungrouped');
    }
    return menuItems.filter((group) => group.name !== 'ungrouped');
  }
}
