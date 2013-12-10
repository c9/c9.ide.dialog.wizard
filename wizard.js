define(function(require, module, exports) {
    main.consumes = [
        "Plugin", "ui", "Dialog"
    ];
    main.provides = ["Wizard", "WizardPage"];
    return main;
    
    function main(options, imports, register) {
        var Dialog  = imports.Dialog;
        var ui      = imports.ui;
        
        /***** Initialization *****/
        
        function Wizard(developer, deps, options){
            var plugin = new Dialog("Ajax.org", main.consumes, {
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
            
            var pages   = [];
            var current = -1;
            var body;
            
            var drawn = false;
            function draw(options){
                if (drawn) return;
                drawn = true;
                
                // CSS
                ui.insertCss(require("text!./wizard.css"), plugin);
                
                body = options.aml;
                
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
                activate(pages[current--]);
                emit("previous");
            }
            
            function next(){
                activate(pages[current++]);
                emit("next");
            }
            
            function finish(){
                plugin.hide(); 
                emit("finish");
            }
            
            function add(page){
                pages.push(page);
            }
            
            function activate(page){
                var idx = pages.indexOf(page);
                
                plugin.update([
                    { id: "cancel", visible: page.cancel },
                    { id: "previous", visible: idx > 0 }, 
                    { id: "next", visible: idx < pages.length - 1 && !page.last },
                    { id: "finish", visible: page.finish }
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
                
                    if (reset || current == -1)
                        activate(pages[0]);
                        
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
                get activePage(){ return pages[current]; },
                
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
        
        function WizardPage(){
            /*
                last
                cancel
                finish
            */
        }
        
        register("", {
            "Wizard" : Wizard
        });
    }
});