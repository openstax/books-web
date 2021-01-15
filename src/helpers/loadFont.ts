
export default (url: string) => new Promise<void>((resolve) => {
  if (typeof(document) === 'undefined' || !document.head) {
    throw new Error('fonts can only be loaded in the browser');
  }

  if (document.head.querySelector(`link[href="${url}"]`)) {
    resolve();
    return;
  }

  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', url);
  link.onload = () => resolve();
  document.head.appendChild(link);
});
