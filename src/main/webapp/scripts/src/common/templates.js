/**
 * @author sweetyx
 * 组件基础模板
 */
var autocomplete = `
    <input class="shark-autocomplete" type="text" />
`;
var fileupload = `
    <button class="shark-fileupload">上传文件</button>
`;
var listgroup = `
    <ul class="shark-list-group list-group position-absolute" style="display: none;"></ul>
`;
var popover = `
    <div class="shark-popover popover" style="display: none;">
        <div class="arrow"></div>
        <% if(this.title){ %>
        <div class="popover-title"><%= this.title %></div>
        <% } %> 
        <% if(this.content){ %>
            <div class="popover-content"><%= this.content %></div>
        <% } %> 
    </div>
`;
var selecter = `
    <div class="shark-selecter position-relative">
        <a class="selecter">
            <span class="value"></span>
            <span class="caret"></span>
        </a>
    </div>
`;
var dropdown = `
    <div class="shark-dropdown">
        <button class="btn btn-default dropdown">
            <%= this.text %>
            <span class="caret"></span>
        </button >
    </div>
`;
var pager = `
    <ul class="shark-pager pagination"></ul>
`;
var tree = `
    <ul class="<% if(this.isRoot){ %>shark-tree<% } %> tree-open">
        <%
            for(var i=0; i < this.nodes.length; i++){
                var node = this.nodes[i];
        %>
            <li>
                <label class="tree-group" tree-group-id="<%= node.node_id %>" tree-group-level="<%= node.level %>" style="padding-left: <% if(node.children && node.children.length>0) { %> <%= this.basePl + this.baseIconWidth %> <% } else{ %> <%= this.basePl + this.baseIconWidth*2 %> <% } %>px;">
                    <% if(node.children && node.children.length>0) { %>
                        <a class="tree-icon tree-icon-right"></a>
                    <% } %> 
                    <% if(this.checkable) { %>
                        <% if(this.checked) { %>
                            <a class="tree-icon tree-icon-check"></a>
                        <% } %>
                        <% else{ %>
                            <a class="tree-icon tree-icon-check-empty"></a>
                        <% } %>
                    <% } %>
                    <span class="tree-node-name"><%= node.node_name %></span>
                </label>
            </li>
        <% } %>
    </ul>
`;
var tabs = `
    <div class="shark-tabs">
	    <ul class="nav nav-tabs">
            <%
                for(var i=0; i < this.tabs.length; i++){
                    var tab = this.tabs[i];
            %>
                <% if(i === this.active) { %>
                    <li class="active">
                        <a href="javascript:void(0);"><%= tab.title %></a>
                    </li>
                <% } %> 
                <% else{ %>
                    <li>
                        <a href="javascript:void(0);"><%= tab.title %></a>
                    </li>
                <% } %>
            <% } %>
        </ul>
        <div class="tab-content">
            <%
                for(var i=0; i < this.tabs.length; i++){
                    var tab = this.tabs[i];
            %>
                <% if(i === this.active) { %>
                    <div class="tab-pane active"><%= tab.pane %></div>
                <% } %> 
                <% else{ %>
                    <div class="tab-pane"><%= tab.pane %></div>
                <% } %>
            <% } %>
        </div>
    </div>
`;
var modal = `
<div class="shark-modal modal <%= this.animate %>" style="display: none;">
    <div class="modal-dialog <% if(this.size) { %>modal-<%= this.size %><% }%>">
        <div class="modal-content">
            <%= this.content %>
        </div>
    </div>
</div>
`;
var confirm = `
<div class="modal-header">
    <button type="button" class="btn btn-link pull-right js-cancel">
        <span class="icon-close"></span>
    </button>
    <h4 class="modal-title"><%= this.title %></h4>
</div>
<div class="modal-body">
    <%= this.content %>
</div>
<div class="modal-footer">
    <button type="button" class="btn btn-success js-ok"><%= this.okText %></button>
    <% if(this.cancelText) { %>
        <button type="button" class="btn btn-default js-cancel"><%= this.cancelText %></button>
    <% } %>
</div>
`;
var toastr = `
<div class="shark-toastr toastr toastr-<%= this.type %>">
    <div><%= this.content %></div>
</div>
`;

function tempAdd(line, isJs) {
    if (/^\s*$/.test(line)) {
        return '';
    }
    if (isJs) {
        if (/^=/.test(line)) {
            return 'r.push(' + line.substring(1) + ');\n';
        } else {
            return line + '\n';
        }
    } else {
        return 'r.push("' + line.replace(/"/g, '\\"') + '");\n';
    }
}

function templateAoT(template) {
    var reg = /<%((\s|.)*?)%>/g;
    var code = 'var r=[];\n';
    var cursor = 0;
    var match;
    while (match = reg.exec(template)) {
        code = code + tempAdd(template.slice(cursor, match.index), false);
        code = code + tempAdd(match[1], true);
        cursor = match.index + match[0].length;
    }
    code = code + tempAdd(template.substr(cursor, template.length - cursor));
    code = code + 'return r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, ''));
}

function template2html(template, data) {
    return templateAoT(template).apply(data);
}

var Templates = {
    autocomplete: autocomplete,
    fileupload: fileupload,
    listgroup: listgroup,
    modal: modal,
    confirm: confirm,
    pager: pager,
    popover: popover,
    selecter: selecter,
    dropdown: dropdown,
    tree: tree,
    tabs: tabs,
    templateAoT: templateAoT,
    template2html: template2html,
    toastr: toastr
};
export { Templates };
