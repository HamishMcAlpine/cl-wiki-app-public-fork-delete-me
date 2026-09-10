<template lang='pug'>
  v-app.admin
    nav-header(hide-search)
      template(slot='mid')
        v-spacer
        .overline.admin-area-label {{$t('admin:adminArea')}}
        v-spacer
    v-navigation-drawer.pb-0.admin-sidebar(v-model='adminDrawerShown', app, fixed, clipped, :right='$vuetify.rtl', permanent, width='260')
      vue-scroll(:ops='scrollStyle')
        v-list.radius-0(dense, nav)
          v-list-item(to='/dashboard')
            v-list-item-avatar(size='24', tile): v-icon mdi-view-dashboard-variant
            v-list-item-title {{ $t('admin:dashboard.title') }}
          template(v-if='hasPermission([`manage:system`, `manage:navigation`, `write:pages`, `manage:pages`, `delete:pages`])')
            v-divider.my-2
            v-subheader.pl-4 {{ $t('admin:nav.site') }}
            v-list-item(to='/general', v-if='hasPermission(`manage:system`)')
              v-list-item-avatar(size='24', tile): v-icon mdi-widgets
              v-list-item-title {{ $t('admin:general.title') }}
            v-list-item(to='/locale', v-if='hasPermission(`manage:system`)')
              v-list-item-avatar(size='24', tile): v-icon mdi-web
              v-list-item-title {{ $t('admin:locale.title') }}
            v-list-item(to='/navigation', v-if='hasPermission([`manage:system`, `manage:navigation`])')
              v-list-item-avatar(size='24', tile): v-icon mdi-near-me
              v-list-item-title {{ $t('admin:navigation.title') }}
            v-list-item(to='/pages', v-if='hasPermission([`manage:system`, `write:pages`, `manage:pages`, `delete:pages`])')
              v-list-item-avatar(size='24', tile): v-icon mdi-file-document-outline
              v-list-item-title {{ $t('admin:pages.title') }}
              v-list-item-action(style='min-width:auto;')
                v-chip.admin-sidebar-count(x-small)
                  .caption {{ info.pagesTotal }}
            v-list-item(to='/tags', v-if='hasPermission([`manage:system`])')
              v-list-item-avatar(size='24', tile): v-icon mdi-tag-multiple
              v-list-item-title {{ $t('admin:tags.title') }}
              v-list-item-action(style='min-width:auto;')
                v-chip.admin-sidebar-count(x-small)
                  .caption {{ info.tagsTotal }}
            v-list-item(to='/theme', v-if='hasPermission([`manage:system`, `manage:theme`])')
              v-list-item-avatar(size='24', tile): v-icon mdi-palette-outline
              v-list-item-title {{ $t('admin:theme.title') }}
          template(v-if='hasPermission([`manage:system`, `manage:groups`, `write:groups`, `manage:users`, `write:users`])')
            v-divider.my-2
            v-subheader.pl-4 {{ $t('admin:nav.users') }}
            v-list-item(to='/groups', v-if='hasPermission([`manage:system`, `manage:groups`, `write:groups`])')
              v-list-item-avatar(size='24', tile): v-icon mdi-account-group
              v-list-item-title {{ $t('admin:groups.title') }}
              v-list-item-action(style='min-width:auto;')
                v-chip.admin-sidebar-count(x-small)
                  .caption {{ info.groupsTotal }}
            v-list-item(to='/users', v-if='hasPermission([`manage:system`, `manage:groups`, `write:groups`, `manage:users`, `write:users`])')
              v-list-item-avatar(size='24', tile): v-icon mdi-account-box
              v-list-item-title {{ $t('admin:users.title') }}
              v-list-item-action(style='min-width:auto;')
                v-chip.admin-sidebar-count(x-small)
                  .caption {{ info.usersTotal }}
          template(v-if='hasPermission(`manage:system`)')
            v-divider.my-2
            v-subheader.pl-4 {{ $t('admin:nav.modules') }}
            v-list-item(to='/analytics')
              v-list-item-avatar(size='24', tile): v-icon mdi-chart-timeline-variant
              v-list-item-title {{ $t('admin:analytics.title') }}
            v-list-item(to='/auth')
              v-list-item-avatar(size='24', tile): v-icon mdi-lock-outline
              v-list-item-title {{ $t('admin:auth.title') }}
            v-list-item(to='/comments')
              v-list-item-avatar(size='24', tile): v-icon mdi-comment-text-outline
              v-list-item-title {{ $t('admin:comments.title') }}
            v-list-item(to='/rendering')
              v-list-item-avatar(size='24', tile): v-icon mdi-cogs
              v-list-item-title {{ $t('admin:rendering.title') }}
            v-list-item(to='/search')
              v-list-item-avatar(size='24', tile): v-icon mdi-cloud-search-outline
              v-list-item-title {{ $t('admin:search.title') }}
            v-list-item(to='/storage')
              v-list-item-avatar(size='24', tile): v-icon mdi-harddisk
              v-list-item-title {{ $t('admin:storage.title') }}
          template(v-if='hasPermission([`manage:system`, `manage:api`])')
            v-divider.my-2
            v-subheader.pl-4 {{ $t('admin:nav.system') }}
            v-list-item(to='/api', v-if='hasPermission([`manage:system`, `manage:api`])')
              v-list-item-avatar(size='24', tile): v-icon mdi-call-split
              v-list-item-title {{ $t('admin:api.title') }}
            v-list-item(to='/mail', v-if='hasPermission(`manage:system`)')
              v-list-item-avatar(size='24', tile): v-icon mdi-email-multiple-outline
              v-list-item-title {{ $t('admin:mail.title') }}
            v-list-item(to='/security', v-if='hasPermission(`manage:system`)')
              v-list-item-avatar(size='24', tile): v-icon mdi-lock-check
              v-list-item-title {{ $t('admin:security.title') }}
            v-list-item(to='/ssl', v-if='hasPermission(`manage:system`)')
              v-list-item-avatar(size='24', tile): v-icon mdi-cloud-lock-outline
              v-list-item-title {{ $t('admin:ssl.title') }}
            v-list-item(to='/system', v-if='hasPermission(`manage:system`)')
              v-list-item-avatar(size='24', tile): v-icon mdi-tune
              v-list-item-title {{ $t('admin:system.title') }}
            v-list-item(to='/utilities', v-if='hasPermission(`manage:system`)')
              v-list-item-avatar(size='24', tile): v-icon mdi-wrench-outline
              v-list-item-title {{ $t('admin:utilities.title') }}
            v-list-group(
              to='/dev'
              no-action
              v-if='hasPermission([`manage:system`, `manage:api`])'
              )
              v-list-item(slot='activator')
                v-list-item-avatar(size='24', tile): v-icon mdi-dev-to
                v-list-item-title {{ $t('admin:dev.title') }}

              v-list-item(to='/dev-flags')
                v-list-item-title {{ $t('admin:dev.flags.title') }}
              v-list-item(href='/graphql')
                v-list-item-title GraphQL
              //- v-list-item(to='/dev-graphiql')
              //-   v-list-item-title {{ $t('admin:dev.graphiql.title') }}
              //- v-list-item(to='/dev-voyager')
              //-   v-list-item-title {{ $t('admin:dev.voyager.title') }}
            v-divider.my-2
          v-list-item(to='/contribute')
            v-list-item-avatar(size='24', tile): v-icon mdi-heart-outline
            v-list-item-title {{ $t('admin:contribute.title') }}

    v-main.admin-main
      transition(name='admin-router')
        router-view

    nav-footer
    notify
    search-results
