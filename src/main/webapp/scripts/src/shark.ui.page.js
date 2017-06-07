require('./common/base');
var SharkUI = require('./common/core');
require('./common/templates');
require('./components/autocomplete.ui');
require('./components/dropdown.ui');
require('./components/fileupload.ui');
require('./components/modal.ui');
require('./components/pager.ui');
require('./components/popover.ui');
require('./components/selecter.ui');
require('./components/tabs.ui');
require('./components/toastr.ui');
require('./components/tree.ui');

if (typeof window !== 'undefined') {
    window.SharkUI = SharkUI;
}

module.exports = SharkUI;