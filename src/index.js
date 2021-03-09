import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import parseXML from './parser.js';
import watchState from '../view/watchers.js';

const schema = yup.object().shape({
  url: yup.string().required('Fill out this field').url('Ссылка должна быть валидным URL'),
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
      message: 'RSS уже добавлен',
    },
  };
};

export default () => {
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
      valid: true,
      errors: {}, // TODO: maybe just string instead object
    },
  };

  const container = document.getElementById('point'); // TODO: вынести формирование начальных элекментов в отдельный модуль и использовать при инициализации приложения
  container.classList.add('container-fluid', 'bg-dark', 'p-5');

  const row = document.createElement('div');
  row.classList.add('row');

  const colMd10 = document.createElement('div');
  colMd10.classList.add('col-md-10', 'col-lg-8', 'mx-auto', 'text-white');

  const form = document.createElement('form');
  form.classList.add('rss-form');

  form.innerHTML = `<div class="row">
  <div class="col-10">
    <input autofocus="" required name="url" aria-label="url" class="form-control form-control-lg w-100" placeholder="ссылка RSS">
  </div>
  <div class="col-auto">
    <button type="submit" aria-label="add" class="btn btn-lg btn-primary px-sm-5">Add</button>
  </div>
</div>`;

  colMd10.appendChild(form);
  row.appendChild(colMd10);
  container.appendChild(row);

  const watchedState = watchState(state, document.body);

  const updateValidationState = () => {
    let errors;
    errors = validate(watchedState.form.field);
    if (_.isEqual(errors, {})) {
      errors = checkInFeedList(watchedState);
    }
    watchedState.form.valid = _.isEqual(errors, {});
    watchedState.form.errors = errors;
    console.log(watchedState);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    watchedState.form.field = Object.fromEntries(formData);
    updateValidationState();
    if (watchedState.form.valid) {
      const url = new URL(watchedState.form.field.url);
      axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`)
        .then((response) => {
          console.log(response);
          if (response.status === 200) return response;
          throw new Error('Network response was not ok.');
        })
        .then((response) => {
          const { contents } = response.data;
          const feedContent = parseXML(contents);
          feedContent.id = _.uniqueId();
          watchedState.form.feeds.unshift(feedContent);
        })
        .catch((error) => {
          watchedState.form.processError = error.message;
          watchedState.form.processState = 'failed';
        });
    }
  });
};
