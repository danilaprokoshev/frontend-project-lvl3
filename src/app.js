import _ from 'lodash';
import axios from 'axios';
import * as yup from 'yup';
import watchState from './view/watchers.js';
import parseXML from './parser.js';

export default (i18nInstance) => {
  const DELAY = 5000;
  const state = {
    processState: null,
    processError: null,
    form: {
      field: {
        url: '',
      },
      valid: true,
      error: '',
    },
    feeds: [],
    posts: [],
    viewedPosts: new Set(),
    modalPost: null,
  };

  const form = document.querySelector('.rss-form');
  const feedbackEl = document.querySelector('.feedback');
  const feedsColumn = document.querySelector('.feeds');
  const postsColumn = document.querySelector('.posts');
  const modal = document.querySelector('#modal');
  const closeModalButtons = document.querySelectorAll('[data-dismiss="modal"]');

  const watchedState = watchState(
    state,
    form,
    feedbackEl,
    feedsColumn,
    postsColumn,
    modal,
    closeModalButtons,
    i18nInstance,
  );

  yup.setLocale({
    string: {
      required: i18nInstance.t('form.validation.empty_field'),
      url: i18nInstance.t('form.validation.invalid_url'),
    },
  });

  const schema = yup.string().required().url();

  const validate = (urlString) => {
    try {
      schema.validateSync(urlString, { abortEarly: false });
      return '';
    } catch (e) {
      return e.message;
    }
  };

  const checkFeedStatus = (urlString) => {
    if (!watchedState.feeds.some((feed) => feed.url === urlString)) {
      return '';
    }
    return i18nInstance.t('form.validation.already_added_rss');
  };

  const updateValidationState = (urlString) => {
    const validationError = validate(urlString);
    const checkStatusError = checkFeedStatus(urlString);
    const error = validationError || checkStatusError;
    watchedState.form.valid = error === '';
    watchedState.form.error = error;
  };

  const proxyUrl = (url) => `https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`;

  const localizeError = (error) => {
    switch (error.message) {
      case 'Network Error':
        return 'form.network_error';
      case 'Error parsing XML':
        return 'form.validation.invalid_rss';
      default:
        return 'form.validation.invalid_rss';
    }
  };

  const updatePosts = () => {
    const promises = watchedState.feeds.map((feed) => axios.get(proxyUrl(feed.url)));
    const promise = Promise.all(promises);
    return promise.then((responses) => responses.forEach((response) => {
      const { contents } = response.data;
      const feedContent = parseXML(contents);
      const newPosts = _.differenceBy(feedContent.posts, watchedState.posts, 'title');
      _.forEachRight(newPosts, (post) => {
        _.set(post, 'dataId', _.uniqueId());
      });
      watchedState.posts = newPosts.concat(watchedState.posts);
    }))
      .catch((error) => {
        console.log(i18nInstance.t(
          localizeError(error),
        ));
      })
      .finally(() => {
        setTimeout(updatePosts, DELAY);
      });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const urlString = formData.get('url');
    updateValidationState(urlString);
    if (!watchedState.form.valid) {
      return;
    }
    watchedState.processState = 'sending';
    const url = new URL(urlString);
    axios.get(proxyUrl(url))
      .then((response) => {
        if (response.status === 200) return response;
        throw new Error('Network Error');
      })
      .then((response) => {
        const { contents } = response.data;
        const feedContent = parseXML(contents);
        feedContent.feed.url = url.href;
        _.forEachRight(feedContent.posts, (post) => {
          _.set(post, 'dataId', _.uniqueId());
        });
        watchedState.feeds.unshift(feedContent.feed);
        watchedState.posts = feedContent.posts.concat(watchedState.posts);
        watchedState.processError = null;
        watchedState.processState = 'processed';
        setTimeout(updatePosts, DELAY);
      })
      .catch((error) => {
        watchedState.processError = localizeError(error);
        watchedState.processState = 'failed';
      });
  });
};
