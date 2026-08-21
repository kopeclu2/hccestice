import * as migration_20260820_161810_baseline from './20260820_161810_baseline';
import * as migration_20260820_161820_add_audit_log from './20260820_161820_add_audit_log';
import * as migration_20260821_053907_add_maintenance_mode from './20260821_053907_add_maintenance_mode';
import * as migration_20260821_085520_hero_modern_album_tiles from './20260821_085520_hero_modern_album_tiles';
import * as migration_20260821_090730_posts_grid_show_photo from './20260821_090730_posts_grid_show_photo';
import * as migration_20260821_091316_news_show_photo from './20260821_091316_news_show_photo';
import * as migration_20260821_093332_posts_list_show_photo from './20260821_093332_posts_list_show_photo';
import * as migration_20260821_093653_trainings_cards from './20260821_093653_trainings_cards';
import * as migration_20260821_095556_trainings_drop_extras from './20260821_095556_trainings_drop_extras';

export const migrations = [
  {
    up: migration_20260820_161810_baseline.up,
    down: migration_20260820_161810_baseline.down,
    name: '20260820_161810_baseline',
  },
  {
    up: migration_20260820_161820_add_audit_log.up,
    down: migration_20260820_161820_add_audit_log.down,
    name: '20260820_161820_add_audit_log',
  },
  {
    up: migration_20260821_053907_add_maintenance_mode.up,
    down: migration_20260821_053907_add_maintenance_mode.down,
    name: '20260821_053907_add_maintenance_mode',
  },
  {
    up: migration_20260821_085520_hero_modern_album_tiles.up,
    down: migration_20260821_085520_hero_modern_album_tiles.down,
    name: '20260821_085520_hero_modern_album_tiles',
  },
  {
    up: migration_20260821_090730_posts_grid_show_photo.up,
    down: migration_20260821_090730_posts_grid_show_photo.down,
    name: '20260821_090730_posts_grid_show_photo',
  },
  {
    up: migration_20260821_091316_news_show_photo.up,
    down: migration_20260821_091316_news_show_photo.down,
    name: '20260821_091316_news_show_photo',
  },
  {
    up: migration_20260821_093332_posts_list_show_photo.up,
    down: migration_20260821_093332_posts_list_show_photo.down,
    name: '20260821_093332_posts_list_show_photo',
  },
  {
    up: migration_20260821_093653_trainings_cards.up,
    down: migration_20260821_093653_trainings_cards.down,
    name: '20260821_093653_trainings_cards',
  },
  {
    up: migration_20260821_095556_trainings_drop_extras.up,
    down: migration_20260821_095556_trainings_drop_extras.down,
    name: '20260821_095556_trainings_drop_extras'
  },
];
