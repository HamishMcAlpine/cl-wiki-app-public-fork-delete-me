<template lang='pug'>
  v-dialog(v-model='isShown', persistent, max-width='700', no-click-animation)
    v-btn(fab, fixed, bottom, right, color='primary', @click='goBack', style='width: 50px;'): v-icon mdi-undo-variant
    v-card.editor-select
      v-card-text.text-center.py-6
        .editor-select-title {{$t('editor:select.title')}}
        v-container(grid-list-lg, fluid)
          v-layout(row, wrap, justify-center)
            v-flex(xs6)
              v-card.editor-select-card.animated.fadeInUp.wait-p1s(
                hover
                ripple
                )
                v-card-text.text-center(@click='selectEditor("markdown")')
                  img(src='/_assets/svg/editor-icon-markdown.svg', alt='Markdown', style='width: 36px;')
                  .body-2.editor-select-name.mt-2 Markdown
                  .caption.editor-select-desc Plain Text Formatting
            v-flex(xs6)
              v-card.editor-select-card.animated.fadeInUp.wait-p2s(
                hover
                ripple
                )
                v-card-text.text-center(@click='selectEditor("ckeditor")')
                  img(src='/_assets/svg/editor-icon-ckeditor.svg', alt='Visual Editor', style='width: 36px;')
                  .body-2.editor-select-name.mt-2 Visual Editor
                  .caption.editor-select-desc Rich-text WYSIWYG
            v-flex(xs4)
              v-card.editor-select-card.animated.fadeInUp.wait-p3s(
                hover
                ripple
                )
                v-card-text.text-center(@click='selectEditor("asciidoc")')
                  img(src='/_assets/svg/editor-icon-asciidoc.svg', alt='AsciiDoc', style='width: 36px;')
                  .body-2.editor-select-name.mt-2 AsciiDoc
                  .caption.editor-select-desc Plain Text Formatting
            v-flex(xs4)
              v-card.editor-select-card.animated.fadeInUp.wait-p4s(
                hover
                ripple
                )
                v-card-text.text-center(@click='selectEditor("code")')
                  img(src='/_assets/svg/editor-icon-code.svg', alt='Code', style='width: 36px;')
                  .body-2.editor-select-name.mt-2 Code
                  .caption.editor-select-desc Raw HTML
            v-flex(xs4)
              v-card.editor-select-card.animated.fadeInUp.wait-p5s(
                hover
                ripple
                )
                v-card-text.text-center(@click='fromTemplate')
                  img(src='/_assets/svg/icon-cube.svg', alt='From Template', style='width: 42px; opacity: .5;')
                  .body-2.editor-select-name.is-template.mt-1 From Template
                  .caption.editor-select-desc Use an existing page...

    page-selector(mode='select', v-model='templateDialogIsShown', :open-handler='fromTemplateHandle', :path='path', :locale='locale', must-exist)
</template>

<script>
import _ from 'lodash'
import { sync, get } from 'vuex-pathify'

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      templateDialogIsShown: false
    }
  },
  computed: {
    isShown: {
      get() { return this.value },
      set(val) { this.$emit('input', val) }
    },
    currentEditor: sync('editor/editor'),
    locale: get('page/locale'),
    path: get('page/path')
  },
  methods: {
    selectEditor (name) {
      this.currentEditor = `editor${_.startCase(name)}`
      this.isShown = false
    },
    goBack () {
      window.history.go(-1)
    },
    fromTemplate () {
      this.templateDialogIsShown = true
    },
    fromTemplateHandle ({ id }) {
      this.templateDialogIsShown = false
      this.isShown = false
      this.$nextTick(() => {
        window.location.assign(`/e/${this.locale}/${this.path}?from=${id}`)
      })
    }
  }
}
</script>

<style lang='scss'>

// Editor picker: surface dialog, 1 px bordered option cards with a pale green hover
.editor-select.v-card {
  border-radius: $cl-radius-lg;

  .editor-select-title {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--cl-heading);
    margin-bottom: 8px;
  }

  .editor-select-card.v-card {
    height: 100%;
    border: 1px solid var(--cl-border);
    border-radius: $cl-radius-lg;
    box-shadow: none !important;
    cursor: pointer;
    transition: background-color 120ms ease, border-color 120ms ease;

    &:hover, &:focus-within {
      background-color: var(--cl-accent-pale);
      border-color: var(--cl-accent-deep);
    }
  }

  .editor-select-name {
    font-weight: 700;
    color: var(--cl-heading);

    &.is-template {
      color: var(--cl-accent-deep);
    }
  }

  .editor-select-desc {
    color: var(--cl-muted);
  }
}

</style>
