<template lang='pug'>
  v-container.admin-dashboard(fluid, grid-list-lg)
    v-layout(row, wrap)
      v-flex(xs12)
        .admin-dashboard-header
          h1.admin-dashboard-title.animated.fadeInLeft {{ $t('admin:dashboard.title') }}
          .admin-dashboard-subtitle.animated.fadeInLeft.wait-p2s {{ $t('admin:dashboard.subtitle') }}

      //- Stat tiles
      v-flex(xs12, sm6, lg3, d-flex)
        .admin-stat.animated.fadeInUp
          .admin-stat-label {{$t('admin:dashboard.pages')}}
          animated-number.admin-stat-value(
            :value='info.pagesTotal'
            :duration='2000'
            :formatValue='round'
            easing='easeOutQuint'
            )
      v-flex(xs12, sm6, lg3, d-flex)
        .admin-stat.animated.fadeInUp.wait-p2s
          .admin-stat-label {{$t('admin:dashboard.users')}}
          animated-number.admin-stat-value(
            :value='info.usersTotal'
            :duration='2000'
            :formatValue='round'
            easing='easeOutQuint'
            )
      v-flex(xs12, sm6, lg3, d-flex)
        .admin-stat.animated.fadeInUp.wait-p4s
          .admin-stat-label {{$t('admin:dashboard.groups')}}
          animated-number.admin-stat-value(
            :value='info.groupsTotal'
            :duration='2000'
            :formatValue='round'
            easing='easeOutQuint'
            )
      v-flex(xs12, sm6, lg3, d-flex)
        .admin-stat.animated.fadeInUp.wait-p6s(:class='isLatestVersion ? `is-good` : `is-warn`')
          v-btn.admin-stat-action.btn-animate-wrench(icon, small, to='system', v-if='hasPermission(`manage:system`)')
            v-icon(small) mdi-wrench
          .admin-stat-label Wiki.js
          .admin-stat-value {{info.currentVersion}}
          .admin-stat-note(v-if='isLatestVersion') {{$t('admin:dashboard.versionLatest')}}
          .admin-stat-note(v-else) {{$t('admin:dashboard.versionNew', { version: info.latestVersion })}}

      //- Update available
      v-flex(xs12, v-if='!isLatestVersion')
        v-alert.admin-dashboard-update.mb-0.animated.fadeInUp.wait-p6s(type='warning', icon='mdi-alert-outline')
          strong.mr-1 Update available.
          span {{$t('admin:dashboard.versionNew', { version: info.latestVersion })}}

      //- Recent pages / last logins
      v-flex(xs12, lg8)
        v-card.admin-dashboard-card.animated.fadeInUp.wait-p2s
          .admin-dashboard-card-head
            .admin-dashboard-card-title {{$t('admin:dashboard.recentPages')}}
          v-data-table.admin-dashboard-table(
            :items='recentPages'
            :headers='recentPagesHeaders'
            :loading='recentPagesLoading'
            hide-default-footer
            )
            template(slot='item', slot-scope='props')
              tr.is-clickable(:active='props.selected', @click='$router.push(`/pages/` + props.item.id)')
                td
                  .admin-dashboard-link {{ props.item.title }}
                td.admin-pages-path
                  span.admin-dashboard-locale {{ props.item.locale }}
                  span.admin-dashboard-path / {{ props.item.path }}
                td.text-right.admin-dashboard-date(width='250') {{ props.item.updatedAt | moment('calendar') }}

        v-card.admin-dashboard-card.mt-4.animated.fadeInUp.wait-p4s
          .admin-dashboard-card-head
            .admin-dashboard-card-title {{$t('admin:dashboard.lastLogins')}}
          v-data-table.admin-dashboard-table(
            :items='lastLogins'
            :headers='lastLoginsHeaders'
            :loading='lastLoginsLoading'
            hide-default-footer
            )
            template(slot='item', slot-scope='props')
              tr.is-clickable(:active='props.selected', @click='$router.push(`/users/` + props.item.id)')
                td
                  .admin-dashboard-link {{ props.item.name }}
                td.text-right.admin-dashboard-date(width='250') {{ props.item.lastLoginAt | moment('calendar') }}

      //- System info / contribute
      v-flex(xs12, lg4)
        v-card.admin-dashboard-card.animated.fadeInUp.wait-p4s
          v-card-text
            .admin-dashboard-card-title {{$t('admin:system.title')}}
            dl.admin-dashboard-dl
              dt {{$t('admin:system.currentVersion')}}
              dd Wiki.js {{info.currentVersion}}
              dt {{$t('admin:system.latestVersion')}}
              dd {{info.latestVersion}}
              dt {{$t('admin:tags.title')}}
              dd {{info.tagsTotal}}

        v-card.admin-dashboard-card.dashboard-contribute.mt-4.animated.fadeInUp.wait-p6s
          v-card-text
            .admin-dashboard-card-title {{$t('admin:contribute.title')}}
            .admin-dashboard-contribute-lead {{$t('admin:dashboard.contributeSubtitle')}}
            .admin-dashboard-contribute-help {{$t('admin:dashboard.contributeHelp')}}
            v-btn.mx-0.mt-4(outlined, small, to='/contribute') {{$t('admin:dashboard.contributeLearnMore')}}

</template>

<script>
import _ from 'lodash'
import AnimatedNumber from 'animated-number-vue'
import { get } from 'vuex-pathify'
import gql from 'graphql-tag'
import semverLte from 'semver/functions/lte'

