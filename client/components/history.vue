<template lang='pug'>
  v-app(:dark='$vuetify.theme.dark').history
    nav-header
    v-content
      .history-page
        //- Page header
        .history-header
          .history-header-main
            h1.history-title {{title}}
            p.history-subtitle Page history
          .history-header-actions
            v-btn(outlined, small, @click='goLive')
              v-icon(left, size='18') mdi-arrow-left
              span Back to page
          .history-header-meta
            span.history-path /{{path}}
            template(v-if='$vuetify.breakpoint.mdAndUp')
              span.history-header-meta-sep
              span Trail length {{total}}
              span.history-header-meta-sep
              span ID {{pageId}}

        v-row
          //- Versions timeline
          v-col(cols='12', md='4')
            .history-card.history-versions
              .history-card-head
                span.history-card-title Versions
                span.history-card-count {{total}} versions
              .history-item(
                v-for='(ph, idx) in fullTrail'
                :key='ph.versionId'
                :class='{ "is-selected": diffTarget === ph.versionId || diffSource === ph.versionId, "is-first": idx === 0, "is-last": idx === fullTrail.length - 1 }'
                )
                .history-item-rail
                  .history-item-rail-top
                  .history-item-dot(:class='{ "is-current": ph.actionType === `live` }')
                  .history-item-rail-bottom
                .history-item-body
                  .history-item-row
                    span.history-item-version(v-if='ph.actionType === `live`') Current
                    span.history-item-version(v-else) Version {{ph.versionId}}
                    span.history-pill(:class='trailPillClass(ph.actionType)')
                      span.history-pill-dot
                      span {{ trailLabel(ph.actionType) }}
                  .history-item-author {{ ph.authorName }}
                  .history-item-date(:title='$options.filters.moment(ph.versionDate, `LLL`)')
                    span {{ ph.versionDate | moment('ll') }}
                    span(v-if='ph.actionType === `move`') &nbsp;&middot; from #[strong {{ph.valueBefore}}] to #[strong {{ph.valueAfter}}]
                  .history-item-actions
                    v-btn.history-ab(
                      x-small
                      depressed
                      :outlined='diffSource !== ph.versionId'
                      :color='diffSource === ph.versionId ? `primary` : ``'
                      :disabled='(ph.versionId >= diffTarget && diffTarget !== 0) || ph.versionId === 0'
                      @click='setDiffSource(ph.versionId)'
                      title='Set as differencing source'
                      ) A
                    v-btn.history-ab(
                      x-small
                      depressed
                      :outlined='diffTarget !== ph.versionId'
                      :color='diffTarget === ph.versionId ? `primary` : ``'
                      :disabled='ph.versionId <= diffSource && ph.versionId !== 0'
                      @click='setDiffTarget(ph.versionId)'
                      title='Set as differencing target'
                      ) B
                    span.history-item-actions-sep
                    v-btn(text, x-small, @click='viewSource(ph.versionId)') Source
                    span.history-item-actions-dot &middot;
                    v-btn(text, x-small, @click='download(ph.versionId)') Download
                    span.history-item-actions-dot &middot;
                    v-btn(text, x-small, :disabled='ph.versionId === 0', @click='restore(ph.versionId, ph.versionDate)') Restore
                    span.history-item-actions-dot &middot;
                    v-btn(text, x-small, @click='branchOff(ph.versionId)') Branch off
              .history-card-foot
                v-btn(
                  v-if='total > trail.length'
                  text
                  small
                  block
                  @click='loadMore'
                  ) Load more
                span.history-card-end(v-else) End of history trail

          //- Diff
          v-col(cols='12', md='8')
            .history-card.history-diff
              .history-card-head
                .history-diff-heading
                  span.history-card-title {{target.title}}
                  span.history-card-count(v-if='target.description') {{target.description}}
                v-spacer
                v-btn(v-if='$vuetify.breakpoint.mdAndUp', outlined, small, @click='toggleViewMode')
                  v-icon(left, size='18') mdi-eye
                  span View mode
              .history-diff-body(v-html='diffHTML')

    v-dialog(v-model='isRestoreConfirmDialogShown', max-width='650', persistent)
      v-card
        v-card-title.history-dialog-title {{$t('history:restore.confirmTitle')}}
        v-card-text.pa-4
          i18next(tag='span', path='history:restore.confirmText')
            strong(place='date') {{ restoreTarget.versionDate | moment('LLL') }}
        v-card-actions
          v-spacer
          v-btn(text, @click='isRestoreConfirmDialogShown = false', :disabled='restoreLoading') {{$t('common:actions.cancel')}}
          v-btn(color='primary', depressed, @click='restoreConfirm', :loading='restoreLoading') {{$t('history:restore.confirmButton')}}

    page-selector(mode='create', v-model='branchOffOpts.modal', :open-handler='branchOffHandle', :path='branchOffOpts.path', :locale='branchOffOpts.locale')

    nav-footer
    notify
    search-results
