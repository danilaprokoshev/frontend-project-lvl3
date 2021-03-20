import i18n from 'i18next';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import getBodyElement from './example.js';
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

  const element = document.getElementById('point');
  document.body = getBodyElement(element, i18nInstance);

  const state = {
    processState: null,
    processError: null,
    form: {
      field: {
        url: '',
      },
      feedsList: [],
      valid: true,
      error: {},
    },
    feeds: [],
    posts: [],
    modalPost: null,
  };

  const watchedState = watchState(state, document.body, i18nInstance);

  yup.setLocale({
    string: {
      required: i18nInstance.t('form.validation.empty_field'),
      url: i18nInstance.t('form.validation.invalid_url'),
    },
  });

  const schema = yup.object().shape({
    url: yup.string().required().url(),
  });

  const validate = (field) => {
    try {
      schema.validateSync(field, { abortEarly: false });
      return {};
    } catch (e) {
      return _.keyBy(e.inner, 'path');
    }
  };

  const checkFeedStatus = (field) => {
    if (watchedState.feeds.some((feed) => feed.url === field.url)) {
      return {
        url: {
          message: i18nInstance.t('form.validation.already_added_rss'),
        },
      };
    }

    return {};
  };

  const updateValidationState = (field) => {
    const validationError = validate(field);
    const checkStatusError = checkFeedStatus(field);
    const error = { ...validationError, ...checkStatusError };
    watchedState.form.valid = _.isEqual(error, {});
    watchedState.form.error = error;
  };

  const proxyUrl = (url) => `https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`;

  const updatePosts = () => {
    const promises = watchedState.feeds.map((feed) => axios.get(proxyUrl(feed.url))
      .catch(() => {
      }));
    const promise = Promise.all(promises);
    return promise.then((responses) => responses.forEach((response) => {
      const { contents } = response.data;
      const feedContent = parseXML(contents);
      const newPosts = _.differenceBy(feedContent.posts, watchedState.posts, 'title');
      _.forEachRight(newPosts, (post) => _.set(post, 'dataId', _.uniqueId()));
      watchedState.posts = newPosts.concat(watchedState.posts);
      setTimeout(updatePosts, 5000);
    }));
  };

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formField = Object.fromEntries(formData);
    updateValidationState(formField);
    if (watchedState.form.valid) {
      watchedState.processState = 'sending';
      const url = new URL(formField.url);
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
            _.set(post, 'dataId', _.uniqueId());
            _.set(post, 'viewed', false);
          });
          watchedState.feeds.unshift(feedContent.feed);
          watchedState.posts = feedContent.posts.concat(watchedState.posts);
          watchedState.processState = 'processed';
          setTimeout(updatePosts, 5000);
        })
        .catch((error) => {
          if (error.message !== 'Network Error') {
            watchedState.processError = 'form.validation.invalid_rss';
          }
          watchedState.processState = 'failed';
        });
    }
  });
};
