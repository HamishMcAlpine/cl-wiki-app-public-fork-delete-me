<template lang='pug'>
  v-dialog(
    v-model='isShown'
    persistent
    width='720'
    :fullscreen='$vuetify.breakpoint.smAndDown'
    )
    v-card.editor-props
      .editor-props-header
        .editor-props-header-text
          .editor-props-title {{$t('editor:props.pageProperties')}}
          .editor-props-subtitle {{$t('editor:props.pageInfo')}} · {{$t('editor:props.categorization')}} · {{$t('editor:props.scheduling')}}
      v-tabs.editor-props-tabs(v-model='currentTab')
        v-tab {{$t('editor:props.info')}}
        v-tab {{$t('editor:props.scheduling')}}
        v-tab(:disabled='!hasScriptPermission') {{$t('editor:props.scripts')}}
        //- v-tab(disabled) {{$t('editor:props.social')}}
        v-tab(:disabled='!hasStylePermission') {{$t('editor:props.styles')}}
        v-tab-item(transition='fade-transition', reverse-transition='fade-transition')
          v-card-text.editor-props-body
            .editor-props-field
              label.editor-props-label {{$t(`editor:props.title`)}}
              v-text-field(
                ref='iptTitle'
                outlined
                dense
                hide-details='auto'
                counter='255'
                v-model='title'
                )
            .editor-props-field
              label.editor-props-label {{$t(`editor:props.shortDescription`)}}
              v-text-field(
                outlined
                dense
                hide-details='auto'
                counter='255'
                v-model='description'
                persistent-hint
                :hint='$t(`editor:props.shortDescriptionHint`)'
                )
            .editor-props-row
              .editor-props-field.editor-props-field-locale
                label.editor-props-label {{$t(`editor:props.locale`)}}
                v-select(
                  outlined
                  dense
                  suffix='/'
                  :items='namespaces'
                  v-model='locale'
                  hide-details
                  )
              .editor-props-field.editor-props-field-path
                label.editor-props-label {{$t(`editor:props.path`)}}
                v-text-field.editor-props-path(
                  outlined
                  dense
                  hide-details='auto'
                  append-icon='mdi-folder-search'
                  v-model='path'
                  :hint='$t(`editor:props.pathHint`)'
                  persistent-hint
                  @click:append='showPathSelector'
                  :rules='[rules.required, rules.path]'
                  )
            .editor-props-field
              label.editor-props-label {{$t(`editor:props.tags`)}}
              v-chip-group.editor-props-tags(column, v-if='tags && tags.length > 0')
                v-chip.editor-props-tag(
                  v-for='tag of tags'
                  :key='`tag-` + tag'
                  close
                  label
                  small
                  @click:close='removeTag(tag)'
                  ) {{tag}}
              v-combobox(
                outlined
                dense
                hide-details='auto'
                v-model='newTag'
                :hint='$t(`editor:props.tagsHint`)'
                :items='newTagSuggestions'
                :loading='$apollo.queries.newTagSuggestions.loading'
                persistent-hint
                hide-no-data
                :search-input.sync='newTagSearch'
                )
        v-tab-item(transition='fade-transition', reverse-transition='fade-transition')
          v-card-text.editor-props-body
            .editor-props-field
              label.editor-props-label {{$t('editor:props.publishState')}}
              v-switch.editor-props-switch.mt-1(
                :label='$t(`editor:props.publishToggle`)'
                v-model='isPublished'
                color='primary'
                :hint='$t(`editor:props.publishToggleHint`)'
                persistent-hint
                inset
                )
            .editor-props-row
              .editor-props-field
                label.editor-props-label {{$t(`editor:props.publishStart`)}}
                v-dialog(
                  ref='menuPublishStart'
                  :close-on-content-click='false'
                  v-model='isPublishStartShown'
                  :return-value.sync='publishStartDate'
                  width='460px'
                  :disabled='!isPublished'
                  )
                  template(v-slot:activator='{ on }')
                    v-text-field(
                      v-on='on'
                      v-model='publishStartDate'
                      prepend-inner-icon='mdi-calendar-check'
                      readonly
                      outlined
                      dense
                      hide-details='auto'
                      clearable
                      :hint='$t(`editor:props.publishStartHint`)'
                      persistent-hint
                      :disabled='!isPublished'
                      )
                  v-date-picker(
                    v-model='publishStartDate'
                    :min='(new Date()).toISOString().substring(0, 10)'
                    color='primary'
                    reactive
                    scrollable
                    landscape
                    )
                    v-spacer
                    v-btn(
                      text
                      color='primary'
                      @click='isPublishStartShown = false'
                      ) {{$t('common:actions.cancel')}}
                    v-btn(
                      text
                      color='primary'
                      @click='$refs.menuPublishStart.save(publishStartDate)'
                      ) {{$t('common:actions.ok')}}
              .editor-props-field
                label.editor-props-label {{$t(`editor:props.publishEnd`)}}
                v-dialog(
                  ref='menuPublishEnd'
                  :close-on-content-click='false'
                  v-model='isPublishEndShown'
                  :return-value.sync='publishEndDate'
                  width='460px'
                  :disabled='!isPublished'
                  )
                  template(v-slot:activator='{ on }')
                    v-text-field(
                      v-on='on'
                      v-model='publishEndDate'
                      prepend-inner-icon='mdi-calendar-remove'
                      readonly
                      outlined
                      dense
                      hide-details='auto'
                      clearable
                      :hint='$t(`editor:props.publishEndHint`)'
                      persistent-hint
                      :disabled='!isPublished'
                      )
                  v-date-picker(
                    v-model='publishEndDate'
                    :min='(new Date()).toISOString().substring(0, 10)'
                    color='primary'
                    reactive
                    scrollable
                    landscape
                    )
                    v-spacer
                    v-btn(
                      text
                      color='primary'
                      @click='isPublishEndShown = false'
                      ) {{$t('common:actions.cancel')}}
                    v-btn(
                      text
                      color='primary'
                      @click='$refs.menuPublishEnd.save(publishEndDate)'
                      ) {{$t('common:actions.ok')}}

        v-tab-item(:transition='false', :reverse-transition='false')
          .editor-props-codeeditor-title
            .editor-props-label {{$t('editor:props.html')}}
          .editor-props-codeeditor
            textarea(ref='codejs')
          .editor-props-codeeditor-hint
            .caption {{$t('editor:props.htmlHint')}}

        //- v-tab-item(transition='fade-transition', reverse-transition='fade-transition')
        //-   v-card-text
        //-     .overline {{$t('editor:props.socialFeatures')}}
        //-     v-switch(
        //-       :label='$t(`editor:props.allowComments`)'
        //-       v-model='isPublished'
        //-       color='primary'
        //-       :hint='$t(`editor:props.allowCommentsHint`)'
        //-       persistent-hint
        //-       inset
        //-       )
        //-     v-switch(
        //-       :label='$t(`editor:props.allowRatings`)'
        //-       v-model='isPublished'
        //-       color='primary'
        //-       :hint='$t(`editor:props.allowRatingsHint`)'
        //-       persistent-hint
        //-       disabled
        //-       inset
        //-       )
        //-     v-switch(
        //-       :label='$t(`editor:props.displayAuthor`)'
        //-       v-model='isPublished'
        //-       color='primary'
        //-       :hint='$t(`editor:props.displayAuthorHint`)'
        //-       persistent-hint
        //-       inset
        //-       )
        //-     v-switch(
        //-       :label='$t(`editor:props.displaySharingBar`)'
        //-       v-model='isPublished'
        //-       color='primary'
        //-       :hint='$t(`editor:props.displaySharingBarHint`)'
        //-       persistent-hint
        //-       inset
        //-       )

        v-tab-item(:transition='false', :reverse-transition='false')
          .editor-props-codeeditor-title
            .editor-props-label {{$t('editor:props.css')}}
          .editor-props-codeeditor
            textarea(ref='codecss')
          .editor-props-codeeditor-hint
            .caption {{$t('editor:props.cssHint')}}

      .editor-props-footer
        v-btn(outlined, small, height='32', @click.native='close') {{ $t('common:actions.close') }}
        v-btn.ml-2(depressed, small, height='32', color='primary', @click.native='close')
          v-icon(left, small) mdi-check
          span {{ $t('common:actions.ok') }}

    page-selector(:mode='pageSelectorMode', v-model='pageSelectorShown', :path='path', :locale='locale', :open-handler='setPath')
