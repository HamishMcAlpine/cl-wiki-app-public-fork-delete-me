<template lang="pug">
  div.nav-sidebar
    .pa-3.d-flex.nav-sidebar-header(v-if='navMode === `MIXED`')
      v-btn(
        outlined
        small
        style='min-width:0;'
        @click='goHome'
        :aria-label='$t(`common:header.home`)'
        )
        v-icon(size='18') mdi-home
      v-btn.ml-3(
        v-if='currentMode === `custom`'
        outlined
        small
        style='flex: 1 1 100%;'
        @click='switchMode(`browse`)'
        )
        v-icon(left, size='18') mdi-file-tree
        .body-2.text-none {{$t('common:sidebar.browse')}}
      v-btn.ml-3(
        v-else-if='currentMode === `browse`'
        outlined
        small
        style='flex: 1 1 100%;'
        @click='switchMode(`custom`)'
        )
        v-icon(left, size='18') mdi-navigation
        .body-2.text-none {{$t('common:sidebar.mainMenu')}}
    v-divider
    //-> Custom Navigation
    v-list.py-2.px-2.nav-sidebar-list(v-if='currentMode === `custom`', dense)
      template(v-for='item of items')
        v-list-item(
          v-if='item.k === `link`'
          :href='item.t'
          :target='item.y === `externalblank` ? `_blank` : `_self`'
          :rel='item.y === `externalblank` ? `noopener` : ``'
          )
          v-list-item-avatar(size='24', tile)
            v-icon(v-if='item.c.match(/fa[a-z] fa-/)', size='19') {{ item.c }}
            v-icon(v-else) {{ item.c }}
          v-list-item-title {{ item.l }}
        v-divider.my-2(v-else-if='item.k === `divider`')
        v-subheader.pl-4(v-else-if='item.k === `header`') {{ item.l }}
    //-> Browse
    v-list.py-2.px-2.nav-sidebar-list(v-else-if='currentMode === `browse`', dense)
      template(v-if='currentParent.id > 0')
        v-list-item(v-for='(item, idx) of parents', :key='`parent-` + item.id', @click='fetchBrowseItems(item)', style='min-height: 30px;')
          v-list-item-avatar(size='18', :style='`padding-left: ` + (idx * 8) + `px; width: auto; margin: 0 5px 0 0;`')
            v-icon(small) mdi-folder-open
          v-list-item-title {{ item.title }}
        v-divider.mt-2
        v-list-item.mt-2(v-if='currentParent.pageId > 0', :href='`/` + currentParent.locale + `/` + currentParent.path', :key='`directorypage-` + currentParent.id', :input-value='path === currentParent.path')
          v-list-item-avatar(size='24')
            v-icon mdi-text-box
          v-list-item-title {{ currentParent.title }}
        v-subheader.pl-4 {{$t('common:sidebar.currentDirectory')}}
      template(v-for='item of currentItems')
        v-list-item(v-if='item.isFolder', :key='`childfolder-` + item.id', @click='fetchBrowseItems(item)')
          v-list-item-avatar(size='24')
            v-icon mdi-folder
          v-list-item-title {{ item.title }}
        v-list-item(v-else, :href='`/` + item.locale + `/` + item.path', :key='`childpage-` + item.id', :input-value='path === item.path')
          v-list-item-avatar(size='24')
            v-icon mdi-text-box
          v-list-item-title {{ item.title }}
</template>

<script>
import _ from 'lodash'
import gql from 'graphql-tag'
import { get } from 'vuex-pathify'

/* global siteLangs */

