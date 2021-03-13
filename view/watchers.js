import onChange from 'on-change';
import i18n from 'i18next';

const renderErrors = (body, errors) => { // TODO: maybe error, not errors
  const inputEl = body.querySelector('input');
  const error = errors.url;
  if (!error) {
    inputEl.classList.remove('is-invalid');
    return;
  }
  inputEl.classList.add('is-invalid');
};

const renderFeeds = (body, watchedState) => { // TODO: разбить на 2 функции (фиды и посты)
  let container;
  container = document.querySelector('section.container-fluid.p-5:not(.bg-dark)');
  if (container) {
    container.remove();
  }
  container = document.createElement('section');
  container.classList.add('container-fluid', 'p-5');
  const feedsRow = document.createElement('div');
  feedsRow.classList.add('row');
  const feedsCol = document.createElement('div');
  feedsCol.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'feeds');
  const feedsH2 = document.createElement('h2');
  feedsH2.textContent = i18n.t('feeds');
  feedsCol.appendChild(feedsH2);
  const feedsUl = document.createElement('ul');
  feedsUl.classList.add('list-group', 'mb-5');
  watchedState.form.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.innerHTML = `<h3>${feed.title}</h3>
<p>${feed.description}</p>`;
    feedsUl.appendChild(li);
  });
  feedsCol.appendChild(feedsUl);
  feedsRow.appendChild(feedsCol);

  const postsRow = document.createElement('div');
  postsRow.classList.add('row');
  const postsCol = document.createElement('div');
  postsCol.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'posts');
  const postsH2 = document.createElement('h2');
  postsH2.textContent = i18n.t('posts');
  postsCol.appendChild(postsH2);
  const postsUl = document.createElement('ul');
  postsUl.classList.add('list-group');
  watchedState.form.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const aEl = document.createElement('a');
    aEl.classList.add('fw-bold');
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
    li.appendChild(aEl);
    li.appendChild(button);
    postsUl.appendChild(li);
  });
  postsCol.appendChild(postsUl);
  postsRow.appendChild(postsCol);

  container.appendChild(feedsRow);
  container.appendChild(postsRow);

  body.appendChild(container);
};

export default (state, body) => {
  const form = body.querySelector('.rss-form');
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.processState':
        break;
      case 'form.valid':
        break;
      case 'form.errors':
        renderErrors(body, value);
        break;
      case 'form.feedsList':
        form.reset();
        break;
      case 'form.posts': // TODO: разбить рендеры отдельно на фиды и посты
        renderFeeds(body, watchedState);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
