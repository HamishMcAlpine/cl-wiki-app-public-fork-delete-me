<template lang='pug'>
  v-app-bar.nav-header(dark, app, :clipped-left='!$vuetify.rtl', :clipped-right='$vuetify.rtl', fixed, flat, :extended='searchIsShown && $vuetify.breakpoint.smAndDown')
    v-toolbar.cl-search-mobile(flat, slot='extension', v-if='searchIsShown && $vuetify.breakpoint.smAndDown')
      v-text-field.cl-search(
        ref='searchFieldMobile'
        v-model='search'
        clearable
        color='white'
        :label='$t(`common:header.search`)'
        single-line
        solo
        flat
        hide-details
        prepend-inner-icon='mdi-magnify'
        :loading='searchIsLoading'
        @keyup.enter='searchEnter'
        autocomplete='off'
      )
    v-layout(row)
      v-flex(xs5, md4)
        v-toolbar.nav-header-inner(dark, flat, :class='$vuetify.rtl ? `pr-3` : `pl-3`')
          .cl-brand
            img.cl-wordmark(
              v-if='$vuetify.breakpoint.mdAndUp'
              src='/_assets/img/cl/carbon-logica-logo-reversed.png'
              alt='Carbon Logica'
              @click='goHome'
            )
            img.cl-leaf(
              v-else
              src='/_assets/img/cl/cl-leaf.png'
              alt='Carbon Logica'
              @click='goHome'
            )
            .cl-divider
            span.cl-site-title {{shortTitle}}
      v-flex(md4, v-if='$vuetify.breakpoint.mdAndUp')
        v-toolbar.nav-header-inner(dark, flat)
          slot(name='mid')
            transition(name='navHeaderSearch', v-if='searchIsShown')
              v-text-field.cl-search(
                ref='searchField',
                v-if='searchIsShown && $vuetify.breakpoint.mdAndUp',
                v-model='search',
                color='white',
                :label='$t(`common:header.search`)',
                single-line,
                solo
                flat
                hide-details,
                prepend-inner-icon='mdi-magnify',
                :loading='searchIsLoading',
                @keyup.enter='searchEnter'
                @keyup.esc='searchClose'
                @focus='searchFocus'
                @blur='searchBlur'
                @keyup.down='searchMove(`down`)'
                @keyup.up='searchMove(`up`)'
                autocomplete='off'
              )
                template(v-slot:append)
                  kbd.cl-kbd(v-show='!searchIsFocused') /
      v-flex(xs7, md4)
        v-toolbar.nav-header-inner.pr-4(dark, flat)
          v-spacer
          .navHeaderLoading.mr-3
            v-progress-circular(indeterminate, color='accent', :size='22', :width='2' v-show='isLoading')

          slot(name='actions')

          .cl-actions

            //- (mobile) SEARCH TOGGLE

            v-btn.cl-iconbtn(
              v-if='!hideSearch && $vuetify.breakpoint.smAndDown'
              @click='searchToggle'
              icon
              small
              width='32'
              height='32'
              :aria-label='$t(`common:header.search`)'
              )
              v-icon(size='18') mdi-magnify

            //- NEW PAGE

            template(v-if='hasNewPagePermission && path && mode !== `edit`')
              v-btn.cl-newpage(color='primary', depressed, small, height='32', @click='pageNew', :aria-label='$t(`common:header.newPage`)')
                v-icon(left, small) mdi-plus
                span {{$t('common:header.newPage')}}

            //- PAGE ACTIONS

            template(v-if='hasAnyPagePermissions && path && mode !== `edit`')
              v-menu(offset-y, bottom, transition='slide-y-transition', left)
                template(v-slot:activator='{ on: menu, attrs }')
                  v-tooltip(bottom)
                    template(v-slot:activator='{ on: tooltip }')
                      v-btn.cl-iconbtn(
                        icon
                        small
                        width='32'
                        height='32'
                        v-bind='attrs'
                        v-on='{ ...menu, ...tooltip }'
                        :aria-label='$t(`common:header.pageActions`)'
                        )
                        v-icon(size='18') mdi-dots-horizontal
                    span {{$t('common:header.pageActions')}}
                v-list(nav, :light='!$vuetify.theme.dark', :dark='$vuetify.theme.dark')
                  .overline.pa-4 {{$t('common:header.currentPage')}}
                  v-list-item.pl-4(@click='pageView', v-if='mode !== `view`')
                    v-list-item-avatar(size='24', tile): v-icon(color='primary') mdi-file-document-outline
                    v-list-item-title.body-2 {{$t('common:header.view')}}
                  v-list-item.pl-4(@click='pageEdit', v-if='mode !== `edit` && hasWritePagesPermission')
                    v-list-item-avatar(size='24', tile): v-icon(color='primary') mdi-file-document-edit-outline
                    v-list-item-title.body-2 {{$t('common:header.edit')}}
                  v-list-item.pl-4(@click='pageHistory', v-if='mode !== `history` && hasReadHistoryPermission')
                    v-list-item-avatar(size='24', tile): v-icon(color='primary') mdi-history
                    v-list-item-content
                      v-list-item-title.body-2 {{$t('common:header.history')}}
                  v-list-item.pl-4(@click='pageSource', v-if='mode !== `source` && hasReadSourcePermission')
                    v-list-item-avatar(size='24', tile): v-icon(color='primary') mdi-code-tags
                    v-list-item-title.body-2 {{$t('common:header.viewSource')}}
                  v-list-item.pl-4(@click='pageConvert', v-if='hasWritePagesPermission')
                    v-list-item-avatar(size='24', tile): v-icon(color='primary') mdi-lightning-bolt
                    v-list-item-title.body-2 {{$t('common:header.convert')}}
                  v-list-item.pl-4(@click='pageDuplicate', v-if='hasWritePagesPermission')
                    v-list-item-avatar(size='24', tile): v-icon(color='primary') mdi-content-duplicate
                    v-list-item-title.body-2 {{$t('common:header.duplicate')}}
                  v-list-item.pl-4(@click='pageMove', v-if='hasManagePagesPermission')
                    v-list-item-avatar(size='24', tile): v-icon(color='primary') mdi-content-save-move-outline
                    v-list-item-content
                      v-list-item-title.body-2 {{$t('common:header.move')}}
                  v-list-item.pl-4(@click='pageDelete', v-if='hasDeletePagesPermission')
                    v-list-item-avatar(size='24', tile): v-icon(color='error') mdi-trash-can-outline
                    v-list-item-title.body-2 {{$t('common:header.delete')}}

            //- LANGUAGES

            template(v-if='mode === `view` && locales.length > 0')
              v-menu(offset-y, bottom, transition='slide-y-transition', max-height='320px', min-width='210px', left)
                template(v-slot:activator='{ on: menu, attrs }')
                  v-tooltip(bottom)
                    template(v-slot:activator='{ on: tooltip }')
                      v-btn.cl-iconbtn(
                        icon
                        small
                        width='32'
                        height='32'
                        v-bind='attrs'
                        v-on='{ ...menu, ...tooltip }'
                        :aria-label='$t(`common:header.language`)'
                        )
                        v-icon(size='18') mdi-web
                    span {{$t('common:header.language')}}
                v-list(nav, :light='!$vuetify.theme.dark', :dark='$vuetify.theme.dark')
                  template(v-for='(lc, idx) of locales')
                    v-list-item(@click='changeLocale(lc)')
                      v-list-item-action(style='min-width:auto;'): v-chip(color='primary', :outlined='lc.code !== locale', small, label) {{lc.code.toUpperCase()}}
                      v-list-item-title {{lc.name}}

            //- THEME TOGGLE

            v-tooltip(bottom)
              template(v-slot:activator='{ on }')
                v-btn.cl-iconbtn(
                  icon
                  small
                  width='32'
                  height='32'
                  v-on='on'
                  @click='toggleTheme'
                  :aria-label='themeToggleLabel'
                  )
                  v-icon(size='18') {{ $vuetify.theme.dark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}
              span {{themeToggleLabel}}

            //- ADMIN

            template(v-if='isAuthenticated && isAdmin')
              v-tooltip(bottom, v-if='mode !== `admin`')
                template(v-slot:activator='{ on }')
                  v-btn.cl-iconbtn(icon, small, width='32', height='32', v-on='on', href='/a', :aria-label='$t(`common:header.admin`)')
                    v-icon(size='18') mdi-cog
                span {{$t('common:header.admin')}}
              v-btn.cl-iconbtn.cl-iconbtn--label(v-else, text, small, height='32', href='/', :aria-label='$t(`common:actions.exit`)')
                v-icon(left, size='18') mdi-exit-to-app
                span {{$t('common:actions.exit')}}

            //- ACCOUNT

            v-menu(v-if='isAuthenticated', offset-y, bottom, min-width='300', transition='slide-y-transition', left)
              template(v-slot:activator='{ on: menu, attrs }')
                v-tooltip(bottom)
                  template(v-slot:activator='{ on: tooltip }')
                    v-btn.cl-account(
                      text
                      small
                      height='32'
                      v-bind='attrs'
                      v-on='{ ...menu, ...tooltip }'
                      :aria-label='$t(`common:header.account`)'
                      )
                      v-avatar.cl-avatar(size='28')
                        span.cl-avatar-initials(v-if='picture.kind === `initials`') {{picture.initials}}
                        v-img(v-else-if='picture.kind === `image`', :src='picture.url')
                      v-icon.cl-account-chevron(small, color='white') mdi-chevron-down
                  span {{$t('common:header.account')}}
              v-list(nav, :light='!$vuetify.theme.dark', :dark='$vuetify.theme.dark')
                v-list-item.py-3.cl-account-head
                  v-list-item-avatar
                    v-avatar.cl-avatar(v-if='picture.kind === `initials`', :size='40')
                      span.cl-avatar-initials {{picture.initials}}
                    v-avatar(v-else-if='picture.kind === `image`', :size='40')
                      v-img(:src='picture.url')
                  v-list-item-content
                    v-list-item-title {{name}}
                    v-list-item-subtitle {{email}}
                v-list-item(href='/p')
                  v-list-item-action: v-icon(color='primary') mdi-face-profile
                  v-list-item-content
                    v-list-item-title {{$t('common:header.profile')}}
                v-list-item(@click='logout')
                  v-list-item-action: v-icon(color='error') mdi-logout
                  v-list-item-title.error--text {{$t('common:header.logout')}}

            v-tooltip(v-else, left)
              template(v-slot:activator='{ on }')
                v-btn.cl-iconbtn(icon, small, width='32', height='32', v-on='on', href='/login', :aria-label='$t(`common:header.login`)')
                  v-icon(size='18') mdi-account-circle
              span {{$t('common:header.login')}}

    page-selector(mode='create', v-model='newPageModal', :open-handler='pageNewCreate', :locale='locale')
    page-selector(mode='move', v-model='movePageModal', :open-handler='pageMoveRename', :path='path', :locale='locale')
    page-selector(mode='create', v-model='duplicateOpts.modal', :open-handler='pageDuplicateHandle', :path='duplicateOpts.path', :locale='duplicateOpts.locale')
    page-delete(v-model='deletePageModal', v-if='path && path.length')
    page-convert(v-model='convertPageModal', v-if='path && path.length')

    .nav-header-dev(v-if='isDevMode')
      v-icon mdi-alert
      div
        .overline DEVELOPMENT VERSION
        .overline This code base is NOT for production use!
</template>

<script>
import { get, sync } from 'vuex-pathify'
import _ from 'lodash'

import movePageMutation from 'gql/common/common-pages-mutation-move.gql'
import { setOverride } from '../../helpers/appearance'

/* global siteConfig, siteLangs */

export default {
  components: {
    PageDelete: () => import('./page-delete.vue'),
    PageConvert: () => import('./page-convert.vue')
  },
  props: {
    dense: {
      type: Boolean,
      default: false
    },
    hideSearch: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      menuIsShown: true,
      searchIsShown: true,
      searchAdvMenuShown: false,
      newPageModal: false,
      movePageModal: false,
      convertPageModal: false,
      deletePageModal: false,
      locales: siteLangs,
      isDevMode: false,
      duplicateOpts: {
        locale: 'en',
        path: 'new-page',
        modal: false
      }
    }
  },
  computed: {
    search: sync('site/search'),
    searchIsFocused: sync('site/searchIsFocused'),
    searchIsLoading: sync('site/searchIsLoading'),
    searchRestrictLocale: sync('site/searchRestrictLocale'),
    searchRestrictPath: sync('site/searchRestrictPath'),
    isLoading: get('isLoading'),
    title: get('site/title'),
    logoUrl: get('site/logoUrl'),
    path: get('page/path'),
    locale: get('page/locale'),
    mode: get('page/mode'),
    name: get('user/name'),
    email: get('user/email'),
    pictureUrl: get('user/pictureUrl'),
    isAuthenticated: get('user/authenticated'),
    permissions: get('user/permissions'),
    shortTitle () {
      const full = _.trim(this.title || '')
      const short = _.trim(full.replace(/^carbon\s+logica\b\s*[-–:|]?\s*/i, ''))
      return short.length > 0 ? short : full
    },
    themeToggleLabel () {
      return this.$vuetify.theme.dark ? 'Switch to light mode' : 'Switch to dark mode'
    },
    picture () {
      if (this.pictureUrl && this.pictureUrl.length > 1) {
        return {
          kind: 'image',
          url: (this.pictureUrl === 'internal') ? `/_userav/${this.$store.get('user/id')}` : this.pictureUrl
        }
      } else {
        const nameParts = this.name.toUpperCase().split(' ')
        let initials = _.head(nameParts).charAt(0)
        if (nameParts.length > 1) {
          initials += _.last(nameParts).charAt(0)
        }
        return {
          kind: 'initials',
          initials
        }
      }
    },
    isAdmin () {
      return _.intersection(this.permissions, ['manage:system', 'write:users', 'manage:users', 'write:groups', 'manage:groups', 'manage:navigation', 'manage:theme', 'manage:api']).length > 0
    },
    hasNewPagePermission () {
      return this.hasAdminPermission || _.intersection(this.permissions, ['write:pages']).length > 0
    },
    hasAdminPermission: get('page/effectivePermissions@system.manage'),
    hasWritePagesPermission: get('page/effectivePermissions@pages.write'),
    hasManagePagesPermission: get('page/effectivePermissions@pages.manage'),
    hasDeletePagesPermission: get('page/effectivePermissions@pages.delete'),
    hasReadSourcePermission: get('page/effectivePermissions@source.read'),
    hasReadHistoryPermission: get('page/effectivePermissions@history.read'),
    hasAnyPagePermissions () {
      return this.hasAdminPermission || this.hasWritePagesPermission || this.hasManagePagesPermission ||
        this.hasDeletePagesPermission || this.hasReadSourcePermission || this.hasReadHistoryPermission
    }
  },
  created () {
    if (this.hideSearch || this.dense || this.$vuetify.breakpoint.smAndDown) {
      this.searchIsShown = false
    }
  },
  mounted () {
    this.$root.$on('pageEdit', () => {
      this.pageEdit()
    })
    this.$root.$on('pageHistory', () => {
      this.pageHistory()
    })
    this.$root.$on('pageSource', () => {
      this.pageSource()
    })
    this.$root.$on('pageMove', () => {
      this.pageMove()
    })
    this.$root.$on('pageConvert', () => {
      this.pageConvert()
    })
    this.$root.$on('pageDuplicate', () => {
      this.pageDuplicate()
    })
    this.$root.$on('pageDelete', () => {
      this.pageDelete()
    })
    this.isDevMode = siteConfig.devMode === true
    window.addEventListener('keydown', this.searchHotkey)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.searchHotkey)
  },
  methods: {
    searchHotkey (ev) {
      if (ev.key !== '/' || ev.ctrlKey || ev.metaKey || ev.altKey) {
        return
      }
      const el = ev.target
      const tag = (el && el.tagName) ? el.tagName.toLowerCase() : ''
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (el && el.isContentEditable)) {
        return
      }
      if (!this.searchIsShown || !this.$refs.searchField) {
        return
      }
      ev.preventDefault()
      this.$refs.searchField.focus()
    },
    toggleTheme () {
      const dark = !this.$vuetify.theme.dark
      this.$vuetify.theme.dark = dark
      setOverride(dark ? 'dark' : 'light')
    },
    searchFocus () {
      this.searchIsFocused = true
    },
    searchBlur () {
      this.searchIsFocused = false
    },
    searchClose () {
      this.search = ''
      this.searchBlur()
    },
    searchToggle () {
      this.searchIsShown = !this.searchIsShown
      if (this.searchIsShown) {
        _.delay(() => {
          this.$refs.searchFieldMobile.focus()
        }, 200)
      }
    },
    searchEnter () {
      this.$root.$emit('searchEnter', true)
    },
    searchMove(dir) {
      this.$root.$emit('searchMove', dir)
    },
    pageNew () {
      this.newPageModal = true
    },
    pageNewCreate ({ path, locale }) {
      window.location.assign(`/e/${locale}/${path}`)
    },
    pageView () {
      window.location.assign(`/${this.locale}/${this.path}`)
    },
    pageEdit () {
      window.location.assign(`/e/${this.locale}/${this.path}`)
    },
    pageHistory () {
      window.location.assign(`/h/${this.locale}/${this.path}`)
    },
    pageSource () {
      window.location.assign(`/s/${this.locale}/${this.path}`)
    },
    pageDuplicate () {
      const pathParts = this.path.split('/')
      this.duplicateOpts = {
        locale: this.locale,
        path: (pathParts.length > 1) ? _.initial(pathParts).join('/') + `/new-page` : `new-page`,
        modal: true
      }
    },
    pageDuplicateHandle ({ locale, path }) {
      window.location.assign(`/e/${locale}/${path}?from=${this.$store.get('page/id')}`)
    },
    pageConvert () {
      this.convertPageModal = true
    },
    pageMove () {
      this.movePageModal = true
    },
    async pageMoveRename ({ path, locale }) {
      this.$store.commit(`loadingStart`, 'page-move')
      try {
        const resp = await this.$apollo.mutate({
          mutation: movePageMutation,
          variables: {
            id: this.$store.get('page/id'),
            destinationLocale: locale,
            destinationPath: path
          }
        })
        if (_.get(resp, 'data.pages.move.responseResult.succeeded', false)) {
          window.location.replace(`/${locale}/${path}`)
        } else {
          throw new Error(_.get(resp, 'data.pages.move.responseResult.message', this.$t('common:error.unexpected')))
        }
      } catch (err) {
        this.$store.commit('pushGraphError', err)
        this.$store.commit(`loadingStop`, 'page-move')
      }
    },
    pageDelete () {
      this.deletePageModal = true
    },
    assets () {
      // window.location.assign(`/f`)
      this.$store.commit('showNotification', {
        style: 'primary',
        message: `Coming soon...`,
        icon: 'ferry'
      })
    },
    async changeLocale (locale) {
      await this.$i18n.i18next.changeLanguage(locale.code)
      switch (this.mode) {
        case 'view':
        case 'history':
          window.location.assign(`/${locale.code}/${this.path}`)
          break
      }
    },
    logout () {
      window.location.assign('/logout')
    },
    goHome () {
      if (this.locales && this.locales.length > 0) {
        window.location.assign(`/${this.locale}/home`)
      } else {
        window.location.assign('/')
      }
    }
  }
}
</script>

