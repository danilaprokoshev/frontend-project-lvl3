import onChange from 'on-change';
import i18n from 'i18next';
import { openModalHandler, closeModalHandler, linkHandler } from '../handlers/handlers.js';

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

const renderProcessError = (inputEl, feedbackEl, value) => {
  inputEl.classList.remove('is-invalid');
  feedbackEl.classList.remove('text-success');
  feedbackEl.classList.add('text-danger');
  feedbackEl.textContent = value;
};

const renderSuccessFeedback = (inputEl, feedbackEl) => {
  inputEl.classList.remove('is-invalid');
  feedbackEl.classList.remove('text-danger');
  feedbackEl.classList.add('text-success');
  feedbackEl.textContent = i18n.t('form.success_feedback');
};

const renderFeeds = (body, watchedState) => {
  const feedsColumn = body.querySelector('.feeds');
  feedsColumn.innerHTML = '';
  const feedsTitle = document.createElement('h2');
  feedsTitle.textContent = i18n.t('feeds');
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

const renderPosts = (body, watchedState, postsColumn, postsTitle, postsUlEl) => {
  postsColumn.innerHTML = '';
  postsTitle.textContent = i18n.t('posts');
  postsUlEl.innerHTML = '';
  watchedState.posts.forEach((post) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const aEl = document.createElement('a');
    if (post.viewed) {
      aEl.classList.add('fw-normal');
    } else {
      aEl.classList.add('fw-bold');
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
    button.textContent = i18n.t('view');
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

export default (state, body) => {
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
        renderProcessError(inputEl, feedbackEl, watchedState.processError);
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
        if (value === i18n.t('form.network_error')) {
          renderProcessError(inputEl, feedbackEl, value);
        }
        if (value === i18n.t('form.validation.invalid_rss')) {
          renderProcessError(inputEl, feedbackEl, value);
        }
        break;
      case 'feeds':
        renderFeeds(body, watchedState);
        renderSuccessFeedback(inputEl, feedbackEl);
        form.reset();
        break;
      case 'posts':
        renderPosts(body, watchedState, postsColumn, postsTitle, postsUlEl);
        break;
      case 'modalPost':
        if (value) {
          renderModal(body, watchedState);
        } else closeModal(body);
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
