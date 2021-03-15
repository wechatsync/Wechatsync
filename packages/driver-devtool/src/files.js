var currentSelectedFileIndex = null;

var isArrayBufferSupported = (new Buffer(new Uint8Array([1]).buffer)[0] === 1);
var arrayBufferToBuffer = isArrayBufferSupported ? arrayBufferToBufferAsArgument : arrayBufferToBufferCycle;

function arrayBufferToBufferAsArgument(ab) {
    return new Buffer(ab);
}

function arrayBufferToBufferCycle(ab) {
    var buffer = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}


export default {

    initFileManager(){

        var self = this;
        if(this.$refs.filer){

            this.$refs.filer.onchange = function(e){
                console.log(e, this.files);
                var fileObject = this.files[0];
                var fileName = fileObject.name;
                var isWasm = fileName.indexOf('wasm') > -1;

                var newFile = {
                    fileName: fileName,
                    content: '',
                    isLeader: false
                }
                
                var fileReader = new FileReader();
                fileReader.onload = function() {
                    if(isWasm){
                        var wasmContent = arrayBufferToBuffer(this.result).toString("hex");
                        newFile.content = 'can not display';
                        newFile.hexData = wasmContent;
                        newFile.compiled = true;
                        console.log('ready', arrayBufferToBuffer(this.result).toString("hex"));
                    }else{
                        newFile.content = this.result;
                        console.log(this.result);
                    }
                    self.files.push(newFile);
                }

                if(isWasm){
                    fileReader.readAsArrayBuffer(fileObject);
                }else{
                    fileReader.readAsText(fileObject);
                }
            }
            console.log('this.$refs.filer', this.$refs);
        } else {
            console.log('not found filer', this.$refs)
        }
    },

    initEditor(){
        var openedFilesSatus = this.getOpenedFileFromLocal();
        var editorFiles = [];
        console.log('openedFiles', openedFilesSatus, this.isMobile);
        this.files.forEach((file) => {
            if(this.isMobile){
                editorFiles.push(file);
                return;
            }
            if(openedFilesSatus.files.indexOf(file.fileName) > -1){
                console.log('openedFiles', file)
                editorFiles.push(file);
            }

            if(openedFilesSatus.selected && openedFilesSatus.selected == file.fileName){
                this.currentEditFileName = file.fileName;
                this.currentEditFile = file;
            }
        })

        this.editorFiles = editorFiles;
    },

    editorAfterProjectLoad(){

        if(!this.editorFiles.length){
            if(this.isMobile){
                this.editorFiles = this.files;
            }else{
                this.editorFiles = [this.files[0]];
            }
        }
       
        if(!this.currentEditFileName) this.openFile(this.files[0]);

        console.log('editorAfterProjectLoad',  this.files[0]);
    },
    createFile(){
        var newFile = {
            fileName: 'untitled.js',
            content: '',
            isLeader: false,
            edit: true
        }
        this.files.push(newFile);
        console.log('createFile');
        this.autoSaveCode();
    },

    handleFileContextmenu(Vnode){
        currentSelectedFileIndex = Vnode.data.key;
        console.log('vnode', Vnode, currentSelectedFileIndex)
    },

    handleSelectAsMain(){
        var currentFile = this.files[currentSelectedFileIndex];
        console.log('handleSelectAsMain', currentFile)
        if(!currentFile.compiled && currentFile.fileName.indexOf('cpp') < 0){
            alert('not cpp file');
            return;
        }

        this.files =  this.files.map((file) => {
            if(file.isLeader){
                delete file.isLeader;
            }
            return file;
        });
     
        currentFile.isLeader = true;
        console.log('handleRename', arguments, currentSelectedFileIndex, currentFile);
        this.$forceUpdate();
        this.autoSaveCode();
    },

    handleRename(){
        var currentFile = this.files[currentSelectedFileIndex];
        currentFile.edit = true;
        console.log('handleRename', arguments, currentSelectedFileIndex, currentFile);
        this.$forceUpdate();
        this.autoSaveCode();
    },
    handleDelete(){
        this.files.splice(currentSelectedFileIndex, 1);
        console.log('handleDelete', arguments);
        this.autoSaveCode();
    },

    handleEdit(file){

        var duplicateFiles = this.files.filter(function (item){ 
            return item != file && item.fileName == file.fileName
        });

        if(duplicateFiles.length){
            alert('duplicate file name');
            return;
        }

        var fileExt = file.fileName.split(".").pop();
        file.meta = {
            ext: fileExt
        }

        console.log('handleEdit', file, duplicateFiles);
        file.edit = false;
        this.$forceUpdate();
        this.autoSaveCode();
    },

    openFile(file, index){
        if(this.editorFiles.indexOf(file) > -1){
            console.log('file exist');
        }else{
            this.editorFiles.push(file);
        }

        this.currentEditFileName = file.fileName;
        this.currentEditFile = file;
        console.log('openFile', file, this.editorFiles)
        this.saveEditorStatus();

    },
    selectFile(file){

        console.log('this.currentEditFileName', this.currentEditFileName)

        this.currentEditFileName = file.fileName; 
        this.currentEditFile = file;
        console.log('selectFile', this)
        this.saveEditorStatus();
    },
    closeFile(file, index){
        var leftFiles = this.editorFiles.filter(function (item){ 
            return item != file
        });

        var lastFile = leftFiles[leftFiles.length-1];

        if(lastFile){
            this.selectFile(leftFiles[leftFiles.length-1]);
        }else{
            this.currentEditFile = {};
            this.currentEditFileName = '';
        }   
       
        this.editorFiles = leftFiles;

        this.saveEditorStatus();
        console.log('leftFiles', leftFiles);
    },

    saveEditorStatus(){
        var openedFiles = this.editorFiles.map((f) => {
            return f.fileName;
        })
        window.localStorage.setItem('openedFiles', JSON.stringify({
            selected: this.currentEditFileName,
            files:  openedFiles.join(',')
        }));
    },

    getOpenedFileFromLocal(){
        var files = window.localStorage.getItem('openedFiles');
        if(files) return JSON.parse(files);
        return {
            files: []
        };
    },

    getFileCodeOptions(file){
        console.log('getFileCodeOptions', file)
       var Options = {
        tabSize: 2,
        styleActiveLine: false,
        lineNumbers: true,
        styleSelectedText: false,
        line: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
        mode: "text/javascript",
        // hint.js options
        hintOptions: {
            // 当匹配只有一项的时候是否自动补全
            completeSingle: false
        },
        //快捷键 可提供三种模式 sublime、emacs、vim
        keyMap: "sublime",
        matchBrackets: true,
        showCursorWhenSelecting: true,
        theme: "eclipse"
        // extraKeys: { "Ctrl": "autocomplete" }
        }

        if(file.fileName && (file.fileName.indexOf('cpp') > -1  || file.fileName.indexOf('hpp') > -1 )){
        Options.mode = 'text/x-c++src';
        }

        if(file.fileName && (file.fileName.indexOf('java') > -1)){
        Options.mode = 'text/x-java';
        }

        console.log('getFileCodeOptions', Options)
        return Options;
    },

    exportState(){
        this.stateDatabase = JSON.stringify(window.localStorage);
    },

    importState(){


    }
}