<template lang="pug">
  .search-results(v-if='searchIsFocused || (search && search.length > 1)')
    .search-results-container
      .search-results-help(v-if='!search || (search && search.length < 2)')
        v-icon.search-results-glyph(size='40') mdi-magnify
        .search-results-help-text {{$t('common:header.searchHint')}}
      .search-results-loader(v-else-if='searchIsLoading && (!results || results.length < 1)')
        orbit-spinner(
          :animation-duration='1000'
          :size='64'
          color='#8BC926'
        )
        .search-results-loader-text {{$t('common:header.searchLoading')}}
      .search-results-none(v-else-if='!searchIsLoading && (!results || results.length < 1)')
        v-icon.search-results-glyph(size='40') mdi-file-search-outline
        .search-results-none-text {{$t('common:header.searchNoResult')}}
      template(v-if='search && search.length >= 2 && results && results.length > 0')
        .search-results-head
          span.search-results-count {{$t('common:header.searchResultsCount', { total: response.totalHits })}}
          span.search-results-hint Enter to open, Esc to close
        v-list.search-results-items.py-0(two-line, dense)
          template(v-for='(item, idx) of results')
            v-list-item.search-results-item(@click='goToPage(item)', @click.middle="goToPageInNewTab(item)", :key='item.id', :class='idx === cursor ? `highlighted` : ``')
              v-list-item-avatar.search-results-item-icon(tile, size='24')
                v-icon(size='18') mdi-file-document-outline
              v-list-item-content
                v-list-item-title.search-results-item-title(v-text='item.title')
                .search-results-item-path(v-text='item.path')
                v-list-item-subtitle.search-results-item-desc(v-text='item.description')
              v-list-item-action
                v-chip.search-results-locale(label, outlined, small) {{item.locale.toUpperCase()}}
        .search-results-pagination(v-if='paginationLength > 1')
          v-pagination(
            v-model='pagination'
            :length='paginationLength'
            color='primary'
          )
      .search-results-suggestions(v-if='suggestions && suggestions.length > 0')
        span.search-results-suggestions-label {{$t('common:header.searchDidYouMean')}}
        template(v-for='(term, idx) of suggestions')
          v-chip.search-results-suggestion(:key='term', label, small, @click='setSearchTerm(term)', :class='idx + results.length === cursor ? `highlighted` : ``') {{term}}
      .search-results-foot(v-if='search && search.length > 1')
        v-btn(outlined, small, color='primary', @click='search = ``')
          v-icon(left, small) mdi-close
          span {{$t('common:header.searchClose')}}
</template>

<script>
import _ from 'lodash'
import { sync } from 'vuex-pathify'
import { OrbitSpinner } from 'epic-spinners'

import searchPagesQuery from 'gql/common/common-pages-query-search.gql'

export default {
  components: {
    OrbitSpinner
  },
  data() {
    return {
      cursor: 0,
      pagination: 1,
      perPage: 10,
      response: {
        results: [],
        suggestions: [],
        totalHits: 0
      }
    }
  },
  computed: {
    search: sync('site/search'),
    searchIsFocused: sync('site/searchIsFocused'),
    searchIsLoading: sync('site/searchIsLoading'),
    searchRestrictLocale: sync('site/searchRestrictLocale'),
    searchRestrictPath: sync('site/searchRestrictPath'),
    results() {
      const currentIndex = (this.pagination - 1) * this.perPage
      return this.response.results ? _.slice(this.response.results, currentIndex, currentIndex + this.perPage) : []
    },
    hits() {
      return this.response.totalHits ? this.response.totalHits : 0
    },
    suggestions() {
      return this.response.suggestions ? this.response.suggestions : []
    },
    paginationLength() {
      return (this.response.totalHits > 0) ? Math.ceil(this.response.totalHits / this.perPage) : 0
    }
  },
  watch: {
    search(newValue, oldValue) {
      this.cursor = 0
      if (!newValue || (newValue && newValue.length < 2)) {
        this.searchIsLoading = false
      } else {
        this.searchIsLoading = true
      }
    },
    results() {
      this.cursor = 0
    }
  },
  mounted() {
    this.$root.$on('searchMove', (dir) => {
      this.cursor += ((dir === 'up') ? -1 : 1)
      if (this.cursor < -1) {
        this.cursor = -1
      } else if (this.cursor > this.results.length + this.suggestions.length - 1) {
        this.cursor = this.results.length + this.suggestions.length - 1
      }
    })
    this.$root.$on('searchEnter', () => {
      if (!this.results) {
        return
      }

      if (this.cursor >= 0 && this.cursor < this.results.length) {
        this.goToPage(_.nth(this.results, this.cursor))
      } else if (this.cursor >= 0) {
        this.setSearchTerm(_.nth(this.suggestions, this.cursor - this.results.length))
      }
    })
  },
  methods: {
    setSearchTerm(term) {
      this.search = term
    },
    goToPage(item) {
      window.location.assign(`/${item.locale}/${item.path}`)
    },
    goToPageInNewTab(item) {
      window.open(`/${item.locale}/${item.path}`, '_blank')
    }
  },
  apollo: {
    response: {
      query: searchPagesQuery,
      variables() {
        return {
          query: this.search
        }
      },
      fetchPolicy: 'network-only',
      debounce: 300,
      throttle: 1000,
      skip() {
        return !this.search || this.search.length < 2
      },
      result() {
        this.pagination = 1
      },
      update: (data) => _.get(data, 'pages.search', {}),
      watchLoading (isLoading) {
        this.searchIsLoading = isLoading
      }
    }
  }
}
</script>

