<template lang='pug'>
  .editor-markdown
    v-toolbar.editor-markdown-toolbar(dense, flat, height='44', style='overflow-x: hidden;')
      template(v-if='isModalShown')
        v-spacer
        v-btn.animated.fadeInRight(text, small, @click='closeAllModal')
          v-icon(left) mdi-arrow-left-circle
          span {{$t('editor:backToEditor')}}
      template(v-else)
        v-tooltip(bottom, color='primary')
          template(v-slot:activator='{ on }')
            v-btn.animated.fadeIn(icon, v-on='on', @click='toggleMarkup({ start: `**` })').mx-0
              v-icon mdi-format-bold
          span {{$t('editor:markup.bold')}}
        v-tooltip(bottom, color='primary')
          template(v-slot:activator='{ on }')
            v-btn.animated.fadeIn.wait-p1s(icon, v-on='on', @click='toggleMarkup({ start: `*` })').mx-0
              v-icon mdi-format-italic
          span {{$t('editor:markup.italic')}}
        v-tooltip(bottom, color='primary')
          template(v-slot:activator='{ on }')
            v-btn.animated.fadeIn.wait-p2s(icon, v-on='on', @click='toggleMarkup({ start: `~~` })').mx-0
              v-icon mdi-format-strikethrough
          span {{$t('editor:markup.strikethrough')}}
        .editor-markdown-toolbar-divider
        v-menu(offset-y, open-on-hover)
          template(v-slot:activator='{ on }')
            v-btn.animated.fadeIn.wait-p3s(icon, v-on='on').mx-0
              v-icon mdi-format-header-pound
          v-list.py-0
            template(v-for='(n, idx) in 6')
              v-list-item(@click='setHeaderLine(n)', :key='idx')
                v-list-item-action
                  v-icon(:size='24 - (idx - 1) * 2') mdi-format-header-{{n}}
                v-list-item-title {{$t('editor:markup.heading', { level: n })}}
              v-divider(v-if='idx < 5')
        v-tooltip(bottom, color='primary')
          template(v-slot:activator='{ on }')
            v-btn.animated.fadeIn.wait-p4s(icon, v-on='on', @click='toggleMarkup({ start: `~` })').mx-0
              v-icon mdi-format-subscript
          span {{$t('editor:markup.subscript')}}
        v-tooltip(bottom, color='primary')
          template(v-slot:activator='{ on }')
            v-btn.animated.fadeIn.wait-p5s(icon, v-on='on', @click='toggleMarkup({ start: `^` })').mx-0
              v-icon mdi-format-superscript
          span {{$t('editor:markup.superscript')}}
        .editor-markdown-toolbar-divider
        v-menu(offset-y, open-on-hover)
          template(v-slot:activator='{ on }')
            v-btn.animated.fadeIn.wait-p6s(icon, v-on='on').mx-0
              v-icon mdi-alpha-t-box-outline
          v-list.py-0
            v-list-item(@click='insertBeforeEachLine({ content: `> `})')
              v-list-item-action
                v-icon mdi-alpha-t-box-outline
              v-list-item-title {{$t('editor:markup.blockquote')}}
            v-divider
            v-list-item(@click='insertBeforeEachLine({ content: `> `, after: `{.is-info}`})')
              v-list-item-action
                v-icon(color='info') mdi-alpha-i-box-outline
              v-list-item-title {{$t('editor:markup.blockquoteInfo')}}
            v-divider
            v-list-item(@click='insertBeforeEachLine({ content: `> `, after: `{.is-success}`})')
              v-list-item-action
                v-icon(color='success') mdi-alpha-s-box-outline
              v-list-item-title {{$t('editor:markup.blockquoteSuccess')}}
            v-divider
            v-list-item(@click='insertBeforeEachLine({ content: `> `, after: `{.is-warning}`})')
              v-list-item-action
                v-icon(color='warning') mdi-alpha-w-box-outline
              v-list-item-title {{$t('editor:markup.blockquoteWarning')}}
            v-divider
            v-list-item(@click='insertBeforeEachLine({ content: `> `, after: `{.is-danger}`})')
              v-list-item-action
                v-icon(color='error') mdi-alpha-e-box-outline
              v-list-item-title {{$t('editor:markup.blockquoteError')}}
            v-divider
        .editor-markdown-toolbar-divider
        v-tooltip(bottom, color='primary')
          template(v-slot:activator='{ on }')
            v-btn.animated.fadeIn.wait-p7s(icon, v-on='on', @click='insertBeforeEachLine({ content: `- `})').mx-0
              v-icon mdi-format-list-bulleted
          span {{$t('editor:markup.unorderedList')}}
        v-tooltip(bottom, color='primary')
          template(v-slot:activator='{ on }')
            v-btn.animated.fadeIn.wait-p8s(icon, v-on='on', @click='insertBeforeEachLine({ content: `1. `})').mx-0
              v-icon mdi-format-list-numbered
          span {{$t('editor:markup.orderedList')}}
        .editor-markdown-toolbar-divider
        v-tooltip(bottom, color='primary')
          template(v-slot:activator='{ on }')
            v-btn.animated.fadeIn.wait-p9s(icon, v-on='on', @click='toggleMarkup({ start: "`" })').mx-0
              v-icon mdi-code-tags
          span {{$t('editor:markup.inlineCode')}}
        v-tooltip(bottom, color='primary')
          template(v-slot:activator='{ on }')
            v-btn.animated.fadeIn.wait-p10s(icon, v-on='on', @click='toggleMarkup({ start: `<kbd>`, end: `</kbd>` })').mx-0
              v-icon mdi-keyboard-variant
          span {{$t('editor:markup.keyboardKey')}}
        v-tooltip(bottom, color='primary')
          template(v-slot:activator='{ on }')
            v-btn.animated.fadeIn.wait-p11s(icon, v-on='on', @click='insertAfter({ content: `---`, newLine: true })').mx-0
              v-icon mdi-minus
          span {{$t('editor:markup.horizontalBar')}}
        template(v-if='$vuetify.breakpoint.mdAndUp')
          v-spacer
          v-tooltip(bottom, color='primary', v-if='previewShown')
            template(v-slot:activator='{ on }')
              v-btn.animated.fadeIn.wait-p1s(icon, v-on='on', @click='spellModeActive = !spellModeActive', :class='{ "is-active": spellModeActive }').mx-0
                v-icon mdi-spellcheck
            span {{$t('editor:markup.toggleSpellcheck')}}
          v-tooltip(bottom, color='primary')
            template(v-slot:activator='{ on }')
              .editor-markdown-viewmode.animated.fadeIn.wait-p2s(v-on='on')
                button.editor-markdown-viewmode-btn(type='button', :class='{ "is-active": previewShown }', @click='previewShown = true') Split
                button.editor-markdown-viewmode-btn(type='button', :class='{ "is-active": !previewShown }', @click='previewShown = false') Editor
            span {{$t('editor:markup.togglePreviewPane')}}
    .editor-markdown-main
      .editor-markdown-sidebar
        v-tooltip(right, color='primary')
          template(v-slot:activator='{ on }')
            v-btn.animated.fadeInLeft(icon, v-on='on', @click='insertLink').mx-0
              v-icon mdi-link-plus
          span {{$t('editor:markup.insertLink')}}
        v-tooltip(right, color='primary')
          template(v-slot:activator='{ on }')
            v-btn.mt-2.animated.fadeInLeft.wait-p1s(icon, v-on='on', @click='toggleModal(`editorModalMedia`)', :class='{ "is-active": activeModal === `editorModalMedia` }').mx-0
              v-icon mdi-folder-multiple-image
          span {{$t('editor:markup.insertAssets')}}
        v-tooltip(right, color='primary')
          template(v-slot:activator='{ on }')
            v-btn.mt-2.animated.fadeInLeft.wait-p2s(icon, v-on='on', @click='toggleModal(`editorModalDrawio`)', :class='{ "is-active": activeModal === `editorModalDrawio` }').mx-0
              v-icon mdi-chart-multiline
          span {{$t('editor:markup.insertDiagram')}}
        template(v-if='$vuetify.breakpoint.mdAndUp')
          v-spacer
          v-tooltip(right, color='primary')
            template(v-slot:activator='{ on }')
              v-btn.mt-2.animated.fadeInLeft.wait-p3s(icon, v-on='on', @click='toggleFullscreen').mx-0
                v-icon mdi-arrow-expand-all
            span {{$t('editor:markup.distractionFreeMode')}}
          v-tooltip(right, color='primary')
            template(v-slot:activator='{ on }')
              v-btn.mt-2.animated.fadeInLeft.wait-p4s(icon, v-on='on', @click='toggleHelp', :class='{ "is-active": helpShown }').mx-0
                v-icon mdi-help-circle
            span {{$t('editor:markup.markdownFormattingHelp')}}
      .editor-markdown-editor
        textarea(ref='cm')
      transition(name='editor-markdown-preview')
        .editor-markdown-preview(v-if='previewShown')
          .editor-markdown-preview-content.contents(ref='editorPreviewContainer')
            div(
              ref='editorPreview'
              v-html='previewHTML'
              :spellcheck='spellModeActive'
              :contenteditable='spellModeActive'
              @blur='spellModeActive = false'
              )

    v-system-bar.editor-markdown-sysbar(height='32')
      .caption.editor-markdown-sysbar-locale {{locale.toUpperCase()}}
      .caption.px-3 /{{path}}
      template(v-if='$vuetify.breakpoint.mdAndUp')
        v-spacer
        .caption Markdown
        v-spacer
        .caption Ln {{cursorPos.line + 1}}, Col {{cursorPos.ch + 1}}

    markdown-help(v-if='helpShown')
    page-selector(mode='select', v-model='insertLinkDialog', :open-handler='insertLinkHandler', :path='path', :locale='locale')
