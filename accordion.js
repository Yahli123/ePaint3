(function () {
  const Accordion = function (element) {
    this.element = element;
    this.items = getChildrenByClassName(this.element, 'js-accordion__item');
    this.version = this.element.getAttribute('data-version')
      ? `-${this.element.getAttribute('data-version')}`
      : '';
    this.showClass = `accordion${this.version}__item--is-open`;
    this.animateHeight = this.element.getAttribute('data-animation') == 'on';
    this.multiItems = !(this.element.getAttribute('data-multi-items') == 'off');
    // deep linking options
    this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
    // init accordion
    this.initAccordion();
  };

  Accordion.prototype.initAccordion = function () {
    // set initial aria attributes
    for (let i = 0; i < this.items.length; i++) {
      const button = this.items[i].getElementsByTagName('button')[0];
      const content = this.items[i].getElementsByClassName(
        'js-accordion__panel',
      )[0];
      const isOpen = this.items[i].classList.contains(this.showClass)
        ? 'true'
        : 'false';
      button.setAttribute('aria-expanded', isOpen);
      button.setAttribute('aria-controls', `accordion-content-${i}`);
      button.setAttribute('id', `accordion-header-${i}`);
      button.classList.add('js-accordion__trigger');
      content.setAttribute('aria-labelledby', `accordion-header-${i}`);
      content.setAttribute('id', `accordion-content-${i}`);
    }

    // listen for Accordion events
    this.initAccordionEvents();

    // check deep linking option
    this.initDeepLink();
  };

  Accordion.prototype.initAccordionEvents = function () {
    const self = this;

    this.element.addEventListener('click', (event) => {
      const trigger = event.target.closest('.js-accordion__trigger');
      // check index to make sure the click didn't happen inside a children accordion
      if (
        trigger &&
        Array.prototype.indexOf.call(self.items, trigger.parentElement) >= 0
      )
        self.triggerAccordion(trigger);
    });
  };

  Accordion.prototype.triggerAccordion = function (trigger) {
    const bool = trigger.getAttribute('aria-expanded') === 'true';

    this.animateAccordion(trigger, bool, false);

    if (!bool && this.deepLinkOn) {
      history.replaceState(
        null,
        '',
        `#${trigger.getAttribute('aria-controls')}`,
      );
    }
  };

  Accordion.prototype.animateAccordion = function (trigger, bool, deepLink) {
    const self = this;
    const item = trigger.closest('.js-accordion__item');
    const content = item.getElementsByClassName('js-accordion__panel')[0];
    const ariaValue = bool ? 'false' : 'true';

    if (!bool) item.classList.add(this.showClass);
    trigger.setAttribute('aria-expanded', ariaValue);
    self.resetContentVisibility(item, content, bool);

    if ((!this.multiItems && !bool) || deepLink) this.closeSiblings(item);
  };

  Accordion.prototype.resetContentVisibility = function (item, content, bool) {
    item.classList.toggle(this.showClass, !bool);
    content.removeAttribute('style');
    if (bool && !this.multiItems) {
      // accordion item has been closed -> check if there's one open to move inside viewport
      this.moveContent();
    }
  };

  Accordion.prototype.closeSiblings = function (item) {
    // if only one accordion can be open -> search if there's another one open
    const index = Array.prototype.indexOf.call(this.items, item);
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].classList.contains(this.showClass) && i != index) {
        this.animateAccordion(
          this.items[i].getElementsByClassName('js-accordion__trigger')[0],
          true,
          false,
        );
        return false;
      }
    }
  };

  Accordion.prototype.moveContent = function () {
    // make sure title of the accordion just opened is inside the viewport
    const openAccordion = this.element.getElementsByClassName(this.showClass);
    if (openAccordion.length == 0) return;
    const boundingRect = openAccordion[0].getBoundingClientRect();
    if (boundingRect.top < 0 || boundingRect.top > window.innerHeight) {
      const windowScrollTop =
        window.scrollY || document.documentElement.scrollTop;
      window.scrollTo(0, boundingRect.top + windowScrollTop);
    }
  };

  Accordion.prototype.initDeepLink = function () {
    if (!this.deepLinkOn) return;
    const hash = window.location.hash.substr(1);
    if (!hash || hash == '') return;
    const trigger = this.element.querySelector(
      `.js-accordion__trigger[aria-controls="${hash}"]`,
    );
    if (trigger && trigger.getAttribute('aria-expanded') !== 'true') {
      this.animateAccordion(trigger, false, true);
      setTimeout(() => {
        trigger.scrollIntoView(true);
      });
    }
  };

  function getChildrenByClassName(el, className) {
    const { children } = el;
    const childrenByClass = [];
    for (let i = 0; i < children.length; i++) {
      if (children[i].classList.contains(className))
        childrenByClass.push(children[i]);
    }
    return childrenByClass;
  }

  window.Accordion = Accordion;

  // initialize the Accordion objects
  const accordions = document.getElementsByClassName('js-accordion');
  if (accordions.length > 0) {
    for (let i = 0; i < accordions.length; i++) {
      (function (i) {
        new Accordion(accordions[i]);
      })(i);
    }
  }
})();
