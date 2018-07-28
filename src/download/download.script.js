
// var S3_DOMAIN = 'http://localhost:9000/test-electron-update/'
var S3_DOMAIN = 'https://s3.eu-central-1.amazonaws.com/cryptovista-electron/'
var YML_PARSER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/3.12.0/js-yaml.min.js'
var LATEST_MAC_URL = S3_DOMAIN + 'latest-mac.yml'
var LATEST_WIN_URL = S3_DOMAIN + 'latest.yml'

function forEachKey (object, cb) {
  for (var property in object) {
    if (object.hasOwnProperty(property)) {
      cb(object[property], property)
    }
  }
}

/**
 * Download and append a script
 * @param {String} - source Url of the script
 * @param {Function} - callback
 */
function getScript (source, callback) {
    var script = document.createElement('script')
    var prior = document.getElementsByTagName('script')[0]
    script.async = 1
    script.onload = script.onreadystatechange = function( _, isAbort ) {
      if(isAbort || !script.readyState || /loaded|complete/.test(script.readyState) ) {
        script.onload = script.onreadystatechange = null
        script = undefined
        if (!isAbort) {
          if (callback) {
            callback()
          }
        }
      }
    }
    script.src = source
    prior.parentNode.insertBefore(script, prior)
}

/**
 * @property {function} add - append a node to another
 * @property {function} el - create a dom element
 * @property {function} getById - find dom element by id
 * @property {function} addClass - add a css class to an element
 */
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

function addLastVersionMac (versionData) {
  // CREATE THE LINK
  var icon = dom.el('img', {
    src: '/images/cryptovista-download-icon.svg',
    className: 'space-right-1ch',
    width: '16',
    height: '16'
  })

  var fileData = versionData.files.reduce(function (fileData, file) {
    if (/\.dmg$/.test(file.url)) {
      fileData.fileName = file.url
      fileData.fileURL = S3_DOMAIN + encodeURI(file.url)
    }
    return fileData
  }, {fileName: '', fileURL: ''})

  var linkText = dom.el('span', {
    innerText: fileData.fileName
  })

  var macLink = dom.getById('mac-download-link')
  macLink.href = fileData.fileURL
  dom.add(macLink, icon)
  dom.add(macLink, linkText)
  dom.addClass(macLink, 'link-cta')
  // CREATE THE DATE
  var macDate = dom.getById('mac-release-date')
  macDate.innerText = '(' + new Date(versionData.releaseDate).toLocaleDateString() + ')'
}

function addLastVersionWin (versionData) {
  // CREATE THE LINK
  var icon = dom.el('img', {
    src: '/images/cryptovista-download-icon.svg',
    className: 'space-right-1ch',
    width: '16',
    height: '16'
  })

  var fileData = versionData.files.reduce(function (fileData, file) {
    if (/.*Setup.*\.exe$/.test(file.url)) {
      fileData.fileName = file.url
      fileData.fileURL = S3_DOMAIN + encodeURI(file.url)
      fileData.sha = file.sha512
    }
    return fileData
  }, {fileName: '', fileURL: ''})

  var linkText = dom.el('span', {
    innerText: fileData.fileName
  })

  var winLink = dom.getById('win-download-link')
  winLink.href = fileData.fileURL
  dom.add(winLink, icon)
  dom.add(winLink, linkText)
  dom.addClass(winLink, 'link-cta')
  // CREATE THE DATE
  var winDate = dom.getById('win-release-date')
  winDate.innerText = '(' + new Date(versionData.releaseDate).toLocaleDateString() + ')'
}

/**
 * @param {object} options
 * @param {string} options.url
 * @param {function} options.onSuccess
 * @param {function} options.onFail
 * @param {string} options.parser
 */
function get (options) {
  var oReq = new XMLHttpRequest()
  oReq.addEventListener('load', function () {
    if (oReq.status === 200) {
      switch (options.parser) {
        case 'yml': options.onSuccess({data: jsyaml.load(oReq.responseText)}); break
        default: options.onSuccess({data: oReq.responseText})
      }
    }
    else {
      if (options.onFail) {
        options.onFail(oReq)
      }
    }
  })
  oReq.open('GET', options.url)
  oReq.send()
}

getScript(YML_PARSER_URL, function () {
  get({
    url: LATEST_MAC_URL,
    parser: 'yml',
    onSuccess: function (res) {
      addLastVersionMac(res.data)
    }
  })

  get({
    url: LATEST_WIN_URL,
    parser: 'yml',
    onSuccess: function (res) {
      addLastVersionWin(res.data)
    }
  })
})
