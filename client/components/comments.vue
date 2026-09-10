<template lang="pug">
  div.comments-widget(v-intersect.once='onIntersect')
    v-textarea#discussion-new(
      outlined
      flat
      :placeholder='$t(`common:comments.newPlaceholder`)'
      auto-grow
      dense
      rows='3'
      hide-details
      v-model='newcomment'
      color='primary'
      v-if='permissions.write'
      :aria-label='$t(`common:comments.fieldContent`)'
    )
    v-row.mt-2(dense, v-if='!isAuthenticated && permissions.write')
      v-col(cols='12', lg='6')
        v-text-field(
          outlined
          color='primary'
          :placeholder='$t(`common:comments.fieldName`)'
          hide-details
          dense
          autocomplete='name'
          v-model='guestName'
          :aria-label='$t(`common:comments.fieldName`)'
        )
      v-col(cols='12', lg='6')
        v-text-field(
          outlined
          color='primary'
          :placeholder='$t(`common:comments.fieldEmail`)'
          hide-details
          type='email'
          dense
          autocomplete='email'
          v-model='guestEmail'
          :aria-label='$t(`common:comments.fieldEmail`)'
        )
    .d-flex.align-center.pt-3(v-if='permissions.write')
      v-icon.mr-1.comments-hint-icon(small) mdi-language-markdown-outline
      .caption.comments-hint {{$t('common:comments.markdownFormat')}}
      v-spacer
      .caption.mr-3.comments-hint(v-if='isAuthenticated')
        i18next(tag='span', path='common:comments.postingAs')
          strong(place='name') {{userDisplayName}}
      v-btn(
        color='primary'
        @click='postComment'
        depressed
        :aria-label='$t(`common:comments.postComment`)'
        )
        v-icon(left) mdi-comment
        span.text-none {{$t('common:comments.postComment')}}
    v-divider.mt-3(v-if='permissions.write')
    .pa-5.d-flex.align-center.justify-center(v-if='isLoading && !hasLoadedOnce')
      v-progress-circular(
        indeterminate
        size='20'
        width='1'
        color='primary'
      )
      .caption.comments-hint.pl-3: em {{$t('common:comments.loading')}}
    v-timeline.comments-timeline(
      dense
      v-else-if='comments && comments.length > 0'
      )
      v-timeline-item.comments-post(
        color='transparent'
        large
        v-for='cm of comments'
        :key='`comment-` + cm.id'
        :id='`comment-post-id-` + cm.id'
        )
        template(v-slot:icon)
          v-avatar.comments-avatar(size='32')
            //- v-img(src='http://i.pravatar.cc/64')
            span {{cm.initials}}
        v-card.comments-post-card(flat)
          v-card-text
            .comments-post-actions(v-if='permissions.manage && !isBusy && commentEditId === 0')
              v-icon.mr-3(small, @click='editComment(cm)') mdi-pencil
              v-icon(small, @click='deleteCommentConfirm(cm)') mdi-delete
            .comments-post-name {{cm.authorName}}
            .comments-post-date {{cm.createdAt | moment('from') }} #[em(v-if='cm.createdAt !== cm.updatedAt') - {{$t('common:comments.modified', { reldate: $options.filters.moment(cm.updatedAt, 'from') })}}]
            .comments-post-content.mt-3(v-if='commentEditId !== cm.id', v-html='cm.render')
            .comments-post-editcontent.mt-3(v-else)
              v-textarea(
                outlined
                flat
                auto-grow
                dense
                rows='3'
                hide-details
                v-model='commentEditContent'
                color='primary'
              )
              .d-flex.align-center.pt-3
                v-spacer
                v-btn.mr-3(
                  @click='editCommentCancel'
                  outlined
                  )
                  v-icon(left) mdi-close
                  span.text-none {{$t('common:actions.cancel')}}
                v-btn(
                  color='primary'
                  @click='updateComment'
                  depressed
                  )
                  v-icon(left) mdi-comment
                  span.text-none {{$t('common:comments.updateComment')}}
    .pt-5.text-center.body-2.comments-hint(v-else-if='permissions.write') {{$t('common:comments.beFirst')}}
    .text-center.body-2.comments-hint(v-else) {{$t('common:comments.none')}}

    v-dialog(v-model='deleteCommentDialogShown', max-width='500')
      v-card
        .dialog-header.is-red {{$t('common:comments.deleteConfirmTitle')}}
        v-card-text.pt-5
          span {{$t('common:comments.deleteWarn')}}
          .caption: strong {{$t('common:comments.deletePermanentWarn')}}
        v-card-chin
          v-spacer
          v-btn(text, @click='deleteCommentDialogShown = false') {{$t('common:actions.cancel')}}
          v-btn(color='error', @click='deleteComment') {{$t('common:actions.delete')}}
