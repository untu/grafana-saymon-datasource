import { GenericDatasource } from './datasource';
import { GenericDatasourceQueryCtrl } from './query-ctrl';

/**
 * Generic query UI controller.
 */
class GenericConfigCtrl {}
GenericConfigCtrl.templateUrl = 'partials/config.html';

/**
 * Generic query options UI controller.
 */
class GenericQueryOptionsCtrl {}
GenericQueryOptionsCtrl.templateUrl = 'partials/query.options.html';

/**
 * Generic query annotations UI controller.
 */
class GenericAnnotationsQueryCtrl {}
GenericAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';

export {
  GenericDatasource as Datasource,
  GenericDatasourceQueryCtrl as QueryCtrl,
  GenericConfigCtrl as ConfigCtrl,
  GenericQueryOptionsCtrl as QueryOptionsCtrl,
  GenericAnnotationsQueryCtrl as AnnotationsQueryCtrl
};
