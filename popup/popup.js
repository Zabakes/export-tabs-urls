
var
  popupButtonSettings, popupCounter, popupTextarea, popupTextareaContainer, popupFilterTabs, popupFilterTabsContainer,
  popupButtonCopy, popupButtonExport,
  popupFormat, popupLabelFormatTitles, popupLabelFormatCustom, popupLimitWindow,
  currentWindowId, os,
  optionsIgnoreNonHTTP, optionsIgnorePinned, optionsFormatCustom, optionsFilterTabs, optionsCustomHeader

var defaultPopupStates = {
  'states': {
    format: false,
    popupLimitWindow: false
  }
}

chrome.runtime.getPlatformInfo(function (info) {
  os = info.os
})

chrome.windows.getLastFocused(function (currentWindow) {
  currentWindowId = currentWindow.id
})

w.addEventListener('load', function () {
  popupCounter = d.getElementsByClassName('popup-counter')[0]
  popupFilterTabs = d.getElementsByClassName('popup-filter-tabs')[0]
  popupFilterTabsContainer = d.getElementsByClassName('popup-filter-tabs-container')[0]
  popupTextarea = d.getElementsByClassName('popup-textarea')[0]
  popupTextareaContainer = d.getElementsByClassName('popup-textarea-container')[0]
  popupFormat = d.getElementById('popup-format')
  popupLabelFormatTitles = d.getElementsByClassName('popup-label-format-titles')[0]
  popupLabelFormatCustom = d.getElementsByClassName('popup-label-format-custom')[0]
  popupLimitWindow = d.getElementById('popup-limit-window')
  popupButtonCopy = d.getElementsByClassName('popup-button-copy')[0]
  popupButtonExport = d.getElementsByClassName('popup-button-export')[0]
  popupButtonSettings = d.getElementsByClassName('popup-button-settings')[0]
  
  updatePopup()

  popupFormat.addEventListener('change', function () {
    updatePopup()
  })

  popupButtonSettings.addEventListener('click', function () {
    chrome.runtime.openOptionsPage()
  })

  popupLimitWindow.addEventListener('change', function () {
    updatePopup()
  })

  popupFilterTabs.addEventListener('input', function () {
    updatePopup()
  })

  popupButtonCopy.addEventListener('click', function () {
    copyToClipboard()
  })

  popupButtonExport.addEventListener('click', function () {
    download()
  })
})

function updatePopup () {
  chrome.tabs.query(
    {currentWindow: true},
    function (tabs) {
      var list = ''
      var actualNbTabs = 0
      var totalNbTabs = tabs.length
      var nbFilterMatch = 0
      var userInput = popupFilterTabs.value

      for (var i = 0; i < totalNbTabs; i++) {
        var tabURL = tabs[i].url

        if (tabURL.startsWith('http')){
          actualNbTabs += 1
          if (filterMatch(userInput, [ tabURL]) || userInput === '') {
            nbFilterMatch += 1
            list += tabURL + '\r\n'
          }
        }

      popupTextarea.value = ''

      popupTextarea.value += list
      popupCounter.textContent = (userInput !== '') ? nbFilterMatch + ' / ' + actualNbTabs : actualNbTabs

      setSeparatorStyle()
      popupFilterTabs.focus()
    
    }
  })
}

function filterMatch (needle, haystack) {
  var regex = new RegExp(needle, 'i')
  var match = false

  haystack.forEach(function (element) {
    if (regex.test(element)) match = true
  })

  return match
}

function setSeparatorStyle () {
  if (hasScrollbar(popupTextarea)) {
    popupTextareaContainer.classList.add('has-scrollbar')
  } else {
    popupTextareaContainer.classList.remove('has-scrollbar')
  }
}


function copyToClipboard () {
  if (popupButtonCopy.classList.contains('disabled')) return

  popupTextarea.select()

  var message = d.execCommand('copy') ? 'copiedToClipboard' : 'notCopiedToClipboard'

  chrome.notifications.create('ExportTabsURLs', {
    'type': 'basic',
    'title': chrome.i18n.getMessage('appName'),
    'iconUrl': '../img/icon.svg',
    'message': chrome.i18n.getMessage(message)
  })

  popupButtonCopy.classList.add('disabled')

  setTimeout(function () {
    chrome.notifications.clear('ExportTabsURLs')
    popupButtonCopy.classList.remove('disabled')
  }, 3000)
}

function download () {
  var list = popupTextarea.value

  // fix inconsistent behaviour on Windows, see https://github.com/alct/export-tabs-urls/issues/2
  if (os === 'win') list = list.replace(/\r?\n/g, '\r\n')

  var element = d.createElement('a')
  element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(list)
  element.download = moment().format('YYYYMMDDTHHmmssZZ') + '_ExportTabsURLs.tabs'
  element.style.display = 'none'

  d.body.appendChild(element)
  element.click()
  d.body.removeChild(element)
}