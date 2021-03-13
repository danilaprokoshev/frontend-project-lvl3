import i18n from 'i18next';

export default class Example {
  constructor(element) {
    this.element = element;
  }

  init() {
    const body = this.element.closest('body');
    body.classList.add('d-flex', 'flex-column', 'min-vh-100');
    body.innerHTML = `<div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="modal" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title"></h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div class="modal-body"></div>
      <div class="modal-footer">
        <a class="btn btn-primary full-article" href="#" role="button" target="_blank" rel="noopener noreferrer">${i18n.t('modal.read')}</a>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">${i18n.t('modal.close')}</button>
      </div>
    </div>
  </div>
</div>
<main class="flex-grow-1">
  <section class="container-fluid bg-dark p-5">
    <div class="row">
      <div class="col-md-10 col-lg-8 mx-auto text-white">
        <h1 class="display-3">${i18n.t('title.main_title')}</h1>
        <p class="lead">${i18n.t('title.trigger')}</p>
        <form action="" class="rss-form">
          <div class="row">
            <div class="col">
              <input autofocus="" required="" name="url" aria-label="url" class="form-control form-control-lg w-100" placeholder="${i18n.t('title.placeholder')}">
            </div>
            <div class="col-auto">
              <button type="submit" aria-label="add" class="btn btn-lg btn-primary px-sm-5">${i18n.t('title.add')}</button>
            </div>
          </div>
        </form>
        <p class="text-muted my-1">${i18n.t('title.example')}: https://www.nasa.gov/rss/dyn/educationnews.rss</p>
        <div class="feedback"></div>
      </div>
    </div>
  </section>
  <section class="container-fluid p-5">
    <div class="row">
      <div class="col-md-10 col-lg-8 mx-auto feeds"></div>
    </div>
    <div class="row">
      <div class="col-md-10 col-lg-8 mx-auto posts"></div>
    </div>
  </section>
</main>
<footer class="footer border-top py-3 mt-5">
  <div class="container-xl">
    <div class="text-center">${i18n.t('created')} <a href="https://github.com/danilaprokoshev" target="_blank">Danila Prokoshev</a></div>
  </div>
</footer>`;
  }
}
