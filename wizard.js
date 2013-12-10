define(function(require, module, exports) {
    main.consumes = ["Plugin", "ui", "Dialog"];
    main.provides = ["Wizard", "WizardPage"];
    return main;
    
    function main(options, imports, register) {
        var Plugin  = imports.Plugin;
        var Dialog  = imports.Dialog;
        var ui      = imports.ui;
        
        /***** Initialization *****/
        
        function Wizard(developer, deps, options){
            var plugin = new Dialog(developer, deps.concat(main.consumes), {
                name       : "dialog.wizard",
                allowClose : false,
                modal      : true,
                elements   : [
                    { type: "button", id: "cancel", caption: "Cancel", visible: false },
                    { filler: true },
                    { type: "button", id: "previous", caption: "Previous", visible: false },
                    { type: "button", id: "next", caption: "Next", color: "green", "default": true },
                    { type: "button", id: "finish", caption: "Finish", color: "green", visible: false }
                ]
            });
            var emit = plugin.getEmitter();
            
            var path    = [];
            var current = -1;
            var body;
            
            var drawn = false;
            function draw(options){
                if (drawn) return;
                drawn = true;
                
                // CSS
                ui.insertCss(require("text!./wizard.css"), plugin);
                
                body = options;
                
                plugin.update([
                    { id: "cancel", onclick: function(){ 
                        cancel();
                    }},
                    { id: "previous", onclick: function(){ 
                        previous();
                    }},
                    { id: "next", onclick: function(){ 
                        next();
                    }},
                    { id: "finish", onclick: function(){ 
                        finish();
                    }}
                ]);
                
                emit("draw", null, true);
            }
            
            /***** Methods *****/
            
            function cancel(){
                plugin.hide(); 
                emit("cancel");
            }
            
            function previous(){
                activate(path[current--]);
                emit("previous");
            }
            
            function next(){
                var page;
                if (current < path.length)
                    page = path[++current];
                else {
                    page = emit("next", { 
                        activePage: path[path.length - 1] 
                    });
                    current = path.push(page) - 1;
                }
                
                activate(page);
            }
            
            function finish(){
                plugin.hide(); 
                emit("finish");
            }
            
            function activate(page){
                var idx = path.indexOf(page);
                if (idx == -1) idx = path.length;
                
                plugin.update([
                    { id: "cancel", visible: page.cancel },
                    { id: "previous", visible: idx > 0 }, 
                    { id: "next", visible: !page.last }
                ]);
                
                if (plugin.activePage)
                    plugin.activePage.hide();
                page.show(body);
            }
            
            function show(reset, options){
                if (!options)
                    options = {};
                
                return plugin.queue(function(){
                    draw();
                
                    if (reset || current == -1) {
                        path = [];
                        activate(startPage);
                    }
                        
                }, options.queue === false);
            }
            
            /***** Lifecycle *****/
            
            plugin.on("draw", function(){
                draw();
            });
            
            /***** Register and define API *****/
            
            plugin.freezePublicAPI.baseclass();
            
            /**
             * 
             */
            plugin.freezePublicAPI({
                /**
                 * 
                 */
                get activePage(){ return path[current]; },
                
                /**
                 * 
                 */
                get finish(){ 
                    return plugin.getElement("finish").visible;
                },
                set finish(value){
                    plugin.update([
                        { id: "finish", visible: value }
                    ]);
                },
                
                /**
                 * 
                 */
                show: show
                
                /**
                 * 
                 */
                cancel: cancel,
                
                /**
                 * 
                 */
                previous: previous,
                
                /**
                 * 
                 */
                next: next,
                
                /**
                 * 
                 */
                finish: finish
            });
        }
        
        function WizardPage(options){
            var plugin = new Plugin("Ajax.org", main.consumes);
            var emit   = plugin.getEmitter();
            
            var name = options.name;
            var last, cancel, finish;
            
            var drawn;
            function draw(){
                if (drawn) return;
                drawn = true;
                
                container = document.createElement("div");
                container.style.position = "absolute";
                container.style.left     = 0;
                container.style.right    = 0;
                container.style.bottom   = 0;
                container.style.top      = 0;
                
                emit("draw", { html: container }, true);
            }
            
            /***** Methods *****/
            
            function hide(){
                container.parentNode.removeChild(container);
            }
            
            function show(options){
                draw();
                options.html.appendChild(container);
            }
            
            /***** Register and define API *****/
            
            plugin.freezePublicAPI.baseclass();
            
            /**
             * 
             */
            plugin.freezePublicAPI({
                /**
                 * 
                 */
                get name(){ return name; }),
                
                /**
                 * 
                 */
                get last(){ return last; }),
                set last(v){ last = v; }),
                
                /**
                 * 
                 */
                get cancel(){ return cancel; }),
                set cancel(v){ cancel = v; }),
                
                /**
                 * 
                 */
                show: show,
                
                /**
                 * 
                 */
                hide: hide
            });
            
            return plugin;
        }
        
        register("", {
            "Wizard" : Wizard,
            "WizardPage" : WizardPage,
        });
    }
});