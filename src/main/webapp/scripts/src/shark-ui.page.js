import './components/autocomplete.ui';
import './components/dropdown.ui';
import './components/fileupload.ui';
import './components/modal.ui';
import './components/pager.ui';
import './components/popover.ui';
import './components/selecter.ui';
import './components/tabs.ui';
import './components/toastr.ui';
import './components/tree.ui';
import { SharkUI } from './common/core';
if (typeof window !== 'undefined') {
    window.SharkUI = SharkUI;
}
export { SharkUI };