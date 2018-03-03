/* globals beaker confirm */

import yo from 'yo-yo'
import * as toast from '../com/toast'
import {niceDate} from '../../lib/time'
import DatNetworkActivity from '../com/dat-network-activity'
import renderBuiltinPagesNav from '../com/builtin-pages-nav'
// import {create as createEditAppPopup} from '../com/edit-app-popup' TODO(apps) restore when we bring back apps -prf

// globals
// =

var settings
var browserInfo
var browserEvents
var defaultProtocolSettings
var activeView = 'general'
var datNetworkActivity = new DatNetworkActivity()

// TODO(bgimg) disabled for now -prf
// var bgImages = [
//   {path: '1.jpg', thumbnailPath: '1-thumbnail.jpg',},
//   {path: '2.jpg', thumbnailPath: '2-thumbnail.jpg', selected: true},
//   {path: '3.jpg', thumbnailPath: '3-thumbnail.jpg'},
//   {path: '4.jpg', thumbnailPath: '4-thumbnail.jpg'},
//   {path: '5.jpg', thumbnailPath: '5-thumbnail.jpg'},
//   {path: '6.jpg', thumbnailPath: '6-thumbnail.jpg'},
//   {path: '7.jpg', thumbnailPath: '7-thumbnail.jpg'},
//   {path: '8.jpg', thumbnailPath: '8-thumbnail.jpg'},
//   {path: '9.jpg', thumbnailPath: '9-thumbnail.jpg'},
//   {path: '10.jpg', thumbnailPath: '10-thumbnail.jpg'},
//   {path: '11.jpg', thumbnailPath: '11-thumbnail.jpg'}]

// main
// =

setup()
async function setup () {
  renderToPage()

  // wire up events
  browserEvents = beaker.browser.createEventsStream()
  browserEvents.addEventListener('updater-state-changed', onUpdaterStateChanged)
  browserEvents.addEventListener('updater-error', onUpdaterError)
  window.addEventListener('popstate', onPopState)

  // fetch data
  browserInfo = await beaker.browser.getInfo()
  settings = await beaker.browser.getSettings()
  defaultProtocolSettings = await beaker.browser.getDefaultProtocolSettings()
  // applications = await beaker.apps.list(0) TODO(apps) restore when we bring back apps -prf

  // set the view and render
  setViewFromHash()
}

// rendering
// =

function renderToPage () {
  // only render if this page is active
  if (!browserInfo) {
    yo.update(document.querySelector('.settings-wrapper'), yo`
      <div class="settings-wrapper builtin-wrapper" id="el-content">
        <div class="settings-wrapper builtin-wrapper"></div>
      </div>`
    )
    return
  }

  yo.update(document.querySelector('.settings-wrapper'), yo`
    <div id="el-content" class="settings-wrapper builtin-wrapper">
      ${renderHeader()}

      <div class="builtin-main">
        ${renderSidebar()}
        ${renderView()}
      </div>
    </div>`
  )
}

function renderHeader () {
  return yo`
    <div class="builtin-header fixed">
      ${renderBuiltinPagesNav('Settings')}
    </div>`
}

function renderSidebar () {
  return yo`
    <div class="builtin-sidebar">
      <div class="nav-item ${activeView === 'general' ? 'active' : ''}" onclick=${() => onUpdateView('general')}>
        <i class="fa fa-angle-right"></i>
        General
      </div>

      <div class="nav-item ${activeView === 'dat-network-activity' ? 'active' : ''}" onclick=${() => onUpdateView('dat-network-activity')}>
        <i class="fa fa-angle-right"></i>
        Dat network activity
      </div>

      <div class="nav-item ${activeView === 'dat-import-export' ? 'active' : ''}" onclick=${() => onUpdateView('dat-import-export')}>
        <i class="fa fa-angle-right"></i>
        Import / export data
      </div>

      <div class="nav-item ${activeView === 'information' ? 'active' : ''}" onclick=${() => onUpdateView('information')}>
        <i class="fa fa-angle-right"></i>
        Information & Help
      </div>
    </div>`
}

function renderView () {
  switch (activeView) {
    case 'general':
      return renderGeneral()
    case 'dat-network-activity':
      return renderDatNetworkActivity()
    case 'dat-import-export':
      return renderDatImportExport()
    case 'information':
      return renderInformation()
  }
}