</template>

<script>
import _ from 'lodash'
import { get, sync } from 'vuex-pathify'
import markdownHelp from './markdown/help.vue'
import gql from 'graphql-tag'
import DOMPurify from 'dompurify'

/* global siteConfig, siteLangs */

// ========================================
// IMPORTS
// ========================================

// Code Mirror
import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'

// Language
import 'codemirror/mode/markdown/markdown.js'

// Addons
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/display/fullscreen.js'
import 'codemirror/addon/display/fullscreen.css'
import 'codemirror/addon/selection/mark-selection.js'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/foldgutter.css'

// Markdown-it
import MarkdownIt from 'markdown-it'
import mdAttrs from 'markdown-it-attrs'
import mdDecorate from 'markdown-it-decorate'
import { full as mdEmoji } from 'markdown-it-emoji'
import mdTaskLists from 'markdown-it-task-lists'
import mdExpandTabs from 'markdown-it-expand-tabs'
import mdAbbr from 'markdown-it-abbr'
import mdSup from 'markdown-it-sup'
import mdSub from 'markdown-it-sub'
import mdMark from 'markdown-it-mark'
import mdMultiTable from 'markdown-it-multimd-table'
import mdFootnote from 'markdown-it-footnote'
import mdImsize from 'markdown-it-imsize'
import katex from 'katex'
import underline from '../../libs/markdown-it-underline'
import 'katex/dist/contrib/mhchem'
import twemoji from 'twemoji'
import plantuml from './markdown/plantuml'

