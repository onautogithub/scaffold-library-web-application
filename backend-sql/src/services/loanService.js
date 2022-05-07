const LoanRepository = require('../database/repositories/loanRepository');
const ValidationError = require('../errors/validationError');
const AbstractRepository = require('../database/repositories/abstractRepository');

const Roles = require('../security/roles')

const SettingsService = require('../services/settingsService')
const moment = require('moment')

module.exports = class LoanService {
  constructor({ currentUser, language }) {
    this.repository = new LoanRepository();
    this.currentUser = currentUser;
    this.language = language;
  }

  async create(data) {

    data.dueDate = await this._calculateDueDate(data)
    const transaction = await AbstractRepository.createTransaction();

    try {
      const record = await this.repository.create(data, {
        transaction,
        currentUser: this.currentUser,
      });

      await AbstractRepository.commitTransaction(
        transaction,
      );

      return record;
    } catch (error) {
      await AbstractRepository.rollbackTransaction(
        transaction,
      );
      throw error;
    }
  }

  async update(id, data) {
    const transaction = await AbstractRepository.createTransaction();

    try {
      const record = await this.repository.update(
        id,
        data,
        {
          transaction,
          currentUser: this.currentUser,
        },
      );

      await AbstractRepository.commitTransaction(
        transaction,
      );

      return record;
    } catch (error) {
      await AbstractRepository.rollbackTransaction(
        transaction,
      );
      throw error;
    }
  }

  async destroyAll(ids) {
    const transaction = await AbstractRepository.createTransaction();

    try {
      for (const id of ids) {
        await this.repository.destroy(id, {
          transaction,
          currentUser: this.currentUser,
        });
      }

      await AbstractRepository.commitTransaction(
        transaction,
      );
    } catch (error) {
      await AbstractRepository.rollbackTransaction(
        transaction,
      );
      throw error;
    }
  }

  async findById(id) {
    return this.repository.findById(id);
  }

  async findAllAutocomplete(search, limit) {
    return this.repository.findAllAutocomplete(search, limit);
  }

  async findAndCountAll(args) {
    const isMember = this.currentUser.roles.includes(Roles.values.member) && !this.currentUser.roles.includes(Roles.values.librarian)
    if (isMember) {
      args.filter = {
        ...args.filter,
        member: this.currentUser.id
      }
    }
    return this.repository.findAndCountAll(args);
  }

  async import(data, importHash) {
    if (!importHash) {
      throw new ValidationError(
        this.language,
        'importer.errors.importHashRequired',
      );
    }

    if (await this._isImportHashExistent(importHash)) {
      throw new ValidationError(
        this.language,
        'importer.errors.importHashExistent',
      );
    }

    const dataToCreate = {
      ...data,
      importHash,
    };

    return this.create(dataToCreate);
  }

  async _isImportHashExistent(importHash) {
    const count = await this.repository.count({
      importHash,
    });

    return count > 0;
  }

  async _calculateDueDate(data) {

    const settings = await SettingsService.findOrCreateDefault(this.currentUser)
    return moment(data.issueDate).add(settings.loanPeriodInDays, 'days').toISOString()
  }
};
