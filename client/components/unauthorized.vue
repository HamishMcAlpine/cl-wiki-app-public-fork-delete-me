<template lang='pug'>
  v-app
    .unauthorized
      .unauthorized-content
        img.unauthorized-wordmark(:src='wordmarkUrl', alt='Carbon Logica')
        .unauthorized-label Access
        h1.unauthorized-title {{$t('unauthorized.title')}}
        p.unauthorized-text {{$t('unauthorized.action.' + action)}}
        .unauthorized-actions
          v-btn(color='primary', depressed, href='/login')
            v-icon(left, size='18') mdi-login
            span {{$t('unauthorized.login')}}
          v-btn(outlined, href='javascript:window.history.go(-1);')
            v-icon(left, size='18') mdi-arrow-left
            span {{$t('unauthorized.goback')}}
</template>

<script>

export default {
  props: {
    action: {
      type: String,
      default: 'view'
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
