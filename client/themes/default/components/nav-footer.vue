<template lang="pug">
  v-footer.cl-footer(:color='bgColor', :class='$vuetify.theme.dark ? `is-dark` : `is-light`', inset)
    .cl-footer-text
      template(v-if='footerOverride')
        span(v-html='footerOverrideRender + ` |&nbsp;`')
      template(v-else-if='company && company.length > 0 && contentLicense !== ``')
        span(v-if='contentLicense === `alr`') {{ $t('common:footer.copyright', { company: company, year: currentYear, interpolation: { escapeValue: false } }) }} |&nbsp;
        span(v-else) {{ $t('common:footer.license', { company: company, license: $t('common:license.' + contentLicense), interpolation: { escapeValue: false } }) }} |&nbsp;
      span {{ $t('common:footer.poweredBy') }} #[a(href='https://wiki.js.org', ref='nofollow') Wiki.js]
    img.cl-footer-logo(:src='$vuetify.theme.dark ? `/_assets/img/cl/carbon-logica-logo-reversed.png` : `/_assets/img/cl/carbon-logica-logo.png`', alt='Carbon Logica')
</template>

<script>
import { get } from 'vuex-pathify'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: false,
  breaks: false,
  linkify: true
})

export default {
  props: {
    color: {
      type: String,
      default: ''
    },
    darkColor: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      currentYear: (new Date()).getFullYear()
    }
  },
  computed: {
    company: get('site/company'),
    contentLicense: get('site/contentLicense'),
    footerOverride: get('site/footerOverride'),
    footerOverrideRender () {
      if (!this.footerOverride) { return '' }
      return md.renderInline(this.footerOverride)
    },
    bgColor() {
      if (!this.$vuetify.theme.dark) {
        return this.color
      } else {
        return this.darkColor
      }
    }
  }
}
</script>

<style lang="scss">
  // Footer (design system AppFooter): 48 px bar, text left, wordmark right.
  // Light: white surface with a top rule. Dark: navy with the dark rule and subtle cover text.
  .v-application .v-footer.cl-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    min-height: 48px;
    padding: 0 40px;
    font-family: $cl-font;
    font-size: 12px;
    line-height: 1.4;

    &.is-light {
      background-color: var(--cl-surface) !important;
      border-top: 1px solid var(--cl-border);
      color: var(--cl-muted) !important;
    }

    &.is-dark {
      background-color: $cl-navy !important;
      border-top: 1px solid $cl-dark-border;
      color: $cl-cover-subtle !important;
    }

    .cl-footer-text {
      flex: 1 1 auto;
      min-width: 0;
      text-align: left;

      @at-root .is-rtl & {
        text-align: right;
      }
    }

    .cl-footer-logo {
      flex: none;
      display: block;
      height: 22px;
      width: auto;
    }

    a {
      text-decoration: none;
      font-weight: 600;
      color: var(--cl-link);

      &:hover {
        color: var(--cl-link-hover);
        text-decoration: underline;
        text-underline-offset: .15em;
      }
    }

    @media (max-width: 599px) {
      padding: 0 16px;
    }
  }

  // Legacy alternate footer background used by other views: navy with subtle text
  .v-application .v-footer.altbg {
    background-color: $cl-navy !important;

    span {
      color: $cl-cover-subtle;
    }

    a {
      color: $cl-green;
    }
  }
</style>
