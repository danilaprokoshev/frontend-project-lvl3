import onChange from 'on-change';

export default (state) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.processState':
      break;
    case 'form.valid':
      break;
    case 'form.errors':
      renderErrors(value);
      break;
    default:
      break;
  }
});
