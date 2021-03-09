export default (xml) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(xml, 'application/xhtml+xml');
  const title = doc.querySelector('title');
  const description = doc.querySelector('description');
  const items = doc.getElementsByTagName('item');
  const itemsContent = Array.from(items)
    .map((item) => ({
      title: item.querySelector('title').textContent,
      link: item.querySelector('link').textContent,
    }));
  return {
    title: title.textContent,
    description: description.textContent,
    items: itemsContent,
  };
};
