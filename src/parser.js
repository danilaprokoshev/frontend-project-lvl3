export default (xml) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(xml, 'text/html');
  const title = doc.querySelector('title');
  const description = doc.querySelector('description');
  const items = doc.getElementsByTagName('item');
  const posts = Array.from(items)
    .map((item) => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    }));

  return {
    feed: {
      title: title.textContent,
      description: description.textContent,
    },
    posts,
  };
};
