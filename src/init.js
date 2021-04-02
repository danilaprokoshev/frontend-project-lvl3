import i18n from 'i18next';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import ru from './locales/ru.js';
import watchState from './view/watchers.js';
import parseXML from './parser.js';

export default () => {
  const i18nInstance = i18n.createInstance();
  const defaultLanguage = 'ru';
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources: {
      ru,
    },
  });
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
    postsState: {
      viewed: {},
    },
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

  const updatePosts = () => {
    const promises = watchedState.feeds.map((feed) => axios.get(proxyUrl(feed.url)));
    const promise = Promise.all(promises);
    return promise.then((responses) => responses.forEach((response) => {
      const { contents } = response.data;
      const feedContent = parseXML(contents);
      const newPosts = _.differenceBy(feedContent.posts, watchedState.posts, 'title');
      _.forEachRight(newPosts, (post) => {
        const dataId = _.uniqueId();
        _.set(post, 'dataId', dataId);
        watchedState.postsState.viewed[dataId] = false;
      });
      watchedState.posts = newPosts.concat(watchedState.posts);
    }))
      .then(() => {
        watchedState.processError = null;
      })
      .catch((error) => {
        switch (error.message) {
          case 'Network Error':
            watchedState.processError = 'form.network_error';
            break;
          case 'Error parsing XML':
            watchedState.processError = 'form.validation.invalid_rss';
            break;
          default:
            throw new Error(`Unknown error: '${error}'!`);
        }
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
      .catch((error) => {
        watchedState.processError = 'form.network_error';
        throw error;
      })
      .then((response) => {
        const { contents } = response.data;
        const feedContent = parseXML(contents);
        feedContent.feed.url = url.href;
        _.forEachRight(feedContent.posts, (post) => {
          const dataId = _.uniqueId();
          _.set(post, 'dataId', dataId);
          watchedState.postsState.viewed[dataId] = false;
        });
        watchedState.feeds.unshift(feedContent.feed);
        watchedState.posts = feedContent.posts.concat(watchedState.posts);
        watchedState.processState = 'processed';
        setTimeout(updatePosts, DELAY);
      })
      .catch((error) => {
        if (error.message !== 'Network Error') {
          watchedState.processError = 'form.validation.invalid_rss';
        }
        watchedState.processState = 'failed';
      });
  });
};
