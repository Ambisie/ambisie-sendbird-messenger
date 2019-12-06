import styles from '../../scss/modal.scss';
import { createDivEl } from '../utils';
import { Spinner } from './Spinner';

class Modal {
  constructor({ title, description, submitText, widgetContainerEl }) {
    this.widgetContainerEl = widgetContainerEl;
    this.contentElement    = null;
    this.cancelHandler     = null;
    this.submitHandler     = null;
    this.element           = this._create({ title, description, submitText });
  }

  _create({ title, description, submitText }) {
    const root = createDivEl({ className: styles['modal-root'] });
    const modal = createDivEl({ className: styles['modal-body'] });
    root.appendChild(modal);

    const titleText = createDivEl({ className: styles['modal-title'], content: title });
    modal.appendChild(titleText);

    const desc = createDivEl({ className: styles['modal-desc'], content: description });
    modal.appendChild(desc);

    this.contentElement = createDivEl({ className: styles['modal-content'] });
    modal.appendChild(this.contentElement);

    const bottom = createDivEl({ className: styles['modal-bottom'] });
    modal.appendChild(bottom);
    const cancel = createDivEl({ className: styles['modal-cancel'], content: 'CANCEL' });
    cancel.addEventListener('click', () => {
      if (this.cancelHandler) {
        this.cancelHandler();
      }
      this.close();
    });
    bottom.appendChild(cancel);
    const submit = createDivEl({ className: styles['modal-submit'], content: submitText });
    submit.addEventListener('click', () => {
      Spinner.start(modal);
      if (this.submitHandler) {
        this.submitHandler();
      }
    });
    bottom.appendChild(submit);

    return root;
  }

  close() {
    if (this.widgetContainerEl.contains(this.element)) {
      this.widgetContainerEl.removeChild(this.element);
    }
  }

  render() {
    if (!this.widgetContainerEl.querySelector(`.${styles['modal-root']}`)) {
      this.widgetContainerEl.appendChild(this.element);
    }
  }
}

export { Modal };
