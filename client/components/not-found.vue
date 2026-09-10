<template lang='pug'>
  v-app
    .notfound
      .notfound-content
        img.notfound-wordmark(:src='wordmarkUrl', alt='Carbon Logica')
        .notfound-label Not found
        h1.notfound-title {{$t('notfound.title')}}
        p.notfound-text {{$t('notfound.subtitle')}}
        .notfound-actions
          v-btn(color='primary', depressed, href='/')
            v-icon(left, size='18') mdi-home
            span {{$t('notfound.gohome')}}
          v-btn(outlined, href='javascript:window.history.go(-1);')
            v-icon(left, size='18') mdi-arrow-left
            span {{$t('unauthorized.goback')}}
</template>

<script>

export default {
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