<style lang='scss'>

// Carbon Logica top bar: navy, 2 px green rule, reversed wordmark, 32 px bordered icon buttons.
.nav-header {
  background-color: $cl-navy !important;
  box-shadow: inset 0 -2px 0 $cl-green !important;

  .v-toolbar__extension {
    padding: 0;

    .v-toolbar__content {
      padding: 0;
    }
    .v-text-field .v-input__prepend-inner {
      padding: 0 14px 0 5px;
      padding-right: 14px;
    }
  }

  &-inner {
    background: transparent !important;

    .v-toolbar__content {
      padding: 0;
    }
  }

  // ---- Brand: wordmark (leaf on small screens), divider, short site title ----
  .cl-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .cl-wordmark {
    height: 40px;
    width: auto;
    cursor: pointer;
    display: block;
    flex: none;
  }
  .cl-leaf {
    height: 32px;
    width: 32px;
    cursor: pointer;
    display: block;
    flex: none;
  }
  .cl-divider {
    width: 1px;
    height: 28px;
    background: $cl-dark-border;
    flex: none;
  }
  .cl-site-title {
    font-family: $cl-font;
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.2;
    color: $cl-white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  // ---- Search field (desktop centre column and mobile extension) ----
  .cl-search {
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
    font-family: $cl-font;

    > .v-input__control {
      min-height: 36px !important;
    }
    > .v-input__control > .v-input__slot {
      min-height: 36px !important;
      height: 36px;
      padding: 0 8px 0 12px !important;
      background: $cl-dark-page !important;
      border: 1px solid $cl-dark-border-strong;
      border-radius: $cl-radius-md !important;
      box-shadow: none !important;
      transition: border-color 120ms ease, box-shadow 120ms ease;
    }
    &.v-input--is-focused > .v-input__control > .v-input__slot {
      border-color: $cl-green !important;
      box-shadow: 0 0 0 3px $cl-green-ring !important;
    }
    input {
      font-family: $cl-font;
      font-size: 14px;
      color: $cl-white !important;
      caret-color: $cl-white;
    }
    .v-label {
      font-family: $cl-font;
      font-size: 14px;
      color: $cl-dark-muted !important;
    }
    .v-input__prepend-inner {
      margin-top: 0 !important;
      align-self: center;
      padding-right: 8px;

      .v-icon {
        font-size: 18px;
        color: $cl-dark-muted !important;
      }
    }
    &.v-input--is-focused .v-input__prepend-inner .v-icon {
      color: $cl-green !important;
    }
    .v-input__append-inner {
      margin-top: 0 !important;
      align-self: center;
    }
    .v-input__icon--clear .v-icon {
      color: $cl-dark-muted !important;
    }
    .v-progress-linear {
      border-radius: 0 0 $cl-radius-md $cl-radius-md;
    }
  }
  .cl-kbd {
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 6px;
    border: 1px solid $cl-dark-border;
    border-radius: $cl-radius-sm;
    background: $cl-dark-sunken;
    font-family: $cl-font-mono;
    font-size: 11px;
    line-height: 1;
    color: $cl-dark-muted;
    box-shadow: none;
  }
  .cl-search-mobile {
    background-color: $cl-navy !important;

    .cl-search {
      max-width: none;
      margin: 0 12px;
    }
  }

  // ---- Right-hand actions ----
  .cl-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cl-iconbtn.v-btn {
    color: $cl-white !important;
    border: 1px solid $cl-dark-border-strong;
    border-radius: $cl-radius-md !important;
    background: transparent;

    &::before {
      border-radius: $cl-radius-md;
    }
    .v-icon {
      color: $cl-white !important;
    }
    &:hover, &:focus {
      border-color: $cl-dark-muted;
    }
  }
  .cl-iconbtn--label.v-btn {
    padding: 0 12px 0 8px;
    font-size: 14px;
  }
  .cl-newpage.v-btn {
    padding: 0 12px;
    font-size: 14px;
  }
  .cl-account.v-btn {
    min-width: 0;
    padding: 0 4px 0 2px;
    border-radius: $cl-radius-md;

    &::before {
      border-radius: $cl-radius-md;
    }
  }
  .cl-account-chevron {
    margin-left: 4px;
  }
  .cl-avatar.v-avatar {
    background-color: $cl-green;
  }
  .cl-avatar-initials {
    font-family: $cl-font;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: $cl-navy;
  }

  &-search-adv {
    position: absolute;
    top: 7px;
    right: 12px;
    border-radius: 4px !important;

    @at-root .v-application--is-rtl & {
      right: initial;
      left: 12px;
    }

    &::before {
      border-radius: 4px !important;
    }

    &:hover, &:focus {
      position: absolute !important;

      &::before {
        border-radius: 4px;
      }
    }
  }

  &-dev {
    background-color: $cl-warn;
    color: $cl-white;
    position: absolute;
    top: 11px;
    left: 255px;
    padding: 5px 15px;
    border-radius: 5px;
    display: flex;

    .v-icon {
      margin-right: 15px;
      color: $cl-white !important;
    }

    .overline {
      color: $cl-white !important;
    }
    .overline:nth-child(2) {
      text-transform: none;
    }
  }
}

// Account menu (rendered outside .nav-header by v-menu)
.cl-account-head.v-list-item {
  background-color: var(--cl-sunken);

  .cl-avatar.v-avatar {
    background-color: $cl-green;
  }
  .cl-avatar-initials {
    font-family: $cl-font;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: $cl-navy;
  }
  .v-list-item__title {
    font-weight: 700;
    color: var(--cl-heading);
  }
  .v-list-item__subtitle {
    color: var(--cl-muted);
  }
}

.navHeaderSearch {
  &-enter-active, &-leave-active {
    transition: opacity .25s ease, transform .25s ease;
    opacity: 1;
  }
  &-enter-active {
    transition-delay: .25s;
  }
  &-enter, &-leave-to {
    opacity: 0;
    transform: scale(.7, .7);
  }
}
.navHeaderLoading { // To avoid search bar jumping
  width: 22px;
}

</style>
