# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"

# CodeMirror 6 & Dependencies (via esm.sh)
pin "codemirror", to: "https://esm.sh/codemirror@6.0.1"
pin "@codemirror/view", to: "https://esm.sh/@codemirror/view@6.23.0"
pin "@codemirror/state", to: "https://esm.sh/@codemirror/state@6.4.0"
pin "@codemirror/language", to: "https://esm.sh/@codemirror/language@6.10.0"
pin "@codemirror/commands", to: "https://esm.sh/@codemirror/commands@6.3.3"
pin "@codemirror/search", to: "https://esm.sh/@codemirror/search@6.5.5"
pin "@codemirror/autocomplete", to: "https://esm.sh/@codemirror/autocomplete@6.12.0"
pin "@codemirror/lint", to: "https://esm.sh/@codemirror/lint@6.4.2"
pin "@codemirror/lang-ruby", to: "https://esm.sh/@codemirror/lang-ruby@6.2.0"
pin "@codemirror/theme-one-dark", to: "https://esm.sh/@codemirror/theme-one-dark@6.1.2"

# Dependencies managed by esm.sh (no need to pin explicitly if using esm.sh bundle, but pinning for safety)
pin "@lezer/common", to: "https://esm.sh/@lezer/common@1.2.1"
pin "@lezer/highlight", to: "https://esm.sh/@lezer/highlight@1.2.0"
pin "@lezer/lr", to: "https://esm.sh/@lezer/lr@1.4.0"
pin "@lezer/ruby", to: "https://esm.sh/@lezer/ruby@0.2.0"
pin "style-mod", to: "https://esm.sh/style-mod@4.1.0"
pin "w3c-keyname", to: "https://esm.sh/w3c-keyname@2.2.8"
pin "crelt", to: "https://esm.sh/crelt@1.0.6"