</template>

<script>
import _ from 'lodash'
import { sync, get } from 'vuex-pathify'
import gql from 'graphql-tag'

import CodeMirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/htmlmixed/htmlmixed.js'
import 'codemirror/mode/css/css.js'

/* global siteLangs, siteConfig */
const filenamePattern = /^(?![\#\/\.\$\^\=\*\;\:\&\?\(\)\[\]\{\}\"\'\>\<\,\@\!\%\`\~\s])(?!.*[\#\/\.\$\^\=\*\;\:\&\?\(\)\[\]\{\}\"\'\>\<\,\@\!\%\`\~\s]$)[^\#\.\$\^\=\*\;\:\&\?\(\)\[\]\{\}\"\'\>\<\,\@\!\%\`\~\s]*$/

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      isPublishStartShown: false,
      isPublishEndShown: false,
      pageSelectorShown: false,
      namespaces: siteLangs.length ? siteLangs.map(ns => ns.code) : [siteConfig.lang],
      newTag: '',
      newTagSuggestions: [],
      newTagSearch: '',
      currentTab: 0,
      cm: null,
      rules: {
        required: value => !!value || 'This field is required.',
        path: value => {
          return filenamePattern.test(value) || 'Invalid path. Please ensure it does not contain special characters, or begin/end in a slash or hashtag string.'
        }
      }
    }
  },
  computed: {
    isShown: {
      get() { return this.value },
      set(val) { this.$emit('input', val) }
    },
    mode: get('editor/mode'),
    title: sync('page/title'),
    description: sync('page/description'),
    locale: sync('page/locale'),
    tags: sync('page/tags'),
    path: sync('page/path'),
    isPublished: sync('page/isPublished'),
    publishStartDate: sync('page/publishStartDate'),
    publishEndDate: sync('page/publishEndDate'),
    scriptJs: sync('page/scriptJs'),
    scriptCss: sync('page/scriptCss'),
    hasScriptPermission: get('page/effectivePermissions@pages.script'),
    hasStylePermission: get('page/effectivePermissions@pages.style'),
    pageSelectorMode () {
      return (this.mode === 'create') ? 'create' : 'move'
    }
  },
  watch: {
    value (newValue, oldValue) {
      if (newValue) {
        _.delay(() => {
          this.$refs.iptTitle.focus()
        }, 500)
      }
    },
    newTag (newValue, oldValue) {
      const tagClean = _.trim(newValue || '').toLowerCase()
      if (tagClean && tagClean.length > 0) {
        if (!_.includes(this.tags, tagClean)) {
          this.tags = [...this.tags, tagClean]
        }
        this.$nextTick(() => {
          this.newTag = null
        })
      }
    },
    currentTab (newValue, oldValue) {
      if (this.cm) {
        this.cm.toTextArea()
      }
      if (newValue === 2) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.loadEditor(this.$refs.codejs, 'html')
          }, 100)
        })
      } else if (newValue === 3) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.loadEditor(this.$refs.codecss, 'css')
          }, 100)
        })
      }
    }
  },
  methods: {
    removeTag (tag) {
      this.tags = _.without(this.tags, tag)
    },
    close() {
      this.isShown = false
    },
    showPathSelector() {
      this.pageSelectorShown = true
    },
    setPath({ path, locale }) {
      this.locale = locale
      this.path = path
    },
    loadEditor(ref, mode) {
      this.cm = CodeMirror.fromTextArea(ref, {
        tabSize: 2,
        mode: `text/${mode}`,
        theme: 'wikijs-dark',
        lineNumbers: true,
        lineWrapping: true,
        line: true,
        styleActiveLine: true,
        viewportMargin: 50,
        inputStyle: 'contenteditable',
        direction: 'ltr'
      })
      switch (mode) {
        case 'html':
          this.cm.setValue(this.scriptJs)
          this.cm.on('change', c => {
            this.scriptJs = c.getValue()
          })
          break
        case 'css':
          this.cm.setValue(this.scriptCss)
          this.cm.on('change', c => {
            this.scriptCss = c.getValue()
          })
          break
        default:
          console.warn('Invalid Editor Mode')
          break
      }
      this.cm.setSize(null, '500px')
      this.$nextTick(() => {
        this.cm.refresh()
        this.cm.focus()
      })
    }
  },
  apollo: {
    newTagSuggestions: {
      query: gql`
        query ($query: String!) {
          pages {
            searchTags (query: $query)
          }
        }
      `,
      variables () {
        return {
          query: this.newTagSearch
        }
      },
      fetchPolicy: 'cache-first',
      update: (data) => _.get(data, 'pages.searchTags', []),
      skip () {
        return !this.value || _.isEmpty(this.newTagSearch)
      },
      throttle: 500
    }
  }
}
</script>

