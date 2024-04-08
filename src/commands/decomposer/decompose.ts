'use strict';

import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import { SFDX_PROJECT_FILE_NAME, LOG_FILE } from '../../helpers/constants.js';
import { decomposeFileHandler } from '../../service/decomposeFileHandler.js';
import { getRegistryValuesBySuffix } from '../../metadata/getRegistryValuesBySuffix.js';
import { readOriginalLogFile, checkLogForErrors } from '../../service/checkLogforErrors.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sfdx-decomposer', 'decomposer.decompose');

export type DecomposerDecomposeResult = {
  metadata: string;
};

export default class DecomposerDecompose extends SfCommand<DecomposerDecomposeResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    'sfdx-configuration': Flags.file({
      summary: messages.getMessage('flags.sfdx-configuration.summary'),
      char: 'c',
      required: true,
      exists: true,
      default: SFDX_PROJECT_FILE_NAME,
    }),
    'metadata-type': Flags.string({
      summary: messages.getMessage('flags.metadata-type.summary'),
      char: 'm',
      required: true,
    }),
    prepurge: Flags.boolean({
      summary: messages.getMessage('flags.prepurge.summary'),
      required: false,
      default: false,
    }),
    postpurge: Flags.boolean({
      summary: messages.getMessage('flags.postpurge.summary'),
      required: false,
      default: false,
    }),
    debug: Flags.boolean({
      summary: messages.getMessage('flags.debug.summary'),
      required: false,
      default: false,
    }),
  };

  public async run(): Promise<DecomposerDecomposeResult> {
    const { flags } = await this.parse(DecomposerDecompose);
    const sfdxConfigFile = flags['sfdx-configuration'];
    const metadataTypeToRetrieve = flags['metadata-type'];
    const prepurge = flags['prepurge'];
    const postpurge = flags['postpurge'];
    const debug = flags['debug'];
    const metaAttributes = await getRegistryValuesBySuffix(metadataTypeToRetrieve, sfdxConfigFile, 'decompose');

    const currentLogFile = await readOriginalLogFile(LOG_FILE);
    await decomposeFileHandler(metaAttributes, prepurge, postpurge, debug);
    const decomposeErrors = await checkLogForErrors(LOG_FILE, currentLogFile);
    if (decomposeErrors.length > 0) {
      decomposeErrors.forEach((error) => {
        this.warn(error);
      });
    }
    this.log(`All metadata files have been decomposed for the metadata type: ${metadataTypeToRetrieve}`);

    return {
      metadata: metadataTypeToRetrieve,
    };
  }
}