function renderGeneral () {
  return yo`
    <div class="view">
      ${renderWorkspacePathSettings()}
      ${renderAutoUpdater()}
      ${renderProtocolSettings()}
    </div>
  `
}

function renderWorkspacePathSettings () {
  return yo`
    <div class="section">
      <h2 id="workspace-path" class="subtitle-heading">Default workspace directory</h2>

      <p>
        Choose the default directory where your projects will be saved.
      </p>

      <p>
        <code>${settings.workspace_default_path}</code>
        <button class="btn small" onclick=${onUpdateDefaultWorkspaceDirectory}>
          Choose directory
        </button>
      </p>
    </div>
  `
}

function renderDatNetworkActivity () {
  return yo`
    <div class="view">
      <div class="section">
        <h2 id="dat-network-activity" class="subtitle-heading">Dat Network Activity</h2>
        ${datNetworkActivity.render()}
      </div>
    </div>
  `
}

function renderDatImportExport () {
  return yo`
    <div class="view">
      <div class="section">
        <h2 class="subtitle-heading">Import / export data</h2>
        <div class="message error">
          <i class="fa fa-exclamation-triangle"></i>
          <div><strong>Warning!</strong> There are tricky parts to this. Read everything, and ask for help if you need it.</div>
        </div>
        <p>
          Backup and transfer ownership of your Dat archives, private keys, and profile data.
        </p>
        <p>
          <strong>Note.</strong> Only one computer can own your profile.
          If you export your profile to another Beaker, then you shouldn${"'"}t keep using your profile on this computer.
        </p>
        <p>
          To avoid problems, follow this guide:
        </p>
        <ol>
          <li><strong class="ok"><i class="fa fa-check"></i> Backups</strong> <strong>Do</strong> export the profile and save it.</li>
          <li><strong class="ok"><i class="fa fa-check"></i> Restores</strong> <strong>Do</strong> import saved profile to a new Beaker if the old Beaker has been reset or lost.</li>
          <li><strong class="not-ok"><i class="fa fa-times"></i> Copies</strong> <strong>Never</strong> import profile into a new Beaker without resetting the old one.</li>
        </ol>

        <h2 class="subtitle-heading">Backup your profile</h2>
        <p>
          Export a .zip file containing all your Dat archives, private keys, and bookmarks.
          If you are transfering to a new device, be sure to reset all data after export.
        </p>
        <p>
          <a href="#" class="btn">Export profile</a>
        </p>

        <h2 class="subtitle-heading">Restore from backup</h2>
        <p>
          Import a .zip file containing all your Dat archives, private keys, and bookmarks.
          This will not overwrite any existing data.
        </p>
        <p>
          <a href="#" class="btn">Import profile</a>
        </p>

        <h2 class="subtitle-heading">Reset all data</h2>
        <p>
          Delete all Dat archives, private keys, and bookmarks. This is not reversable!
        </p>
        <p>
          <a href="#" class="btn">Clear profile</a>
        </p>
      </div>
    </div>
  `  
}

function renderInformation () {
  return yo`
    <div class="view">
      <div class="section">
        <h2 id="information" class="subtitle-heading">About Beaker</h2>
        <ul>
          <li>Version: ${browserInfo.version} Electron: ${browserInfo.electronVersion} - Chromium: ${browserInfo.chromiumVersion} - Node: ${browserInfo.nodeVersion}</li>
          <li>User data: ${browserInfo.paths.userData}</li>
        </ul>

        <h2 class="subtitle-heading">Get help</h2>
        <ul>
          <li><a href="https://beakerbrowser.com/docs/using-beaker">Take a tour of Beaker</a></li>
          <li><a href="https://beakerbrowser.com/docs">Read the documentation</a></li>
          <li><a href="https://github.com/beakerbrowser/beaker/issues">Report an issue</a></li>
        </ul>
      </div>
    </div>
  `
}

function renderProtocolSettings () {
  function register (protocol) {
    return () => {
      // update and optimistically render
      beaker.browser.setAsDefaultProtocolClient(protocol)
      defaultProtocolSettings[protocol] = true
      renderToPage()
    }
  }
  var registered = Object.keys(defaultProtocolSettings).filter(k => defaultProtocolSettings[k])
  var unregistered = Object.keys(defaultProtocolSettings).filter(k => !defaultProtocolSettings[k])

  return yo`
    <div class="section">
      <h2 id="protocol" class="subtitle-heading">Default browser settings</h2>
      ${registered.length
        ? yo`<p>Beaker is the default browser for <strong>${registered.join(', ')}</strong>.</p>`
        : ''}
      ${unregistered.map(proto => yo`
        <p>
          <strong>${proto}</strong>
          <a onclick=${register(proto)}>
            Make default
            <i class="fa fa-share"></i>
          </a>
        </p>`)}
      </div>`
}

