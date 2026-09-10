<template lang='pug'>
  v-container(fluid, grid-list-lg)
    v-layout(row wrap)
      v-flex(xs12)
        .profile-header
          .profile-header-title
            h2.profile-header-heading {{$t('profile:pages.title')}}
            .profile-header-sub {{$t('profile:pages.subtitle')}}
          v-spacer
          v-btn(outlined, small, @click='refresh', title='Refresh')
            v-icon(size='18') mdi-refresh
      v-flex(xs12)
        v-card
          v-data-table(
            :items='pages'
            :headers='headers'
            :page.sync='pagination'
            :items-per-page='15'
            :loading='loading'
            must-sort,
            sort-by='updatedAt',
            sort-desc,
            hide-default-footer
          )
            template(slot='item', slot-scope='props')
              tr.is-clickable(:active='props.selected', @click='goToPage(props.item.id)')
                td
                  .profile-pages-title {{ props.item.title }}
                  .profile-pages-desc {{ props.item.description }}
                td.profile-pages-path
                  span.profile-pages-locale {{ props.item.locale }}
                  span.profile-pages-pathtext / {{ props.item.path }}
                td {{ props.item.createdAt | moment('calendar') }}
                td {{ props.item.updatedAt | moment('calendar') }}
            template(slot='no-data')
              v-alert.ma-3(icon='mdi-information-outline', :value='true', color='info', text)
                span.caption {{$t('profile:pages.emptyList')}}
          .text-center.py-2(v-if='this.pageTotal > 1')
            v-pagination(v-model='pagination', :length='pageTotal')
</template>

<script>
import gql from 'graphql-tag'

export default {
  data() {
    return {
      selectedPage: {},
      pagination: 1,
      pages: [],
      loading: false
    }
  },
  computed: {
    headers () {
      return [
        { text: this.$t('profile:pages.headerTitle'), value: 'title' },
        { text: this.$t('profile:pages.headerPath'), value: 'path' },
        { text: this.$t('profile:pages.headerCreatedAt'), value: 'createdAt', width: 250 },
        { text: this.$t('profile:pages.headerUpdatedAt'), value: 'updatedAt', width: 250 }
      ]
    },
    pageTotal () {
      return Math.ceil(this.pages.length / 15)
    }
  },
  methods: {
    async refresh() {
      await this.$apollo.queries.pages.refetch()
      this.$store.commit('showNotification', {
        message: this.$t('profile:pages.refreshSuccess'),
        style: 'success',
        icon: 'cached'
      })
    },
    goToPage(id) {
      window.location.assign(`/i/` + id)
    }
  },
  apollo: {
    pages: {
      query: gql`
        query($creatorId: Int, $authorId: Int) {
          pages {
            list(creatorId: $creatorId, authorId: $authorId) {
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
      variables () {
        return {
          creatorId: this.$store.get('user/id'),
          authorId: this.$store.get('user/id')
        }
      },
      fetchPolicy: 'network-only',
      update: (data) => data.pages.list,
      watchLoading (isLoading) {
        this.loading = isLoading
        this.$store.commit(`loading${isLoading ? 'Start' : 'Stop'}`, 'profile-pages-refresh')
      }
    }
  }
}
</script>

<style lang='scss'>

.profile-pages {
  &-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--cl-heading);
  }
  &-desc {
    font-size: 12px;
    color: var(--cl-muted);
  }
  &-path {
    font-family: $cl-font-mono;
    font-size: 12px;
    color: var(--cl-muted);
  }
  &-locale {
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 6px;
    margin-right: 6px;
    border: 1px solid var(--cl-border);
    border-radius: $cl-radius-sm;
    background-color: var(--cl-sunken);
    color: var(--cl-heading);
    font-family: $cl-font;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }
}

</style>
