import * as migration_20261107_152057_initial from './20261107_152057_initial';
import * as migration_20261107_152113_search_trigram_indexes from './20261107_152113_search_trigram_indexes';

export const migrations = [
  {
    up: migration_20261107_152057_initial.up,
    down: migration_20261107_152057_initial.down,
    name: '20261107_152057_initial',
  },
  {
    up: migration_20261107_152113_search_trigram_indexes.up,
    down: migration_20261107_152113_search_trigram_indexes.down,
    name: '20261107_152113_search_trigram_indexes'
  },
];
