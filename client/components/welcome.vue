<template lang='pug'>
  v-app
    .onboarding
      .onboarding-content
        img.onboarding-wordmark(:src='wordmarkUrl', alt='Carbon Logica')
        .onboarding-label Welcome
        h1.onboarding-title {{ $t('welcome.title') }}
        p.onboarding-text {{ $t('welcome.subtitle') }}
        .onboarding-actions
          v-btn(color='primary', depressed, :href='`/e/` + locale + `/home`')
            v-icon(left, size='18') mdi-plus
            span {{ $t('welcome.createhome') }}
          v-btn(outlined, href='/a')
            v-icon(left, size='18') mdi-view-dashboard
            span {{ $t('welcome.goadmin') }}

</template>

<script>

export default {
  props: {
    locale: {
      type: String,
      default: 'en'
    }
  },
  data() {
    return { }
  },
  computed: {
    wordmarkUrl () {
      return this.$vuetify.theme.dark ? '/_assets/img/cl/carbon-logica-logo-reversed.png' : '/_assets/img/cl/carbon-logica-logo.png'
    }
  }
}
</script>

<style lang='scss'>

</style>
