<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">
        <app-i18n code="home.menu"></app-i18n>
      </el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/loan' }">
        <app-i18n code="entities.loan.menu"></app-i18n>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <app-i18n code="entities.loan.edit.title" v-if="isEditing"></app-i18n>
        <app-i18n code="entities.loan.new.title" v-if="!isEditing"></app-i18n>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <div class="app-content-page">
      <h1 class="app-content-title">
        <app-i18n code="entities.loan.edit.title" v-if="isEditing"></app-i18n>
        <app-i18n code="entities.loan.new.title" v-if="!isEditing"></app-i18n>
      </h1>

      <div class="app-page-spinner" v-if="findLoading || findSettingsLoading" v-loading="findLoading"></div>

      <el-form
        :label-position="labelPosition"
        :label-width="labelWidthForm"
        :model="model"
        :rules="rules"
        @submit.native.prevent="doSubmit"
        class="form"
        ref="form"
        v-if="model"
      >
        <el-form-item :label="fields.id.label" :prop="fields.id.name" v-if="isEditing">
          <el-col :lg="11" :md="16" :sm="24">
            <el-input :disabled="true" v-model="model[fields.id.name]"/>
          </el-col>
        </el-form-item>

        <el-form-item
          :label="fields.book.label"
          :prop="fields.book.name"
          :required="fields.book.required"
        >
          <el-col :lg="11" :md="16" :sm="24">
            <app-autocomplete-one-input
              :fetchFn="fields.book.fetchFn"
              v-model="model[fields.book.name]"
              :disabled="isEditing"
            ></app-autocomplete-one-input>
          </el-col>
        </el-form-item>

        <el-form-item
          :label="fields.member.label"
          :prop="fields.member.name"
          :required="fields.member.required"
        >
          <el-col :lg="11" :md="16" :sm="24">
            <app-autocomplete-one-input
              :fetchFn="fields.member.fetchFn"
              v-model="model[fields.member.name]"
              :disabled="isEditing"
            ></app-autocomplete-one-input>
          </el-col>
        </el-form-item>

        <el-form-item
          :label="fields.issueDate.label"
          :prop="fields.issueDate.name"
          :required="fields.issueDate.required"
        >
          <el-col :lg="11" :md="16" :sm="24">
            <el-date-picker 
            placeholder 
            type="datetime" 
            v-model="model[fields.issueDate.name]" 
            @change="onIssueDateChange">
            :disabled="isEditing"
          </el-date-picker>
          </el-col>
        </el-form-item>

        <el-form-item
          :label="fields.dueDate.label"
          :prop="fields.dueDate.name"
          :required="fields.dueDate.required"
          v-if="model.dueDate"
        >
          <el-col :lg="11" :md="16" :sm="24">
            <el-date-picker 
            placeholder 
            type="datetime" 
            v-model="model[fields.dueDate.name]">
            :disabled="isEditing"
          </el-date-picker>
          </el-col>
        </el-form-item>

        <el-form-item
          :label="fields.returnDate.label"
          :prop="fields.returnDate.name"
          :required="fields.returnDate.required"
          v-if="isEditing"
        >
          <el-col :lg="11" :md="16" :sm="24">
            <el-date-picker placeholder type="datetime" v-model="model[fields.returnDate.name]" @change="onReturnDateChange"></el-date-picker>
          </el-col>
        </el-form-item>

        <el-form-item
          :label="fields.status.label"
          :prop="fields.status.name"
          :required="fields.status.required"
          v-if="model.status"
          >
          <el-col :lg="11" :md="16" :sm="24">
            <app-loan-status-tag :value="model.status" />
          </el-col>
        </el-form-item>

        <el-form-item>
          <div class="form-buttons">
            <el-button
              :disabled="saveLoading"
              @click="doSubmit"
              icon="el-icon-fa-floppy-o"
              type="primary"
            >
              <app-i18n code="common.save"></app-i18n>
            </el-button>

            <el-button :disabled="saveLoading" @click="doReset" icon="el-icon-fa-undo">
              <app-i18n code="common.reset"></app-i18n>
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { FormSchema } from '@/shared/form/form-schema';
import { LoanModel } from '@/modules/loan/loan-model';
import moment from 'moment'

import LoanStatusTag from '@/modules/loan/components/loan-status-tag'

const { fields } = LoanModel;

const newformSchema = new FormSchema([
  fields.id,
  fields.book,
  fields.member,
  fields.issueDate,
  fields.dueDate,

  fields.status,
]);

const editformSchema = new FormSchema([
  fields.id,
  fields.book,
  fields.member,
  fields.issueDate,
  fields.dueDate,
  fields.returnDate,
  fields.status,
]);

export default {
  name: 'app-loan-form-page',

    components: {
    [LoanStatusTag.name]: LoanStatusTag
  },

  props: ['id'],

  data() {
    let rules = null;
    const isEditing = !!this.id
 
    if (isEditing) {
      rules = editformSchema.rules()
    }
    if (!isEditing) {
      rules = newformSchema.rules()
    }
    return {
      rules,
      model: null,
    };
  },

  computed: {
    ...mapGetters({
      labelPosition: 'layout/labelPosition',
      labelWidthForm: 'layout/labelWidthForm',
      record: 'loan/form/record',
      findLoading: 'loan/form/findLoading',
      saveLoading: 'loan/form/saveLoading',
      loanPeriodInDays: 'settings/loanPeriodInDays',
      findSettingsLoading: 'settings/findLoading'
    }),

    formSchema() {
      return this.isEditing ? editformSchema : newformSchema
    },

    isEditing() {
      return !!this.id;
    },

    fields() {
      return fields;
    },
  },

  async created() {
    await this.doFindSettings()
    if (this.isEditing) {
      await this.doFind(this.id);
    } else {
      await this.doNew();
    }

    this.model = this.formSchema.initialValues(this.record);
  },

  methods: {
    ...mapActions({
      doFind: 'loan/form/doFind',
      doNew: 'loan/form/doNew',
      doUpdate: 'loan/form/doUpdate',
      doCreate: 'loan/form/doCreate',
      doFindSettings: 'settings/doFind',
    }),

    onIssueDateChange(value) {
      this.model.dueDate = moment(value).add(
        this.loanPeriodInDays, 'days',
        )
        this.fillStatus(this.model.dueDate, this.model.returnDate) 
    },

    onReturnDateChange(value) {
      this.fillStatus(this.model.dueDate, value)
    },

    fillStatus(dueDate, returnDate) {
      if (returnDate) {
        this.model.status = 'closed'
        return
      }
      if (moment().isAfter(moment(dueDate))) {
        this.model.status = 'overdue'
        return
      }
      this.model.status = 'inProgress'
    },

    doReset() {
      this.model = this.formSchema.initialValues(this.record);
    },

    async doSubmit() {
      try {
        await this.$refs.form.validate();
      } catch (error) {
        return;
      }

      const { id, ...values } = this.formSchema.cast(this.model);

      if (this.isEditing) {
        return this.doUpdate({
          id,
          values,
        });
      } else {
        return this.doCreate(values);
      }
    },
  },
};
</script>

<style>
</style>