</template>

<script>
import * as Diff2Html from 'diff2html'
import { createPatch } from 'diff'
import _ from 'lodash'
import gql from 'graphql-tag'

export default {
  i18nOptions: { namespaces: 'history' },
  props: {
    pageId: {
      type: Number,
      default: 0
    },
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
    createdAt: {
      type: String,
      default: ''
    },
    updatedAt: {
      type: String,
      default: ''
    },
    tags: {
      type: Array,
      default: () => ([])
    },
    authorName: {
      type: String,
      default: 'Unknown'
    },
    authorId: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    liveContent: {
      type: String,
      default: ''
    },
    effectivePermissions: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      source: {
        versionId: 0,
        content: '',
        title: '',
        description: ''
      },
      target: {
        versionId: 0,
        content: '',
        title: '',
        description: ''
      },
      trail: [],
      diffSource: 0,
      diffTarget: 0,
      offsetPage: 0,
      total: 0,
      viewMode: 'line-by-line',
      cache: [],
      restoreTarget: {
        versionId: 0,
        versionDate: ''
      },
      branchOffOpts: {
        versionId: 0,
        locale: 'en',
        path: 'new-page',
        modal: false
      },
      isRestoreConfirmDialogShown: false,
      restoreLoading: false
    }
  },
  computed: {
    fullTrail () {
      const liveTrailItem = {
        versionId: 0,
        authorId: this.authorId,
        authorName: this.authorName,
        actionType: 'live',
        valueBefore: null,
        valueAfter: null,
        versionDate: this.updatedAt
      }
      // -> Check for move between latest and live
      const prevPage = _.find(this.cache, ['versionId', _.get(this.trail, '[0].versionId', -1)])
      if (prevPage && this.path !== prevPage.path) {
        liveTrailItem.actionType = 'move'
        liveTrailItem.valueBefore = prevPage.path
        liveTrailItem.valueAfter = this.path
      }
      // -> Combine trail with live
      return [
        liveTrailItem,
        ...this.trail
      ]
    },
    diffs () {
      return createPatch(`/${this.path}`, this.source.content, this.target.content)
    },
    diffHTML () {
      return Diff2Html.html(this.diffs, {
        inputFormat: 'diff',
        drawFileList: false,
        matching: 'lines',
        outputFormat: this.viewMode
      })
    }
  },
  watch: {
    trail (newValue, oldValue) {
      if (newValue && newValue.length > 0) {
        this.diffTarget = 0
        this.diffSource = _.get(_.head(newValue), 'versionId', 0)
      }
    },
    async diffSource (newValue, oldValue) {
      if (this.diffSource !== this.source.versionId) {
        const page = _.find(this.cache, { versionId: newValue })
        if (page) {
          this.source = page
        } else {
          this.source = await this.loadVersion(newValue)
        }
      }
    },
    async diffTarget (newValue, oldValue) {
      if (this.diffTarget !== this.target.versionId) {
        const page = _.find(this.cache, { versionId: newValue })
        if (page) {
          this.target = page
        } else {
          this.target = await this.loadVersion(newValue)
        }
      }
    }
  },
  created () {
    this.$store.commit('page/SET_ID', this.id)
    this.$store.commit('page/SET_LOCALE', this.locale)
    this.$store.commit('page/SET_PATH', this.path)

    this.$store.commit('page/SET_MODE', 'history')

    this.cache.push({
      action: 'live',
      authorId: this.authorId,
      authorName: this.authorName,
      content: this.liveContent,
      contentType: '',
      createdAt: this.createdAt,
      description: this.description,
      editor: '',
      isPrivate: false,
      isPublished: this.isPublished,
      locale: this.locale,
      pageId: this.pageId,
      path: this.path,
      publishEndDate: '',
      publishStartDate: '',
      tags: this.tags,
      title: this.title,
      versionId: 0,
      versionDate: this.updatedAt
    })

    this.target = this.cache[0]

    if (this.effectivePermissions) {
      this.$store.set('page/effectivePermissions', JSON.parse(Buffer.from(this.effectivePermissions, 'base64').toString()))
    }
  },
  methods: {
    async loadVersion (versionId) {
      this.$store.commit(`loadingStart`, 'history-version-' + versionId)
      const resp = await this.$apollo.query({
        query: gql`
          query ($pageId: Int!, $versionId: Int!) {
            pages {
              version (pageId: $pageId, versionId: $versionId) {
                action
                authorId
                authorName
                content
                contentType
                createdAt
                versionDate
                description
                editor
                isPrivate
                isPublished
                locale
                pageId
                path
                publishEndDate
                publishStartDate
                tags
                title
                versionId
              }
            }
          }
        `,
        variables: {
          versionId,
          pageId: this.pageId
        }
      })
      this.$store.commit(`loadingStop`, 'history-version-' + versionId)
      const page = _.get(resp, 'data.pages.version', null)
      if (page) {
        this.cache.push(page)
        return page
      } else {
        return { content: '' }
      }
    },
    viewSource (versionId) {
      window.location.assign(`/s/${this.locale}/${this.path}?v=${versionId}`)
    },
    download (versionId) {
      window.location.assign(`/d/${this.locale}/${this.path}?v=${versionId}`)
    },
    restore (versionId, versionDate) {
      this.restoreTarget = {
        versionId,
        versionDate
      }
      this.isRestoreConfirmDialogShown = true
    },
    async restoreConfirm () {
      this.restoreLoading = true
      this.$store.commit(`loadingStart`, 'history-restore')
      try {
        const resp = await this.$apollo.mutate({
          mutation: gql`
            mutation ($pageId: Int!, $versionId: Int!) {
              pages {
                restore (pageId: $pageId, versionId: $versionId) {
                  responseResult {
                    succeeded
                    errorCode
                    slug
                    message
                  }
                }
              }
            }
          `,
          variables: {
            versionId: this.restoreTarget.versionId,
            pageId: this.pageId
          }
        })
        if (_.get(resp, 'data.pages.restore.responseResult.succeeded', false) === true) {
          this.$store.commit('showNotification', {
            style: 'success',
            message: this.$t('history:restore.success'),
            icon: 'check'
          })
          this.isRestoreConfirmDialogShown = false
          setTimeout(() => {
            window.location.assign(`/${this.locale}/${this.path}`)
          }, 1000)
        } else {
          throw new Error(_.get(resp, 'data.pages.restore.responseResult.message', 'An unexpected error occurred'))
        }
      } catch (err) {
        this.$store.commit('showNotification', {
          style: 'red',
          message: err.message,
          icon: 'alert'
        })
      }
      this.$store.commit(`loadingStop`, 'history-restore')
      this.restoreLoading = false
    },
    branchOff (versionId) {
      const pathParts = this.path.split('/')
      this.branchOffOpts = {
        versionId: versionId,
        locale: this.locale,
        path: (pathParts.length > 1) ? _.initial(pathParts).join('/') + `/new-page` : `new-page`,
        modal: true
      }
    },
    branchOffHandle ({ locale, path }) {
      window.location.assign(`/e/${locale}/${path}?from=${this.pageId},${this.branchOffOpts.versionId}`)
    },
    toggleViewMode () {
      this.viewMode = (this.viewMode === 'line-by-line') ? 'side-by-side' : 'line-by-line'
    },
    goLive () {
      window.location.assign(`/${this.path}`)
    },
    setDiffSource (versionId) {
      this.diffSource = versionId
    },
    setDiffTarget (versionId) {
      this.diffTarget = versionId
    },
    loadMore () {
      this.offsetPage++
      this.$apollo.queries.trail.fetchMore({
        variables: {
          id: this.pageId,
          offsetPage: this.offsetPage,
          offsetSize: this.$vuetify.breakpoint.mdAndUp ? 25 : 5
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          return {
            pages: {
              history: {
                total: previousResult.pages.history.total,
                trail: [...previousResult.pages.history.trail, ...fetchMoreResult.pages.history.trail],
                __typename: previousResult.pages.history.__typename
              },
              __typename: previousResult.pages.__typename
            }
          }
        }
      })
    },
    trailLabel (actionType) {
      switch (actionType) {
        case 'edit':
          return 'Updated'
        case 'move':
          return 'Moved'
        case 'initial':
          return 'Created'
        case 'live':
          return 'Updated'
        default:
          return 'Unknown'
      }
    },
    trailPillClass (actionType) {
      switch (actionType) {
        case 'move':
          return 'is-info'
        case 'initial':
          return 'is-good'
        default:
          return 'is-neutral'
      }
    },
    trailColor (actionType) {
      switch (actionType) {
        case 'edit':
          return 'primary'
        case 'move':
          return 'info'
        case 'initial':
          return 'success'
        case 'live':
          return 'accent'
        default:
          return 'grey'
      }
    },
    trailIcon (actionType) {
      switch (actionType) {
        case 'edit':
          return '' // 'mdi-pencil'
        case 'move':
          return 'mdi-forward'
        case 'initial':
          return 'mdi-plus'
        case 'live':
          return 'mdi-atom-variant'
        default:
          return 'mdi-alert'
      }
    }
  },
  apollo: {
    trail: {
      query: gql`
        query($id: Int!, $offsetPage: Int, $offsetSize: Int) {
          pages {
            history(id:$id, offsetPage:$offsetPage, offsetSize:$offsetSize) {
              trail {
                versionId
                authorId
                authorName
                actionType
                valueBefore
                valueAfter
                versionDate
              }
              total
            }
          }
        }
      `,
      variables () {
        return {
          id: this.pageId,
          offsetPage: 0,
          offsetSize: this.$vuetify.breakpoint.mdAndUp ? 25 : 5
        }
      },
      manual: true,
      result ({ data, loading, networkStatus }) {
        this.total = data.pages.history.total
        this.trail = data.pages.history.trail
      },
      watchLoading (isLoading) {
        this.$store.commit(`loading${isLoading ? 'Start' : 'Stop'}`, 'history-trail-refresh')
      }
    }
  }
}
</script>

