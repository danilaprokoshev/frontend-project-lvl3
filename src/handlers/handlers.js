const makePostViewed = (id, watchedState) => watchedState.posts
  .find((post) => {
    if (post.dataId === id) {
      return post;
    }

    return null;
  });

export const openModalHandler = (id, watchedState) => {
  watchedState.postsState.viewed[id] = true;
  watchedState.postsState.viewed = { ...watchedState.postsState.viewed };
  watchedState.modalPost = makePostViewed(id, watchedState);
};

export const closeModalHandler = (watchedState) => {
  watchedState.modalPost = null;
};

export const linkHandler = (id, watchedState) => {
  watchedState.postsState.viewed[id] = true;
  watchedState.postsState.viewed = { ...watchedState.postsState.viewed };
  makePostViewed(id, watchedState);
};