</template>

<script>
import _ from 'lodash'
import VueRouter from 'vue-router'
import { get, sync } from 'vuex-pathify'

import statsQuery from 'gql/admin/dashboard/dashboard-query-stats.gql'

import adminStore from '../store/admin'

/* global WIKI */

WIKI.$store.registerModule('admin', adminStore)

const router = new VueRouter({
  mode: 'history',
  base: '/a',
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-dashboard.vue') },
    { path: '/general', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-general.vue') },
    { path: '/locale', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-locale.vue') },
    { path: '/navigation', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-navigation.vue') },
    { path: '/pages', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-pages.vue') },
    { path: '/pages/:id(\\d+)', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-pages-edit.vue') },
    { path: '/pages/visualize', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-pages-visualize.vue') },
    { path: '/tags', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-tags.vue') },
    { path: '/theme', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-theme.vue') },
    { path: '/groups', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-groups.vue') },
    { path: '/groups/:id(\\d+)', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-groups-edit.vue') },
    { path: '/users', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-users.vue') },
    { path: '/users/:id(\\d+)', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-users-edit.vue') },
    { path: '/analytics', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-analytics.vue') },
    { path: '/auth', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-auth.vue') },
    { path: '/comments', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-comments.vue') },
    { path: '/rendering', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-rendering.vue') },
    { path: '/editor', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-editor.vue') },
    { path: '/extensions', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-extensions.vue') },
    { path: '/logging', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-logging.vue') },
    { path: '/search', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-search.vue') },
    { path: '/storage', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-storage.vue') },
    { path: '/api', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-api.vue') },
    { path: '/mail', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-mail.vue') },
    { path: '/security', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-security.vue') },
    { path: '/ssl', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-ssl.vue') },
    { path: '/system', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-system.vue') },
    { path: '/utilities', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-utilities.vue') },
    { path: '/webhooks', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-webhooks.vue') },
    { path: '/dev-flags', component: () => import(/* webpackChunkName: "admin-dev" */ './admin/admin-dev-flags.vue') },
    { path: '/contribute', component: () => import(/* webpackChunkName: "admin" */ './admin/admin-contribute.vue') }
  ]
})

export default {
  i18nOptions: { namespaces: 'admin' },
  data() {
    return {
      adminDrawerShown: true,
      scrollStyle: {
        vuescroll: {},
        scrollPanel: {
          initialScrollY: 0,
          initialScrollX: 0,
          scrollingX: false,
          easing: 'easeOutQuad',
          speed: 1000,
          verticalNativeBarPos: this.$vuetify.rtl ? `left` : `right`
        },
        rail: {
          gutterOfEnds: '2px'
        },
        bar: {
          onlyShowBarOnScroll: false,
          background: '#D5DCE4',
          hoverStyle: {
            background: '#B9C4D0'
          }
        }
      }
    }
  },
  computed: {
    info: sync('admin/info'),
    permissions: get('user/permissions')
  },
  router,
  created() {
    this.$store.commit('page/SET_MODE', 'admin')
  },
  methods: {
    hasPermission(prm) {
      if (_.isArray(prm)) {
        return _.some(prm, p => {
          return _.includes(this.permissions, p)
        })
      } else {
        return _.includes(this.permissions, prm)
      }
    }
  },
  apollo: {
    info: {
      query: statsQuery,
      fetchPolicy: 'network-only',
      manual: true,
      result({ data, loading, networkStatus }) {
        this.info = data.system.info
      },
      watchLoading (isLoading) {
        this.$store.commit(`loading${isLoading ? 'Start' : 'Stop'}`, 'admin-stats-refresh')
      }
    }
  }
}
</script>

<style lang='scss'>

.admin {
  background-color: var(--cl-page) !important;

  .v-application--wrap {
    background-color: var(--cl-page);
  }
}

// "Administration" label sits on the navy top bar, so it uses the bright green
.admin-area-label {
  color: $cl-green !important;
}

.admin-main {
  background-color: var(--cl-page);
}

.admin-router {
  &-enter-active, &-leave-active {
    transition: opacity .25s ease;
    opacity: 1;
  }
  &-enter-active {
    transition-delay: .25s;
  }
  &-enter, &-leave-to {
    opacity: 0;
  }
}

// Admin drawer: light surface, 1 px rule, caps group labels, 36 px items
.admin-sidebar.v-navigation-drawer {
  background-color: var(--cl-surface) !important;

  .v-navigation-drawer__border {
    background-color: var(--cl-border) !important;
  }

  .v-list {
    background-color: transparent;
    padding: 8px 12px;
  }

  .v-subheader {
    height: 32px;
    padding: 0 12px !important;
    margin-top: 4px;
    font-family: $cl-font;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--cl-accent-deep);
  }

  .v-divider {
    border-color: var(--cl-border) !important;
  }

  .v-list-item {
    min-height: 36px;
    padding: 0 12px;
    margin-bottom: 2px;
    border-radius: $cl-radius-md;
    color: var(--cl-text);

    &::before {
      border-radius: $cl-radius-md;
    }

    .v-list-item__title {
      font-family: $cl-font;
      font-size: 14px;
      font-weight: 400;
      color: var(--cl-text);
    }

    .v-list-item__avatar {
      min-width: 18px;
      width: 18px;
      height: 18px;
      margin: 0 12px 0 0 !important;
    }

    .v-icon {
      font-size: 18px;
      color: var(--cl-muted);
    }

    &:hover::before {
      opacity: .04;
    }

    &.v-list-item--active {
      background-color: var(--cl-accent-pale);
      color: var(--cl-accent-deep) !important;

      &::before {
        opacity: 0;
      }

      .v-list-item__title {
        font-weight: 700;
        color: var(--cl-accent-deep);
      }

      .v-icon {
        color: var(--cl-accent-deep);
      }
    }
  }

  .v-list-group > .v-list-item {
    padding-left: 0;
  }

  .v-list-group__items .v-list-item {
    padding-left: 42px;
  }

  .admin-sidebar-count {
    height: 18px;
    padding: 0 6px;
    background-color: var(--cl-sunken) !important;
    border: 1px solid var(--cl-border);
    border-radius: $cl-radius-sm;

    .caption {
      font-size: 11px !important;
      font-weight: 600;
      color: var(--cl-muted);
    }
  }
}

.admin-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  &-title {
    margin-left: 1rem;
  }
}

.admin-providerlogo {
  width: 250px;
  height: 50px;
  float: right;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-left: 16px;

  img {
    max-width: 100%;
    max-height: 50px;
  }
}

.v-application.admin {
  code {
    box-shadow: none;
    font-family: $cl-font-mono;
    font-size: .85em;
    color: var(--cl-accent-deep);
    background-color: var(--cl-sunken);
    border: 1px solid var(--cl-border);
    border-radius: $cl-radius-sm;
  }
}

</style>