<style lang='scss'>

// Page properties dialog: 720 px surface card, caps field labels, sunken footer
.editor-props.v-card {
  display: flex;
  flex-direction: column;
  border-radius: $cl-radius-lg;

  .editor-props-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--cl-border);
  }

  .editor-props-title {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--cl-heading);
  }

  .editor-props-subtitle {
    font-size: 12px;
    line-height: 1.4;
    color: var(--cl-muted);
    margin-top: 2px;
  }

  .editor-props-tabs {
    > .v-tabs-bar {
      padding: 0 24px;
      border-bottom: 1px solid var(--cl-border);
    }
  }

  .editor-props-body {
    padding: 24px;
  }

  .editor-props-field {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-width: 0;

    & + .editor-props-field {
      margin-top: 16px;
    }
  }

  .editor-props-row {
    display: flex;
    align-items: flex-start;
    margin-top: 16px;

    > .editor-props-field + .editor-props-field {
      margin-top: 0;
      margin-left: 16px;
    }

    @include until($tablet) {
      flex-direction: column;

      > .editor-props-field + .editor-props-field {
        margin-top: 16px;
        margin-left: 0;
      }
    }
  }

  .editor-props-field-locale {
    flex: 0 0 160px;
    width: 160px;

    @include until($tablet) {
      flex-basis: auto;
      width: 100%;
    }
  }

  .editor-props-label {
    display: block;
    margin-bottom: 4px;
    font-size: 11px;
    font-weight: 400;
    line-height: 1.3;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: var(--cl-muted);
  }

  .editor-props-path input {
    font-family: $cl-font-mono;
    font-size: 13px;
  }

  // Tag chips: 24 px, 2 px radius, pale green fill, deep green text, 1 px border
  .editor-props-tags {
    margin-bottom: 8px;

    .v-slide-group__content {
      padding: 0;
    }
  }

  .editor-props-tag.v-chip {
    height: 24px;
    margin: 0 6px 6px 0;
    padding: 0 6px 0 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--cl-accent-deep) !important;
    background-color: var(--cl-accent-pale) !important;
    border: 1px solid var(--cl-border);
    border-radius: $cl-radius-sm !important;

    .v-chip__close {
      font-size: 14px !important;
      color: var(--cl-accent-deep) !important;
    }
  }

  .editor-props-switch {
    .v-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--cl-heading);
    }
  }

  .editor-props-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 12px 24px;
    margin-top: auto;
    background-color: var(--cl-sunken);
    border-top: 1px solid var(--cl-border);
    border-radius: 0 0 $cl-radius-lg $cl-radius-lg;
  }
}

.editor-props-codeeditor {
  background-color: var(--cl-surface);
  min-height: 500px;

  > textarea {
    visibility: hidden;
  }

  &-title {
    background-color: var(--cl-sunken);
    border-bottom: 1px solid var(--cl-border);
    padding: 10px 16px;

    .editor-props-label {
      margin-bottom: 0;
    }
  }

  &-hint {
    background-color: var(--cl-sunken);
    border-top: 1px solid var(--cl-border);
    color: var(--cl-muted);
    padding: 6px 16px;

    .caption {
      font-size: 12px !important;
      color: var(--cl-muted);
    }
  }

  .CodeMirror {
    font-family: $cl-font-mono;
    font-size: 13px;
    line-height: 1.6;
  }
}

</style>
