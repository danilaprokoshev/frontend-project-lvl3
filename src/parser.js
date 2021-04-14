export default (xml) => {
  console.log('xml-->', xml);
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  if (doc.documentElement.querySelector('parsererror')) {
    const error = new Error('Error parsing XML');
    error.isParsingError = true;
    throw error;
    // throw new Error('Error parsing XML');
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
