const getModalPost = (id, watchedState) => watchedState.posts
  .find((post) => post.dataId === id ?? null);

export const openModalHandler = (id, watchedState) => {
  watchedState.viewedPosts.add(id);
  watchedState.modalPost = getModalPost(id, watchedState);
};

export const closeModalHandler = (watchedState) => {
  watchedState.modalPost = null;
};

export const linkHandler = (id, watchedState) => {
  watchedState.viewedPosts.add(id);
  getModalPost(id, watchedState);
};
