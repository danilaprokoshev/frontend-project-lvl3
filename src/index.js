import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import _ from 'lodash';
import onChange from 'on-change';
import axios from 'axios';

const schema = yup.object().shape({
  url: yup.string().required('Fill out this field').url('Ссылка должна быть валидным URL'),
});

const validate = (fieldElement) => {
  try {
    schema.validateSync(fieldElement, { abortEarly: false });
    return {};
  } catch (e) {
    return _.keyBy(e.inner, 'path');
  }
};

const renderErrors = (field, errors) => {
  const element = field.url;
  const error = errors.url;
  if (!error) {
    element.classList.remove('is-invalid');
    return;
  }
  element.classList.add('is-invalid');
};

export default () => {
  const state = {
    form: {
      processState: 'filling', // TODO: 2. 'processed', 3. 'failed'. Также, что делать с изменением этого стейта, как реагировать, когда изменять?
      processError: null, // TODO: включить изменение состояния при ошибках сети и реакцию на изменение
      field: {
        url: '',
      },
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

  const fieldElement = {
    url: document.querySelector('input'),
  };

  const watchedState = onChange(state, (path, value) => { // TODO: вынести в отдельный модуль View (use class View?)
    switch (path) {
      case 'form.processState':
        break;
      case 'form.valid':
        break;
      case 'form.errors':
        renderErrors(fieldElement, value);
        break;
      case 'form.feeds':
        form.reset();
        break;
      default:
        break;
    }
  });

  const checkInFeedList = (url) => {
    if (!watchedState.form.feeds.includes(url)) {
      watchedState.form.feeds.push(url);
      return {};
    }
    return {
      url: {
        message: 'RSS уже добавлен',
      },
    };
  };

  const updateValidationState = () => {
    let errors;
    errors = validate(watchedState.form.field);
    if (_.isEqual(errors, {})) {
      errors = checkInFeedList(watchedState.form.field.url);
    }
    watchedState.form.valid = _.isEqual(errors, {});
    watchedState.form.errors = errors;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    watchedState.form.field = Object.fromEntries(formData);
    updateValidationState();
    if (watchedState.form.valid) {
      const url = new URL(watchedState.form.field.url);
      const domparser = new DOMParser();
      axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(url)}`)
        .then((response) => {
          const XMLSource = response.data.contents;
          const doc = domparser.parseFromString(XMLSource, 'text/xml');
          const title = doc.querySelector('title');
          const description = doc.querySelector('description');
          console.log(title.textContent, description.textContent);
          console.log(doc);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
};
