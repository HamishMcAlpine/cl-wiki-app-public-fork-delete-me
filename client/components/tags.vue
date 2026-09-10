<template lang='pug'>
  v-app(:dark='$vuetify.theme.dark').tags
    nav-header
    v-content
      .tags-page
        //- Page header
        .tags-header
          h1.tags-title Browse by tags
          p.tags-subtitle Pages grouped by tag. Pick one or more tags to narrow the list.

        v-row
          //- Tag picker
          v-col(cols='12', md='3')
            .tags-card.tags-picker
              .tags-card-head
                span.tags-card-title Tags
                span.tags-card-count {{tags.length}} tags
              v-text-field.tags-filter(
                v-model='tagFilter'
                outlined
                dense
                hide-details
                clearable
                placeholder='Filter tags'
                prepend-inner-icon='mdi-magnify'
              )
              .tags-chips
                v-chip.tags-chip(
                  v-for='tag of tagsFiltered'
                  :key='`tag-` + tag.tag'
                  small
                  label
                  :class='{ "is-selected": isSelected(tag.tag) }'
                  @click='toggleTag(tag.tag)'
                  )
                  v-icon(v-if='isSelected(tag.tag)', left, size='14') mdi-check
                  span {{tag.title}}
              .tags-card-hint(v-if='tagsFiltered.length < tags.length') Showing {{tagsFiltered.length}} of {{tags.length}}. Type to filter the rest.

          //- Tagged pages
          v-col(cols='12', md='9')
            .tags-toolbar
              template(v-if='selection.length > 0')
                span.tags-toolbar-label {{$t('tags:currentSelection')}}
                v-chip.tags-chip.is-selected(
                  v-for='tag of tagsSelected'
                  :key='`tagSelected-` + tag.tag'
                  small
                  label
                  close
                  @click:close='toggleTag(tag.tag)'
                  ) {{tag.title}}
                v-btn(text, small, @click='selection = []')
                  v-icon(left, size='16') mdi-close
                  span {{$t('tags:clearSelection')}}
              template(v-else)
                span.tags-toolbar-label {{$t('tags:selectOneMoreTags')}}
              v-spacer
              span.tags-toolbar-count(v-if='selection.length > 0') {{pages.length}} pages
            .tags-toolbar
              v-text-field.tags-search(
                v-model='innerSearch'
                :label='$t(`tags:searchWithinResultsPlaceholder`)'
                outlined
                dense
                hide-details
                single-line
                prepend-inner-icon='mdi-text-box-search-outline'
                clearable
              )
              template(v-if='locales.length > 1')
                v-select.tags-select(
                  :items='locales'
                  v-model='locale'
                  outlined
                  dense
                  hide-details
                  :label='$t(`tags:locale`)'
                  item-text='name'
                  item-value='code'
                  single-line
                )
              v-select.tags-select(
                :items='orderByItems'
                v-model='orderBy'
                outlined
                dense
                hide-details
                :label='$t(`tags:orderBy`)'
                single-line
              )
              v-btn-toggle.tags-direction(v-model='orderByDirection', mandatory, dense)
                v-btn(outlined, small, title='Ascending'): v-icon(size='18') mdi-chevron-double-up
                v-btn(outlined, small, title='Descending'): v-icon(size='18') mdi-chevron-double-down

            .tags-card.tags-list
              .tags-empty(v-if='selection.length < 1')
                span {{$t('tags:selectOneMoreTagsHint')}}
              template(v-else)
                v-data-iterator(
                  :items='pages'
                  :items-per-page='4'
                  :search='innerSearch'
                  :loading='isLoading'
                  :options.sync='pagination'
                  @page-count='pageTotal = $event'
                  hide-default-footer
                  ref='dude'
                  )
                  template(v-slot:loading)
                    .tags-empty
                      v-progress-circular(
                        indeterminate
                        color='primary'
                        size='32'
                        width='2'
                        )
                      span.mt-3 {{$t('tags:retrievingResultsLoading')}}
                  template(v-slot:no-data)
                    .tags-empty
                      span {{$t('tags:noResults')}}
                  template(v-slot:no-results)
                    .tags-empty
                      span {{$t('tags:noResultsWithFilter')}}
                  template(v-slot:default='props')
                    .tags-row(
                      v-for='item of props.items'
                      :key='`page-` + item.id'
                      @click='goTo(item)'
                      )
                      a.tags-row-title(:href='`/` + item.locale + `/` + item.path', @click.prevent) {{item.title}}
                      span.tags-row-path /{{item.locale}}/{{item.path}}
                      span.tags-row-desc {{item.description || '---'}}
                      i18next.tags-row-meta(tag='div', path='tags:pageLastUpdated')
                        span(place='date') {{item.updatedAt | moment('from')}}
                .tags-card-foot(v-if='this.pageTotal > 1')
                  v-pagination(v-model='pagination.page', :length='pageTotal')

    nav-footer
    notify
    search-results
