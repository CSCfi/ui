import { Component, h, Listen, Prop, State } from '@stencil/core';
import Swiper, { Navigation, SwiperOptions } from 'swiper';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

/**
 * @group Content Selectors
 * @slot - Default slot for the c-swiper-tab elements
 */
@Component({
  tag: 'c-swiper',
  styleUrl: 'c-swiper.scss',
  shadow: false,
})
export class CSwiper {
  /**
   * Value of the swiper
   */
  @Prop({ reflect: true, mutable: true }) value: number | string;

  @State() isBeginning = true;
  @State() isEnd = false;

  private _container?: HTMLDivElement;
  private _wrapper?: HTMLDivElement;
  private _swiper: any;
  private _options: SwiperOptions;

  @Listen('changeValue')
  onTabClick(event: MouseEvent) {
    this.value = event.detail;

    this.slotItems.forEach((child) => {
      child.active = child.value === event.detail;
    });
  }

  @Listen('focusTab', { passive: true })
  onTabFocus(event: CustomEvent<number | string>) {
    const index = (event.target as HTMLCSwiperTabElement).dataset.index;

    this._swiper.slideTo(index);
    this._swiper.update();
  }

  get slotItems() {
    return Array.from(this._wrapper.children) as HTMLCSwiperTabElement[];
  }

  componentDidLoad() {
    console.log('🤡🤡🤡', this.value);

    this._options = {
      modules: [Navigation],
      breakpointsBase: 'container',
      loop: false,
      speed: 300,
      slideToClickedSlide: true,
      slidesPerView: 1,
      spaceBetween: 16,
      threshold: 4,
      breakpoints: {
        480: {
          slidesPerView: 2,
        },
        720: {
          slidesPerView: 3,
        },
        960: {
          slidesPerView: 4,
        },
      },
      navigation: {
        nextEl: '.c-icon-button--next',
        prevEl: '.c-icon-button--prev',
      },
      keyboard: true,
    };

    this._initSwiper();
  }

  private _initSwiper() {
    console.log('🤡', this.value);

    for (const [index, slide] of this.slotItems.entries()) {
      slide.classList.add('swiper-slide');
      slide.setAttribute('data-index', index.toString());
      slide.value = slide.value ?? index;
      slide.active = this.value === slide.value;
      console.log(this.value, slide.value);
    }

    this._swiper = new Swiper(this._container, {
      ...this._options,
    });

    this._swiper.on('activeIndexChange', ({ isBeginning, isEnd }) => {
      this.isBeginning = isBeginning;
      this.isEnd = isEnd;
    });
  }

  render() {
    return (
      <div class="c-swiper swiper">
        <div
          class="swiper-container"
          ref={(el) => (this._container = el as HTMLDivElement)}
        >
          <div
            class="swiper-wrapper"
            ref={(el) => (this._wrapper = el as HTMLDivElement)}
          >
            <slot />
          </div>

          <div class="c-swiper__navigation">
            <c-icon-button
              class="c-icon-button--prev"
              disabled={this.isBeginning}
              size="small"
              ghost
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d={mdiChevronLeft} />
              </svg>
            </c-icon-button>
            <c-icon-button
              class="c-icon-button--next"
              disabled={this.isEnd}
              size="small"
              ghost
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d={mdiChevronRight} />
              </svg>
            </c-icon-button>
          </div>
        </div>
      </div>
    );
  }
}
