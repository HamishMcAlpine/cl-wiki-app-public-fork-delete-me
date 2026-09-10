<template lang='pug'>
  v-app(:dark='$vuetify.theme.dark').profile
    nav-header

    v-content
      .profile-page
        //- Identity header
        .profile-identity
          v-avatar.profile-identity-avatar(v-if='picture.kind === `image`', size='64')
            v-img(:src='picture.url')
          v-avatar.profile-identity-avatar.is-initials(v-else, size='64')
            span {{picture.initials}}
          .profile-identity-text
            h1.profile-identity-name {{ userName }}
            .profile-identity-email {{ userEmail }}

        //- Section tabs
        v-tabs.profile-tabs(background-color='transparent', height='44')
          v-tab(to='/profile', exact)
            v-icon(left, size='18') mdi-face-profile
            span {{$t('profile:title')}}
          v-tab(to='/pages', exact)
            v-icon(left, size='18') mdi-file-document-outline
            span {{$t('profile:pages.title')}}
          //- v-tab(to='/comments', disabled)
          //-   v-icon(left, size='18') mdi-message-reply-text
          //-   span {{$t('profile:comments.title')}}

        transition(name='profile-router')
          router-view

    nav-footer
    notify
    search-results
</template>

<script>
import VueRouter from 'vue-router'
import { get } from 'vuex-pathify'
import _ from 'lodash'

/* global WIKI */

const router = new VueRouter({
  mode: 'history',
  base: '/p',
  routes: [
    { path: '/', redirect: '/profile' },
    { path: '/profile', component: () => import(/* webpackChunkName: "profile" */ './profile/profile.vue') },
    { path: '/pages', component: () => import(/* webpackChunkName: "profile" */ './profile/pages.vue') },
    { path: '/comments', component: () => import(/* webpackChunkName: "profile" */ './profile/comments.vue') }
  ]
})

router.beforeEach((to, from, next) => {
  WIKI.$store.commit('loadingStart', 'profile')
  next()
})

router.afterEach((to, from) => {
  WIKI.$store.commit('loadingStop', 'profile')
})

export default {
  i18nOptions: { namespaces: 'profile' },
  data() {
    return {
      profileDrawerShown: true
    }
  },
  computed: {
    userName: get('user/name'),
    userEmail: get('user/email'),
    pictureUrl: get('user/pictureUrl'),
    picture () {
      if (this.pictureUrl && this.pictureUrl.length > 1) {
        return {
          kind: 'image',
          url: this.pictureUrl
        }
      } else {
        const nameParts = (this.userName || '?').toUpperCase().split(' ')
        let initials = _.head(nameParts).charAt(0)
        if (nameParts.length > 1) {
          initials += _.last(nameParts).charAt(0)
        }
        return {
          kind: 'initials',
          initials
        }
      }
    }
  },
  router,
  created() {
    this.$store.commit('page/SET_MODE', 'profile')
  }
}
</script>

<style lang='scss'>

.profile-router {
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

.profile {
  &-page {
    width: 100%;
    max-width: 1120px;
    margin: 0 auto;
    padding: 32px 40px 40px;
    font-family: $cl-font;
    color: var(--cl-text);

    @media screen and (max-width: 959px) {
      padding: 16px 16px 32px;
    }
  }

  // ---- Identity header ----
  &-identity {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 16px;

    &-avatar {
      flex: none;

      &.is-initials {
        background-color: $cl-green;
        color: $cl-navy;
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }
    }
    &-text {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    &-name {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.02em;
      color: var(--cl-heading);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &-email {
      font-size: 14px;
      color: var(--cl-muted);
    }
  }

  // ---- Tabs ----
  &-tabs {
    margin-bottom: 24px;
    border-bottom: 1px solid var(--cl-border);

    .v-tab {
      padding: 0 2px;
      margin-right: 24px;
      min-width: 0;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0;
      text-transform: none;
      color: var(--cl-muted) !important;

      .v-icon {
        color: inherit;
      }
      &.v-tab--active {
        color: var(--cl-heading) !important;
      }
    }
    .v-tabs-slider {
      background-color: $cl-green;
    }
  }

  // ---- Section header row (per view) ----
  &-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;

    &-title {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    &-heading {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      line-height: 1.3;
      color: var(--cl-heading);
    }
    &-sub {
      font-size: 14px;
      color: var(--cl-muted);
    }
  }

  // ---- Cards ----
  &-card {
    &-head {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 16px 16px 8px;
    }
    &-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--cl-heading);
    }
    &-sub {
      font-size: 12px;
      color: var(--cl-muted);
    }
  }
  .v-list-item__title {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--cl-muted);
  }
  .v-list-item__subtitle {
    font-size: 14px;
    color: var(--cl-text) !important;
  }
  .v-list-item__avatar .v-icon {
    color: var(--cl-accent-deep);
  }
  &-hint {
    font-size: 12px;
    line-height: 1.5;
    color: var(--cl-muted);
  }
  &-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--cl-accent-deep);
  }
  &-provider {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid var(--cl-border);
    border-radius: $cl-radius-md;
    background-color: var(--cl-sunken);
    font-size: 14px;
    color: var(--cl-text);

    .v-icon {
      color: var(--cl-accent-deep);
    }
  }
  &-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 0;
    border-bottom: 1px solid var(--cl-border);

    &:last-child {
      border-bottom: 0;
    }
    &-label {
      font-size: 12px;
      color: var(--cl-muted);
    }
    &-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--cl-heading);
    }
  }
}

</style>
