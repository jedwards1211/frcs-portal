export default function fireFakeResizeEvent(target = window) {
  let evt = document.createEvent('UIEvents');
  evt.initUIEvent('resize', true, false, target, 0);
  target.dispatchEvent(evt);
}
