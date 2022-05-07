<template>
<div>
<el-tag type="success" v-if="value==='inProgress'">{{this.label}}</el-tag>
<el-tag type="info" v-if="value==='closed'">{{this.label}}</el-tag>
<el-tag type="danger" v-if="value==='overdue'">{{this.label}}</el-tag>
</div>
  
</template>

<script>
  import {i18n} from '@/i18n'

export default {
  name: 'app-loan-status-tag',

  // the prop value is the status of the loan that the tag will use.
  props: ['value'],
  computed: {
    // Let's call the i18n label for the status.
    label() {
      return i18n(`entities.loan.enumerators.status.${this.value}`)
    }
  }

}
</script>

<style>

</style>