<template lang="pug">
  v-app.editor(:dark='$vuetify.theme.dark')
    v-app-bar.editor-header(app, fixed, flat, dark, height='64')
      .editor-header-brand
        a.editor-header-logo(href='/', :title='siteTitle')
          img(src='/_assets/img/cl/carbon-logica-logo-reversed.png', alt='Carbon Logica')
        .editor-header-divider
        .editor-header-page
          .editor-header-mode {{ mode === 'create' ? 'Creating' : 'Editing' }}
          .editor-header-page-row
            .editor-header-title(@click='openPropsModal', :title='$t(`common:actions.page`)') {{ currentPageTitle }}
            .editor-header-path(v-if='$vuetify.breakpoint.mdAndUp') /{{ currentPagePath }}
      v-spacer
      .editor-header-actions
        v-btn.editor-header-conflict.animated.fadeIn(outlined, small, height='32', v-if='isConflict', @click='openConflict')
          span.mr-2 Conflict
          status-indicator(intermediary, pulse)
        .editor-header-status.animated.fadeIn(v-if='mode !== `create` && $vuetify.breakpoint.smAndUp', :class='isDirty ? `is-unsaved` : `is-saved`')
          span.editor-header-status-dot
          span(v-if='isDirty') Unsaved changes
          span(v-else) {{ $t('editor:save.saved') }}
        v-btn.editor-header-btn.animated.fadeInDown.wait-p1s(
          outlined
          small
          height='32'
          @click='openPropsModal'
          :class='{ "is-icon": $vuetify.breakpoint.mdAndDown }'
          )
          v-icon(small, :left='$vuetify.breakpoint.lgAndUp') mdi-tag-text-outline
          span(v-if='$vuetify.breakpoint.lgAndUp') {{ $t('common:actions.page') }}
        v-btn.editor-header-btn.animated.fadeInDown.wait-p2s(
          v-if='!welcomeMode'
          outlined
          small
          height='32'
          :class='{ "is-icon": $vuetify.breakpoint.mdAndDown }'
          @click='exit'
          )
          v-icon(small, :left='$vuetify.breakpoint.lgAndUp') mdi-close
          span(v-if='$vuetify.breakpoint.lgAndUp') {{ $t('common:actions.close') }}
        v-btn.editor-header-save.animated.fadeInDown(
          depressed
          small
          height='32'
          color='primary'
          @click.exact='save'
          @click.ctrl.exact='saveAndClose'
          :class='{ "is-icon": $vuetify.breakpoint.mdAndDown }'
          )
          v-icon(small, :left='$vuetify.breakpoint.lgAndUp') mdi-check
          span(v-if='$vuetify.breakpoint.lgAndUp') {{ mode === 'create' ? $t('common:actions.create') : $t('common:actions.save') }}
    v-main.editor-main
      component(:is='currentEditor', :save='save')
      editor-modal-properties(v-model='dialogProps')
      editor-modal-editorselect(v-model='dialogEditorSelector')
      editor-modal-unsaved(v-model='dialogUnsaved', @discard='exitGo')
      component(:is='activeModal')

    loader(v-model='dialogProgress', :title='$t(`editor:save.processing`)', :subtitle='$t(`editor:save.pleaseWait`)')
    notify
</template>

<script>
import _ from 'lodash'
import gql from 'graphql-tag'
import { get, sync } from 'vuex-pathify'
import { AtomSpinner } from 'epic-spinners'
import { Base64 } from 'js-base64'
import { StatusIndicator } from 'vue-status-indicator'

import editorStore from '../store/editor'

/* global WIKI, siteConfig */

WIKI.$store.registerModule('editor', editorStore)