</template>

<script>
import VueRouter from 'vue-router'
import _ from 'lodash'

import tagsQuery from 'gql/common/common-pages-query-tags.gql'
import pagesQuery from 'gql/common/common-pages-query-list.gql'

/* global siteLangs */

const router = new VueRouter({
  mode: 'history',
  base: '/t'
})

export default {
  i18nOptions: { namespaces: 'tags' },
  data() {
    return {
      tags: [],
      selection: [],
      innerSearch: '',
      tagFilter: '',
      locale: 'any',
      locales: [],
      orderBy: 'title',
      orderByDirection: 0,
      pagination: {
        page: 1,
        itemsPerPage: 12,
        mustSort: true,
        sortBy: ['title'],
        sortDesc: [false]
      },
      pages: [],
      pageTotal: 0,
      isLoading: true
    }
  },
  computed: {
    tagsGrouped () {
      return _.groupBy(this.tags, t => t.title.charAt(0).toUpperCase())
    },
    tagsFiltered () {
      const needle = _.toLower(_.trim(this.tagFilter || ''))
      if (needle.length < 1) {
        return this.tags
      }
      return _.filter(this.tags, t => _.includes(_.toLower(t.title), needle) || _.includes(_.toLower(t.tag), needle))
    },
    tagsSelected () {
      return _.filter(this.tags, t => _.includes(this.selection, t.tag))
    },
    orderByItems () {
      return [
        { text: this.$t('tags:orderByField.creationDate'), value: 'createdAt' },
        { text: this.$t('tags:orderByField.ID'), value: 'id' },
        { text: this.$t('tags:orderByField.lastModified'), value: 'updatedAt' },
        { text: this.$t('tags:orderByField.path'), value: 'path' },
        { text: this.$t('tags:orderByField.title'), value: 'title' }
      ]
    }
  },
  watch: {
    locale (newValue, oldValue) {
      this.rebuildURL()
    },
    orderBy (newValue, oldValue) {
      this.rebuildURL()
      this.pagination.sortBy = [newValue]
    },
    orderByDirection (newValue, oldValue) {
      this.rebuildURL()
      this.pagination.sortDesc = [newValue === 1]
    }
  },
  router,
  created () {
    this.$store.commit('page/SET_MODE', 'tags')
    this.selection = _.compact(decodeURI(this.$route.path).split('/'))
  },
  mounted () {
    this.locales = _.concat(
      [{name: this.$t('tags:localeAny'), code: 'any'}],
      (siteLangs.length > 0 ? siteLangs : [])
    )
    if (this.$route.query.lang) {
      this.locale = this.$route.query.lang
    }
    if (this.$route.query.sort) {
      this.orderBy = this.$route.query.sort.toLowerCase()
      switch (this.orderBy) {
        case 'updatedat':
          this.orderBy = 'updatedAt'
          break
      }
      this.pagination.sortBy = [this.orderBy]
    }
    if (this.$route.query.dir) {
      this.orderByDirection = this.$route.query.dir === 'asc' ? 0 : 1
      this.pagination.sortDesc = [this.orderByDirection === 1]
    }
  },
  methods: {
    toggleTag (tag) {
      if (_.includes(this.selection, tag)) {
        this.selection = _.without(this.selection, tag)
      } else {
        this.selection.push(tag)
      }
      this.rebuildURL()
    },
    isSelected (tag) {
      return _.includes(this.selection, tag)
    },
    rebuildURL () {
      let urlObj = {
        path: '/' + this.selection.join('/')
      }
      if (this.locale !== `any`) {
        _.set(urlObj, 'query.lang', this.locale)
      }
      if (this.orderBy !== `TITLE`) {
        _.set(urlObj, 'query.sort', this.orderBy.toLowerCase())
      }
      if (this.orderByDirection !== 0) {
        _.set(urlObj, 'query.dir', this.orderByDirection === 0 ? `asc` : `desc`)
      }
      this.$router.push(urlObj)
    },
    goTo (page) {
      window.location.assign(`/${page.locale}/${page.path}`)
    }
  },
  apollo: {
    tags: {
      query: tagsQuery,
      fetchPolicy: 'cache-and-network',
      update: (data) => _.cloneDeep(data.pages.tags),
      watchLoading (isLoading) {
        this.$store.commit(`loading${isLoading ? 'Start' : 'Stop'}`, 'tags-refresh')
      }
    },
    pages: {
      query: pagesQuery,
      fetchPolicy: 'cache-and-network',
      update: (data) => _.cloneDeep(data.pages.list),
      watchLoading (isLoading) {
        this.isLoading = isLoading
        this.$store.commit(`loading${isLoading ? 'Start' : 'Stop'}`, 'pages-refresh')
      },
      variables () {
        return {
          locale: this.locale === 'any' ? null : this.locale,
          tags: this.selection
        }
      },
      skip () {
        return this.selection.length < 1
      }
    }
  }
}
</script>

