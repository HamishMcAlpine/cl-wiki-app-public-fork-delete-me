<template lang='pug'>
  v-app(:dark='$vuetify.theme.dark').source
    nav-header
    v-content
      .source-page
        //- Page header
        .source-header
          .source-header-main
            i18next.source-title(v-if='versionId > 0', path='common:page.viewingSourceVersion', tag='h1')
              strong(place='date', :title='$options.filters.moment(versionDate, `LLL`)') {{versionDate | moment('lll')}}
              strong(place='path') /{{path}}
            i18next.source-title(v-else, path='common:page.viewingSource', tag='h1')
              strong(place='path') /{{path}}
            .source-header-meta(v-if='$vuetify.breakpoint.mdAndUp')
              span {{$t('common:page.id', { id: pageId })}}
              template(v-if='versionId > 0')
                span.source-header-meta-sep
                span {{$t('common:page.versionId', { id: versionId })}}
          .source-header-actions
            v-btn(v-if='versionId > 0', outlined, small, @click='goHistory', title='History')
              v-icon(size='18') mdi-history
            v-btn(outlined, small, @click='goLive')
              v-icon(left, size='18') mdi-arrow-left
              span {{$t('common:page.returnNormalView')}}

        .source-card
          pre
            slot

    nav-footer
    notify
    search-results
</template>

<script>
export default {
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
    versionId: {
      type: Number,
      default: 0
    },
    versionDate: {
      type: String,
      default: ''
    },
    effectivePermissions: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  },
  created () {
    this.$store.commit('page/SET_ID', this.id)
    this.$store.commit('page/SET_LOCALE', this.locale)
    this.$store.commit('page/SET_PATH', this.path)

    this.$store.commit('page/SET_MODE', 'source')

    if (this.effectivePermissions) {
      this.$store.set('page/effectivePermissions', JSON.parse(Buffer.from(this.effectivePermissions, 'base64').toString()))
    }
  },
  methods: {
    goLive() {
      window.location.assign(`/${this.locale}/${this.path}`)
    },
    goHistory () {
      window.location.assign(`/h/${this.locale}/${this.path}`)
    }
  }
}
</script>

<style lang='scss'>

.source {
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

    strong {
      font-weight: 700;
      color: var(--cl-accent-deep);
    }
  }

  // ---- Code container ----
  &-card {
    background-color: var(--cl-sunken);
    border: 1px solid var(--cl-border);
    border-radius: $cl-radius-lg;
    padding: 16px 20px;
    overflow-x: auto;
  }

  pre {
    margin: 0;
    padding: 0;
    background: transparent;
    font-family: $cl-font-mono;
    font-size: 14px;
    line-height: 1.6;
    color: var(--cl-text);
    white-space: pre;
  }

  pre > code {
    display: block;
    box-shadow: none;
    background-color: transparent;
    color: var(--cl-text);
    font-family: $cl-font-mono;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.6;
    padding: 0;

    &::before,
    &::after {
      display: none;
    }
  }
}

</style>
