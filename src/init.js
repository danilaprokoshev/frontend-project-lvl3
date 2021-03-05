import 'bootstrap/dist/css/bootstrap.min.css';
import _ from 'lodash';

function component() {
  const element = document.createElement('div');

  element.innerHTML = `<div class="container">
      <div class="row">
        <div class="col-6">
          <form class="form-inline">
            <div class="form-group">
              <label>Capital</label>
              <input class="ml-2 form-control" type="text" data-autocomplete-name="capital" data-autocomplete="/capitals.json">
            </div>
          </form>
        </div>
        <div class="col-6">
          <ul data-autocomplete-name="capital">
            <li>Nothing</li>
          </ul>
        </div>
      </div>
    </div>`;

  return element;
}

document.body.appendChild(component());
