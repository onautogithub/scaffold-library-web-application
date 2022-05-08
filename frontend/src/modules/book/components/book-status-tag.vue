<template>
<div>
<el-tag type="success" v-if="value==='available'">{{this.label}}</el-tag>
<el-tag type="danger" v-if="value==='unavailable'">{{this.label}}</el-tag>
</div>
  
</template>

<script>
  import {i18n} from '@/i18n'

export default {
  name: 'app-book-status-tag',

  // the prop value is the status of the loan that the tag will use.
  props: ['value'],
  computed: {
    // Let's call the i18n label for the status.
    label() {
      return i18n(`entities.book.enumerators.status.${this.value}`)
    }
  }

}
</script>

<style>

</style>