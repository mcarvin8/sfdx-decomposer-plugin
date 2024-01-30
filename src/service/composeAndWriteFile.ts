/* eslint-disable */

import * as fs from 'node:fs';
import { XML_HEADER, NAMESPACE, INDENT } from '../helpers/constants.js';

export function composeAndWriteFile(combinedXmlContents: string[], filePath: string, xmlElement: string): void {
  // Combine XML contents into a single string
  let finalXmlContent = combinedXmlContents.join('\n');

  // Remove duplicate XML declarations
  finalXmlContent = finalXmlContent.replace(/<\?xml version="1.0" encoding="UTF-8"\?>/g, '');

  // Remove duplicate parent elements
  finalXmlContent = finalXmlContent.replace(`<${xmlElement}>`, '');
  finalXmlContent = finalXmlContent.replace(`</${xmlElement}>`, '');

  // Remove extra newlines
  finalXmlContent = finalXmlContent.replace(/(\n\s*){2,}/g, `\n${INDENT}`);

  fs.writeFileSync(filePath, `${XML_HEADER}\n<${xmlElement} ${NAMESPACE}>${finalXmlContent}</${xmlElement}>`);
  console.log(`Created composed file: ${filePath}`);
}
