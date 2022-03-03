import { Component, h, Prop } from '@stencil/core';
/**
 * @parent c-card
 * @slot - Card actions
 */
@Component({
  tag: 'c-card-actions',
  styleUrl: 'c-card-actions.scss',
  shadow: true,
})
export class CCardActions {
  /**
   * Align actions to the right
   */
  @Prop() right = false;
  render() {
    return (
      <div class="c-card-actions">
        {this.right && <c-spacer></c-spacer>}
        <slot></slot>
      </div>
    );
  }
}
