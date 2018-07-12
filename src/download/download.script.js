;(function () {
  // var S3_DOMAIN = 'http://localhost:9000/test-electron-update/'
  var S3_DOMAIN = 'https://s3.eu-central-1.amazonaws.com/cryptovista-electron/'
  var LATEST_MAC_URL = S3_DOMAIN + 'latest-mac.json'

  function forEachKey (object, cb) {
    for (var property in object) {
      if (object.hasOwnProperty(property)) {
        cb(object[property], property)
      }
    }
  }

  var dom = {
    add: function add(parent, child) {
      parent.appendChild(child)
    },
    el: function el(tag, attributes) {
      var element = document.createElement(tag)
      if (attributes) {
        forEachKey(attributes, function (value, key) {
          element[key] = value
        })
      }
      return element
    },
    getById: function get(id) {
      return window.document.getElementById(id)
    },
    addClass: function addClass(element, className) {
      element.className = element.className + ' ' + className
    }
  }

  function addLastVersionMac (xmlReq) {
    var versionDetails = JSON.parse(xmlReq.responseText)
    // CREATE THE LINK
    var linkText = dom.el('span', {
      innerText: 'cryptovista.app v' + versionDetails.version
    })
    var icon = dom.el('img', {
      src: '/images/cryptovista-download-icon.svg',
      className: 'space-right-1ch',
      width: '16',
      height: '16'
    })
    var macLink = dom.getById('mac-download-link')
    macLink.href = versionDetails.url.replace('-mac.zip', '.dmg')
    dom.add(macLink, icon)
    dom.add(macLink, linkText)
    dom.addClass(macLink, 'link-cta') 
    // CREATE THE DATE
    var macDate = dom.getById('mac-release-date')
    macDate.innerText = '(' + new Date(versionDetails.releaseDate).toLocaleDateString() + ')'
  }


  var oReq = new XMLHttpRequest()
  oReq.overrideMimeType('application/json')
  oReq.addEventListener('load', function () {
    if (oReq.status === 200) {
      addLastVersionMac(oReq)
    }
    else {
      // handle error
    }
  })
  oReq.open('GET', LATEST_MAC_URL)
  oReq.send()
})()