// Prism (Syntax Highlighting)
import Prism from 'prismjs'

// Mermaid
import mermaid from 'mermaid'

// Helpers
import katexHelper from './common/katex'
import tabsetHelper from './markdown/tabset'
import cmFold from './common/cmFold'

// ========================================
// INIT
// ========================================

// Platform detection
const CtrlKey = /Mac/.test(navigator.platform) ? 'Cmd' : 'Ctrl'

// Prism Config
Prism.plugins.autoloader.languages_path = '/_assets/js/prism/'
Prism.plugins.NormalizeWhitespace.setDefaults({
  'remove-trailing': true,
  'remove-indent': true,
  'left-trim': true,
  'right-trim': true,
  'remove-initial-line-feed': true,
  'tabs-to-spaces': 2
})

// Markdown Instance
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typography: true,
  highlight(str, lang) {
    if (lang === 'diagram') {
      return `<pre class="diagram">` + Buffer.from(str, 'base64').toString() + `</pre>`
    } else if (['mermaid', 'plantuml'].includes(lang)) {
      return `<pre class="codeblock-${lang}"><code>${_.escape(str)}</code></pre>`
    } else {
      return `<pre class="line-numbers"><code class="language-${lang}">${_.escape(str)}</code></pre>`
    }
  }
})
  .use(mdAttrs, {
    allowedAttributes: ['id', 'class', 'target']
  })
  .use(mdDecorate)
  .use(underline)
  .use(mdEmoji)
  .use(mdTaskLists, { label: false, labelAfter: false })
  .use(mdExpandTabs)
  .use(mdAbbr)
  .use(mdSup)
  .use(mdSub)
  .use(mdMultiTable, { multiline: true, rowspan: true, headerless: true })
  .use(mdMark)
  .use(mdFootnote)
  .use(mdImsize)

// DOMPurify fix for draw.io
DOMPurify.addHook('uponSanitizeElement', (elm) => {
  if (elm.querySelectorAll) {
    const breaks = elm.querySelectorAll('foreignObject br, foreignObject p')
    if (breaks && breaks.length) {
      for (let i = 0; i < breaks.length; i++) {
        breaks[i].parentNode.replaceChild(
          document.createElement('div'),
          breaks[i]
        )
      }
    }
  }
})

// ========================================
// HELPER FUNCTIONS
// ========================================

// Inject line numbers for preview scroll sync
let linesMap = []
function injectLineNumbers (tokens, idx, options, env, slf) {
  let line
  if (tokens[idx].map && tokens[idx].level === 0) {
    line = tokens[idx].map[0]
    tokens[idx].attrJoin('class', 'line')
    tokens[idx].attrSet('data-line', String(line))
    linesMap.push(line)
  }
  return slf.renderToken(tokens, idx, options, env, slf)
}
md.renderer.rules.paragraph_open = injectLineNumbers
md.renderer.rules.heading_open = injectLineNumbers
md.renderer.rules.blockquote_open = injectLineNumbers

cmFold.register('markdown')
// ========================================
// PLANTUML
// ========================================

// TODO: Use same options as defined in backend
plantuml.init(md, {})

// ========================================
// KATEX
// ========================================

const macros = {}
md.inline.ruler.after('escape', 'katex_inline', katexHelper.katexInline)
md.renderer.rules.katex_inline = (tokens, idx) => {
  try {
    return katex.renderToString(tokens[idx].content, {
      displayMode: false, macros
    })
  } catch (err) {
    console.warn(err)
    return tokens[idx].content
  }
}
md.block.ruler.after('blockquote', 'katex_block', katexHelper.katexBlock, {
  alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
})
md.renderer.rules.katex_block = (tokens, idx) => {
  try {
    return `<p>` + katex.renderToString(tokens[idx].content, {
      displayMode: true, macros
    }) + `</p>`
  } catch (err) {
    console.warn(err)
    return tokens[idx].content
  }
}

// ========================================
// TWEMOJI
// ========================================

