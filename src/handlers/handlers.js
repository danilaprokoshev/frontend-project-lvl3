const makePostViewed = (id, watchedState) => watchedState.posts
  .find((post, i) => {
    if (post.dataId === id) {
      watchedState.posts[i].viewed = true;
      return post;
    }

    return null;
  });

export const openModalHandler = (id, watchedState) => {
  watchedState.modalPost = makePostViewed(id, watchedState);
};

export const closeModalHandler = (watchedState) => {
  watchedState.modalPost = null;
};

export const linkHandler = (id, watchedState) => {
  makePostViewed(id, watchedState);
};
