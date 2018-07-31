require('./less/index.less')

function loadDeferredImages () {
  const deferredImages = document.querySelectorAll('img[data-src]')
  deferredImages.forEach(function (image) {
    image.src = image.dataset.src
  })
}

setTimeout(loadDeferredImages, 100)
