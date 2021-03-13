import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18n from 'i18next';
import parseXML from './parser.js';
import watchState from '../view/watchers.js';
import en from './locales/en.js';
import ru from './locales/ru.js';

export default () => {
  const defaultLanguage = 'ru';
  i18n.init({
    lng: defaultLanguage,
    debug: false,
    resources: {
      en,
      ru,
    },
  }).then(() => {
    // TODO: что сделать в коллбеке...
  });

  yup.setLocale({
    string: {
      required: i18n.t('form.validation.empty_field'),
      url: i18n.t('form.validation.invalid_url'),
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

  const checkInFeedList = (watchedState) => {
    if (!watchedState.form.feedsList.includes(watchedState.form.field.url)) {
      watchedState.form.feedsList.unshift(watchedState.form.field.url);
      return {};
    }
    return {
      url: {
        message: i18n.t('form.validation.already_added_rss'),
      },
    };
  };

  const state = {
    form: {
      processState: 'filling', // TODO: 2. 'processed', 3. 'failed'. Также, что делать с изменением этого стейта, как реагировать, когда изменять?
      processError: null, // TODO: включить изменение состояния
      // при ошибках сети и реакцию на изменение
      field: {
        url: '',
      },
      feedsList: [],
      feeds: [],
      posts: [],
      valid: true,
      errors: {}, // TODO: maybe just string instead object
    },
  };

  const container = document.getElementById('point'); // TODO: вынести формирование начальных элекментов в отдельный модуль и использовать при инициализации приложения
  container.classList.add('container-fluid', 'bg-dark', 'p-5'); // TODO: разобраться с элементами Bootstrap

  const row = document.createElement('div');
  row.classList.add('row');

  const colMd10 = document.createElement('div');
  colMd10.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'text-white');

  const form = document.createElement('form');
  form.classList.add('rss-form');

  form.innerHTML = `<div class="row">
  <div class="col-8">
    <input autofocus="" required name="url" aria-label="url" class="form-control form-control-lg w-100" placeholder="ссылка RSS">
  </div>
  <div class="col-auto">
    <button type="submit" aria-label="add" class="btn btn-lg btn-primary px-sm-5">${i18n.t('add')}</button>
  </div>
</div>`;

  colMd10.appendChild(form);
  row.appendChild(colMd10);
  container.appendChild(row);

  const watchedState = watchState(state, document.body);

  const updateValidationState = () => {
    let errors;
    errors = validate(watchedState.form.field);
    if (_.isEqual(errors, {})) { // TODO: оптимизировать проверку, есть дублирование isEqual
      errors = checkInFeedList(watchedState);
    }
    watchedState.form.valid = _.isEqual(errors, {});
    watchedState.form.errors = errors;
  };

  const updatePosts = () => { // TODO: rename func
    const promises = watchedState.form.feeds.map((feed) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(feed.url)}`)
      .then((response) => {
        if (response.status === 200) return response;
        throw new Error('Network response was not ok.');
      })
      .catch((error) => {
        watchedState.form.processError = error.message;
        watchedState.form.processState = 'failed';
      }));
    const promise = Promise.all(promises);
    return promise.then((responses) => responses.forEach((response) => {
      const { contents } = response.data;
      const feedContent = parseXML(contents);
      const newPosts = _.differenceBy(feedContent.posts, watchedState.form.posts, 'title');
      _.forEachRight(newPosts, (post) => _.set(post, 'dataId', _.uniqueId()));
      watchedState.form.posts = newPosts.concat(watchedState.form.posts);
      setTimeout(updatePosts.bind(null), 5000);
    }));
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    watchedState.form.field = Object.fromEntries(formData); // TODO: подумать,
    // как очищать поле с url
    updateValidationState();
    if (watchedState.form.valid) {
      const url = new URL(watchedState.form.field.url);
      axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`)
        .then((response) => {
          if (response.status === 200) return response;
          throw new Error('Network response was not ok.');
        })
        .then((response) => {
          const { contents } = response.data;
          const feedContent = parseXML(contents);
          feedContent.feed.url = url.href;
          _.forEachRight(feedContent.posts, (post) => {
            _.set(post, 'dataId', _.uniqueId());
            _.set(post, 'viewed', false);
          });
          watchedState.form.feeds.unshift(feedContent.feed);
          watchedState.form.posts = feedContent.posts.concat(watchedState.form.posts);
          console.log(watchedState);
          setTimeout(updatePosts.bind(null), 5000);
        })
        .catch((error) => {
          watchedState.form.processError = error.message;
          watchedState.form.processState = 'failed';
        });
    }
  });
};