<style lang="scss">
// Carbon Logica search results: a raised card under the top bar over a navy-tinted scrim.
.search-results {
  position: fixed;
  top: 64px;
  left: 0;
  overflow-y: auto;
  width: 100%;
  height: calc(100% - 64px);
  background-color: rgba(35, 49, 66, 0.55);
  z-index: 100;
  text-align: center;
  font-family: $cl-font;
  animation: searchResultsReveal .3s ease;

  @media #{map-get($display-breakpoints, 'sm-and-down')} {
    top: 112px;
  }

  @at-root .theme--dark & {
    background-color: rgba(0, 0, 0, 0.6);
  }

  &-container {
    margin: 12px auto;
    width: 90vw;
    max-width: 640px;
    text-align: left;
    background-color: var(--cl-raised);
    color: var(--cl-text);
    border: 1px solid var(--cl-border);
    border-radius: $cl-radius-lg;
    box-shadow: var(--cl-shadow-lg);
    overflow: hidden;
  }

  &-glyph.v-icon {
    color: var(--cl-muted) !important;
  }

  &-help, &-loader, &-none {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 32px 24px;
    color: var(--cl-muted);
    font-size: 14px;
  }
  &-help-text, &-loader-text, &-none-text {
    margin-top: 12px;
  }
  &-none-text {
    font-size: 16px;
    font-weight: 600;
    color: var(--cl-heading);
  }

  // Header row: caps label + muted keyboard hint
  &-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--cl-border);
  }
  &-count {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--cl-accent-deep);
  }
  &-hint {
    font-size: 12px;
    color: var(--cl-muted);
    text-align: right;
  }

  // Result rows
  &-items.v-list {
    background-color: transparent !important;
    text-align: left;
    padding: 0;
    border-radius: 0;
  }
  &-item.v-list-item {
    min-height: 0;
    padding: 12px 16px;
    border-bottom: 1px solid var(--cl-border);
    transition: background-color 120ms ease;

    &::before {
      opacity: 0 !important;
    }
    &:hover, &.highlighted {
      background-color: var(--cl-accent-pale);
    }
    &.highlighted .search-results-item-icon .v-icon {
      color: var(--cl-accent-deep) !important;
    }

    .v-list-item__content {
      padding: 0;
    }
    .v-list-item__avatar {
      margin: 1px 12px 0 0;
      align-self: flex-start;
      min-width: 24px;
    }
    .v-list-item__action {
      align-self: flex-start;
      margin: 0 0 0 12px;
    }
  }
  &-item-icon .v-icon {
    color: var(--cl-muted) !important;
  }
  &-item-title.v-list-item__title {
    font-size: 14px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--cl-heading);
    white-space: normal;
  }
  &-item-path {
    margin-top: 3px;
    font-family: $cl-font-mono;
    font-size: 12px;
    line-height: 1.3;
    color: var(--cl-muted);
    word-break: break-all;
  }
  &-item-desc.v-list-item__subtitle {
    margin-top: 3px;
    font-size: 13px;
    line-height: 1.4;
    color: var(--cl-text);
    white-space: normal;
  }
  &-locale.v-chip {
    height: 20px;
    padding: 0 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--cl-muted) !important;
    border-color: var(--cl-border-strong) !important;
  }

  &-pagination {
    display: flex;
    justify-content: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--cl-border);

    .v-pagination__item, .v-pagination__navigation {
      box-shadow: none;
      border: 1px solid var(--cl-border);
      border-radius: $cl-radius-md;
      background-color: var(--cl-surface);
      color: var(--cl-text);
      font-family: $cl-font;
      font-weight: 600;
    }
    .v-pagination__item--active {
      background-color: $cl-green !important;
      border-color: $cl-green !important;
      color: $cl-navy !important;
    }
  }

  // Suggestions footer: sunken strip with tag-style chips
  &-suggestions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px 16px;
    background-color: var(--cl-sunken);
    border-bottom: 1px solid var(--cl-border);
  }
  &-suggestions-label {
    font-size: 12px;
    color: var(--cl-muted);
    margin-right: 2px;
  }
  &-suggestion.v-chip {
    height: 24px;
    padding: 0 8px;
    border: 1px solid var(--cl-border) !important;
    border-radius: $cl-radius-sm;
    background-color: var(--cl-accent-pale) !important;
    color: var(--cl-accent-deep) !important;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;

    &::before {
      opacity: 0 !important;
    }
    &:hover, &.highlighted {
      border-color: var(--cl-accent-deep) !important;
    }
  }

  &-foot {
    display: flex;
    justify-content: flex-end;
    padding: 12px 16px;
    background-color: var(--cl-sunken);
  }
}

@keyframes searchResultsReveal {
  0% {
    background-color: rgba(35, 49, 66, 0);
    padding-top: 16px;
  }
  100% {
    background-color: rgba(35, 49, 66, 0.55);
    padding-top: 0;
  }
}
</style>
