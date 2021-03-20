import onChange from 'on-change';
// import i18n from 'i18next';
import { openModalHandler, closeModalHandler, linkHandler } from '../handlers/handlers.js';
// import i18n from "i18next";

const renderFormError = (inputEl, feedbackEl, error) => {
  if (!error.url) {
    inputEl.classList.remove('is-invalid');
    feedbackEl.innerHTML = '';
    return;
  }
  inputEl.classList.add('is-invalid');
  feedbackEl.classList.add('text-danger');
  feedbackEl.textContent = error.url.message;
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

const renderFeeds = (body, watchedState, i18nInstance) => {
  const feedsColumn = body.querySelector('.feeds');
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

const renderPosts = (body, watchedState, postsColumn, postsTitle, postsUlEl, i18nInstance) => {
  postsColumn.innerHTML = '';
  postsTitle.textContent = i18nInstance.t('posts');
  postsUlEl.innerHTML = '';
  watchedState.posts.forEach((post) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const aEl = document.createElement('a');
    if (post.viewed) {
      aEl.classList.add('font-weight-normal');
    } else {
      aEl.classList.add('font-weight-bold');
    }
    aEl.setAttribute('href', post.link);
    aEl.setAttribute('target', '_blank');
    aEl.setAttribute('rel', 'noopener noreferrer');
    aEl.textContent = post.title;
    aEl.addEventListener('click', () => linkHandler(post.dataId, watchedState));
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'btn-sm');
    button.dataset.toggle = 'modal';
    button.dataset.target = '#modal';
    button.textContent = i18nInstance.t('view');
    button.addEventListener('click', () => openModalHandler(post.dataId, watchedState));
    liEl.appendChild(aEl);
    liEl.appendChild(button);
    postsUlEl.appendChild(liEl);
  });
  postsColumn.appendChild(postsTitle);
  postsColumn.appendChild(postsUlEl);
};

const renderModal = (body, watchedState) => {
  const modal = body.querySelector('#modal');
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
  body.appendChild(backdropEl);
  body.classList.add('modal-open');
};

const closeModal = (body) => {
  const modal = body.querySelector('#modal');
  const backdropEl = body.querySelector('.modal-backdrop');
  modal.classList.remove('show');
  modal.style.display = 'none';
  backdropEl.remove();
  body.classList.remove('modal-open');
};

export default (state, body, i18nInstance) => {
  const form = body.querySelector('.rss-form');
  const inputEl = body.querySelector('input');
  const feedbackEl = body.querySelector('.feedback');
  const submitButton = body.querySelector('[type="submit"]');

  const postsColumn = body.querySelector('.posts');
  const postsTitle = document.createElement('h2');
  const postsUlEl = document.createElement('ul');
  postsUlEl.classList.add('list-group');

  const processStateHandler = (processState, watchedState) => {
    switch (processState) {
      case 'sending':
        submitButton.setAttribute('disabled', 'true');
        inputEl.setAttribute('readonly', 'readonly');
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

  const watchedState = onChange(state, (path, value) => {
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
        renderFeeds(body, watchedState, i18nInstance);
        renderSuccessFeedback(inputEl, feedbackEl, i18nInstance);
        form.reset();
        break;
      case 'posts':
        renderPosts(body, watchedState, postsColumn, postsTitle, postsUlEl, i18nInstance);
        break;
      case 'modalPost':
        if (value) {
          renderModal(body, watchedState);
        } else {
          closeModal(body);
        }
        break;
      default:
        break;
    }
  });

  const closeModalButtons = body.querySelectorAll('[data-dismiss="modal"]');
  closeModalButtons.forEach((button) => {
    button.addEventListener('click', () => closeModalHandler(watchedState));
  });

  return watchedState;
};
