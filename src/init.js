import i18n from 'i18next';
import ru from './locales/ru.js';
import runApp from './app.js';

export default () => {
  const i18nInstance = i18n.createInstance();
  const defaultLanguage = 'ru';
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources: {
      ru,
    },
  })
    .then(() => runApp(i18nInstance));
};
