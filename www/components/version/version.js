'use strict';

angular.module('naranawm.version', [
  'naranawm.version.interpolate-filter',
  'naranawm.version.version-directive'
])

.value('version', '0.1');
