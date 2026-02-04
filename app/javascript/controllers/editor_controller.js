import { Controller } from "@hotwired/stimulus"
import "ace-builds"
import "ace-builds/mode/ruby"
import "ace-builds/theme/chrome"
import "ace-builds/theme/one_dark"

export default class extends Controller {
  static targets = ["container"]

  connect() {
    console.log("EditorController connected")
    console.log("ace global:", typeof ace)
    console.log("containerTarget:", this.containerTarget)
    
    // ace is exposed globally by the import
    this.editor = ace.edit(this.containerTarget)
    console.log("editor created:", this.editor)
    
    this.editor.setTheme(this.currentTheme)
    this.editor.session.setMode("ace/mode/ruby")
    
    // Initial value
    this.editor.setValue("# Welcome to RubPad!\n# Type code here and see Rurema links appear on the right.\n\nnames = ['Ruby', 'Python', 'JavaScript']\n\nnames.select { |n| n.include?('u') }\n  .map(&:upcase)\n  .each do |n|\n    puts \"Hello, #{n}!\"\n  end\n\n# Try typing .split or .size below:\n", 1) // 1 = move cursor to end

    // Options
    this.editor.setOptions({
      fontSize: "14px",
      fontFamily: "monospace", // "Menlo", "Monaco", "Consolas", "Courier New", monospace
      showPrintMargin: false,
      useWorker: false // Worker not easily supported in importmap without extra config
    })

    this.editor.focus()

    // Observe theme changes
    this.observer = new MutationObserver(() => {
      this.updateTheme()
    })
    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    })
  }

  disconnect() {
    if (this.editor) {
      this.editor.destroy()
      this.editor.container.remove()
    }
    if (this.observer) {
      this.observer.disconnect()
    }
  }

  updateTheme() {
    this.editor.setTheme(this.currentTheme)
  }

  get currentTheme() {
    const isDark = document.documentElement.classList.contains("dark")
    return isDark ? "ace/theme/one_dark" : "ace/theme/chrome"
  }
}