export default {
  i18nOptions: { namespaces: 'editor' },
  components: {
    AtomSpinner,
    StatusIndicator,
    editorApi: () => import(/* webpackChunkName: "editor-api", webpackMode: "lazy" */ './editor/editor-api.vue'),
    editorCode: () => import(/* webpackChunkName: "editor-code", webpackMode: "lazy" */ './editor/editor-code.vue'),
    editorCkeditor: () => import(/* webpackChunkName: "editor-ckeditor", webpackMode: "lazy" */ './editor/editor-ckeditor.vue'),
    editorAsciidoc: () => import(/* webpackChunkName: "editor-asciidoc", webpackMode: "lazy" */ './editor/editor-asciidoc.vue'),
    editorMarkdown: () => import(/* webpackChunkName: "editor-markdown", webpackMode: "lazy" */ './editor/editor-markdown.vue'),
    editorRedirect: () => import(/* webpackChunkName: "editor-redirect", webpackMode: "lazy" */ './editor/editor-redirect.vue'),
    editorModalEditorselect: () => import(/* webpackChunkName: "editor", webpackMode: "eager" */ './editor/editor-modal-editorselect.vue'),
    editorModalProperties: () => import(/* webpackChunkName: "editor", webpackMode: "eager" */ './editor/editor-modal-properties.vue'),
    editorModalUnsaved: () => import(/* webpackChunkName: "editor", webpackMode: "eager" */ './editor/editor-modal-unsaved.vue'),
    editorModalMedia: () => import(/* webpackChunkName: "editor", webpackMode: "eager" */ './editor/editor-modal-media.vue'),
    editorModalBlocks: () => import(/* webpackChunkName: "editor", webpackMode: "eager" */ './editor/editor-modal-blocks.vue'),
    editorModalConflict: () => import(/* webpackChunkName: "editor-conflict", webpackMode: "lazy" */ './editor/editor-modal-conflict.vue'),
    editorModalDrawio: () => import(/* webpackChunkName: "editor", webpackMode: "eager" */ './editor/editor-modal-drawio.vue')
  },
  props: {
    locale: {
      type: String,
      default: 'en'
    },
    path: {
      type: String,
      default: 'home'
    },
    title: {
      type: String,
      default: 'Untitled Page'
    },
    description: {
      type: String,
      default: ''
    },
    tags: {
      type: Array,
      default: () => ([])
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    scriptCss: {
      type: String,
      default: ''
    },
    publishStartDate: {
      type: String,
      default: ''
    },
    publishEndDate: {
      type: String,
      default: ''
    },
    scriptJs: {
      type: String,
      default: ''
    },
    initEditor: {
      type: String,
      default: null
    },
    initMode: {
      type: String,
      default: 'create'
    },
    initContent: {
      type: String,
      default: null
    },
    pageId: {
      type: Number,
      default: 0
    },
    checkoutDate: {
      type: String,
      default: new Date().toISOString()
    },
    effectivePermissions: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isSaving: false,
      isConflict: false,
      dialogProps: false,
      dialogProgress: false,
      dialogEditorSelector: false,
      dialogUnsaved: false,
      exitConfirmed: false,
      initContentParsed: '',
      savedState: {
        description: '',
        isPublished: false,
        publishEndDate: '',
        publishStartDate: '',
        tags: '',
        title: '',
        css: '',
        js: ''
      }
    }
  },
  computed: {
    currentEditor: sync('editor/editor'),
    activeModal: sync('editor/activeModal'),
    mode: get('editor/mode'),
    welcomeMode() { return this.mode === `create` && this.path === `home` },
    currentPageTitle: sync('page/title'),
    currentPagePath: get('page/path'),
    siteTitle () { return siteConfig.title },
    checkoutDateActive: sync('editor/checkoutDateActive'),
    currentStyling: get('page/scriptCss'),
    isDirty () {
      return _.some([
        this.initContentParsed !== this.$store.get('editor/content'),
        this.locale !== this.$store.get('page/locale'),
        this.path !== this.$store.get('page/path'),
        this.savedState.title !== this.$store.get('page/title'),
        this.savedState.description !== this.$store.get('page/description'),
        this.savedState.tags !== this.$store.get('page/tags'),
        this.savedState.isPublished !== this.$store.get('page/isPublished'),
        this.savedState.publishStartDate !== this.$store.get('page/publishStartDate'),
        this.savedState.publishEndDate !== this.$store.get('page/publishEndDate'),
        this.savedState.css !== this.$store.get('page/scriptCss'),
        this.savedState.js !== this.$store.get('page/scriptJs')
      ], Boolean)
    }
  },
  watch: {
    currentEditor(newValue, oldValue) {
      if (newValue !== '' && this.mode === 'create') {
        _.delay(() => {
          this.dialogProps = true
        }, 500)
      }
    },
    currentStyling(newValue) {
      this.injectCustomCss(newValue)
    }
  },
  created() {
    this.$store.set('page/id', this.pageId)
    this.$store.set('page/description', this.description)
    this.$store.set('page/isPublished', this.isPublished)
    this.$store.set('page/publishStartDate', this.publishStartDate)
    this.$store.set('page/publishEndDate', this.publishEndDate)
    this.$store.set('page/locale', this.locale)
    this.$store.set('page/path', this.path)
    this.$store.set('page/tags', this.tags)
    this.$store.set('page/title', this.title)
    this.$store.set('page/scriptCss', this.scriptCss)
    this.$store.set('page/scriptJs', this.scriptJs)

    this.$store.set('page/mode', 'edit')

    this.setCurrentSavedState()

    this.checkoutDateActive = this.checkoutDate

    if (this.effectivePermissions) {
      this.$store.set('page/effectivePermissions', JSON.parse(Buffer.from(this.effectivePermissions, 'base64').toString()))
    }
  },
  mounted() {
    this.$store.set('editor/mode', this.initMode || 'create')

    this.initContentParsed = this.initContent ? Base64.decode(this.initContent) : ''
    this.$store.set('editor/content', this.initContentParsed)
    if (this.mode === 'create' && !this.initEditor) {
      _.delay(() => {
        this.dialogEditorSelector = true
      }, 500)
    } else {
      this.currentEditor = `editor${_.startCase(this.initEditor || 'markdown')}`
    }

    window.onbeforeunload = () => {
      if (!this.exitConfirmed && this.initContentParsed !== this.$store.get('editor/content')) {
        return this.$t('editor:unsavedWarning')
      } else {
        return undefined
      }
    }

    this.$root.$on('resetEditorConflict', () => {
      this.isConflict = false
    })

    // this.$store.set('editor/mode', 'edit')
    // this.currentEditor = `editorApi`
  },
  methods: {
    openPropsModal(name) {
      this.dialogProps = true
    },
    showProgressDialog(textKey) {
      this.dialogProgress = true
    },
    hideProgressDialog() {
      this.dialogProgress = false
    },
    openConflict() {
      this.$root.$emit('saveConflict')
    },
    async save({ rethrow = false, overwrite = false } = {}) {
      this.showProgressDialog('saving')
      this.isSaving = true

      const saveTimeoutHandle = setTimeout(() => {
        throw new Error('Save operation timed out.')
      }, 30000)

      try {
        if (this.$store.get('editor/mode') === 'create') {
          // --------------------------------------------
          // -> CREATE PAGE
          // --------------------------------------------

          let resp = await this.$apollo.mutate({
            mutation: gql`
              mutation (
                $content: String!
                $description: String!
                $editor: String!
                $isPrivate: Boolean!
                $isPublished: Boolean!
                $locale: String!
                $path: String!
                $publishEndDate: Date
                $publishStartDate: Date
                $scriptCss: String
                $scriptJs: String
                $tags: [String]!
                $title: String!
              ) {
                pages {
                  create(
                    content: $content
                    description: $description
                    editor: $editor
                    isPrivate: $isPrivate
                    isPublished: $isPublished
                    locale: $locale
                    path: $path
                    publishEndDate: $publishEndDate
                    publishStartDate: $publishStartDate
                    scriptCss: $scriptCss
                    scriptJs: $scriptJs
                    tags: $tags
                    title: $title
                  ) {
                    responseResult {
                      succeeded
                      errorCode
                      slug
                      message
                    }
                    page {
                      id
                      updatedAt
                    }
                  }
                }
              }
            `,
            variables: {
              content: this.$store.get('editor/content'),
              description: this.$store.get('page/description'),
              editor: this.$store.get('editor/editorKey'),
              locale: this.$store.get('page/locale'),
              isPrivate: false,
              isPublished: this.$store.get('page/isPublished'),
              path: this.$store.get('page/path'),
              publishEndDate: this.$store.get('page/publishEndDate') || '',
              publishStartDate: this.$store.get('page/publishStartDate') || '',
              scriptCss: this.$store.get('page/scriptCss'),
              scriptJs: this.$store.get('page/scriptJs'),
              tags: this.$store.get('page/tags'),
              title: this.$store.get('page/title')
            }
          })
          resp = _.get(resp, 'data.pages.create', {})
          if (_.get(resp, 'responseResult.succeeded')) {
            this.checkoutDateActive = _.get(resp, 'page.updatedAt', this.checkoutDateActive)
            this.isConflict = false
            this.$store.commit('showNotification', {
              message: this.$t('editor:save.createSuccess'),
              style: 'success',
              icon: 'check'
            })
            this.$store.set('editor/id', _.get(resp, 'page.id'))
            this.$store.set('editor/mode', 'update')
            this.exitConfirmed = true
            window.location.assign(`/${this.$store.get('page/locale')}/${this.$store.get('page/path')}`)
          } else {
            throw new Error(_.get(resp, 'responseResult.message'))
          }
        } else {
          // --------------------------------------------
          // -> UPDATE EXISTING PAGE
          // --------------------------------------------

          const conflictResp = await this.$apollo.query({
            query: gql`
              query ($id: Int!, $checkoutDate: Date!) {
                pages {
                  checkConflicts(id: $id, checkoutDate: $checkoutDate)
                }
              }
            `,
            fetchPolicy: 'network-only',
            variables: {
              id: this.pageId,
              checkoutDate: this.checkoutDateActive
            }
          })
          if (_.get(conflictResp, 'data.pages.checkConflicts', false)) {
            this.$root.$emit('saveConflict')
            throw new Error(this.$t('editor:conflict.warning'))
          }

          let resp = await this.$apollo.mutate({
            mutation: gql`
              mutation (
                $id: Int!
                $content: String
                $description: String
                $editor: String
                $isPrivate: Boolean
                $isPublished: Boolean
                $locale: String
                $path: String
                $publishEndDate: Date
                $publishStartDate: Date
                $scriptCss: String
                $scriptJs: String
                $tags: [String]
                $title: String
              ) {
                pages {
                  update(
                    id: $id
                    content: $content
                    description: $description
                    editor: $editor
                    isPrivate: $isPrivate
                    isPublished: $isPublished
                    locale: $locale
                    path: $path
                    publishEndDate: $publishEndDate
                    publishStartDate: $publishStartDate
                    scriptCss: $scriptCss
                    scriptJs: $scriptJs
                    tags: $tags
                    title: $title
                  ) {
                    responseResult {
                      succeeded
                      errorCode
                      slug
                      message
                    }
                    page {
                      updatedAt
                    }
                  }
                }
              }
            `,
            variables: {
              id: this.$store.get('page/id'),
              content: this.$store.get('editor/content'),
              description: this.$store.get('page/description'),
              editor: this.$store.get('editor/editorKey'),
              locale: this.$store.get('page/locale'),
              isPrivate: false,
              isPublished: this.$store.get('page/isPublished'),
              path: this.$store.get('page/path'),
              publishEndDate: this.$store.get('page/publishEndDate') || '',
              publishStartDate: this.$store.get('page/publishStartDate') || '',
              scriptCss: this.$store.get('page/scriptCss'),
              scriptJs: this.$store.get('page/scriptJs'),
              tags: this.$store.get('page/tags'),
              title: this.$store.get('page/title')
            }
          })
          resp = _.get(resp, 'data.pages.update', {})
          if (_.get(resp, 'responseResult.succeeded')) {
            this.checkoutDateActive = _.get(resp, 'page.updatedAt', this.checkoutDateActive)
            this.isConflict = false
            this.$store.commit('showNotification', {
              message: this.$t('editor:save.updateSuccess'),
              style: 'success',
              icon: 'check'
            })
            if (this.locale !== this.$store.get('page/locale') || this.path !== this.$store.get('page/path')) {
              _.delay(() => {
                window.location.replace(`/e/${this.$store.get('page/locale')}/${this.$store.get('page/path')}`)
              }, 1000)
            }
          } else {
            throw new Error(_.get(resp, 'responseResult.message'))
          }
        }

        this.initContentParsed = this.$store.get('editor/content')
        this.setCurrentSavedState()
      } catch (err) {
        this.$store.commit('showNotification', {
          message: err.message,
          style: 'error',
          icon: 'warning'
        })
        if (rethrow === true) {
          clearTimeout(saveTimeoutHandle)
          this.isSaving = false
          this.hideProgressDialog()
          throw err
        }
      }
      clearTimeout(saveTimeoutHandle)
      this.isSaving = false
      this.hideProgressDialog()
    },
    async saveAndClose() {
      try {
        if (this.$store.get('editor/mode') === 'create') {
          await this.save()
        } else {
          await this.save({ rethrow: true })
          await this.exit()
        }
      } catch (err) {
        // Error is already handled
      }
    },
    async exit() {
      if (this.isDirty) {
        this.dialogUnsaved = true
      } else {
        this.exitGo()
      }
    },
    exitGo() {
      this.$store.commit(`loadingStart`, 'editor-close')
      this.currentEditor = ''
      this.exitConfirmed = true
      _.delay(() => {
        if (this.$store.get('editor/mode') === 'create') {
          window.location.assign(`/`)
        } else {
          window.location.assign(`/${this.$store.get('page/locale')}/${this.$store.get('page/path')}`)
        }
      }, 500)
    },
    setCurrentSavedState () {
      this.savedState = {
        description: this.$store.get('page/description'),
        isPublished: this.$store.get('page/isPublished'),
        publishEndDate: this.$store.get('page/publishEndDate') || '',
        publishStartDate: this.$store.get('page/publishStartDate') || '',
        tags: this.$store.get('page/tags'),
        title: this.$store.get('page/title'),
        css: this.$store.get('page/scriptCss'),
        js: this.$store.get('page/scriptJs')
      }
    },
    injectCustomCss: _.debounce(css => {
      const oldStyl = document.querySelector('#editor-script-css')
      if (oldStyl) {
        document.head.removeChild(oldStyl)
      }
      if (!_.isEmpty(css)) {
        const styl = document.createElement('style')
        styl.type = 'text/css'
        styl.id = 'editor-script-css'
        document.head.appendChild(styl)
        styl.appendChild(document.createTextNode(css))
      }
    }, 1000)
  },
  apollo: {
    isConflict: {
      query: gql`
        query ($id: Int!, $checkoutDate: Date!) {
          pages {
            checkConflicts(id: $id, checkoutDate: $checkoutDate)
          }
        }
      `,
      fetchPolicy: 'network-only',
      pollInterval: 5000,
      variables () {
        return {
          id: this.pageId,
          checkoutDate: this.checkoutDateActive
        }
      },
      update: (data) => _.cloneDeep(data.pages.checkConflicts),
      skip () {
        return this.mode === 'create' || this.isSaving || !this.isDirty
      }
    }
  }
}
</script>