md.renderer.rules.emoji = (token, idx) => {
  return twemoji.parse(token[idx].content, {
    callback (icon, opts) {
      return `/_assets/svg/twemoji/${icon}.svg`
    }
  })
}

// ========================================
// Vue Component
// ========================================

let mermaidId = 0

export default {
  components: {
    markdownHelp
  },
  props: {
    save: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      fabInsertMenu: false,
      cm: null,
      cursorPos: { ch: 0, line: 1 },
      previewShown: true,
      previewHTML: '',
      helpShown: false,
      spellModeActive: false,
      insertLinkDialog: false
    }
  },
  computed: {
    isMobile() {
      return this.$vuetify.breakpoint.smAndDown
    },
    isModalShown() {
      return this.helpShown || this.activeModal !== ''
    },
    locale: get('page/locale'),
    path: get('page/path'),
    mode: get('editor/mode'),
    activeModal: sync('editor/activeModal')
  },
  watch: {
    previewShown (newValue, oldValue) {
      if (newValue && !oldValue) {
        this.$nextTick(() => {
          this.renderMermaidDiagrams()
          Prism.highlightAllUnder(this.$refs.editorPreview)
          Array.from(this.$refs.editorPreview.querySelectorAll('pre.line-numbers')).forEach(pre => pre.classList.add('prismjs'))
        })
      }
    },
    spellModeActive (newValue, oldValue) {
      if (newValue) {
        this.$nextTick(() => {
          this.$refs.editorPreview.focus()
        })
      }
    }
  },
  methods: {
    toggleModal(key) {
      this.activeModal = (this.activeModal === key) ? '' : key
      this.helpShown = false
    },
    closeAllModal() {
      this.activeModal = ''
      this.helpShown = false
    },
    onCmInput: _.debounce(function (newContent) {
      this.processContent(newContent)
    }, 600),
    onCmPaste (cm, ev) {
      // const clipItems = (ev.clipboardData || ev.originalEvent.clipboardData).items
      // for (let clipItem of clipItems) {
      //   if (_.startsWith(clipItem.type, 'image/')) {
      //     const file = clipItem.getAsFile()
      //     const reader = new FileReader()
      //     reader.onload = evt => {
      //       this.$store.commit(`loadingStart`, 'editor-paste-image')
      //       this.insertAfter({
      //         content: `![${file.name}](${evt.target.result})`,
      //         newLine: true
      //       })
      //     }
      //     reader.readAsDataURL(file)
      //   }
      // }
    },
    processContent (newContent) {
      linesMap = []
      // this.$store.set('editor/content', newContent)
      this.processMarkers(this.cm.firstLine(), this.cm.lastLine())
      this.previewHTML = DOMPurify.sanitize(md.render(newContent), {
        ADD_TAGS: ['foreignObject'],
        HTML_INTEGRATION_POINTS: { foreignobject: true }
      })
      this.$nextTick(() => {
        tabsetHelper.format()
        this.renderMermaidDiagrams()
        Prism.highlightAllUnder(this.$refs.editorPreview)
        Array.from(this.$refs.editorPreview.querySelectorAll('pre.line-numbers')).forEach(pre => pre.classList.add('prismjs'))
        this.scrollSync(this.cm)
      })
    },
    /**
     * Update cursor state
     */
    positionSync(cm) {
      this.cursorPos = cm.getCursor('head')
    },
    /**
     * Wrap selection with start / end tags
     */
    toggleMarkup({ start, end }) {
      if (!end) { end = start }
      if (!this.cm.doc.somethingSelected()) {
        return this.$store.commit('showNotification', {
          message: this.$t('editor:markup.noSelectionError'),
          style: 'warning',
          icon: 'warning'
        })
      }
      this.cm.doc.replaceSelections(this.cm.doc.getSelections().map(s => start + s + end))
    },
    /**
     * Set current line as header
     */
    setHeaderLine(lvl) {
      const curLine = this.cm.doc.getCursor('head').line
      let lineContent = this.cm.doc.getLine(curLine)
      const lineLength = lineContent.length
      if (_.startsWith(lineContent, '#')) {
        lineContent = lineContent.replace(/^(#+ )/, '')
      }
      lineContent = _.times(lvl, n => '#').join('') + ` ` + lineContent
      this.cm.doc.replaceRange(lineContent, { line: curLine, ch: 0 }, { line: curLine, ch: lineLength })
    },
    /**
     * Get the header lever of the current line
     */
    getHeaderLevel(cm) {
      const curLine = this.cm.doc.getCursor('head').line
      let lineContent = this.cm.doc.getLine(curLine)
      let lvl = 0

      const result = lineContent.match(/^(#+) /)
      if (result) {
        lvl = _.get(result, '[1]', '').length
      }
      return lvl
    },
    /**
     * Insert content at cursor
     */
    insertAtCursor({ content }) {
      const cursor = this.cm.doc.getCursor('head')
      this.cm.doc.replaceRange(content, cursor)
    },
    /**
     * Insert content after current line
     */
    insertAfter({ content, newLine }) {
      const curLine = this.cm.doc.getCursor('to').line
      const lineLength = this.cm.doc.getLine(curLine).length
      this.cm.doc.replaceRange(newLine ? `\n${content}\n` : content, { line: curLine, ch: lineLength + 1 })
    },
    /**
     * Insert content before current line
     */
    insertBeforeEachLine({ content, after }) {
      let lines = []
      if (!this.cm.doc.somethingSelected()) {
        lines.push(this.cm.doc.getCursor('head').line)
      } else {
        lines = _.flatten(this.cm.doc.listSelections().map(sl => {
          const range = Math.abs(sl.anchor.line - sl.head.line) + 1
          const lowestLine = (sl.anchor.line > sl.head.line) ? sl.head.line : sl.anchor.line
          return _.times(range, l => l + lowestLine)
        }))
      }
      lines.forEach(ln => {
        let lineContent = this.cm.doc.getLine(ln)
        const lineLength = lineContent.length
        if (_.startsWith(lineContent, content)) {
          lineContent = lineContent.substring(content.length)
        }

        this.cm.doc.replaceRange(content + lineContent, { line: ln, ch: 0 }, { line: ln, ch: lineLength })
      })
      if (after) {
        const lastLine = _.last(lines)
        this.cm.doc.replaceRange(`\n${after}\n`, { line: lastLine, ch: this.cm.doc.getLine(lastLine).length + 1 })
      }
    },
    /**
     * Update scroll sync
     */
    scrollSync: _.debounce(function (cm) {
      if (!this.previewShown || cm.somethingSelected()) { return }
      let currentLine = cm.getCursor().line
      if (currentLine < 3) {
        this.Velocity(this.$refs.editorPreview, 'stop', true)
        this.Velocity(this.$refs.editorPreview.firstChild, 'scroll', { offset: '-50', duration: 1000, container: this.$refs.editorPreviewContainer })
      } else {
        let closestLine = _.findLast(linesMap, n => n <= currentLine)
        let destElm = this.$refs.editorPreview.querySelector(`[data-line='${closestLine}']`)
        if (destElm) {
          this.Velocity(this.$refs.editorPreview, 'stop', true)
          this.Velocity(destElm, 'scroll', { offset: '-100', duration: 1000, container: this.$refs.editorPreviewContainer })
        }
      }
    }, 500),
    toggleHelp () {
      this.helpShown = !this.helpShown
      this.activeModal = ''
    },
    toggleFullscreen () {
      this.cm.setOption('fullScreen', true)
    },
    refresh() {
      this.$nextTick(() => {
        this.cm.refresh()
      })
    },
    renderMermaidDiagrams () {
      document.querySelectorAll('.editor-markdown-preview pre.codeblock-mermaid > code').forEach(elm => {
        mermaidId++
        const mermaidDef = elm.innerText
        const mmElm = document.createElement('div')
        mmElm.innerHTML = `<div id="mermaid-id-${mermaidId}">${mermaid.render(`mermaid-id-${mermaidId}`, mermaidDef)}</div>`
        elm.parentElement.replaceWith(mmElm)
      })
    },
    autocomplete (cm, change) {
      if (cm.getModeAt(cm.getCursor()).name !== 'markdown') {
        return
      }

      // Links
      if (change.text[0] === '(') {
        const curLine = cm.getLine(change.from.line).substring(0, change.from.ch)
        if (curLine[curLine.length - 1] === ']') {
          cm.showHint({
            hint: async (cm, options) => {
              const cur = cm.getCursor()
              const curLine = cm.getLine(cur.line).substring(0, cur.ch)
              const queryString = curLine.substring(curLine.lastIndexOf('[') + 1, curLine.length - 2)
              const token = cm.getTokenAt(cur)
              try {
                const respRaw = await this.$apollo.query({
                  query: gql`
                    query ($query: String!, $locale: String) {
                      pages {
                        search(query:$query, locale:$locale) {
                          results {
                            title
                            path
                            locale
                          }
                          totalHits
                        }
                      }
                    }
                  `,
                  variables: {
                    query: queryString,
                    locale: this.locale
                  },
                  fetchPolicy: 'cache-first'
                })
                const resp = _.get(respRaw, 'data.pages.search', {})
                if (resp && resp.totalHits > 0) {
                  return {
                    list: resp.results.map(r => ({
                      text: '(' + (siteLangs.length > 0 ? `/${r.locale}/${r.path}` : `/${r.path}`) + ')',
                      displayText: siteLangs.length > 0 ? `/${r.locale}/${r.path} - ${r.title}` : `/${r.path} - ${r.title}`
                    })),
                    from: CodeMirror.Pos(cur.line, token.start),
                    to: CodeMirror.Pos(cur.line, token.end)
                  }
                }
              } catch (err) {}
              return {
                list: [],
                from: CodeMirror.Pos(cur.line, token.start),
                to: CodeMirror.Pos(cur.line, token.end)
              }
            }
          })
        }
      }
    },
    insertLink () {
      this.insertLinkDialog = true
    },
    insertLinkHandler ({ locale, path }) {
      const lastPart = _.last(path.split('/'))
      this.insertAtCursor({
        content: siteLangs.length > 0 ? `[${lastPart}](/${locale}/${path})` : `[${lastPart}](/${path})`
      })
    },
    processMarkers (from, to) {
      let found = null
      let foundStart = 0
      this.cm.doc.getAllMarks().forEach(mk => {
        if (mk.__kind) {
          mk.clear()
        }
      })
      this.cm.eachLine(from, to, ln => {
        const line = ln.lineNo()
        if (ln.text.startsWith('```diagram')) {
          found = 'diagram'
          foundStart = line
        } else if (ln.text === '```' && found) {
          switch (found) {
            // ------------------------------
            // -> DIAGRAM
            // ------------------------------
            case 'diagram': {
              if (line - foundStart !== 2) {
                return
              }
              this.addMarker({
                kind: 'diagram',
                from: { line: foundStart, ch: 3 },
                to: { line: foundStart, ch: 10 },
                text: 'Edit Diagram',
                action: ((start, end) => {
                  return (ev) => {
                    this.cm.doc.setSelection({ line: start, ch: 0 }, { line: end, ch: 3 })
                    try {
                      const raw = this.cm.doc.getLine(end - 1)
                      this.$store.set('editor/activeModalData', Buffer.from(raw, 'base64').toString())
                      this.toggleModal(`editorModalDrawio`)
                    } catch (err) {
                      return this.$store.commit('showNotification', {
                        message: 'Failed to process diagram data.',
                        style: 'warning',
                        icon: 'warning'
                      })
                    }
                  }
                })(foundStart, line)
              })
              if (ln.height > 0) {
                this.cm.foldCode(foundStart)
              }
              break
            }
          }
          found = null
        }
      })
    },
    addMarker ({ kind, from, to, text, action }) {
      const markerElm = document.createElement('span')
      markerElm.appendChild(document.createTextNode(text))
      markerElm.className = 'CodeMirror-buttonmarker'
      markerElm.addEventListener('click', action)
      this.cm.markText(from, to, { replacedWith: markerElm, __kind: kind })
    }
  },
  mounted() {
    this.$store.set('editor/editorKey', 'markdown')

    if (this.mode === 'create' && !this.$store.get('editor/content')) {
      this.$store.set('editor/content', '# Header\nYour content here')
    }

    // Initialize Mermaid API
    mermaid.initialize({
      startOnLoad: false,
      theme: this.$vuetify.theme.dark ? `dark` : `default`
    })

    // Initialize CodeMirror

    this.cm = CodeMirror.fromTextArea(this.$refs.cm, {
      tabSize: 2,
      mode: 'text/markdown',
      theme: 'wikijs-dark',
      lineNumbers: true,
      lineWrapping: true,
      line: true,
      styleActiveLine: true,
      highlightSelectionMatches: {
        annotateScrollbar: true
      },
      viewportMargin: 50,
      inputStyle: 'contenteditable',
      allowDropFileTypes: ['image/jpg', 'image/png', 'image/svg', 'image/jpeg', 'image/gif'],
      direction: siteConfig.rtl ? 'rtl' : 'ltr',
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    })
    this.cm.setValue(this.$store.get('editor/content'))
    this.cm.on('change', c => {
      this.$store.set('editor/content', c.getValue())
      this.onCmInput(this.$store.get('editor/content'))
    })
    // 64 px top bar + 44 px formatting toolbar + 32 px status bar
    if (this.$vuetify.breakpoint.mdAndUp) {
      this.cm.setSize(null, 'calc(100vh - 64px - 44px - 32px)')
    } else {
      this.cm.setSize(null, 'calc(100vh - 64px - 44px - 32px)')
    }

    // Set Keybindings

    const keyBindings = {
      'F11' (c) {
        c.setOption('fullScreen', !c.getOption('fullScreen'))
      },
      'Esc' (c) {
        if (c.getOption('fullScreen')) c.setOption('fullScreen', false)
      }
    }
    _.set(keyBindings, `${CtrlKey}-S`, c => {
      this.save()
      return false
    })
    _.set(keyBindings, `${CtrlKey}-B`, c => {
      this.toggleMarkup({ start: `**` })
      return false
    })
    _.set(keyBindings, `${CtrlKey}-I`, c => {
      this.toggleMarkup({ start: `*` })
      return false
    })
    _.set(keyBindings, `${CtrlKey}-Alt-Right`, c => {
      let lvl = this.getHeaderLevel(c)
      if (lvl >= 6) { lvl = 5 }
      this.setHeaderLine(lvl + 1)
      return false
    })
    _.set(keyBindings, `${CtrlKey}-Alt-Left`, c => {
      let lvl = this.getHeaderLevel(c)
      if (lvl <= 1) { lvl = 2 }
      this.setHeaderLine(lvl - 1)
      return false
    })
    this.cm.setOption('extraKeys', keyBindings)

    this.cm.on('inputRead', this.autocomplete)

    // Handle cursor movement

    this.cm.on('cursorActivity', c => {
      this.positionSync(c)
      this.scrollSync(c)
    })

    // Handle special paste

    this.cm.on('paste', this.onCmPaste)

    // Render initial preview

    this.processContent(this.$store.get('editor/content'))
    this.refresh()

    this.$root.$on('editorInsert', opts => {
      switch (opts.kind) {
        case 'IMAGE':
          let img = `![${opts.text}](${opts.path})`
          if (opts.align && opts.align !== '') {
            img += `{.align-${opts.align}}`
          }
          this.insertAtCursor({
            content: img
          })
          break
        case 'BINARY':
          this.insertAtCursor({
            content: `[${opts.text}](${opts.path})`
          })
          break
        case 'DIAGRAM':
          const selStartLine = this.cm.getCursor('from').line
          const selEndLine = this.cm.getCursor('to').line + 1
          this.cm.doc.replaceSelection('```diagram\n' + opts.text + '\n```\n', 'start')
          this.processMarkers(selStartLine, selEndLine)
          break
      }
    })

    // Handle save conflict
    this.$root.$on('saveConflict', () => {
      this.toggleModal(`editorModalConflict`)
    })
    this.$root.$on('overwriteEditorContent', () => {
      this.cm.setValue(this.$store.get('editor/content'))
    })
  },
  beforeDestroy() {
    this.$root.$off('editorInsert')
  }
}
</script>

<style lang='scss'>

// 64 px top bar + 44 px formatting toolbar + 32 px status bar
$editor-height: calc(100vh - 64px - 44px - 32px);
$editor-height-mobile: calc(100vh - 64px - 44px - 32px);

.editor-markdown {
  &-main {
    display: flex;
    width: 100%;
  }

  &-editor {
    background-color: var(--cl-surface);
    flex: 1 1 50%;
    display: block;
    height: $editor-height;
    position: relative;
    border-right: 1px solid var(--cl-border);

    @include until($tablet) {
      height: $editor-height-mobile;
    }
  }

  // Preview pane: page wash with the rendered content in a card
  &-preview {
    flex: 1 1 50%;
    background-color: var(--cl-page);
    position: relative;
    height: $editor-height;
    overflow: hidden;
    padding: 24px 32px;

    @include until($tablet) {
      display: none;
    }

    &-enter-active, &-leave-active {
      transition: max-width .5s ease;
      max-width: 50vw;

      .editor-code-preview-content {
        width: 50vw;
        overflow:hidden;
      }
    }
    &-enter, &-leave-to {
      max-width: 0;
    }

    &-content {
      height: calc(100vh - 64px - 44px - 32px - 48px);
      overflow-y: scroll;
      padding: 0;
      width: calc(100% + 17px);

      @include until($tablet) {
        height: calc(100vh - 64px - 44px - 32px - 48px);
      }

      > div {
        outline: none;
        background-color: var(--cl-surface);
        border: 1px solid var(--cl-border);
        border-radius: $cl-radius-lg;
        box-shadow: var(--cl-shadow-sm);
        padding: 32px 40px;
        margin-bottom: 24px;

        @include until($desktop) {
          padding: 24px;
        }
      }

      p.line {
        overflow-wrap: break-word;
      }

      .tabset {
        background-color: $cl-navy;
        color: $cl-white !important;
        padding: 5px 12px;
        font-size: 14px;
        font-weight: 600;
        border-radius: $cl-radius-md $cl-radius-md 0 0;

        &::after {
          display: none;
        }

        &-header {
          background-color: var(--cl-accent-pale);
          color: var(--cl-accent-deep) !important;
          border: 1px solid var(--cl-border);
          border-bottom: 0;
          padding: 5px 12px;
          font-size: 14px;
          font-weight: 600;
          margin-top: 0 !important;

          &::after {
            display: none;
          }
        }

        &-content {
          border: 1px solid var(--cl-border);
          border-radius: 0 0 $cl-radius-md $cl-radius-md;
          background-color: var(--cl-sunken);
          padding: 0 15px 15px;
          overflow: hidden;
          margin-bottom: 16px;
        }
      }
    }
  }

  // Formatting toolbar: light 44 px bar, quiet 32 px icon buttons, segmented view toggle
  &-toolbar.v-toolbar {
    background-color: var(--cl-surface) !important;
    border-bottom: 1px solid var(--cl-border);
    color: var(--cl-heading);

    .v-toolbar__content {
      padding: 0 16px;
      height: 44px !important;

      @include until($tablet) {
        padding: 0 8px;
      }
    }

    .v-btn.v-btn--icon {
      width: 32px;
      height: 32px;
      border-radius: $cl-radius-md;
      color: var(--cl-heading);

      &::before {
        border-radius: $cl-radius-md;
      }

      .v-icon {
        font-size: 20px;
        color: var(--cl-heading);
      }

      &:hover {
        background-color: var(--cl-sunken);

        &::before {
          opacity: 0;
        }
      }

      &.is-active {
        background-color: var(--cl-accent-pale);
        color: var(--cl-accent-deep);

        .v-icon {
          color: var(--cl-accent-deep);
        }
      }
    }

    .v-btn.v-btn--text {
      color: var(--cl-accent-deep);
    }
  }

  &-toolbar-divider {
    flex: none;
    width: 1px;
    height: 20px;
    margin: 0 4px;
    background-color: var(--cl-border);
  }

  &-viewmode {
    display: inline-flex;
    align-items: stretch;
    height: 32px;
    margin-left: 8px;
    border: 1px solid var(--cl-border-strong);
    border-radius: $cl-radius-md;
    background-color: var(--cl-surface);
    overflow: hidden;

    &-btn {
      display: inline-flex;
      align-items: center;
      padding: 0 12px;
      border: 0;
      border-right: 1px solid var(--cl-border);
      background: transparent;
      font-family: $cl-font;
      font-size: 14px;
      font-weight: 400;
      color: var(--cl-text);
      cursor: pointer;
      outline: none;
      transition: background-color 120ms ease, color 120ms ease;

      &:last-child {
        border-right: 0;
      }

      &:hover {
        background-color: var(--cl-sunken);
      }

      &.is-active {
        background-color: $cl-green;
        color: $cl-navy;
        font-weight: 600;
      }

      &:focus-visible {
        box-shadow: inset 0 0 0 2px $cl-green-ring;
      }
    }
  }

  &-insert:not(.v-speed-dial--right) {
    @include from($tablet) {
      left: 50%;
      margin-left: -28px;
    }
  }

  // Insert rail: light column with the same quiet icon buttons as the toolbar
  &-sidebar {
    background-color: var(--cl-surface);
    border-right: 1px solid var(--cl-border);
    width: 48px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 12px 0;

    @include until($tablet) {
      padding: 8px 0;
      width: 40px;
    }

    .v-btn.v-btn--icon {
      width: 32px;
      height: 32px;
      border-radius: $cl-radius-md;
      color: var(--cl-heading);

      &::before {
        border-radius: $cl-radius-md;
      }

      .v-icon {
        font-size: 20px;
        color: var(--cl-heading);
      }

      &:hover {
        background-color: var(--cl-sunken);

        &::before {
          opacity: 0;
        }
      }

      &.is-active {
        background-color: var(--cl-accent-pale);

        .v-icon {
          color: var(--cl-accent-deep);
        }
      }
    }
  }

  // Status bar: 32 px surface strip with a 1 px top rule
  &-sysbar.v-system-bar {
    height: 32px;
    padding: 0 16px;
    background-color: var(--cl-surface) !important;
    border-top: 1px solid var(--cl-border);
    color: var(--cl-muted) !important;
    font-family: $cl-font;

    .caption {
      font-size: 12px !important;
      color: var(--cl-muted);
    }

    &-locale {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 20px;
      padding: 0 8px;
      font-weight: 600 !important;
      background-color: var(--cl-sunken);
      border: 1px solid var(--cl-border);
      border-radius: $cl-radius-sm;
    }
  }

  // ==========================================
  // Fix FAB revealing under codemirror
  // ==========================================

  .speed-dial--fixed {
    z-index: 8;
  }

  // ==========================================
  // CODE MIRROR
  // ==========================================

  .CodeMirror {
    height: auto;
    font-family: $cl-font-mono;
    font-size: 14px;
    line-height: 1.7;

    .cm-header-1 {
      font-size: 1.5rem;
    }
    .cm-header-2 {
      font-size: 1.25rem;
    }
    .cm-header-3 {
      font-size: 1.15rem;
    }
    .cm-header-4 {
      font-size: 1.1rem;
    }
    .cm-header-5 {
      font-size: 1.05rem;
    }
    .cm-header-6 {
      font-size: 1.025rem;
    }
  }

  .CodeMirror-lines {
    padding: 16px 0;
  }

  .CodeMirror pre.CodeMirror-line, .CodeMirror pre.CodeMirror-line-like {
    padding: 0 24px 0 16px;
  }

  // 48 px gutter with 12 px muted numbers
  .CodeMirror-linenumber {
    min-width: 28px;
    padding: 0 12px 0 8px;
    font-size: 12px;
  }

  .CodeMirror-wrap pre.CodeMirror-line, .CodeMirror-wrap pre.CodeMirror-line-like {
    word-break: break-word;
  }

  .CodeMirror-focused .cm-matchhighlight {
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVQI12NgYGBgkKzc8x9CMDAwAAAmhwSbidEoSQAAAABJRU5ErkJggg==);
    background-position: bottom;
    background-repeat: repeat-x;
  }
  .cm-matchhighlight {
    background-color: var(--cl-sunken);
  }
  .CodeMirror-selection-highlight-scrollbar {
    background-color: $cl-green;
  }
}

// HINT DROPDOWN
// CodeMirror appends this list to <body>, outside .v-application, so the CSS custom
// properties do not resolve here; the light palette constants are used instead.

.CodeMirror-hints {
  position: absolute;
  z-index: 10;
  overflow: hidden;
  list-style: none;

  margin: 0;
  padding: 4px;

  box-shadow: $cl-shadow-lg;
  border: 1px solid $cl-grey-line;
  border-radius: $cl-radius-lg;

  background: $cl-white;
  font-family: $cl-font-mono;
  font-size: 13px;

  max-height: 150px;
  overflow-y: auto;

  min-width: 250px;
  max-width: 80vw;
}

.CodeMirror-hint {
  margin: 0;
  padding: 2px 8px;
  border-radius: $cl-radius-sm;
  white-space: pre;
  color: $cl-ink;
  cursor: pointer;
}

li.CodeMirror-hint-active {
  background: $cl-green-pale;
  color: $cl-green-deep;
}
</style>
