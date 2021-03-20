const makePostViewed = (id, watchedState) => {
  const viewedPost = watchedState.posts.find((post, i) => {
    if (post.dataId === id) {
      watchedState.posts[i].viewed = true;
      return post;
    }

    return null;
  });

  return viewedPost;
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
