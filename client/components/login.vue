<template lang="pug">
  v-app
    .login
      //-------------------------------------------------
      //- LEFT PANEL: sign-in
      //-------------------------------------------------
      .login-panel
        img.login-wordmark(:src='wordmarkUrl', alt='Carbon Logica')
        v-alert.login-alert(
          v-model='errorShown'
          transition='slide-y-reverse-transition'
          color='error'
          dense
          icon='mdi-alert'
          )
          .body-2 {{errorMessage}}
        //-------------------------------------------------
        //- PROVIDERS + LOGIN FORM
        //-------------------------------------------------
        template(v-if='screen === `login` && !isTFAShown && !isTFASetupShown')
          .login-heading
            h1.login-title Sign in
            p.login-lead Use your Carbon Logica Microsoft account.
          .login-providers(v-if='externalStrategies.length > 0')
            span.login-sr-only {{$t('auth:selectAuthProvider')}}
            v-btn.login-btn(
              v-for='stg of externalStrategies'
              :key='stg.key'
              color='primary'
              depressed
              block
              height='42'
              @click='selectedStrategyKey = stg.key'
              )
              v-avatar.login-provider-icon.mr-2(tile, size='18', v-html='stg.strategy.icon')
              span Continue with {{stg.displayName}}
          .login-or(v-if='externalStrategies.length > 0 && localStrategy')
            span.login-or-line
            span.login-or-text or
            span.login-or-line
          .login-local(v-if='localStrategy')
            a.login-local-toggle(href='#local', @click.prevent='toggleLocal')
              span Sign in with a local account
              v-icon(size='18') {{ localOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
            v-expand-transition
              .login-form(v-if='localOpen')
                span.login-sr-only {{$t('auth:enterCredentials')}}
                label.cl-field-label(for='login-email') {{ isUsernameEmail ? $t(`auth:fields.email`) : $t(`auth:fields.username`) }}
                v-text-field(
                  id='login-email'
                  outlined
                  dense
                  hide-details='auto'
                  ref='iptEmail'
                  v-model='username'
                  :placeholder='isUsernameEmail ? $t(`auth:fields.email`) : $t(`auth:fields.username`)'
                  :type='isUsernameEmail ? `email` : `text`'
                  :autocomplete='isUsernameEmail ? `email` : `username`'
                  )
                label.cl-field-label(for='login-password') {{ $t('auth:fields.password') }}
                v-text-field(
                  id='login-password'
                  outlined
                  dense
                  hide-details='auto'
                  ref='iptPassword'
                  v-model='password'
                  :append-icon='hidePassword ? "mdi-eye-off" : "mdi-eye"'
                  @click:append='() => (hidePassword = !hidePassword)'
                  :type='hidePassword ? "password" : "text"'
                  :placeholder='$t("auth:fields.password")'
                  autocomplete='current-password'
                  @keyup.enter='login'
                  )
                v-btn.login-btn.login-submit(
                  block
                  outlined
                  height='42'
                  @click='login'
                  :loading='isLoading'
                  ) {{ $t('auth:actions.login') }}
                p.login-note Local accounts are for break-glass administration only.
                .login-links
                  a(href='#forgot', @click.stop.prevent='forgotPassword') {{ $t('auth:forgotPasswordLink') }}
                  a(
                    v-if='selectedStrategyKey === `local` && selectedStrategy.selfRegistration'
                    href='/register'
                    ) {{ $t('auth:switchToRegister.link') }}
        //-------------------------------------------------
        //- FORGOT PASSWORD FORM
        //-------------------------------------------------
        template(v-if='screen === `forgot`')
          .login-heading
            h1.login-title {{ $t('auth:forgotPasswordTitle') }}
            p.login-lead {{ $t('auth:forgotPasswordSubtitle') }}
          .login-form
            label.cl-field-label(for='login-forgot-email') {{ $t('auth:fields.email') }}
            v-text-field(
              id='login-forgot-email'
              outlined
              dense
              hide-details='auto'
              ref='iptForgotPwdEmail'
              v-model='username'
              :placeholder='$t(`auth:fields.email`)'
              type='email'
              autocomplete='email'
              )
            v-btn.login-btn.login-submit(
              block
              depressed
              color='primary'
              height='42'
              @click='forgotPasswordSubmit'
              :loading='isLoading'
              ) {{ $t('auth:sendResetPassword') }}
            .login-links
              a(href='#forgot', @click.stop.prevent='screen = `login`') {{ $t('auth:forgotPasswordCancel') }}
        //-------------------------------------------------
        //- CHANGE PASSWORD FORM
        //-------------------------------------------------
        template(v-if='screen === `changePwd`')
          .login-heading
            h1.login-title {{ $t('auth:changePwd.subtitle') }}
          .login-form
            label.cl-field-label(for='login-new-password') {{ $t('auth:changePwd.newPasswordPlaceholder') }}
            v-text-field(
              id='login-new-password'
              type='password'
              outlined
              dense
              hide-details='auto'
              ref='iptNewPassword'
              v-model='newPassword'
              :placeholder='$t(`auth:changePwd.newPasswordPlaceholder`)'
              autocomplete='new-password'
              )
              password-strength(slot='progress', v-model='newPassword')
            label.cl-field-label(for='login-new-password-verify') {{ $t('auth:changePwd.newPasswordVerifyPlaceholder') }}
            v-text-field(
              id='login-new-password-verify'
              type='password'
              outlined
              dense
              hide-details='auto'
              v-model='newPasswordVerify'
              :placeholder='$t(`auth:changePwd.newPasswordVerifyPlaceholder`)'
              autocomplete='new-password'
              @keyup.enter='changePassword'
              )
            v-btn.login-btn.login-submit(
              block
              depressed
              color='primary'
              height='42'
              @click='changePassword'
              :loading='isLoading'
              ) {{ $t('auth:changePwd.proceed') }}
        //-------------------------------------------------
        //- TFA FORM
        //-------------------------------------------------
        template(v-if='isTFAShown')
          .login-heading
            h1.login-title {{ $t('auth:tfaFormTitle') }}
          .login-form
            label.cl-field-label(for='login-tfa') {{ $t('auth:tfa.placeholder') }}
            v-text-field.login-tfa-field(
              id='login-tfa'
              outlined
              dense
              hide-details='auto'
              ref='iptTFA'
              v-model='securityCode'
              :placeholder='$t("auth:tfa.placeholder")'
              autocomplete='one-time-code'
              @keyup.enter='verifySecurityCode(false)'
              )
            v-btn.login-btn.login-submit(
              block
              depressed
              color='primary'
              height='42'
              @click='verifySecurityCode(false)'
              :loading='isLoading'
              ) {{ $t('auth:tfa.verifyToken') }}
        //-------------------------------------------------
        //- SETUP TFA FORM
        //-------------------------------------------------
        template(v-if='isTFASetupShown')
          .login-heading
            h1.login-title {{ $t('auth:tfaSetupTitle') }}
            p.login-lead {{ $t('auth:tfaSetupInstrFirst') }}
          p.login-note (#[a(href='https://authy.com/', target='_blank', noopener) Authy], #[a(href='https://support.google.com/accounts/answer/1066447', target='_blank', noopener) Google Authenticator], #[a(href='https://www.microsoft.com/en-us/account/authenticator', target='_blank', noopener) Microsoft Authenticator], etc.)
          .login-tfa-qr(v-if='isTFASetupShown', v-html='tfaQRImage')
          p.login-lead.mt-4 {{ $t('auth:tfaSetupInstrSecond') }}
          .login-form
            label.cl-field-label(for='login-tfa-setup') {{ $t('auth:tfa.placeholder') }}
            v-text-field.login-tfa-field(
              id='login-tfa-setup'
              outlined
              dense
              hide-details='auto'
              ref='iptTFASetup'
              v-model='securityCode'
              :placeholder='$t("auth:tfa.placeholder")'
              autocomplete='one-time-code'
              @keyup.enter='verifySecurityCode(true)'
              )
            v-btn.login-btn.login-submit(
              block
              depressed
              color='primary'
              height='42'
              @click='verifySecurityCode(true)'
              :loading='isLoading'
              ) {{ $t('auth:tfa.verifyToken') }}
        //-------------------------------------------------
        //- FOOTER
        //-------------------------------------------------
        .login-footer
          span Staff only. Access is via the Carbon Logica tailnet.
          span Trouble signing in? Ask in the Wiki Teams channel.

      //-------------------------------------------------
      //- RIGHT PANEL: cover
      //-------------------------------------------------
      .login-cover
        .login-cover-top
          .login-cover-caps Carbon Logica
          .login-cover-title {{ coverTitle }}
          .login-cover-sub Procedures, systems, projects, reference and people, in one place.
        .login-cover-spacer
        .login-cover-rule
        .login-cover-bottom
          img.login-wordmark(src='/_assets/img/cl/carbon-logica-logo-reversed.png', alt='Carbon Logica')
          .login-cover-meta
            .login-cover-meta-item
              strong Address
              span {{ host }}
            .login-cover-meta-item
              strong Access
              span Tailscale, staff group
            .login-cover-meta-item
              strong Sign-in
              span Microsoft Entra ID

    loader(v-model='isLoading', :color='loaderColor', :title='loaderTitle', :subtitle='$t(`auth:pleaseWait`)')
    notify(style='padding-top: 64px;')
</template>

<script>
/* global siteConfig */

import _ from 'lodash'
import Cookies from 'js-cookie'
import gql from 'graphql-tag'
import { sync } from 'vuex-pathify'

export default {
  i18nOptions: { namespaces: 'auth' },
  props: {
    bgUrl: {
      type: String,
      default: ''
    },
    hideLocal: {
      type: Boolean,
      default: false
    },
    changePwdContinuationToken: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      error: false,
      strategies: [],
      selectedStrategyKey: 'unselected',
      selectedStrategy: { key: 'unselected', strategy: { useForm: false, usernameType: 'email' } },
      screen: 'login',
      username: '',
      password: '',
      hidePassword: true,
      securityCode: '',
      continuationToken: '',
      isLoading: false,
      loaderColor: 'grey darken-4',
      loaderTitle: 'Working...',
      isShown: false,
      newPassword: '',
      newPasswordVerify: '',
      isTFAShown: false,
      isTFASetupShown: false,
      tfaQRImage: '',
      errorShown: false,
      errorMessage: '',
      localOpen: false
    }
  },
  computed: {
    activeModal: sync('editor/activeModal'),
    siteTitle () {
      return siteConfig.title
    },
    isSocialShown () {
      return this.strategies.length > 1
    },
    logoUrl () { return siteConfig.logoUrl },
    filteredStrategies () {
      const qParams = new URLSearchParams(window.location.search)
      if (this.hideLocal && !qParams.has('all')) {
        return _.reject(this.strategies, ['key', 'local'])
      } else {
        return this.strategies
      }
    },
    isUsernameEmail () {
      return this.selectedStrategy.strategy.usernameType === `email`
    },
    externalStrategies () {
      return _.reject(this.filteredStrategies, ['key', 'local'])
    },
    localStrategy () {
      return _.find(this.filteredStrategies, ['key', 'local'])
    },
    wordmarkUrl () {
      return this.$vuetify.theme.dark ? '/_assets/img/cl/carbon-logica-logo-reversed.png' : '/_assets/img/cl/carbon-logica-logo.png'
    },
    coverTitle () {
      const title = _.trim(this.$store.get('site/title') || siteConfig.title || '')
      const stripped = _.trim(title.replace(/^carbon\s+logica\s*[-–—:|]?\s*/i, ''))
      return stripped.length > 0 ? stripped : 'Staff wiki'
    },
    host () {
      return window.location.host
    }
  },
  watch: {
    filteredStrategies (newValue, oldValue) {
      if (_.head(newValue).strategy.useForm) {
        this.selectedStrategyKey = _.head(newValue).key
      }
      // Local is the only way in: show its form straight away
      if (newValue.length === 1 && _.head(newValue).key === 'local') {
        this.localOpen = true
      }
    },
    selectedStrategyKey (newValue, oldValue) {
      this.selectedStrategy = _.find(this.strategies, ['key', newValue])
      if (this.screen === 'changePwd') {
        return
      }
      this.screen = 'login'
      if (!this.selectedStrategy.strategy.useForm) {
        this.isLoading = true
        window.location.assign('/login/' + newValue)
      } else {
        this.$nextTick(() => {
          if (this.$refs.iptEmail) {
            this.$refs.iptEmail.focus()
          }
        })
      }
    }
  },
  mounted () {
    this.isShown = true
    if (this.changePwdContinuationToken) {
      this.screen = 'changePwd'
      this.continuationToken = this.changePwdContinuationToken
    }
  },
  methods: {
    /**
     * TOGGLE LOCAL ACCOUNT FORM
     */
    toggleLocal () {
      this.localOpen = !this.localOpen
      if (this.localOpen && this.localStrategy) {
        this.selectedStrategyKey = this.localStrategy.key
        this.$nextTick(() => {
          if (this.$refs.iptEmail) {
            this.$refs.iptEmail.focus()
          }
        })
      }
    },
    /**
     * LOGIN
     */
    async login () {
      this.errorShown = false
      if (this.username.length < 2) {
        this.errorMessage = this.$t('auth:invalidEmailUsername')
        this.errorShown = true
        this.$refs.iptEmail.focus()
      } else if (this.password.length < 2) {
        this.errorMessage = this.$t('auth:invalidPassword')
        this.errorShown = true
        this.$refs.iptPassword.focus()
      } else {
        this.loaderColor = 'grey darken-4'
        this.loaderTitle = this.$t('auth:signingIn')
        this.isLoading = true
        try {
          const resp = await this.$apollo.mutate({
            mutation: gql`
              mutation($username: String!, $password: String!, $strategy: String!) {
                authentication {
                  login(username: $username, password: $password, strategy: $strategy) {
                    responseResult {
                      succeeded
                      errorCode
                      slug
                      message
                    }
                    jwt
                    mustChangePwd
                    mustProvideTFA
                    mustSetupTFA
                    continuationToken
                    redirect
                    tfaQRImage
                  }
                }
              }
            `,
            variables: {
              username: this.username,
              password: this.password,
              strategy: this.selectedStrategy.key
            }
          })
          if (_.has(resp, 'data.authentication.login')) {
            const respObj = _.get(resp, 'data.authentication.login', {})
            if (respObj.responseResult.succeeded === true) {
              this.handleLoginResponse(respObj)
            } else {
              throw new Error(respObj.responseResult.message)
            }
          } else {
            throw new Error(this.$t('auth:genericError'))
          }
        } catch (err) {
          console.error(err)
          this.$store.commit('showNotification', {
            style: 'red',
            message: err.message,
            icon: 'alert'
          })
          this.isLoading = false
        }
      }
    },
    /**
     * VERIFY TFA CODE
     */
    async verifySecurityCode (setup = false) {
      if (this.securityCode.length !== 6) {
        this.$store.commit('showNotification', {
          style: 'red',
          message: 'Enter a valid security code.',
          icon: 'alert'
        })
        if (setup) {
          this.$refs.iptTFASetup.focus()
        } else {
          this.$refs.iptTFA.focus()
        }
      } else {
        this.loaderColor = 'grey darken-4'
        this.loaderTitle = this.$t('auth:signingIn')
        this.isLoading = true
        try {
          const resp = await this.$apollo.mutate({
            mutation: gql`
              mutation(
                $continuationToken: String!
                $securityCode: String!
                $setup: Boolean
                ) {
                authentication {
                  loginTFA(
                    continuationToken: $continuationToken
                    securityCode: $securityCode
                    setup: $setup
                    ) {
                    responseResult {
                      succeeded
                      errorCode
                      slug
                      message
                    }
                    jwt
                    mustChangePwd
                    continuationToken
                    redirect
                  }
                }
              }
            `,
            variables: {
              continuationToken: this.continuationToken,
              securityCode: this.securityCode,
              setup
            }
          })
          if (_.has(resp, 'data.authentication.loginTFA')) {
            let respObj = _.get(resp, 'data.authentication.loginTFA', {})
            if (respObj.responseResult.succeeded === true) {
              this.handleLoginResponse(respObj)
            } else {
              if (!setup) {
                this.isTFAShown = false
              }
              throw new Error(respObj.responseResult.message)
            }
          } else {
            throw new Error(this.$t('auth:genericError'))
          }
        } catch (err) {
          console.error(err)
          this.$store.commit('showNotification', {
            style: 'red',
            message: err.message,
            icon: 'alert'
          })
          this.isLoading = false
        }
      }
    },
    /**
     * CHANGE PASSWORD
     */
    async changePassword () {
      this.loaderColor = 'grey darken-4'
      this.loaderTitle = this.$t('auth:changePwd.loading')
      this.isLoading = true
      try {
        const resp = await this.$apollo.mutate({
          mutation: gql`
            mutation (
              $continuationToken: String!
              $newPassword: String!
            ) {
              authentication {
                loginChangePassword (
                  continuationToken: $continuationToken
                  newPassword: $newPassword
                ) {
                  responseResult {
                    succeeded
                    errorCode
                    slug
                    message
                  }
                  jwt
                  continuationToken
                  redirect
                }
              }
            }
          `,
          variables: {
            continuationToken: this.continuationToken,
            newPassword: this.newPassword
          }
        })
        if (_.has(resp, 'data.authentication.loginChangePassword')) {
          let respObj = _.get(resp, 'data.authentication.loginChangePassword', {})
          if (respObj.responseResult.succeeded === true) {
            this.handleLoginResponse(respObj)
          } else {
            throw new Error(respObj.responseResult.message)
          }
        } else {
          throw new Error(this.$t('auth:genericError'))
        }
      } catch (err) {
        console.error(err)
        this.$store.commit('showNotification', {
          style: 'red',
          message: err.message,
          icon: 'alert'
        })
        this.isLoading = false
      }
    },
    /**
     * SWITCH TO FORGOT PASSWORD SCREEN
     */
    forgotPassword () {
      this.screen = 'forgot'
      this.$nextTick(() => {
        this.$refs.iptForgotPwdEmail.focus()
      })
    },
    /**
     * FORGOT PASSWORD SUBMIT
     */
    async forgotPasswordSubmit () {
      this.loaderColor = 'grey darken-4'
      this.loaderTitle = this.$t('auth:forgotPasswordLoading')
      this.isLoading = true
      try {
        const resp = await this.$apollo.mutate({
          mutation: gql`
            mutation (
              $email: String!
            ) {
              authentication {
                forgotPassword (
                  email: $email
                ) {
                  responseResult {
                    succeeded
                    errorCode
                    slug
                    message
                  }
                }
              }
            }
          `,
          variables: {
            email: this.username
          }
        })
        if (_.has(resp, 'data.authentication.forgotPassword.responseResult')) {
          let respObj = _.get(resp, 'data.authentication.forgotPassword.responseResult', {})
          if (respObj.succeeded === true) {
            this.$store.commit('showNotification', {
              style: 'success',
              message: this.$t('auth:forgotPasswordSuccess'),
              icon: 'email'
            })
            this.screen = 'login'
          } else {
            throw new Error(respObj.message)
          }
        } else {
          throw new Error(this.$t('auth:genericError'))
        }
      } catch (err) {
        console.error(err)
        this.$store.commit('showNotification', {
          style: 'red',
          message: err.message,
          icon: 'alert'
        })
      }
      this.isLoading = false
    },
    handleLoginResponse (respObj) {
      this.continuationToken = respObj.continuationToken
      if (respObj.mustChangePwd === true) {
        this.screen = 'changePwd'
        this.$nextTick(() => {
          this.$refs.iptNewPassword.focus()
        })
        this.isLoading = false
      } else if (respObj.mustProvideTFA === true) {
        this.securityCode = ''
        this.isTFAShown = true
        setTimeout(() => {
          this.$refs.iptTFA.focus()
        }, 500)
        this.isLoading = false
      } else if (respObj.mustSetupTFA === true) {
        this.securityCode = ''
        this.isTFASetupShown = true
        this.tfaQRImage = respObj.tfaQRImage
        setTimeout(() => {
          this.$refs.iptTFASetup.focus()
        }, 500)
        this.isLoading = false
      } else {
        this.loaderColor = 'green darken-1'
        this.loaderTitle = this.$t('auth:loginSuccess')
        Cookies.set('jwt', respObj.jwt, { expires: 365, secure: window.location.protocol === 'https:' })
        _.delay(() => {
          const loginRedirect = Cookies.get('loginRedirect')
          const isValidRedirect = loginRedirect && loginRedirect.startsWith('/') && !loginRedirect.startsWith('//') && !loginRedirect.includes('://')
          if (loginRedirect === '/' && respObj.redirect) {
            Cookies.remove('loginRedirect')
            window.location.replace(respObj.redirect)
          } else if (isValidRedirect) {
            Cookies.remove('loginRedirect')
            window.location.replace(loginRedirect)
          } else {
            if (loginRedirect) {
              Cookies.remove('loginRedirect')
            }
            if (respObj.redirect) {
              window.location.replace(respObj.redirect)
            } else {
              window.location.replace('/')
            }
          }
        }, 1000)
      }
    }
  },
  apollo: {
    strategies: {
      query: gql`
        {
          authentication {
            activeStrategies(enabledOnly: true) {
              key
              strategy {
                key
                logo
                color
                icon
                useForm
                usernameType
              }
              displayName
              order
              selfRegistration
            }
          }
        }
      `,
      update: (data) => _.sortBy(data.authentication.activeStrategies, ['order']),
      watchLoading (isLoading) {
        this.$store.commit(`loading${isLoading ? 'Start' : 'Stop'}`, 'login-strategies-refresh')
      }
    }
  }
}
</script>

<style lang="scss">
  .login {
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 100vh;
    background-color: var(--cl-page);
    color: var(--cl-text);
    font-family: $cl-font;
    font-size: 16px;
    line-height: 1.55;

    // ---- Left panel ----
    &-panel {
      width: 560px;
      flex: none;
      display: flex;
      flex-direction: column;
      padding: 64px 72px;
      background-color: var(--cl-surface);
      border-right: 1px solid var(--cl-border);

      @media screen and (max-width: 959px) {
        width: 100%;
        padding: 32px 24px;
        border-right: 0;
      }
    }

    &-wordmark {
      display: block;
      height: 40px;
      width: auto;
      align-self: flex-start;
      flex: none;
    }

    &-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    &-alert {
      margin: 24px 0 0;
    }

    &-heading {
      margin-top: 56px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      @media screen and (max-width: 959px) {
        margin-top: 32px;
      }
    }

    &-title {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.02em;
      color: var(--cl-heading);
    }

    &-lead {
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
      color: var(--cl-muted);
    }

    &-note {
      margin: 12px 0 0;
      font-size: 12px;
      line-height: 1.5;
      color: var(--cl-muted);
    }

    &-providers {
      margin-top: 32px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .v-btn.login-btn {
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0;
      text-transform: none;
    }

    &-provider-icon {
      svg {
        width: 18px;
        height: 18px;
      }
    }

    &-or {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 24px;

      &-line {
        flex: 1 1 auto;
        height: 1px;
        background-color: var(--cl-border);
      }
      &-text {
        font-size: 12px;
        line-height: 1;
        color: var(--cl-muted);
      }
    }

    &-local {
      margin-top: 24px;

      &-toggle {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 600;
        line-height: 1.3;
        color: var(--cl-accent-deep);
        text-decoration: none;

        &:hover {
          color: var(--cl-link-hover);
          text-decoration: underline;
        }
        .v-icon {
          color: inherit;
        }
      }
    }

    &-form {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
    }

    .cl-field-label {
      display: block;
      margin-bottom: 4px;
      font-size: 11px;
      line-height: 1.3;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--cl-muted);
    }
    &-form .v-input + .cl-field-label {
      margin-top: 16px;
    }

    &-submit {
      margin-top: 16px;
    }

    &-links {
      margin-top: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 14px;

      a {
        font-weight: 600;
        color: var(--cl-accent-deep);
        text-decoration: none;

        &:hover {
          color: var(--cl-link-hover);
          text-decoration: underline;
        }
      }
    }

    &-footer {
      margin-top: auto;
      padding-top: 32px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      line-height: 1.5;
      color: var(--cl-muted);
    }

    &-tfa-field input {
      text-align: center;
      letter-spacing: 0.2em;
    }

    &-tfa-qr {
      margin-top: 16px;
      padding: 5px;
      width: 200px;
      height: 200px;
      background-color: #FFF;
      border: 1px solid var(--cl-border);
      border-radius: $cl-radius-md;
    }

    // ---- Right panel (cover) ----
    &-cover {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      padding: 96px 96px 64px;
      background-color: $cl-navy;
      color: $cl-cover-subtle;

      @media screen and (max-width: 959px) {
        display: none;
      }

      &-top {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      &-caps {
        font-size: 14px;
        font-weight: 700;
        line-height: 1.3;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: $cl-green;
      }
      &-title {
        font-size: 48px;
        font-weight: 400;
        line-height: 1.15;
        letter-spacing: -0.01em;
        color: $cl-white;
      }
      &-sub {
        font-size: 14px;
        line-height: 1.5;
        color: $cl-cover-subtle;
      }
      &-spacer {
        flex: 1 1 auto;
      }
      &-rule {
        width: 100%;
        height: 2px;
        flex: none;
        background-color: $cl-green;
      }
      &-bottom {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-top: 32px;
      }
      &-meta {
        display: flex;
        align-items: flex-start;
        gap: 48px;
        flex-wrap: wrap;
        font-size: 12px;
        line-height: 1.5;
        color: $cl-cover-subtle;

        &-item {
          display: flex;
          flex-direction: column;
          gap: 2px;

          strong {
            font-size: 12px;
            font-weight: 700;
            color: $cl-white;
          }
        }
      }
    }
  }

  .theme--dark .login-cover {
    background-color: $cl-dark-page;
  }
</style>