<style lang='scss'>

  .editor {
    background-color: var(--cl-page) !important;
    min-height: 100vh;

    .v-application--wrap {
      background-color: var(--cl-page);
    }
  }

  .editor-main {
    background-color: var(--cl-page);
  }

  // Top bar: navy, 2 px green rule, reversed wordmark, page block, status pill and actions
  .editor-header.v-app-bar {
    background-color: $cl-navy !important;
    box-shadow: inset 0 -2px 0 $cl-green !important;
    font-family: $cl-font;

    .v-toolbar__content {
      padding: 0 24px;

      @include until($tablet) {
        padding: 0 12px;
      }
    }

    .editor-header-brand {
      display: flex;
      align-items: center;
      min-width: 0;
    }

    .editor-header-logo {
      display: flex;
      align-items: center;
      flex: none;
      margin-right: 16px;

      img {
        display: block;
        height: 40px;
        width: auto;
      }

      @include until($tablet) {
        display: none;
      }
    }

    .editor-header-divider {
      flex: none;
      width: 1px;
      height: 28px;
      margin-right: 16px;
      background-color: $cl-dark-border;

      @include until($tablet) {
        display: none;
      }
    }

    .editor-header-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
    }

    .editor-header-mode {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: .06em;
      text-transform: uppercase;
      line-height: 1.2;
      color: $cl-green;
    }

    .editor-header-page-row {
      display: flex;
      align-items: baseline;
      min-width: 0;
      margin-top: 2px;
    }

    .editor-header-title {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.2;
      color: $cl-white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 40vw;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
        text-decoration-color: $cl-green;
      }
    }

    .editor-header-path {
      margin-left: 10px;
      font-family: $cl-font-mono;
      font-size: 12px;
      line-height: 1.2;
      color: $cl-dark-muted;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 30vw;
    }

    .editor-header-actions {
      display: flex;
      align-items: center;
      flex: none;

      > .v-btn {
        margin-left: 8px;
      }
    }

    // Status pill: unsaved = warn on navy, saved = good on navy
    .editor-header-status {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      margin: 0 8px 0 4px;
      border: 1px solid transparent;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;

      &-dot {
        display: block;
        width: 8px;
        height: 8px;
        margin-right: 6px;
        border-radius: 999px;
        background-color: currentColor;
      }

      &.is-unsaved {
        background-color: $cl-dark-warn-bg;
        color: $cl-dark-warn;
      }

      &.is-saved {
        background-color: $cl-dark-good-bg;
        color: $cl-dark-good;
      }
    }

    // Outlined buttons on the navy bar: white text, strong dark border
    .v-btn.v-btn--outlined {
      color: $cl-white !important;
      border-color: $cl-dark-border-strong !important;
      background-color: transparent;

      .v-icon {
        color: $cl-white !important;
      }

      &:hover {
        background-color: rgba(255, 255, 255, .06);
        border-color: $cl-dark-muted !important;
      }
    }

    .editor-header-conflict.v-btn {
      color: $cl-dark-warn !important;
      border-color: $cl-dark-warn !important;
      font-size: 12px;
      letter-spacing: .06em;
      text-transform: uppercase;

      .v-icon {
        color: $cl-dark-warn !important;
      }
    }

    .v-btn.is-icon {
      min-width: 32px;
      padding: 0 6px;
    }
  }

  .atom-spinner.is-inline {
    display: inline-block;
  }

</style>