export default {
  props: {
    color: {
      type: String,
      default: 'primary'
    },
    dark: {
      type: Boolean,
      default: true
    },
    items: {
      type: Array,
      default: () => []
    },
    navMode: {
      type: String,
      default: 'MIXED'
    }
  },
  data() {
    return {
      currentMode: 'custom',
      currentItems: [],
      currentParent: {
        id: 0,
        title: '/ (root)'
      },
      parents: [],
      loadedCache: []
    }
  },
  computed: {
    path: get('page/path'),
    locale: get('page/locale')
  },
  methods: {
    switchMode (mode) {
      this.currentMode = mode
      window.localStorage.setItem('navPref', mode)
      if (mode === `browse` && this.loadedCache.length < 1) {
        this.loadFromCurrentPath()
      }
    },
    async fetchBrowseItems (item) {
      this.$store.commit(`loadingStart`, 'browse-load')
      if (!item) {
        item = this.currentParent
      }

      if (this.loadedCache.indexOf(item.id) < 0) {
        this.currentItems = []
      }

      if (item.id === 0) {
        this.parents = []
      } else {
        const flushRightIndex = _.findIndex(this.parents, ['id', item.id])
        if (flushRightIndex >= 0) {
          this.parents = _.take(this.parents, flushRightIndex)
        }
        if (this.parents.length < 1) {
          this.parents.push(this.currentParent)
        }
        this.parents.push(item)
      }

      this.currentParent = item

      const resp = await this.$apollo.query({
        query: gql`
          query ($parent: Int, $locale: String!) {
            pages {
              tree(parent: $parent, mode: ALL, locale: $locale) {
                id
                path
                title
                isFolder
                pageId
                parent
                locale
              }
            }
          }
        `,
        fetchPolicy: 'cache-first',
        variables: {
          parent: item.id,
          locale: this.locale
        }
      })
      this.loadedCache = _.union(this.loadedCache, [item.id])
      this.currentItems = _.get(resp, 'data.pages.tree', [])
      this.$store.commit(`loadingStop`, 'browse-load')
    },
    async loadFromCurrentPath() {
      this.$store.commit(`loadingStart`, 'browse-load')
      const resp = await this.$apollo.query({
        query: gql`
          query ($path: String, $locale: String!) {
            pages {
              tree(path: $path, mode: ALL, locale: $locale, includeAncestors: true) {
                id
                path
                title
                isFolder
                pageId
                parent
                locale
              }
            }
          }
        `,
        fetchPolicy: 'cache-first',
        variables: {
          path: this.path,
          locale: this.locale
        }
      })
      const items = _.get(resp, 'data.pages.tree', [])
      const curPage = _.find(items, ['pageId', this.$store.get('page/id')])
      if (!curPage) {
        console.warn('Could not find current page in page tree listing!')
        return
      }

      let curParentId = curPage.parent
      let invertedAncestors = []
      while (curParentId) {
        const curParent = _.find(items, ['id', curParentId])
        if (!curParent) {
          break
        }
        invertedAncestors.push(curParent)
        curParentId = curParent.parent
      }

      this.parents = [this.currentParent, ...invertedAncestors.reverse()]
      this.currentParent = _.last(this.parents)

      this.loadedCache = [curPage.parent]
      this.currentItems = _.filter(items, ['parent', curPage.parent])
      this.$store.commit(`loadingStop`, 'browse-load')
    },
    goHome () {
      window.location.assign(siteLangs.length > 0 ? `/${this.locale}/home` : '/')
    }
  },
  mounted () {
    this.currentParent.title = `/ ${this.$t('common:sidebar.root')}`
    if (this.navMode === 'TREE') {
      this.currentMode = 'browse'
    } else if (this.navMode === 'STATIC') {
      this.currentMode = 'custom'
    } else {
      this.currentMode = window.localStorage.getItem('navPref') || 'custom'
    }
    if (this.currentMode === 'browse') {
      this.loadFromCurrentPath()
    }
  }
}
</script>

<style lang="scss">

// Sidebar navigation: white surface, 36 px rows, pale-green active row (design system NavSidebar)
.v-application .nav-sidebar {
  .nav-sidebar-header {
    background-color: var(--cl-sunken);
    border-bottom: 1px solid var(--cl-border);
  }

  .v-divider {
    border-color: var(--cl-border) !important;
  }

  .nav-sidebar-list {
    background-color: transparent !important;
    color: var(--cl-text);

    &.v-list--dense .v-list-item {
      min-height: 36px;
      padding: 0 12px;
      margin-bottom: 2px;
      border-radius: $cl-radius-md;
      transition: background-color 120ms ease, color 120ms ease;
    }

    .v-list-item:not(.v-list-item--active):not(.v-list-item--disabled) {
      color: var(--cl-text) !important;
    }

    &.v-list--dense .v-list-item .v-list-item__title {
      font-size: 14px;
      font-weight: 400;
      line-height: 1.3;
      color: inherit;
    }

    .v-list-item .v-list-item__avatar {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      justify-content: center;

      &:first-child {
        margin-right: 10px;
      }
    }

    .v-list-item .v-icon {
      font-size: 18px;
      color: var(--cl-muted);
    }

    .v-list-item--link::before {
      display: none;
    }

    .v-list-item--link:hover {
      background-color: var(--cl-sunken);
    }

    .v-list-item--active {
      background-color: var(--cl-accent-pale) !important;
      color: var(--cl-accent-deep) !important;

      .v-list-item__title {
        font-weight: 700;
      }
      .v-icon {
        color: var(--cl-accent-deep);
      }
    }

    .v-subheader {
      height: 32px;
      padding: 0 12px !important;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--cl-accent-deep);
    }
  }
}

.v-application.v-application--is-rtl .nav-sidebar .nav-sidebar-list .v-list-item .v-list-item__avatar:first-child {
  margin-right: 0;
  margin-left: 10px;
}
</style>