<style lang='scss'>

.history {
  &-page {
    padding: 28px 40px 40px;
    font-family: $cl-font;
    color: var(--cl-text);

    @media screen and (max-width: 959px) {
      padding: 16px 16px 32px;
    }
  }

  // ---- Header ----
  &-header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 12px 24px;
    margin-bottom: 24px;

    &-main {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    &-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: none;
    }
    &-meta {
      flex: 1 1 100%;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 12px;
      color: var(--cl-muted);

      &-sep {
        width: 1px;
        height: 16px;
        background-color: var(--cl-border);
      }
    }
  }
  &-title {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--cl-heading);
  }
  &-subtitle {
    margin: 0;
    font-size: 16px;
    line-height: 1.5;
    color: var(--cl-muted);
  }
  &-path {
    font-family: $cl-font-mono;
    font-size: 12px;
    color: var(--cl-heading);
  }

  // ---- Cards (flush) ----
  &-card {
    display: flex;
    flex-direction: column;
    background-color: var(--cl-surface);
    border: 1px solid var(--cl-border);
    border-radius: $cl-radius-lg;
    box-shadow: var(--cl-shadow-sm);
    overflow: hidden;

    &-head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--cl-border);
      background-color: var(--cl-sunken);
    }
    &-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--cl-heading);
    }
    &-count {
      font-size: 12px;
      color: var(--cl-muted);
    }
    &-foot {
      padding: 8px 16px;
      text-align: center;
    }
    &-end {
      font-size: 12px;
      color: var(--cl-muted);
    }
  }
  &-versions &-card-head {
    justify-content: space-between;
    align-items: baseline;
  }

  // ---- Timeline items ----
  &-item {
    display: flex;
    align-items: stretch;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--cl-border);
    background-color: var(--cl-surface);

    &.is-selected {
      background-color: var(--cl-accent-pale);
    }

    &-rail {
      width: 10px;
      flex: none;
      display: flex;
      flex-direction: column;
      align-items: center;

      &-top {
        width: 2px;
        height: 6px;
        background-color: var(--cl-border);
      }
      &-bottom {
        width: 2px;
        flex: 1 1 auto;
        background-color: var(--cl-border);
      }
    }
    &.is-first &-rail-top {
      background-color: transparent;
    }
    &.is-last &-rail-bottom {
      background-color: transparent;
    }
    &-dot {
      width: 10px;
      height: 10px;
      flex: none;
      border-radius: 999px;
      background-color: var(--cl-border-strong);

      &.is-current {
        background-color: $cl-green;
      }
    }

    &-body {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    &-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    &-version {
      font-size: 14px;
      font-weight: 700;
      color: var(--cl-heading);
    }
    &-author {
      font-size: 13px;
      color: var(--cl-text);
    }
    &-date {
      font-size: 12px;
      color: var(--cl-muted);

      strong {
        color: var(--cl-text);
        font-weight: 600;
      }
    }
    &-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 2px;
      margin-left: -6px;
      padding-top: 2px;

      .v-btn.v-btn--text {
        padding: 0 6px;
        min-width: 0;
        height: 24px;
        font-size: 12px;
        font-weight: 600;
        color: var(--cl-accent-deep);
      }
      &-dot {
        font-size: 12px;
        color: $cl-grey-mid;
      }
      &-sep {
        width: 1px;
        height: 14px;
        margin: 0 6px;
        background-color: var(--cl-border);
      }
    }
  }

  .v-btn.history-ab {
    min-width: 24px;
    height: 24px;
    padding: 0 6px;
    font-size: 12px;
    font-weight: 700;
    margin-left: 6px;
  }

  // ---- Status pill ----
  &-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;
    white-space: nowrap;
    background-color: var(--cl-sunken);
    color: var(--cl-muted);

    &-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background-color: currentColor;
    }
    &.is-info {
      background-color: var(--cl-info-bg);
      color: var(--cl-info);
    }
    &.is-good {
      background-color: var(--cl-good-bg);
      color: var(--cl-good);
    }
  }

  // ---- Diff ----
  &-diff {
    &-heading {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    &-body {
      font-family: $cl-font-mono;
      font-size: 13px;
      color: var(--cl-text);
      overflow-x: auto;
    }
  }

  &-dialog-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--cl-heading);
    border-bottom: 1px solid var(--cl-border);
  }

  // ---- diff2html overrides ----
  .d2h-wrapper {
    font-family: $cl-font-mono;
  }
  .d2h-file-wrapper {
    border: 0;
    border-radius: 0;
    margin-bottom: 0;
  }
  .d2h-file-header {
    display: none;
  }
  .d2h-files-diff .d2h-file-side-diff {
    border-right: 1px solid var(--cl-border);
  }
  .d2h-diff-table {
    font-family: $cl-font-mono;
    font-size: 13px;
  }
  .d2h-code-line,
  .d2h-code-side-line {
    font-family: $cl-font-mono;
    font-size: 13px;
    color: var(--cl-text);
  }
  .d2h-code-linenumber,
  .d2h-code-side-linenumber {
    background-color: var(--cl-sunken);
    border-color: var(--cl-border);
    color: var(--cl-muted);
    font-size: 12px;
  }
  .d2h-code-line-prefix {
    color: var(--cl-muted);
  }
  .d2h-info {
    background-color: var(--cl-sunken);
    border-color: var(--cl-border);
    color: var(--cl-muted);
  }
  .d2h-cntx {
    background-color: var(--cl-surface);
  }
  .d2h-ins {
    background-color: var(--cl-good-bg);
    border-color: var(--cl-good-bg);
    color: var(--cl-text);
  }
  .d2h-del {
    background-color: var(--cl-critical-bg);
    border-color: var(--cl-critical-bg);
    color: var(--cl-text);
  }
  .d2h-ins .d2h-code-linenumber,
  .d2h-ins .d2h-code-side-linenumber {
    background-color: var(--cl-good-bg);
    color: var(--cl-good);
  }
  .d2h-del .d2h-code-linenumber,
  .d2h-del .d2h-code-side-linenumber {
    background-color: var(--cl-critical-bg);
    color: var(--cl-critical);
  }
  .d2h-ins .d2h-code-line-prefix {
    color: var(--cl-good);
  }
  .d2h-del .d2h-code-line-prefix {
    color: var(--cl-critical);
  }
  .d2h-code-line ins,
  .d2h-code-side-line ins {
    background-color: var(--cl-good-bg);
    color: var(--cl-good);
    text-decoration: none;
    box-shadow: inset 0 -1px 0 var(--cl-good);
  }
  .d2h-code-line del,
  .d2h-code-side-line del {
    background-color: var(--cl-critical-bg);
    color: var(--cl-critical);
    text-decoration: none;
    box-shadow: inset 0 -1px 0 var(--cl-critical);
  }
  .d2h-emptyplaceholder,
  .d2h-code-side-emptyplaceholder {
    background-color: var(--cl-sunken);
    border-color: var(--cl-border);
  }
}

</style>