</template>

<script>
import gql from 'graphql-tag'
import { get } from 'vuex-pathify'
import validate from 'validate.js'
import _ from 'lodash'

export default {
  data () {
    return {
      newcomment: '',
      isLoading: true,
      hasLoadedOnce: false,
      comments: [],
      guestName: '',
      guestEmail: '',
      commentToDelete: {},
      commentEditId: 0,
      commentEditContent: null,
      deleteCommentDialogShown: false,
      isBusy: false,
      scrollOpts: {
        duration: 1500,
        offset: 0,
        easing: 'easeInOutCubic'
      }
    }
  },
  computed: {
    pageId: get('page/id'),
    permissions: get('page/effectivePermissions@comments'),
    isAuthenticated: get('user/authenticated'),
    userDisplayName: get('user/name')
  },
  methods: {
    onIntersect (entries, observer, isIntersecting) {
      if (isIntersecting) {
        this.fetch(true)
      }
    },
    async fetch (silent = false) {
      this.isLoading = true
      try {
        const results = await this.$apollo.query({
          query: gql`
            query ($locale: String!, $path: String!) {
              comments {
                list(locale: $locale, path: $path) {
                  id
                  render
                  authorName
                  createdAt
                  updatedAt
                }
              }
            }
          `,
          variables: {
            locale: this.$store.get('page/locale'),
            path: this.$store.get('page/path')
          },
          fetchPolicy: 'network-only'
        })
        this.comments = _.get(results, 'data.comments.list', []).map(c => {
          const nameParts = c.authorName.toUpperCase().split(' ')
          let initials = _.head(nameParts).charAt(0)
          if (nameParts.length > 1) {
            initials += _.last(nameParts).charAt(0)
          }
          c.initials = initials
          return c
        })
      } catch (err) {
        console.warn(err)
        if (!silent) {
          this.$store.commit('showNotification', {
            style: 'red',
            message: err.message,
            icon: 'alert'
          })
        }
      }
      this.isLoading = false
      this.hasLoadedOnce = true
    },
    /**
     * Post New Comment
     */
    async postComment () {
      let rules = {
        comment: {
          presence: {
            allowEmpty: false
          },
          length: {
            minimum: 2
          }
        }
      }
      if (!this.isAuthenticated && this.permissions.write) {
        rules.name = {
          presence: {
            allowEmpty: false
          },
          length: {
            minimum: 2,
            maximum: 255
          }
        }
        rules.email = {
          presence: {
            allowEmpty: false
          },
          email: true
        }
      }
      const validationResults = validate({
        comment: this.newcomment,
        name: this.guestName,
        email: this.guestEmail
      }, rules, { format: 'flat' })

      if (validationResults) {
        this.$store.commit('showNotification', {
          style: 'red',
          message: validationResults[0],
          icon: 'alert'
        })
        return
      }

      try {
        const resp = await this.$apollo.mutate({
          mutation: gql`
            mutation (
              $pageId: Int!
              $replyTo: Int
              $content: String!
              $guestName: String
              $guestEmail: String
            ) {
              comments {
                create (
                  pageId: $pageId
                  replyTo: $replyTo
                  content: $content
                  guestName: $guestName
                  guestEmail: $guestEmail
                ) {
                  responseResult {
                    succeeded
                    errorCode
                    slug
                    message
                  }
                  id
                }
              }
            }
          `,
          variables: {
            pageId: this.pageId,
            replyTo: 0,
            content: this.newcomment,
            guestName: this.guestName,
            guestEmail: this.guestEmail
          }
        })

        if (_.get(resp, 'data.comments.create.responseResult.succeeded', false)) {
          this.$store.commit('showNotification', {
            style: 'success',
            message: this.$t('common:comments.postSuccess'),
            icon: 'check'
          })

          this.newcomment = ''
          await this.fetch()
          this.$nextTick(() => {
            this.$vuetify.goTo(`#comment-post-id-${_.get(resp, 'data.comments.create.id', 0)}`, this.scrollOpts)
          })
        } else {
          throw new Error(_.get(resp, 'data.comments.create.responseResult.message', 'An unexpected error occurred.'))
        }
      } catch (err) {
        this.$store.commit('showNotification', {
          style: 'red',
          message: err.message,
          icon: 'alert'
        })
      }
    },
    /**
     * Show Comment Editing Form
     */
    async editComment (cm) {
      this.$store.commit(`loadingStart`, 'comments-edit')
      this.isBusy = true
      try {
        const results = await this.$apollo.query({
          query: gql`
            query ($id: Int!) {
              comments {
                single(id: $id) {
                  content
                }
              }
            }
          `,
          variables: {
            id: cm.id
          },
          fetchPolicy: 'network-only'
        })
        this.commentEditContent = _.get(results, 'data.comments.single.content', null)
        if (this.commentEditContent === null) {
          throw new Error('Failed to load comment content.')
        }
      } catch (err) {
        console.warn(err)
        this.$store.commit('showNotification', {
          style: 'red',
          message: err.message,
          icon: 'alert'
        })
      }
      this.commentEditId = cm.id
      this.isBusy = false
      this.$store.commit(`loadingStop`, 'comments-edit')
    },
    /**
     * Cancel Comment Edit
     */
    editCommentCancel () {
      this.commentEditId = 0
      this.commentEditContent = null
    },
    /**
     * Update Comment with new content
     */
    async updateComment () {
      this.$store.commit(`loadingStart`, 'comments-edit')
      this.isBusy = true
      try {
        if (this.commentEditContent.length < 2) {
          throw new Error(this.$t('common:comments.contentMissingError'))
        }
        const resp = await this.$apollo.mutate({
          mutation: gql`
            mutation (
              $id: Int!
              $content: String!
            ) {
              comments {
                update (
                  id: $id,
                  content: $content
                ) {
                  responseResult {
                    succeeded
                    errorCode
                    slug
                    message
                  }
                  render
                }
              }
            }
          `,
          variables: {
            id: this.commentEditId,
            content: this.commentEditContent
          }
        })

        if (_.get(resp, 'data.comments.update.responseResult.succeeded', false)) {
          this.$store.commit('showNotification', {
            style: 'success',
            message: this.$t('common:comments.updateSuccess'),
            icon: 'check'
          })

          const cm = _.find(this.comments, ['id', this.commentEditId])
          cm.render = _.get(resp, 'data.comments.update.render', '-- Failed to load updated comment --')
          cm.updatedAt = (new Date()).toISOString()

          this.editCommentCancel()
        } else {
          throw new Error(_.get(resp, 'data.comments.delete.responseResult.message', 'An unexpected error occurred.'))
        }
      } catch (err) {
        console.warn(err)
        this.$store.commit('showNotification', {
          style: 'red',
          message: err.message,
          icon: 'alert'
        })
      }
      this.isBusy = false
      this.$store.commit(`loadingStop`, 'comments-edit')
    },
    /**
     * Show Delete Comment Confirmation Dialog
     */
    deleteCommentConfirm (cm) {
      this.commentToDelete = cm
      this.deleteCommentDialogShown = true
    },
    /**
     * Delete Comment
     */
    async deleteComment () {
      this.$store.commit(`loadingStart`, 'comments-delete')
      this.isBusy = true
      this.deleteCommentDialogShown = false

      try {
        const resp = await this.$apollo.mutate({
          mutation: gql`
            mutation (
              $id: Int!
            ) {
              comments {
                delete (
                  id: $id
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
            id: this.commentToDelete.id
          }
        })

        if (_.get(resp, 'data.comments.delete.responseResult.succeeded', false)) {
          this.$store.commit('showNotification', {
            style: 'success',
            message: this.$t('common:comments.deleteSuccess'),
            icon: 'check'
          })

          this.comments = _.reject(this.comments, ['id', this.commentToDelete.id])
        } else {
          throw new Error(_.get(resp, 'data.comments.delete.responseResult.message', 'An unexpected error occurred.'))
        }
      } catch (err) {
        this.$store.commit('showNotification', {
          style: 'red',
          message: err.message,
          icon: 'alert'
        })
      }
      this.isBusy = false
      this.$store.commit(`loadingStop`, 'comments-delete')
    }
  }
}
</script>

<style lang="scss">
// Comments (design system): 32 px pale-green avatar, 14/700 name, 12 px muted date, 14 px body
.comments-widget {
  font-family: $cl-font;
  color: var(--cl-text);

  .comments-hint {
    color: var(--cl-muted) !important;
    font-size: 12px;

    strong {
      color: var(--cl-heading);
    }
  }

  .comments-hint-icon {
    color: var(--cl-muted) !important;
  }

  .v-divider {
    border-color: var(--cl-border) !important;
  }
}

.comments-timeline {
  padding-top: 16px;

  &::before {
    background: var(--cl-border) !important;
  }

  .v-timeline-item__dot {
    background: transparent !important;
    box-shadow: none !important;
  }

  .v-timeline-item__inner-dot {
    background: transparent !important;
  }
}

.comments-avatar {
  background-color: var(--cl-accent-pale) !important;
  border: 1px solid var(--cl-border);

  span {
    color: var(--cl-accent-deep);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
}

.comments-post {
  position: relative;

  &:hover {
    .comments-post-actions {
      opacity: 1;
    }
  }

  &-card {
    background-color: var(--cl-surface);
    border: 1px solid var(--cl-border);
    border-radius: $cl-radius-lg;
    box-shadow: var(--cl-shadow-sm);

    > .v-card__text {
      color: var(--cl-text);
      font-size: 14px;
      line-height: 1.5;
    }
  }

  &-actions {
    position: absolute;
    top: 16px;
    right: 16px;
    opacity: 0;
    transition: opacity .4s ease;

    .v-icon {
      color: var(--cl-muted);

      &:hover {
        color: var(--cl-accent-deep);
      }
    }
  }

  &-name {
    font-size: 14px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--cl-heading);
  }

  &-date {
    margin-top: 2px;
    font-size: 12px;
    line-height: 1.3;
    color: var(--cl-muted);
  }

  &-content {
    font-size: 14px;
    line-height: 1.5;
    color: var(--cl-text);

    > p:first-child {
      padding-top: 0;
    }

    p {
      padding-top: 12px;
      margin-bottom: 0;
    }

    a {
      color: var(--cl-link);
      font-weight: 600;
      text-decoration: none;

      &:hover {
        color: var(--cl-link-hover);
        text-decoration: underline;
      }
    }

    img {
      max-width: 100%;
      border-radius: $cl-radius-md;
    }

    code {
      background-color: var(--cl-sunken);
      border: 1px solid var(--cl-border);
      border-radius: $cl-radius-sm;
      color: var(--cl-text);
      font-family: $cl-font-mono;
      font-size: .9em;
      padding: 0 4px;
      box-shadow: none;

      &::before, &::after {
        display: none;
      }
    }

    pre > code {
      display: block;
      margin-top: 12px;
      padding: 12px 16px;
      background-color: var(--cl-sunken);
      border: 1px solid var(--cl-border);
      border-radius: $cl-radius-md;
      box-shadow: none;
      width: 100%;
      color: var(--cl-text);
      font-weight: 400;
      font-size: 13px;
      line-height: 1.55;
      font-family: $cl-font-mono;
      overflow-x: auto;
    }
  }
}
</style>
