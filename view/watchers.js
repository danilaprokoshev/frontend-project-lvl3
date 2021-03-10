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

const renderFeeds = (body, watchedState) => {
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
  watchedState.form.feeds.forEach((feed) => {
    feed.items.forEach((item) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
      li.innerHTML = `<a href="${item.link}">${item.title}</a>`;
      postsUl.appendChild(li);
    });
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
      case 'form.feeds':
        renderFeeds(body, watchedState);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
