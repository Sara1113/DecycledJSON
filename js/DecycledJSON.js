/**
 * DJSNode Class
 * Attributes are fields with primitive values
 * Children are objects
 */
DJSHelper = {};
DJSHelper.Cache = [];
DJSHelper.currentHashID = 0;
DJSHelper.ReviveCache = [];

// DOES NOT ENCODE FUNCTION
function DJSNode(name, object, isRoot){
    this.name = name;
    // [ATTRIBUTES] contains the primitive fields of the Node
    this.attributes = {};

    // [CHILDREN] contains the Object/Typed fields of the Node
    // All [CHILDREN] must be of type [DJSNode]
    this.children = []; //Array of DJSNodes only

    // If [IS-ROOT] is true reset the Cache and currentHashId
    // before encoding
    isRoot = typeof isRoot === 'undefined'? true:isRoot;
    this.isRoot = isRoot;
    if(isRoot){
        DJSHelper.Cache = [];
        DJSHelper.currentHashID = 0;

        // CACHE THE ROOT
        object.hashID = DJSHelper.currentHashID++;
        DJSHelper.Cache.push(object);
    }

    for(var a in object){
        if(object.hasOwnProperty(a)){
            var val = object[a];

            if (typeof val === 'object') {
                // IF OBJECT OR NULL REF.

                /***************************************************************************/
                // DO NOT REMOVE THE [FALSE] AS THAT WOULD RESET THE [DJSHELPER.CACHE]
                // AND THE RESULT WOULD BE STACK OVERFLOW
                /***************************************************************************/
                if(val !== null) {
                    if (DJSHelper.Cache.indexOf(val) === -1) {
                        // VAL NOT IN CACHE
                        // ADD THE VAL TO CACHE FIRST -> BEFORE DOING RECURSION
                        val.hashID = DJSHelper.currentHashID++;
                        //console.log("Assigned", val.hashID, "to", a);
                        DJSHelper.Cache.push(val);

                        if (!(val instanceof Array)) {
                            // VAL NOT AN [ARRAY]
                            try {
                                this.children.push(new DJSNode(a, val, false));
                            } catch (err) {
                                console.log(err.message, a);
                                throw err;
                            }
                        } else {
                            // VAL IS AN [ARRAY]
                            var node = new DJSNode(a, {
                                array: true,
                                hashID: val.hashID // HashID of array
                            }, false);
                            val.forEach(function (elem, index) {
                                node.children.push(new DJSNode("elem", {val: elem}, false));
                            });
                            this.children.push(node);
                        }
                    } else {
                        // VAL IN CACHE
                        // ADD A CYCLIC NODE WITH HASH-ID
                        this.children.push(new DJSNode(a, {
                            cyclic: true,
                            hashID: val.hashID
                        }, false));
                    }
                }else{
                    // PUT NULL AS AN ATTRIBUTE
                    this.attributes[a] = 'null';
                }
            } else if (typeof val !== 'function') {
                // MUST BE A PRIMITIVE
                // ADD IT AS AN ATTRIBUTE
                this.attributes[a] = val;
            }
        }
    }

    if(isRoot){
        DJSHelper.Cache = null;
    }
    this.constructorName = object.constructor.name;
}
DJSNode.Revive = function (xmlNode, isRoot) {
    // Default value of [isRoot] is True
    isRoot = typeof isRoot === 'undefined'?true: isRoot;
    var root;
    if(isRoot){
        DJSHelper.ReviveCache = []; //Garbage Collect
    }
    if(window[xmlNode.constructorName].toString().indexOf('[native code]') > -1 ) {
        // yep, native in the browser
        if(xmlNode.constructorName == 'Object'){
            root = {};
        }else{
            return null;
        }
    }else {
        eval('root = new ' + xmlNode.constructorName + "()");
    }

    //CACHE ROOT INTO REVIVE-CACHE
    DJSHelper.ReviveCache[xmlNode.attributes.hashID] = root;

    for(var k in xmlNode.attributes){
        // PRIMITIVE OR NULL REF FIELDS
        if(xmlNode.attributes.hasOwnProperty(k)) {
            var a = xmlNode.attributes[k];
            if(a == 'null'){
                root[k] = null;
            }else {
                root[k] = a;
            }
        }
    }

    xmlNode.children.forEach(function (value) {
        // Each children is an [DJSNode]
        // [Array]s are stored as [DJSNode] with an positive Array attribute
        // So is value

        if(value.attributes.array){
            // ITS AN [ARRAY]
            root[value.name] = [];
            value.children.forEach(function (elem) {
                root[value.name].push(elem.attributes.val);
            });
            //console.log("Caching", value.attributes.hashID);
            DJSHelper.ReviveCache[value.attributes.hashID] = root[value.name];
        }else if(!value.attributes.cyclic){
            // ITS AN [OBJECT]
            root[value.name] = DJSNode.Revive(value, false);
            //console.log("Caching", value.attributes.hashID);
            DJSHelper.ReviveCache[value.attributes.hashID] = root[value.name];
        }
    });

    // [SEPARATE ITERATION] TO MAKE SURE ALL POSSIBLE
    // [CYCLIC] REFERENCES ARE CACHED PROPERLY
    xmlNode.children.forEach(function (value) {
        // Each children is an [DJSNode]
        // [Array]s are stored as [DJSNode] with an positive Array attribute
        // So is value

        if(value.attributes.cyclic){
            // ITS AND [CYCLIC] REFERENCE
            root[value.name] = DJSHelper.ReviveCache[value.attributes.hashID];
        }
    });

    if(isRoot){
        DJSHelper.ReviveCache = null; //Garbage Collect
    }
    return root;
};

DecycledJSON = {};
DecycledJSON.stringify = function (obj) {
    return JSON.stringify(new DJSNode("root", obj));
};
DecycledJSON.parse = function (json, replacerObject) {
    // use the replacerObject to get the null values
    return DJSNode.Revive(JSON.parse(json));
};
DJS = DecycledJSON;

