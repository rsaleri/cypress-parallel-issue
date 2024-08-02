import {defineConfig} from 'cypress'
import * as createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import {addCucumberPreprocessorPlugin} from '@badeball/cypress-cucumber-preprocessor';
import createEsbuildPlugin from '@badeball/cypress-cucumber-preprocessor/esbuild';
import * as fs from 'fs';
const SPECIAL = process.env.SPECIAL

const e2eSpecPath = SPECIAL ? 'tests/e2e/**/**.SPECIAL.{feature,features}' : 'tests/e2e/**/**.{feature,features}'
const e2eExcludeSpecPattern = SPECIAL ? '**/*.js' : ['**/*.js', '**/*.SPECIAL.{feature,features}']

console.log(`Special: ${!!SPECIAL}`)

export default defineConfig({
  e2e: {
    async setupNodeEvents(
        cypressOn: Cypress.PluginEvents,
        config: Cypress.PluginConfigOptions
    ): Promise<Cypress.PluginConfigOptions> {
      const on = require('cypress-on-fix')(cypressOn)
      // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
      await addCucumberPreprocessorPlugin(on, config);

      on(
          'file:preprocessor',
          createBundler({
            plugins: [createEsbuildPlugin(config)],
          })
      )
      on('after:run', (results: unknown) => {
        if (results) {
          fs.mkdirSync('.run', {recursive: true});
          fs.writeFileSync('.run/results.json', JSON.stringify(results));
        }
      }) // Make sure to return the config object as it might have been modified by the plugin.

      return config;
    },
    specPattern: e2eSpecPath,
    excludeSpecPattern: e2eExcludeSpecPattern,
    viewportHeight: 1080,
    viewportWidth: 1920,
    testIsolation: false,
    defaultCommandTimeout: 10000,
    watchForFileChanges: false,
    baseUrl: `https://example.com`,
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      reporterEnabled: 'mochawesome, @badeball/cypress-parallel/knapsack-reporter',
      mochawesomeReporterOptions: {
        overwrite: false,
        html: false,
        json: true,
      },
      badeballCypressParallelKnapsackReporterReporterOptions: {
        'output': 'knapsack.json'
      }
    },
    // reporter: 'mochawesome',
    // reporterOptions: {
    //   overwrite: false,
    //   html: false,
    //   json: true,
    // }
  }
});