<style lang='scss'>
.tags {
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
    flex-direction: column;
    gap: 6px;
    margin-bottom: 24px;
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

  // ---- Cards ----
  &-card {
    display: flex;
    flex-direction: column;
    background-color: var(--cl-surface);
    border: 1px solid var(--cl-border);
    border-radius: $cl-radius-lg;
    box-shadow: var(--cl-shadow-sm);

    &-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
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
    &-hint {
      padding-top: 4px;
      font-size: 12px;
      color: var(--cl-muted);
    }
    &-foot {
      padding: 8px 16px;
      text-align: center;
      border-top: 1px solid var(--cl-border);
    }
  }
  &-picker {
    gap: 12px;
    padding: 16px;
  }
  &-list {
    overflow: hidden;
  }

  // ---- Tag chips ----
  &-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .v-chip.tags-chip {
    height: 24px;
    padding: 0 8px;
    border: 1px solid var(--cl-border);
    border-radius: $cl-radius-sm;
    background-color: var(--cl-accent-pale) !important;
    color: var(--cl-accent-deep) !important;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;

    .v-icon {
      color: inherit !important;
    }
    .v-chip__close {
      font-size: 14px;
    }

    &.is-selected {
      border-color: $cl-green;
      background-color: $cl-green !important;
      color: $cl-navy !important;
    }
  }

  // ---- Toolbar ----
  &-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;

    &-label {
      font-size: 14px;
      color: var(--cl-text);
    }
    &-count {
      font-size: 12px;
      color: var(--cl-muted);
    }
  }
  &-search {
    flex: 1 1 240px;
    max-width: 420px;
  }
  &-select {
    flex: 0 1 220px;
    max-width: 220px;
  }
  .v-btn-toggle.tags-direction {
    border-radius: $cl-radius-md;

    .v-btn.v-btn--outlined {
      border-color: var(--cl-border-strong);
    }
    .v-btn.v-btn--active {
      background-color: var(--cl-accent-pale);
      color: var(--cl-accent-deep);

      .v-icon {
        color: var(--cl-accent-deep);
      }
    }
  }

  // ---- Rows ----
  &-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--cl-border);
    cursor: pointer;

    &:last-child {
      border-bottom: 0;
    }
    &:hover {
      background-color: var(--cl-accent-pale);
    }

    &-title {
      font-size: 16px;
      font-weight: 600;
      line-height: 1.3;
      color: var(--cl-heading);
      text-decoration: none;

      &:hover {
        color: var(--cl-link);
      }
    }
    &-path {
      font-family: $cl-font-mono;
      font-size: 12px;
      color: var(--cl-muted);
    }
    &-desc {
      font-size: 14px;
      line-height: 1.5;
      color: var(--cl-text);
    }
    &-meta {
      padding-top: 2px;
      font-size: 12px;
      color: var(--cl-muted);
    }
  }

  &-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
    font-size: 14px;
    color: var(--cl-muted);
    text-align: center;
  }
}
</style>