// TODO(apps) restore when we bring back apps -prf
// function renderApplications () {
//   return yo`
//     <div class="view applications">
//       <table>
//         ${applications.map(app => yo`
//           <tr>
//             <td><a href=${'app://' + app.name} target="_blank">${app.name}</a></td>
//             <td class="current-value"><a href=${app.url} target="_blank">${app.url}</a></td>
//             <td class="date">${niceDate(app.updatedAt)}</td>
//             <td class="edit-ctrl"><a href="#" onclick=${e => onClickEditApp(e, app)}>edit</a></td>
//             <td class="remove-ctrl"><a href="#" onclick=${e => onClickRemoveApp(e, app)}>remove</a></td>
//           </tr>
//         `)}
//       </table>
//       <div class="create-app">
//         <a href="#" onclick=${onClickEditApp}>+ New app</a>
//       </div>
//     </div>`
// }

function renderAutoUpdater () {
  if (!browserInfo.updater.isBrowserUpdatesSupported) {
    return yo`
      <div class="section">
        <h2 id="auto-updater" class="subtitle-heading">Auto updater</h2>

        <p>
          Sorry! Beaker auto-updates are only supported on the production build for MacOS and Windows.
        </p>

        <p>
          To get the most recent version of Beaker, you${"'"}ll need to <a href="https://github.com/beakerbrowser/beaker">
          build Beaker from source</a>.
        </p>
      </div>`
  }

  switch (browserInfo.updater.state) {
    default:
    case 'idle':
      return yo`<div class="settings-section">
        <button class="btn btn-default" onclick=${onClickCheckUpdates}>Check for updates</button>
        <span class="version-info">
          ${browserInfo.updater.error
            ? yo`<span><span class="icon icon-cancel"></span> ${browserInfo.updater.error}</span>`
            : yo`<span>
              <span class="icon icon-check"></span>
              <strong>Beaker v${browserInfo.version}</strong> is up-to-date
            </span>`
          }
          ${renderAutoUpdateCheckbox()}
        </span>
        <span class="prereleases">
          [ Advanced: <a href="#" onclick=${onClickCheckPrereleases}>Check for prereleases</a> ]
        </span>
      </div>`

    case 'checking':
      return yo`
      <div class="settings-section">
        <button class="btn" disabled>Checking for updates</button>
        <span class="version-info">
          <div class="spinner"></div>
          Checking for updates to Beaker...
          ${renderAutoUpdateCheckbox()}
        </span>
      </div>`

    case 'downloading':
      return yo`
        <div class="view">
          <button class="btn" disabled>Updating</button>
          <span class="version-info">
            <div class="spinner"></div>
            Downloading the latest version of Beaker...
            ${renderAutoUpdateCheckbox()}
          </span>
        </div>`

    case 'downloaded':
      return yo`<div class="settings-section">
        <button class="btn" onclick=${onClickRestart}>Restart now</button>
        <span class="version-info">
          <span class="icon icon-up-circled"></span>
          <strong>New version available.</strong> Restart Beaker to install.
          ${renderAutoUpdateCheckbox()}
        </span>
      </div>`
  }
}

function renderAutoUpdateCheckbox () {
  return yo`<label>
    <input type="checkbox" checked=${isAutoUpdateEnabled()} onclick=${onToggleAutoUpdate} /> Check for updates automatically
  </label>`
}

// TODO(bgimg) disabled for now -prf
// function renderStartPageSettings () {
//   return yo`
//   <div class="settings-section start-page">
//     <div class="bg-images">
//       <div width="90" height="60" class="bg-image-container add">
//         <input onchange=${onUpdateStartPageBackgroundImage} name="start-background-image" type="file" accept="image/*"/>
//         +
//       </div>
//       ${bgImages.map(img => {
//         return yo`
//           <div onclick=${() => onUpdateStartPageBackgroundImage(`assets/img/start/${img.path}`)} class="bg-image-container ${img.selected ? 'selected' : ''}">
//             <img class="bg-image" width="90" height="60" src="beaker://start/background-image-default/${img.thumbnailPath}"/>
//           </div>`
//       })}
//     </div>
//   `
// }


