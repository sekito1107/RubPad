# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"

# Ace Editor (via jsdelivr)
pin "ace-builds", to: "https://cdn.jsdelivr.net/npm/ace-builds@1.32.6/src-min-noconflict/ace.js"
pin "ace-builds/mode/ruby", to: "https://cdn.jsdelivr.net/npm/ace-builds@1.32.6/src-min-noconflict/mode-ruby.js"
pin "ace-builds/theme/chrome", to: "https://cdn.jsdelivr.net/npm/ace-builds@1.32.6/src-min-noconflict/theme-chrome.js"
pin "ace-builds/theme/one_dark", to: "https://cdn.jsdelivr.net/npm/ace-builds@1.32.6/src-min-noconflict/theme-one_dark.js"
