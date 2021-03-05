import 'bootstrap/dist/css/bootstrap.min.css';

export default () => {
  const container = document.getElementById('point');
  container.classList.add('container');

  const row = document.createElement('div');
  row.classList.add('row');

  const form = document.createElement('div');
  form.classList.add('col-8');
  form.innerHTML = `<form class="form-inline">
  <div class="form-group">
    <input class="ml-2 form-control" type="text">
   </div>
 </form>`;

  const submitButton = document.createElement('div');
  submitButton.classList.add('col');
  submitButton.innerHTML = '<button type="submit" class="btn btn-primary">Add</button>';

  row.appendChild(form);
  row.appendChild(submitButton);

  container.appendChild(row);
};