// event handlers
// =

function onUpdateView (view) {
  activeView = view
  window.location.hash = view
  renderToPage()
}

function onClickCheckUpdates () {
  // trigger check
  beaker.browser.checkForUpdates()
}

function onClickCheckPrereleases (e) {
  e.preventDefault()
  beaker.browser.checkForUpdates({prerelease: true})
}

function onToggleAutoUpdate () {
  settings.auto_update_enabled = isAutoUpdateEnabled() ? 0 : 1
  renderToPage()
  beaker.browser.setSetting('auto_update_enabled', settings.auto_update_enabled)
}

async function onUpdateDefaultWorkspaceDirectory () {
  let path = await beaker.browser.showOpenDialog({
    title: 'Select a folder',
    buttonLabel: 'Select folder',
    properties: ['openDirectory']
  })

  if (path) {
    path = path[0]
    settings.workspace_default_path = path
    beaker.browser.setSetting('workspace_default_path', settings.workspace_default_path)
    renderToPage()
    toast.create('Workspace directory updated')
  }
}

function onClickRestart () {
  beaker.browser.restartBrowser()
}

function onUpdaterStateChanged (state) {
  if (!browserInfo) { return }
  // render new state
  browserInfo.updater.state = state
  browserInfo.updater.error = false
  renderToPage()
}

// TODO(apps) restore when we bring back apps -prf
// async function onClickEditApp (e, app) {
//   e.preventDefault()
//   var newApp = await createEditAppPopup(app)
//   if (app && app.name !== newApp.name) {
//     await beaker.apps.unbind(0, app.name)
//   }
//   await beaker.apps.bind(0, newApp.name, newApp.url)
//   applications = await beaker.apps.list(0)
//   renderToPage()
// }

// TODO(apps) restore when we bring back apps -prf
// async function onClickRemoveApp (e, app) {
//   e.preventDefault()
//   if (!confirm(`Remove the "${app.name}" application?`)) {
//     return
//   }

//   await beaker.apps.unbind(0, app.name)
//   applications = await beaker.apps.list(0)
//   renderToPage()
// }

/*function onUpdateStartPageTheme (e) {
  var theme = e.target.value
  settings.start_page_background_image = theme
  beaker.browser.setSetting('start_page_background_image', theme)
  renderToPage()
}

async function onUpdateStartPageBackgroundImage (srcPath) {
  var isUpload = this && this.files
  if (isUpload) srcPath = this.files[0].path

  // write the image to start_background_image
  var appendDir = isUpload ? false : true
  await beaker.browser.setStartPageBackgroundImage(srcPath, appendDir)

  // TODO: we might not need this. disabling for now -tbv
  // is the image light or dark?
  // if (isUpload) await setStartPageTheme()
  // if (true) await setStartPageTheme()
  // else {
  //   settings.start_page_background_image = ''
  //   await beaker.browser.setSetting('start_page_background_image', '')
  // }
  renderToPage()
}*/

function onUpdaterError (err) {
  if (!browserInfo) { return }
  // render new state
  browserInfo.updater.error = err
  renderToPage()
}

function onPopState (e) {
  setViewFromHash()
}

// internal methods
// =

function setViewFromHash () {
  let hash = window.location.hash
  onUpdateView((hash && hash !== '#') ? hash.slice(1) : 'general')
}

function isAutoUpdateEnabled () {
  return +settings.auto_update_enabled === 1
}

/*function setStartPageTheme () {
  function getBrightness (r, g, b) {
    return Math.sqrt(
      0.241 * Math.pow(r, 2) +
      0.691 * Math.pow(g, 2) +
      0.068 * Math.pow(b, 2))
  }

  return new Promise(resolve => {
    var img = new Image()
    img.setAttribute('crossOrigin', 'anonymous')
    img.onload = e => {
      var palette = colorThief.getPalette(img, 10)
      var totalBrightness = 0

      palette.forEach(color => {
        totalBrightness += getBrightness(...color)
      })

      var brightness = totalBrightness / palette.length

      var theme = brightness < 150 ? 'dark' : 'light'
      beaker.browser.setSetting('start_page_background_image', theme)
      settings.start_page_background_image = theme
      resolve()
    }
    img.onerror = resolve
    img.src = 'beaker://start/background-image'
  })
}*/
