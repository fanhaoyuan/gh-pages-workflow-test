'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function(resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : {default: mod}
  }
Object.defineProperty(exports, '__esModule', {value: true})
exports.getLastestCommit = exports.suppressSensitiveInformation = exports.checkParameters = exports.generateFolderPath = exports.generateRepositoryPath = exports.generateTokenType = exports.isNullOrUndefined = void 0
const fs_1 = require('fs')
const path_1 = __importDefault(require('path'))
const core_1 = require('@actions/core')
const child_process_1 = __importDefault(require('child_process'))
/* Replaces all instances of a match in a string. */
const replaceAll = (input, find, replace) => input.split(find).join(replace)
/* Utility function that checks to see if a value is undefined or not. */
exports.isNullOrUndefined = value =>
  typeof value === 'undefined' || value === null || value === ''
/* Generates a token type used for the action. */
exports.generateTokenType = action =>
  action.ssh
    ? 'SSH Deploy Key'
    : action.accessToken
    ? 'Access Token'
    : action.gitHubToken
    ? 'GitHub Token'
    : '…'
/* Generates a the repository path used to make the commits. */
exports.generateRepositoryPath = action =>
  action.ssh
    ? `git@github.com:${action.repositoryName}`
    : `https://${action.accessToken ||
        `x-access-token:${action.gitHubToken}`}@github.com/${
        action.repositoryName
      }.git`
/* Genetate absolute folder path by the provided folder name */
exports.generateFolderPath = action => {
  const folderName = action['folder']
  return path_1.default.isAbsolute(folderName)
    ? folderName
    : folderName.startsWith('~')
    ? folderName.replace('~', process.env.HOME)
    : path_1.default.join(action.workspace, folderName)
}
/* Checks for the required tokens and formatting. Throws an error if any case is matched. */
const hasRequiredParameters = (action, params) => {
  const nonNullParams = params.filter(
    param => !exports.isNullOrUndefined(action[param])
  )
  return Boolean(nonNullParams.length)
}
/* Verifies the action has the required parameters to run, otherwise throw an error. */
exports.checkParameters = action => {
  if (!hasRequiredParameters(action, ['accessToken', 'gitHubToken', 'ssh'])) {
    throw new Error(
      'No deployment token/method was provided. You must provide the action with either a Personal Access Token or the GitHub Token secret in order to deploy. If you wish to use an ssh deploy token then you must set SSH to true.'
    )
  }
  if (!hasRequiredParameters(action, ['branch'])) {
    throw new Error('Branch is required.')
  }
  if (!hasRequiredParameters(action, ['folder'])) {
    throw new Error('You must provide the action with a folder to deploy.')
  }
  if (!fs_1.existsSync(action.folderPath)) {
    throw new Error(
      `The directory you're trying to deploy named ${action.folderPath} doesn't exist. Please double check the path and any prerequisite build scripts and try again. ❗`
    )
  }
}
/* Suppresses sensitive information from being exposed in error messages. */
exports.suppressSensitiveInformation = (str, action) => {
  let value = str
  if (core_1.isDebug()) {
    // Data is unmasked in debug mode.
    return value
  }
  const orderedByLength = [
    action.accessToken,
    action.gitHubToken,
    action.repositoryPath
  ]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
  for (const find of orderedByLength) {
    value = replaceAll(value, find, '***')
  }
  return value
}
/**Get lastest commit hash before use this action */
exports.getLastestCommit = () =>
  __awaiter(void 0, void 0, void 0, function*() {
    const lastCommitHash = yield child_process_1.default.execSync(
      'git log -1 --format=%H'
    )
    return lastCommitHash.toString().trim()
  })
