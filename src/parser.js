export default (xml) => {
  const parser = new DOMParser();

  const docError = parser.parseFromString('INVALID', 'text/xml');
  const parsererrorNS = docError.getElementsByTagName('parsererror')[0].namespaceURI;

  const doc = parser.parseFromString(xml, 'text/xml');
  if (doc.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0) {
    throw new Error('Error parsing XML');
  }
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