export default {
  components: {
    AnimatedNumber
  },
  data() {
    return {
      recentPages: [],
      recentPagesLoading: false,
      recentPagesHeaders: [
        { text: 'Title', value: 'title' },
        { text: 'Path', value: 'path' },
        { text: 'Last Updated', value: 'updatedAt', width: 250, align: 'end' }
      ],
      lastLogins: [],
      lastLoginsLoading: false,
      lastLoginsHeaders: [
        { text: 'User', value: 'displayName' },
        { text: 'Last Login', value: 'lastLoginAt', width: 250, align: 'end' }
      ]
    }
  },
  computed: {
    isLatestVersion() {
      if (this.info.latestVersion === 'n/a' || this.info.currentVersion === 'n/a') {
        return true
      } else {
        return semverLte(this.info.latestVersion, this.info.currentVersion)
      }
    },
    info: get('admin/info'),
    permissions: get('user/permissions')
  },
  methods: {
    round(val) { return Math.round(val) },
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
    recentPages: {
      query: gql`
        query {
          pages {
            list(limit: 10, orderBy: UPDATED, orderByDirection: DESC) {
              id
              locale
              path
              title
              description
              contentType
              isPublished
              isPrivate
              privateNS
              createdAt
              updatedAt
            }
          }
        }
      `,
      update: (data) => data.pages.list,
      watchLoading (isLoading) {
        this.recentPagesLoading = isLoading
        this.$store.commit(`loading${isLoading ? 'Start' : 'Stop'}`, 'admin-dashboard-recentpages')
      }
    },
    lastLogins: {
      query: gql`
        query {
          users {
            lastLogins {
              id
              name
              lastLoginAt
            }
          }
        }
      `,
      fetchPolicy: 'network-only',
      update: (data) => data.users.lastLogins,
      watchLoading (isLoading) {
        this.lastLoginsLoading = isLoading
        this.$store.commit(`loading${isLoading ? 'Start' : 'Stop'}`, 'admin-dashboard-lastlogins')
      }
    }
  }
}
</script>

<style lang='scss'>

.admin-dashboard {
  &-header {
    margin-bottom: 4px;
  }

  &-title {
    font-family: $cl-font;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -.02em;
    color: var(--cl-heading);
    margin: 0;
  }

  &-subtitle {
    font-size: 14px;
    color: var(--cl-muted);
    margin-top: 4px;
  }

  // Cards
  &-card {
    width: 100%;

    &-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--cl-border);
    }

    &-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--cl-heading);
    }
  }

  // Tables (header / row rules come from cl-theme .v-data-table)
  &-table {
    border-radius: 0 0 $cl-radius-lg $cl-radius-lg;

    .v-data-table__wrapper > table > thead > tr > th {
      height: 40px;
    }
    .v-data-table__wrapper > table > tbody > tr > td {
      height: 40px;
    }
  }

  &-link {
    font-size: 14px;
    font-weight: 600;
    color: var(--cl-link);
  }

  &-locale {
    display: inline-block;
    padding: 0 6px;
    margin-right: 8px;
    font-size: 11px;
    font-weight: 600;
    line-height: 18px;
    text-transform: uppercase;
    color: var(--cl-muted);
    background-color: var(--cl-sunken);
    border: 1px solid var(--cl-border);
    border-radius: $cl-radius-sm;
  }

  &-path {
    font-family: $cl-font-mono;
    font-size: 13px;
    color: var(--cl-text);
  }

  &-date {
    font-size: 13px;
    color: var(--cl-muted);
  }

  // Definition list
  &-dl {
    margin: 12px 0 0;

    dt {
      font-size: 12px;
      color: var(--cl-muted);
      margin-top: 10px;
    }
    dt:first-child {
      margin-top: 0;
    }
    dd {
      font-size: 14px;
      color: var(--cl-text);
      margin: 2px 0 0;
    }
  }

  // Update available (border, tint and icon colour come from cl-theme .v-alert.warning)
  &-update {
    font-size: 14px;

    strong {
      color: var(--cl-warn);
    }
  }

  &-contribute-lead {
    font-size: 14px;
    font-weight: 700;
    color: var(--cl-heading);
    margin-top: 12px;
  }

  &-contribute-help {
    font-size: 14px;
    color: var(--cl-text);
    margin-top: 4px;
  }
}

// Stat tiles
.admin-stat {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  min-height: 66px;
  padding: 8px 12px;
  background-color: var(--cl-surface);
  border: 1px solid var(--cl-border);
  border-radius: $cl-radius-lg;
  box-shadow: var(--cl-shadow-sm);

  &-label {
    font-size: 10.5px;
    font-weight: 400;
    letter-spacing: .04em;
    text-transform: uppercase;
    color: var(--cl-muted);
    line-height: 1.3;
  }

  &-value {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--cl-heading);
    margin-top: 2px;
  }

  &-note {
    font-size: 10.5px;
    color: var(--cl-muted);
    line-height: 1.3;
    margin-top: 2px;
  }

  &-action {
    position: absolute;
    top: 6px;
    right: 6px;
    color: var(--cl-muted) !important;

    @at-root .v-application--is-rtl & {
      left: 6px;
      right: auto;
    }
  }

  &.is-good {
    background-color: var(--cl-good-bg);
    border-color: var(--cl-good);

    .admin-stat-value {
      color: var(--cl-good);
    }
  }

  &.is-warn {
    background-color: var(--cl-warn-bg);
    border-color: var(--cl-warn);

    .admin-stat-value {
      color: var(--cl-warn);
    }
  }
}

</style>
