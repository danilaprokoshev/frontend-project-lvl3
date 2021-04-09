import onChange from 'on-change';
import { openModalHandler, closeModalHandler, linkHandler } from '../handlers/handlers.js';

const renderFormError = (inputEl, feedbackEl, error) => {
  if (!error) {
    inputEl.classList.remove('is-invalid');
    feedbackEl.innerHTML = '';
    return;
  }
  inputEl.classList.add('is-invalid');
  feedbackEl.classList.add('text-danger');
  feedbackEl.textContent = error;
};

const renderProcessError = (inputEl, feedbackEl, value, i18nInstance) => {
  inputEl.classList.remove('is-invalid');
  feedbackEl.classList.remove('text-success');
  feedbackEl.classList.add('text-danger');
  feedbackEl.textContent = i18nInstance.t(value);
};

const renderSuccessFeedback = (inputEl, feedbackEl, i18nInstance) => {
  inputEl.classList.remove('is-invalid');
  feedbackEl.classList.remove('text-danger');
  feedbackEl.classList.add('text-success');
  feedbackEl.textContent = i18nInstance.t('form.success_feedback');
};

const renderFeeds = (feedsColumn, watchedState, i18nInstance) => {
  feedsColumn.innerHTML = '';
  const feedsTitle = document.createElement('h2');
  feedsTitle.textContent = i18nInstance.t('feeds');
  const feedsUlEl = document.createElement('ul');
  feedsUlEl.classList.add('list-group', 'mb-5');
  watchedState.feeds.forEach((feed) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');
    liEl.innerHTML = `<h3>${feed.title}</h3>
<p>${feed.description}</p>`;
    feedsUlEl.appendChild(liEl);
  });
  feedsColumn.appendChild(feedsTitle);
  feedsColumn.appendChild(feedsUlEl);
};

const renderPosts = (watchedState, postsColumn, postsTitle, postsUlEl, i18nInstance) => {
  postsColumn.innerHTML = '';
  postsTitle.textContent = i18nInstance.t('posts');
  postsUlEl.innerHTML = '';
  watchedState.posts.forEach(({ dataId, title, link }) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const aEl = document.createElement('a');
    aEl.classList.add((watchedState.viewedPosts.has(dataId)) ? 'font-weight-normal' : 'font-weight-bold');
    aEl.setAttribute('href', link);
    aEl.setAttribute('target', '_blank');
    aEl.setAttribute('rel', 'noopener noreferrer');
    aEl.textContent = title;
    aEl.addEventListener('click', () => linkHandler(dataId, watchedState));
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'btn-sm');
    button.dataset.toggle = 'modal';
    button.dataset.target = '#modal';
    button.textContent = i18nInstance.t('view');
    button.addEventListener('click', () => openModalHandler(dataId, watchedState));
    liEl.appendChild(aEl);
    liEl.appendChild(button);
    postsUlEl.appendChild(liEl);
  });
  postsColumn.appendChild(postsTitle);
  postsColumn.appendChild(postsUlEl);
};

const renderModal = (modal, watchedState) => {
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const modalReadFullArticle = modal.querySelector('.full-article');
  const backdropEl = document.createElement('div');
  modal.classList.add('show');
  modal.style.display = 'block';
  modalTitle.textContent = watchedState.modalPost.title;
  modalBody.textContent = watchedState.modalPost.description;
  modalReadFullArticle.href = watchedState.modalPost.link;
  backdropEl.classList.add('modal-backdrop', 'fade', 'show');
  const body = modal.closest('body');
  body.appendChild(backdropEl);
  body.classList.add('modal-open');
};

const closeModal = (modal) => {
  const body = modal.closest('body');
  const backdropEl = body.querySelector('.modal-backdrop');
  modal.classList.remove('show');
  modal.style.display = 'none';
  backdropEl.remove();
  body.classList.remove('modal-open');
};

export default (state, form, feedbackEl, feedsColumn,
  postsColumn, modal, closeModalButtons, i18nInstance) => {
  const inputEl = form.querySelector('input');
  const submitButton = form.querySelector('[type="submit"]');
  const postsTitle = document.createElement('h2');
  const postsUlEl = document.createElement('ul');
  postsUlEl.classList.add('list-group');

  const processStateHandler = (processState, watchedState) => {
    switch (processState) {
      case 'sending':
        submitButton.setAttribute('disabled', 'true');
        inputEl.setAttribute('readonly', 'readonly');
        renderProcessError(inputEl, feedbackEl, watchedState.processError, i18nInstance);
        break;
      case 'processed':
        submitButton.removeAttribute('disabled');
        inputEl.removeAttribute('readonly');
        break;
      case 'failed':
        submitButton.removeAttribute('disabled');
        inputEl.removeAttribute('readonly');
        renderProcessError(inputEl, feedbackEl, watchedState.processError, i18nInstance);
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  };

  const modalPostHandler = (value, watchedState) => {
    if (value) {
      renderModal(modal, watchedState);
    } else {
      closeModal(modal);
    }
  };

  const watchedState = onChange(state, (path, value) => {
    console.log(watchedState);
    switch (path) {
      case 'processState':
        processStateHandler(value, watchedState);
        break;
      case 'form.error':
        renderFormError(inputEl, feedbackEl, value);
        break;
      case 'processError':
        renderProcessError(inputEl, feedbackEl, value, i18nInstance);
        break;
      case 'feeds':
        renderFeeds(feedsColumn, watchedState, i18nInstance);
        renderSuccessFeedback(inputEl, feedbackEl, i18nInstance);
        form.reset();
        break;
      case 'posts':
        renderPosts(watchedState, postsColumn, postsTitle, postsUlEl, i18nInstance);
        break;
      case 'viewedPosts':
        renderPosts(watchedState, postsColumn, postsTitle, postsUlEl, i18nInstance);
        break;
      case 'modalPost':
        modalPostHandler(value, watchedState);
        break;
      default:
        break;
    }
  });

  closeModalButtons.forEach((button) => {
    button.addEventListener('click', () => closeModalHandler(watchedState));
  });

  return watchedState;
};
