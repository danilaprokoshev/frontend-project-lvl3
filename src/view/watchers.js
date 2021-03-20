import onChange from 'on-change';
import i18n from 'i18next';

const renderFormError = (inputEl, feedbackEl, error) => {
  if (!error.url) {
    inputEl.classList.remove('is-invalid');
    feedbackEl.innerHTML = ''; // eslint-disable-line
    return;
  }
  inputEl.classList.add('is-invalid');
  feedbackEl.classList.add('text-danger');
  feedbackEl.textContent = error.url.message; // eslint-disable-line
};

const renderProcessError = (inputEl, feedbackEl, value) => {
  inputEl.classList.remove('is-invalid');
  feedbackEl.classList.remove('text-success');
  feedbackEl.classList.add('text-danger');
  feedbackEl.textContent = value; // eslint-disable-line
};

const renderSuccessFeedback = (inputEl, feedbackEl) => {
  inputEl.classList.remove('is-invalid');
  feedbackEl.classList.remove('text-danger');
  feedbackEl.classList.add('text-success');
  feedbackEl.textContent = i18n.t('form.success_feedback'); // eslint-disable-line
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

const renderPosts = (body, watchedState) => {
  const postsColumn = body.querySelector('.posts');
  postsColumn.innerHTML = '';
  const postsTitle = document.createElement('h2');
  postsTitle.textContent = i18n.t('posts');
  const postsUlEl = document.createElement('ul');
  postsUlEl.classList.add('list-group');
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
    aEl.dataset.id = post.dataId;
    aEl.setAttribute('target', '_blank');
    aEl.setAttribute('rel', 'noopener noreferrer');
    aEl.textContent = post.title;
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'btn-sm');
    button.dataset.id = post.dataId;
    button.dataset.toggle = 'modal';
    button.dataset.target = '#modal';
    button.textContent = i18n.t('view');
    liEl.appendChild(aEl);
    liEl.appendChild(button);
    postsUlEl.appendChild(liEl);
  });
  postsColumn.appendChild(postsTitle);
  postsColumn.appendChild(postsUlEl);

  const aElements = postsUlEl.querySelectorAll('a');
  aElements.forEach((aEl) => {
    aEl.addEventListener('click', () => {
      const { id } = aEl.dataset;
      const post = watchedState.posts.find((el) => el.dataId === id);
      post.viewed = true;
    });
  });

  const buttons = postsUlEl.querySelectorAll('button');
  const modal = body.querySelector('#modal');
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const modalReadFullArticle = modal.querySelector('.full-article');
  const backdropEl = document.createElement('div');
  buttons.forEach((button) => {
    button.addEventListener('click', () => { // TODO: вынести в отдельную функцию
      const { id } = button.dataset;
      const post = watchedState.posts.find((el) => el.dataId === id);
      post.viewed = true;
      renderPosts(body, watchedState);
      modal.classList.add('show');
      modal.style.display = 'block';
      modalTitle.textContent = post.title;
      const closeButtons = modal.querySelectorAll('[data-dismiss="modal"]');
      closeButtons.forEach((closeButton) => {
        closeButton.addEventListener('click', () => { // TODO: вынести в отдельную фунцкцию
          modal.classList.remove('show');
          modal.style.display = 'none';
          backdropEl.remove();
          body.classList.remove('modal-open');
        });
      });
      modalBody.textContent = post.description;
      modalReadFullArticle.href = post.link;
      backdropEl.classList.add('modal-backdrop', 'fade', 'show');
      body.appendChild(backdropEl);
      body.classList.add('modal-open');
    });
  });
};

export default (state, body) => {
  const form = body.querySelector('.rss-form');
  const inputEl = body.querySelector('input');
  const feedbackEl = body.querySelector('.feedback');
  const submitButton = body.querySelector('[type="submit"]');
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'processState':
        if (value === 'sending') {
          submitButton.setAttribute('disabled', 'true');
          inputEl.setAttribute('readonly', 'readonly');
          break;
        }
        if (value === 'processed') {
          submitButton.removeAttribute('disabled');
          inputEl.removeAttribute('readonly');
          break;
        }
        if (value === 'failed') {
          submitButton.removeAttribute('disabled');
          inputEl.removeAttribute('readonly');
          renderProcessError(inputEl, feedbackEl, watchedState.processError);
          break;
        }
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
        renderPosts(body, watchedState);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
