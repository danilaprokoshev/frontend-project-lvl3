const makePostViewed = (id, watchedState) => {
  const post = watchedState.posts.find((el) => el.dataId === id);
  post.viewed = true;

  return post;
};

export const openModalHandler = (id, watchedState) => {
  watchedState.modalPost = makePostViewed(id, watchedState);
};

export const closeModalHandler = (id, watchedState) => {
  watchedState.modalPost = null;
};

export const linkHandler = (id, watchedState) => {
  makePostViewed(id, watchedState);
};
